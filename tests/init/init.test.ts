import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("runInit", () => {
  it("does not initialize agent surfaces before config exists", async () => {
    const repo = await createTempRepo();

    try {
      const result = await runInit(repo.rootDir);

      expect(result.command).toBe("init");
      expect(result.summary).toContain("Run truthmark config first");
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "error",
            file: ".truthmark/config.yml",
          }),
        ]),
      );
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/TRUTHMARK.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/docs/truthmark/areas.md`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("creates the Truthmark scaffold in an empty repository", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      const result = await runInit(repo.rootDir);

      expect(result.command).toBe("init");
      expect(await repo.readFile(".truthmark/config.yml")).toContain("version: 1");
      expect(await repo.readFile(".truthmark/config.yml")).toContain("platforms:");
      expect(await repo.readFile(".truthmark/config.yml")).not.toContain("specs_draft");
      await expect(fs.stat(`${repo.rootDir}/.truthmark/local.example.yml`)).rejects.toThrow();
      expect(await repo.readFile("TRUTHMARK.md")).toContain(
        "Markdown in the current checkout is authoritative for this branch.",
      );
      expect(await repo.readFile("docs/truthmark/areas.md")).toContain("# Truthmark Areas");
      expect(await repo.readFile("docs/truthmark/areas.md")).toContain("Area files:");
      expect(await repo.readFile("docs/truthmark/areas.md")).toContain(
        "- docs/truthmark/areas/repository.md",
      );
      expect(await repo.readFile("docs/truthmark/areas/repository.md")).toContain(
        "# Repository Areas",
      );
      expect(await repo.readFile("docs/truthmark/areas/repository.md")).toContain(
        "Truth documents:",
      );
      expect(await repo.readFile("docs/truthmark/areas/repository.md")).toContain(
        "- docs/features/repository/overview.md",
      );
      expect(await repo.readFile("docs/truthmark/areas/repository.md")).not.toContain(
        "- docs/features/README.md",
      );
      expect(await repo.readFile("docs/features/README.md")).toContain("Feature Docs");
      expect(await repo.readFile("docs/features/README.md")).toContain("index");
      expect(await repo.readFile("docs/features/repository/README.md")).toContain(
        "Repository Feature Docs",
      );
      expect(await repo.readFile("docs/features/repository/README.md")).toContain("index");
      expect(await repo.readFile("docs/features/repository/overview.md")).toContain(
        "# Repository Overview",
      );
      expect(await repo.readFile("docs/features/repository/overview.md")).toContain(
        "## Current Behavior",
      );
      expect(await repo.readFile("docs/features/repository/overview.md")).toContain(
        "## Product Decisions",
      );
      expect(await repo.readFile("docs/features/repository/overview.md")).toContain(
        "## Rationale",
      );
      await expect(fs.stat(`${repo.rootDir}/docs/features/current/README.md`)).rejects.toThrow();

      const agents = await repo.readFile("AGENTS.md");
      const structureSkill = await repo.readFile(".codex/skills/truthmark-structure/SKILL.md");
      const structureSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-structure/agents/openai.yaml",
      );
      const structureOpenCodeSkill = await repo.readFile("skills/truthmark-structure/SKILL.md");
      const structureOpenCodePluginSkill = await repo.readFile(
        ".opencode/skills/truthmark-structure/SKILL.md",
      );
      const syncSkill = await repo.readFile(".codex/skills/truthmark-sync/SKILL.md");
      const syncSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-sync/agents/openai.yaml",
      );
      const syncOpenCodeSkill = await repo.readFile("skills/truthmark-sync/SKILL.md");
      const syncOpenCodePluginSkill = await repo.readFile(
        ".opencode/skills/truthmark-sync/SKILL.md",
      );
      const realizeSkill = await repo.readFile(".codex/skills/truthmark-realize/SKILL.md");
      const realizeSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-realize/agents/openai.yaml",
      );
      const realizeOpenCodeSkill = await repo.readFile("skills/truthmark-realize/SKILL.md");
      const checkSkill = await repo.readFile(".codex/skills/truthmark-check/SKILL.md");
      const checkSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-check/agents/openai.yaml",
      );
      const checkOpenCodeSkill = await repo.readFile("skills/truthmark-check/SKILL.md");
      const claudeInstructions = await repo.readFile("CLAUDE.md");

      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(claudeInstructions).toContain("Truthmark Workflow");
      expect(claudeInstructions.split("\n").length).toBeLessThanOrEqual(65);
      expect(agents).toContain("### Truth Structure");
      expect(agents).toContain("Generated by Truthmark 1.2.0");
      expect(agents).toContain("Automatic finish-time trigger");
      expect(agents).toContain("use the truthmark-sync skill before finishing");
      expect(agents).toContain("/skill truthmark-sync");
      expect(agents).toContain("/skill truthmark-structure");
      expect(agents).toContain("/skill truthmark-check");
      expect(agents).toContain("Truthmark hierarchy:");
      expect(agents).toContain("Root route index: docs/truthmark/areas.md");
      expect(agents).toContain("Area route files: docs/truthmark/areas/**/*.md");
      expect(agents).toContain("Feature docs: docs/features/**/*.md");
      expect(agents).toContain("Decision truth lives in the canonical doc it governs");
      expect(agents).not.toContain("truthmark check --json --workflow truth-sync");
      expect(agents).toContain("### Manual Truth Realize");
      expect(agents).toContain("### Truth Check");
      expect(agents).toContain("Only run when the user explicitly asks");
      expect(agents).toContain("host supports subagent dispatch");
      expect(agents).not.toContain(".truthmark/local.yml");
      expect(agents).not.toContain("truth_sync.sync_agent");
      expect(agents).toContain("must not rewrite functional code");
      expect(agents).toContain("do not edit truth docs or truth routing");
      expect(agents).toContain("documentation-only change");
      expect(agents).not.toContain("Truth Sync: completed");
      expect(agents).not.toContain("Truth Realize: completed");
      expect(agents.match(/Truthmark hierarchy:/g)).toHaveLength(1);
      expect(agents.match(/Decision truth lives/g)).toHaveLength(1);
      expect(structureSkill).toContain("name: truthmark-structure");
      expect(structureSkill).toContain("Truth Structure: completed");
      expect(structureSkillMetadata).toContain('display_name: "Truthmark Structure"');
      expect(structureOpenCodeSkill).toContain("name: truthmark-structure");
      expect(structureOpenCodePluginSkill).toContain("name: truthmark-structure");
      expect(syncSkill).toContain("name: truthmark-sync");
      expect(syncSkill).toContain("user-invocable: true");
      expect(syncSkill).toContain("truthmark-version: 1.2.0");
      expect(syncSkill).toContain("Use this skill automatically before finishing");
      expect(syncSkill).toContain("direct checkout inspection is the canonical path");
      expect(syncSkill).toContain("host supports subagent dispatch");
      expect(syncSkill).toContain(
        "Read .truthmark/config.yml, TRUTHMARK.md, the configured root route index",
      );
      expect(syncSkill).toContain("relevant child route files");
      expect(syncSkill).not.toContain(".truthmark/local.yml");
      expect(syncSkill).not.toContain("truth_sync.sync_agent");
      expect(syncSkill).not.toContain("truthmark check --json --workflow truth-sync");
      expect(syncSkillMetadata).toContain('display_name: "Truthmark Sync"');
      expect(syncSkillMetadata).toContain("allow_implicit_invocation: true");
      expect(syncSkillMetadata).toContain('version: "1.2.0"');
      expect(syncSkillMetadata).toContain('refresh_command: "truthmark init"');
      expect(syncOpenCodeSkill).toContain("name: truthmark-sync");
      expect(syncOpenCodeSkill).toContain("Use this skill automatically before finishing");
      expect(syncOpenCodePluginSkill).toContain("Use this skill automatically before finishing");
      expect(realizeSkill).toContain("name: truthmark-realize");
      expect(realizeSkill).toContain("user-invocable: true");
      expect(realizeSkill).toContain("may write functional code only");
      expect(realizeSkill).toContain("Truth Realize: completed");
      expect(realizeSkillMetadata).toContain('display_name: "Truthmark Realize"');
      expect(realizeSkillMetadata).toContain(
        'default_prompt: "Use $truthmark-realize to realize the updated truth docs into code."',
      );
      expect(realizeOpenCodeSkill).toContain("name: truthmark-realize");
      expect(realizeOpenCodeSkill).toContain(
        "Use this skill only when the user explicitly asks to realize truth docs into code.",
      );
      expect(checkSkill).toContain("name: truthmark-check");
      expect(checkSkill).toContain("Truth Check: completed");
      expect(checkSkillMetadata).toContain('display_name: "Truthmark Check"');
      expect(checkOpenCodeSkill).toContain("name: truthmark-check");
      await expect(fs.stat(`${repo.rootDir}/commands/truthmark-sync.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/commands/truthmark-realize.md`)).rejects.toThrow();

      await expect(fs.stat(`${repo.rootDir}/OPENCODE.md`)).rejects.toThrow();
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".codex/skills/truthmark-sync/SKILL.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".codex/skills/truthmark-structure/SKILL.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".codex/skills/truthmark-check/SKILL.md",
        ),
      ).toBe(true);
      expect(result.diagnostics.some((diagnostic) => diagnostic.message.includes("Created"))).toBe(
        true,
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("installs only configured platform surfaces on rerun with an existing config", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
platforms:
  - codex
  - cursor
  - github-copilot
  - gemini-cli
authority:
  - TRUTHMARK.md
  - docs/truthmark/areas.md
instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended: []
ignore: []
realization:
  enabled: true
`,
      );

      await runInit(repo.rootDir);

      await expect(fs.stat(`${repo.rootDir}/.codex/skills/truthmark-sync/SKILL.md`)).resolves.toBeTruthy();
      await expect(fs.stat(`${repo.rootDir}/.cursor/rules/truthmark.mdc`)).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.github/copilot-instructions.md`),
      ).resolves.toBeTruthy();
      await expect(fs.stat(`${repo.rootDir}/GEMINI.md`)).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/commands/truthmark/structure.toml`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/commands/truthmark/sync.toml`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/commands/truthmark/check.toml`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/commands/truthmark/realize.toml`),
      ).resolves.toBeTruthy();
      expect(await repo.readFile(".gemini/commands/truthmark/sync.toml")).toContain(
        "description = \"Sync repository truth docs from changed code.\"",
      );
      expect(await repo.readFile(".gemini/commands/truthmark/sync.toml")).toContain(
        "name: truthmark-sync",
      );
      expect(await repo.readFile(".gemini/commands/truthmark/realize.toml")).toContain(
        "description = \"Realize repository truth docs into code.\"",
      );
      expect(await repo.readFile("GEMINI.md")).toContain("/truthmark:sync");
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/CLAUDE.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/skills/truthmark-sync/SKILL.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/.opencode/skills/truthmark-sync/SKILL.md`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves existing docs and authored AGENTS content while scaffolding hierarchy", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("docs/architecture/system.md", "# System Architecture\n");
      await repo.writeFile("docs/features/authentication.md", "# Authentication\n");
      await repo.writeFile("AGENTS.md", "# Local Instructions\n\nKeep this section.\n");

      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);

      expect(await repo.readFile("docs/architecture/system.md")).toBe("# System Architecture\n");
      expect(await repo.readFile("docs/features/authentication.md")).toBe(
        "# Authentication\n",
      );

      const areas = await repo.readFile("docs/truthmark/areas.md");

      expect(areas).toContain("Area files:");
      expect(areas).toContain("docs/truthmark/areas/repository.md");

      const agents = await repo.readFile("AGENTS.md");

      expect(agents).toContain("# Local Instructions");
      expect(agents).toContain("Keep this section.");
      expect(agents).toContain("<!-- truthmark:start -->");
    } finally {
      await repo.cleanup();
    }
  });

  it("is idempotent and only updates the managed AGENTS block when needed", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.writeFile(
        "AGENTS.md",
        `${await repo.readFile("AGENTS.md")}\n\n## Local Notes\nDo not delete this note.\n`,
      );

      const beforeSecondRun = await repo.readFile("AGENTS.md");
      const secondResult = await runInit(repo.rootDir);
      const afterSecondRun = await repo.readFile("AGENTS.md");

      expect(afterSecondRun).toBe(beforeSecondRun);
      expect(afterSecondRun.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(afterSecondRun).toContain("Do not delete this note.");
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Unchanged AGENTS.md"),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Unchanged .codex/skills/truthmark-sync/SKILL.md"),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Unchanged .codex/skills/truthmark-structure/SKILL.md"),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Unchanged .codex/skills/truthmark-check/SKILL.md"),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Unchanged skills/truthmark-sync/SKILL.md"),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Unchanged .codex/skills/truthmark-realize/SKILL.md"),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Unchanged skills/truthmark-realize/SKILL.md"),
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("reports manual migration when configured feature root changes and old docs exist", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
docs:
  layout: hierarchical
  roots:
    features: docs/product
  routing:
    root_index: docs/truthmark/areas.md
    area_files_root: docs/truthmark/areas
    default_area: repository
    max_delegation_depth: 1
authority:
  - TRUTHMARK.md
  - docs/truthmark/areas.md
  - docs/truthmark/areas/**/*.md
  - docs/product/**/*.md
realization:
  enabled: true
`,
      );

      const result = await runInit(repo.rootDir);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "review",
            message: expect.stringContaining("manual migration"),
          }),
        ]),
      );
      expect(await repo.readFile("docs/features/README.md")).toContain("Feature Docs");
    } finally {
      await repo.cleanup();
    }
  });

  it("does not overwrite authored Truthmark-owned files on rerun", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        `${await repo.readFile(".truthmark/config.yml")}\ncustom: true\n`,
      );
      await repo.writeFile(
        "TRUTHMARK.md",
        `${await repo.readFile("TRUTHMARK.md")}\n## Local Notes\nKeep this text.\n`,
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `${await repo.readFile("docs/truthmark/areas.md")}\n## Local Area Notes\nKeep this routing note.\n`,
      );

      const result = await runInit(repo.rootDir);

      expect(await repo.readFile(".truthmark/config.yml")).toContain("custom: true");
      expect(await repo.readFile("TRUTHMARK.md")).toContain("Keep this text.");
      expect(await repo.readFile("docs/truthmark/areas.md")).toContain(
        "Keep this routing note.",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("repairs malformed or duplicated managed AGENTS blocks back to one block", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        `# Notes\n\n<!-- truthmark:start -->\nold block\n<!-- truthmark:end -->\n\n<!-- truthmark:start -->\nduplicate\n<!-- truthmark:end -->\n`,
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(agents.match(/<!-- truthmark:end -->/g)).toHaveLength(1);
      expect(agents).toContain("# Notes");
      expect(agents).toContain("## Truthmark Workflow");
    } finally {
      await repo.cleanup();
    }
  });

  it("removes orphaned managed block content before installing one clean block", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        "# Notes\n\nKeep this note.\n\n<!-- truthmark:start -->\n## Truthmark Workflow\nManaged fragment marker\n- may write truth docs only\n- must not rewrite functional code\n",
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(agents.match(/<!-- truthmark:end -->/g)).toHaveLength(1);
      expect(agents).toContain("Keep this note.");
      expect(agents).not.toContain("Managed fragment marker");
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves authored content above an orphaned end marker", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        "# Notes\nKeep this note.\n<!-- truthmark:end -->\n",
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents).toContain("# Notes");
      expect(agents).toContain("Keep this note.");
      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(agents.match(/<!-- truthmark:end -->/g)).toHaveLength(1);
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves authored content after an orphaned start marker when it does not look managed", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        "# Notes\n\n<!-- truthmark:start -->\nKeep this local note.\n",
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents).toContain("Keep this local note.");
      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(agents.match(/<!-- truthmark:end -->/g)).toHaveLength(1);
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves authored content above an orphaned end marker even with a single Truthmark heading", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        "# Notes\n\n## Truthmark Workflow\nThis section is authored guidance.\n<!-- truthmark:end -->\n",
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents).toContain("## Truthmark Workflow");
      expect(agents).toContain("This section is authored guidance.");
      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(agents.match(/<!-- truthmark:end -->/g)).toHaveLength(1);
    } finally {
      await repo.cleanup();
    }
  });

  it("removes a startless old managed workflow before an orphaned end marker", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        "# Notes\n\n## Truthmark Workflow\n\n### Truth Sync\n- may read changed functional code files\n- may write truth docs only\n<!-- truthmark:end -->\n",
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents.match(/## Truthmark Workflow/g)).toHaveLength(1);
      expect(agents.match(/### Truth Sync/g)).toHaveLength(1);
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves authored Truthmark-shaped guidance above an orphaned end marker", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        "# Notes\n\n## Truthmark Workflow\n- may use local aliases\n- must not merge without review\n<!-- truthmark:end -->\n",
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents).toContain("- may use local aliases");
      expect(agents).toContain("- must not merge without review");
      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(agents.match(/<!-- truthmark:end -->/g)).toHaveLength(1);
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves authored guidance above an orphaned end marker when it overlaps a few canonical lines", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "AGENTS.md",
        "# Notes\n\n## Truthmark Workflow\n### Truth Sync\n- may read changed functional code files\nThis is authored guidance.\n<!-- truthmark:end -->\n",
      );

      await runInit(repo.rootDir);

      const agents = await repo.readFile("AGENTS.md");

      expect(agents).toContain("This is authored guidance.");
      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(agents.match(/<!-- truthmark:end -->/g)).toHaveLength(1);
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps areas routing order stable across reruns when top-level markdown exists", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("notes.md", "# Notes\n");

      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      const firstAreas = await repo.readFile("docs/truthmark/areas.md");

      await runInit(repo.rootDir);
      const secondAreas = await repo.readFile("docs/truthmark/areas.md");

      expect(secondAreas).toBe(firstAreas);
    } finally {
      await repo.cleanup();
    }
  });
});
