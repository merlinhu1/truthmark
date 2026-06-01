import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import { runConfig } from "../../src/config/command.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("runConfig", () => {
  it("creates only .truthmark/config.yml by default", async () => {
    const repo = await createTempRepo();

    try {
      const result = await runConfig(repo.rootDir, {});

      expect(result.command).toBe("config");
      const configText = await repo.readFile(".truthmark/config.yml");
      const config = parse(configText) as Record<string, unknown>;

      expect(config.version).toBe(2);
      expect(config).not.toHaveProperty("docs");
      expect(config).not.toHaveProperty("authority");
      expect(config.truthmark).toEqual({
        workspace: "docs/truthmark",
        routes: {
          index: "routes/areas.md",
          areas: "routes/areas",
          default_area: "repository",
          max_delegation_depth: 1,
        },
        truth: { root: "truth" },
        templates: { root: "templates" },
        generated: {
          portal: {
            enabled: false,
          },
        },
      });
      expect(JSON.stringify(config)).not.toContain("docs/standards");
      expect(JSON.stringify(config)).not.toContain("docs/architecture");
      expect(JSON.stringify(config)).not.toContain("docs/ai");
      expect(JSON.stringify(config)).not.toContain("docs/truth\"");
      expect(JSON.stringify(config)).not.toContain("docs/templates");
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/docs/truthmark/routes/areas.md`)).rejects.toThrow();
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "action",
            file: ".truthmark/config.yml",
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("does not overwrite an existing config without force", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(".truthmark/config.yml", "version: 1\ncustom: true\n");

      const result = await runConfig(repo.rootDir, {});

      expect(await repo.readFile(".truthmark/config.yml")).toBe("version: 1\ncustom: true\n");
      expect(result.summary).toContain("already exists");
    } finally {
      await repo.cleanup();
    }
  });

  it("overwrites config only with force", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(".truthmark/config.yml", "version: 1\ncustom: true\n");

      const result = await runConfig(repo.rootDir, { force: true });

      expect(await repo.readFile(".truthmark/config.yml")).toContain("workspace: docs/truthmark");
      expect(await repo.readFile(".truthmark/config.yml")).not.toContain("custom: true");
      expect(result.summary).toContain("Wrote");
    } finally {
      await repo.cleanup();
    }
  });

  it("renders config to stdout data without writing when stdout is requested", async () => {
    const repo = await createTempRepo();

    try {
      const result = await runConfig(repo.rootDir, { stdout: true });

      expect(result.data).toMatchObject({
        path: ".truthmark/config.yml",
      });
      expect(String(result.data?.content)).toContain("workspace: docs/truthmark");
      await expect(fs.stat(`${repo.rootDir}/.truthmark/config.yml`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });
});
