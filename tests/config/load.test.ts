import { describe, expect, it } from "vitest";

import { createTempRepo } from "../helpers/temp-repo.js";
import { loadConfig } from "../../src/config/load.js";

describe("loadConfig", () => {
  it("loads a valid config and applies defaults for optional frontmatter and ignore fields", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
authority:
  - docs/truthmark/areas.md
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("loaded");
      expect(result.diagnostics).toEqual([]);
      expect(result.config).toMatchObject({
        version: 1,
        platforms: ["codex", "opencode", "claude-code", "github-copilot", "gemini-cli"],
        authority: ["docs/truthmark/areas.md"],
        docs: {
          layout: "hierarchical",
          roots: {
            truth: "docs/truth",
          },
          routing: {
            rootIndex: "docs/truthmark/areas.md",
            areaFilesRoot: "docs/truthmark/areas",
            defaultArea: "repository",
            maxDelegationDepth: 1,
          },
        },
        instructionTargets: ["AGENTS.md"],
        frontmatter: {
          required: [],
          recommended: [],
        },
        ignore: [],
      });
    } finally {
      await repo.cleanup();
    }
  });

  it("accepts the V1 config fields only", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
authority:
  - docs/truthmark/areas.md
instruction_targets:
  - AGENTS.md
platforms:
  - codex
  - github-copilot
frontmatter:
  required: []
  recommended:
    - status
ignore:
  - dist/**
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.diagnostics).toEqual([]);
      expect(result.config?.platforms).toEqual(["codex", "github-copilot"]);
      expect(result.config?.instructionTargets).toEqual(["AGENTS.md"]);
      expect(result.config?.frontmatter.recommended).toEqual(["status"]);
      expect(result.config?.ignore).toEqual(["dist/**"]);
    } finally {
      await repo.cleanup();
    }
  });

  it("loads hierarchical docs config", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
docs:
  layout: hierarchical
  roots:
    truth: docs/product
  routing:
    root_index: docs/truthmark/routes.md
    area_files_root: docs/truthmark/routes
    default_area: core
    max_delegation_depth: 1
authority:
  - docs/truthmark/areas.md
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.diagnostics).toEqual([]);
      expect(result.config?.docs).toMatchObject({
        layout: "hierarchical",
        roots: {
          truth: "docs/product",
        },
        routing: {
          rootIndex: "docs/truthmark/routes.md",
          areaFilesRoot: "docs/truthmark/routes",
          defaultArea: "core",
          maxDelegationDepth: 1,
        },
      });
    } finally {
      await repo.cleanup();
    }
  });

  it("merges omitted docs roots from the current defaults", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
docs:
  layout: hierarchical
  roots:
    ai: docs/ai
  routing:
    root_index: docs/truthmark/areas.md
    area_files_root: docs/truthmark/areas
    default_area: repository
    max_delegation_depth: 1
authority:
  - docs/truthmark/areas.md
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.diagnostics).toEqual([]);
      expect(result.config?.docs.roots).toMatchObject({
        ai: "docs/ai",
        standards: "docs/standards",
        architecture: "docs/architecture",
        truth: "docs/truth",
      });
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects unsupported hierarchical routing depth", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
docs:
  layout: hierarchical
  roots:
    truth: docs/truth
  routing:
    root_index: docs/truthmark/areas.md
    area_files_root: docs/truthmark/areas
    default_area: repository
    max_delegation_depth: 2
authority:
  - docs/truthmark/areas.md
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.config).toBeNull();
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "error",
            message: expect.stringContaining("max_delegation_depth"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects unknown platform names", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
platforms:
  - codex
  - unknown-agent
authority:
  - docs/truthmark/areas.md
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics.some((diagnostic) => diagnostic.message.includes("allowed"))).toBe(
        true,
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("returns config diagnostics for invalid config data", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 2
authority: invalid
automation:
  enabled: true
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "error",
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects retired config keys", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
authority:
  - docs/truthmark/areas.md
alignment:
  mode: packet
outputs:
  directory: .truthmark/cache
`,
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.config).toBeNull();
      expect(result.diagnostics.some((diagnostic) => diagnostic.message.includes("alignment"))).toBe(
        true,
      );
      expect(
        result.diagnostics.some((diagnostic) => diagnostic.message.includes("outputs")),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns a typed missing status when config does not exist yet", async () => {
    const repo = await createTempRepo();

    try {
      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("missing");
      expect(result.config).toBeNull();
      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          category: "config",
          severity: "error",
          file: ".truthmark/config.yml",
        }),
      ]);
    } finally {
      await repo.cleanup();
    }
  });
});
