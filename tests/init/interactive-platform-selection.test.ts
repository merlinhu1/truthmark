import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { posixOnlyIt } from "../helpers/platform.js";
import { expect } from "expect";
import { parse } from "yaml";

import { runInit } from "../../src/init/init.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("runInit platform selection", () => {
  it("creates config and selected platform surfaces from explicit input", async () => {
    const repo = await createTempRepo();
    try {
      const result = await runInit(repo.rootDir, {
        platforms: ["cursor", "codex", "cursor"],
      });
      const config = parse(await repo.readFile(".truthmark/config.yml")) as {
        version: number;
        platforms: string[];
      };

      expect(result.diagnostics).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ severity: "error" }),
        ]),
      );
      expect(config.version).toBe(2);
      expect(config.platforms).toEqual(["codex", "cursor"]);
      expect(await repo.readFile("AGENTS.md")).toContain("Truthmark Workflow");
      expect(
        await repo.readFile(".cursor/skills/truthmark-sync/SKILL.md"),
      ).toContain("Truth Sync");
      await expect(fs.stat(`${repo.rootDir}/CLAUDE.md`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps a first noninteractive init host-neutral", async () => {
    const repo = await createTempRepo();
    try {
      await runInit(repo.rootDir);
      const config = parse(await repo.readFile(".truthmark/config.yml")) as Record<
        string,
        unknown
      >;

      expect(config.version).toBe(2);
      expect(config).not.toHaveProperty("platforms");
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("applies a prompted selection on first run", async () => {
    const repo = await createTempRepo();
    try {
      let defaults: readonly string[] = ["unexpected"];
      await runInit(repo.rootDir, {
        selectPlatforms: async (saved) => {
          defaults = saved;
          return ["opencode", "antigravity"];
        },
      });
      const config = parse(await repo.readFile(".truthmark/config.yml")) as {
        platforms: string[];
      };

      expect(defaults).toEqual([]);
      expect(config.platforms).toEqual(["opencode", "antigravity"]);
    } finally {
      await repo.cleanup();
    }
  });

  it("clears saved selections and generated host surfaces", async () => {
    const repo = await createTempRepo();
    try {
      await runInit(repo.rootDir, { platforms: ["codex"] });

      await runInit(repo.rootDir, {
        selectPlatforms: async () => [],
      });
      const config = parse(await repo.readFile(".truthmark/config.yml")) as Record<
        string,
        unknown
      >;

      expect(config).not.toHaveProperty("platforms");
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("preselects saved platforms and preserves other config content", async () => {
    const repo = await createTempRepo();
    try {
      const source = `# keep this comment
version: 2
platforms:
  - codex
truthmark:
  workspace: custom/truth
  generated:
    portal:
      enabled: false
frontmatter:
  required: []
  recommended: []
ignore: []
`;
      await repo.writeFile(".truthmark/config.yml", source);
      let defaults: readonly string[] = [];

      await runInit(repo.rootDir, {
        selectPlatforms: async (saved) => {
          defaults = saved;
          return ["cursor"];
        },
      });

      const updated = await repo.readFile(".truthmark/config.yml");
      expect(defaults).toEqual(["codex"]);
      expect(updated).toContain("# keep this comment");
      expect(updated).toContain("workspace: custom/truth");
      expect((parse(updated) as { platforms: string[] }).platforms).toEqual([
        "cursor",
      ]);
    } finally {
      await repo.cleanup();
    }
  });

  it("cancels before writing any repository files", async () => {
    const repo = await createTempRepo();
    try {
      const result = await runInit(repo.rootDir, {
        selectPlatforms: async () => null,
      });

      expect(result.summary).toContain("cancelled");
      expect(result.diagnostics).toEqual([]);
      await expect(
        fs.stat(`${repo.rootDir}/.truthmark/config.yml`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/docs/truthmark`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects unsupported explicit platforms without writing", async () => {
    const repo = await createTempRepo();
    try {
      const result = await runInit(repo.rootDir, {
        platforms: ["not-a-platform"],
      });

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: "error",
            message: expect.stringContaining("not-a-platform"),
          }),
        ]),
      );
      await expect(
        fs.stat(`${repo.rootDir}/.truthmark/config.yml`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("does not prompt or overwrite an invalid existing config", async () => {
    const repo = await createTempRepo();
    try {
      const invalid = "version: 1\ncustom: true\n";
      await repo.writeFile(".truthmark/config.yml", invalid);
      let prompted = false;

      const result = await runInit(repo.rootDir, {
        selectPlatforms: async () => {
          prompted = true;
          return ["codex"];
        },
      });

      expect(prompted).toBe(false);
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ severity: "error" }),
        ]),
      );
      expect(await repo.readFile(".truthmark/config.yml")).toBe(invalid);
    } finally {
      await repo.cleanup();
    }
  });

  it("does not update config when lifecycle preflight is inapplicable", async () => {
    const repo = await createTempRepo();
    try {
      await runInit(repo.rootDir, { platforms: ["codex"] });
      const before = await repo.readFile(".truthmark/config.yml");
      await repo.writeFile(
        "AGENTS.md",
        "<!-- truthmark:start -->\nfirst\n<!-- truthmark:start -->\nsecond\n<!-- truthmark:end -->\n",
      );

      const result = await runInit(repo.rootDir, { platforms: ["cursor"] });

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ severity: "error" }),
        ]),
      );
      expect(await repo.readFile(".truthmark/config.yml")).toBe(before);
    } finally {
      await repo.cleanup();
    }
  });

  posixOnlyIt("rejects an aliased config before removing generated surfaces", async () => {
    const repo = await createTempRepo();
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-config-"));
    try {
      await runInit(repo.rootDir, { platforms: ["codex"] });
      const configPath = path.join(repo.rootDir, ".truthmark/config.yml");
      const configSource = await fs.readFile(configPath, "utf8");
      const agentsSource = await repo.readFile("AGENTS.md");
      const outsideConfigPath = path.join(outside, "config.yml");
      await fs.writeFile(outsideConfigPath, configSource, "utf8");
      await fs.rm(configPath);
      await fs.symlink(outsideConfigPath, configPath);

      const result = await runInit(repo.rootDir, { platforms: [] });

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "error",
            file: ".truthmark/config.yml",
          }),
        ]),
      );
      expect(await repo.readFile("AGENTS.md")).toBe(agentsSource);
      expect(await fs.readFile(outsideConfigPath, "utf8")).toBe(configSource);
    } finally {
      await repo.cleanup();
      await fs.rm(outside, { recursive: true, force: true });
    }
  });

  it("keeps existing config bytes when saved selections are reused", async () => {
    const repo = await createTempRepo();
    try {
      await runInit(repo.rootDir, { platforms: ["codex"] });
      const before = await repo.readFile(".truthmark/config.yml");

      await runInit(repo.rootDir);

      expect(await repo.readFile(".truthmark/config.yml")).toBe(before);
    } finally {
      await repo.cleanup();
    }
  });
});
