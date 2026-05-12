import fs from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";
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
      await expect(
        fs.stat(`${repo.rootDir}/docs/truthmark/areas.md`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("creates the Truthmark scaffold in an empty repository", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      const result = await runInit(repo.rootDir);
      const config = parse(await repo.readFile(".truthmark/config.yml")) as {
        version: number;
        platforms: string[];
        docs: {
          roots: Record<string, string>;
        };
      };

      expect(result.command).toBe("init");
      expect(config.version).toBe(1);
      expect(config.platforms.length).toBeGreaterThan(0);
      expect(config.docs.roots).toEqual({
        ai: "docs/ai",
        standards: "docs/standards",
        architecture: "docs/architecture",
        features: "docs/features",
      });
      await expect(
        fs.stat(`${repo.rootDir}/.truthmark/local.example.yml`),
      ).rejects.toThrow();
      expect(await repo.readFile("docs/truthmark/areas.md")).toContain(
        "# Truthmark Areas",
      );
      expect(await repo.readFile("docs/truthmark/areas.md")).toContain(
        "Area files:",
      );
      expect(await repo.readFile("docs/truthmark/areas.md")).toContain(
        "- docs/truthmark/areas/repository.md",
      );
      expect(
        await repo.readFile("docs/truthmark/areas/repository.md"),
      ).toContain("# Repository Areas");
      expect(
        await repo.readFile("docs/truthmark/areas/repository.md"),
      ).toContain("Truth documents:");
      expect(
        await repo.readFile("docs/truthmark/areas/repository.md"),
      ).toContain("- docs/features/repository/overview.md");
      expect(
        await repo.readFile("docs/truthmark/areas/repository.md"),
      ).not.toContain("- docs/features/README.md");
      expect(await repo.readFile("docs/features/README.md")).toContain(
        "Feature Docs",
      );
      expect(await repo.readFile("docs/features/README.md")).toContain("index");
      expect(await repo.readFile("docs/templates/feature-doc.md")).toContain(
        "# {{title}}",
      );
      expect(await repo.readFile("docs/templates/feature-doc.md")).toContain(
        "## Current Behavior",
      );
      expect(await repo.readFile("docs/templates/feature-doc.md")).toContain(
        "## Scope\n\n{{scope}}",
      );
      expect(await repo.readFile("docs/templates/feature-doc.md")).toContain(
        "## Core Rules",
      );
      expect(await repo.readFile("docs/templates/feature-doc.md")).toContain(
        "## Flows And States",
      );
      expect(await repo.readFile("docs/templates/feature-doc.md")).toContain(
        "Split into another leaf doc when content introduces",
      );
      expect(
        await repo.readFile("docs/features/repository/README.md"),
      ).toContain("Repository Feature Docs");
      expect(
        await repo.readFile("docs/features/repository/README.md"),
      ).toContain("index");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("# Repository Overview");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain(
        "This doc was created from the editable feature-doc template at docs/templates/feature-doc.md.",
      );
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("## Current Behavior");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("## Purpose");
      expect(
        (await repo.readFile("docs/features/repository/overview.md")).match(
          /## Scope/g,
        ),
      ).toHaveLength(1);
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("## Non-Goals");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("## Maintenance Notes");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).not.toContain("{{");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("## Product Decisions");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("## Rationale");

      const agents = await repo.readFile("AGENTS.md");
      const structureSkill = await repo.readFile(
        ".codex/skills/truthmark-structure/SKILL.md",
      );
      const structureSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-structure/agents/openai.yaml",
      );
      const structureOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-structure/SKILL.md",
      );
      const documentSkill = await repo.readFile(
        ".codex/skills/truthmark-document/SKILL.md",
      );
      const documentSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-document/agents/openai.yaml",
      );
      const documentOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-document/SKILL.md",
      );
      const syncSkill = await repo.readFile(
        ".codex/skills/truthmark-sync/SKILL.md",
      );
      const syncSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-sync/agents/openai.yaml",
      );
      const syncOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-sync/SKILL.md",
      );
      const realizeSkill = await repo.readFile(
        ".codex/skills/truthmark-realize/SKILL.md",
      );
      const realizeSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-realize/agents/openai.yaml",
      );
      const realizeOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-realize/SKILL.md",
      );
      const checkSkill = await repo.readFile(
        ".codex/skills/truthmark-check/SKILL.md",
      );
      const checkSkillMetadata = await repo.readFile(
        ".codex/skills/truthmark-check/agents/openai.yaml",
      );
      const checkOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-check/SKILL.md",
      );
      const claudeInstructions = await repo.readFile("CLAUDE.md");
      const syncClaudeSkill = await repo.readFile(
        ".claude/skills/truthmark-sync/SKILL.md",
      );

      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(claudeInstructions).toContain("Truthmark Workflow");
      expect(claudeInstructions.split("\n").length).toBeLessThanOrEqual(25);
      expect(agents).not.toContain("### Truth Structure");
      expect(agents).toContain(`Generated by Truthmark ${TRUTHMARK_VERSION}`);
      expect(agents).toContain("Sync: finish-time when functional code changed");
      expect(agents).toContain("use the truthmark-sync skill before finishing");
      expect(agents).toContain("/skill truthmark-sync");
      expect(agents).not.toContain("/skill truthmark-structure");
      expect(agents).not.toContain("/skill truthmark-check");
      expect(agents).toContain(
        "Explicit workflows: Truth Structure, Truth Document, Truth Realize, Truth Check",
      );
      expect(agents).toContain("load the installed skill for details");
      expect(agents).toContain("Truthmark hierarchy:");
      expect(agents).toContain("Root route index: docs/truthmark/areas.md");
      expect(agents).toContain(
        "Area route files: docs/truthmark/areas/**/*.md",
      );
      expect(agents).toContain("Feature docs: docs/features/**/*.md");
      expect(agents).toContain(
        "Decision truth lives in the canonical doc it governs",
      );
      expect(agents).not.toContain(
        "truthmark check --json --workflow truth-sync",
      );
      expect(agents).not.toContain("### Manual Truth Realize");
      expect(agents).not.toContain("### Truth Check");
      expect(agents).toContain("Delegation is host-owned");
      expect(agents).not.toContain(".truthmark/local.yml");
      expect(agents).not.toContain("truth_sync.sync_agent");
      expect(agents).toContain("must not rewrite functional code");
      expect(agents).toContain("documentation-only change");
      expect(agents).toContain("code changed -> tests -> Sync -> report");
      expect(agents).not.toContain("Truth Sync: completed");
      expect(agents).not.toContain("Truth Realize: completed");
      expect(agents.match(/Truthmark hierarchy:/g)).toHaveLength(1);
      expect(agents.match(/Decision truth lives/g)).toHaveLength(1);
      expect(structureSkill).toContain("name: truthmark-structure");
      expect(structureSkill).toContain("Truth Structure: completed");
      expect(structureSkillMetadata).toContain(
        'display_name: "Truthmark Structure"',
      );
      expect(structureOpenCodeSkill).toContain("name: truthmark-structure");
      expect(documentSkill).toContain("name: truthmark-document");
      expect(documentSkill).toContain("Truth Document: completed");
      expect(documentSkill).toContain("must not write functional code");
      expect(documentSkillMetadata).toContain(
        'display_name: "Truthmark Document"',
      );
      expect(documentSkillMetadata).toContain("allow_implicit_invocation: false");
      expect(documentOpenCodeSkill).toContain("name: truthmark-document");
      expect(syncSkill).toContain("name: truthmark-sync");
      expect(syncSkill).toContain("user-invocable: true");
      expect(syncSkill).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
      expect(syncSkill).toContain(
        "Use this skill automatically before finishing",
      );
      expect(syncSkill).toContain(
        "direct checkout inspection is the canonical path",
      );
      expect(syncSkill).toContain("host supports subagent dispatch");
      expect(syncSkill).toContain(
        "Read .truthmark/config.yml, the configured root route index",
      );
      expect(syncSkill).toContain("relevant child route files");
      expect(syncSkill).not.toContain(".truthmark/local.yml");
      expect(syncSkill).not.toContain("truth_sync.sync_agent");
      expect(syncSkill).not.toContain(
        "truthmark check --json --workflow truth-sync",
      );
      expect(syncSkillMetadata).toContain('display_name: "Truthmark Sync"');
      expect(syncSkillMetadata).toContain("allow_implicit_invocation: true");
      expect(syncSkillMetadata).toContain(`version: "${TRUTHMARK_VERSION}"`);
      expect(syncSkillMetadata).toContain('refresh_command: "truthmark init"');
      expect(syncOpenCodeSkill).toContain("name: truthmark-sync");
      expect(syncOpenCodeSkill).toContain(
        "Use this skill automatically before finishing",
      );
      expect(syncClaudeSkill).toContain("name: truthmark-sync");
      expect(syncClaudeSkill).toContain(
        "Use this skill automatically before finishing",
      );
      expect(realizeSkill).toContain("name: truthmark-realize");
      expect(realizeSkill).toContain("user-invocable: true");
      expect(realizeSkill).toContain("may write functional code only");
      expect(realizeSkill).toContain("Truth Realize: completed");
      expect(realizeSkillMetadata).toContain(
        'display_name: "Truthmark Realize"',
      );
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
      await expect(
        fs.stat(`${repo.rootDir}/skills/truthmark-structure/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/skills/truthmark-document/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/skills/truthmark-sync/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/skills/truthmark-realize/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/skills/truthmark-check/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/commands/truthmark-sync.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/commands/truthmark-realize.md`),
      ).rejects.toThrow();

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
            diagnostic.file === ".claude/skills/truthmark-sync/SKILL.md",
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
            diagnostic.file === ".codex/skills/truthmark-document/SKILL.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".codex/skills/truthmark-check/SKILL.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Created"),
        ),
      ).toBe(true);
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
  - github-copilot
  - gemini-cli
authority:
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
      await repo.writeFile(
        "GEMINI.md",
        `Follow \`docs/ai/repo-rules.md\`.

Use that file as the primary repository instruction source for Codex.

Codex-specific:
- Read \`docs/README.md\` for the canonical docs map.
- Use \`docs/ai/agent-onboarding.md\` for quick task routing.
`,
      );

      await runInit(repo.rootDir);

      await expect(
        fs.stat(`${repo.rootDir}/.codex/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.github/copilot-instructions.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.github/prompts/truthmark-sync.prompt.md`),
      ).resolves.toBeTruthy();
      expect(
        await repo.readFile(".github/prompts/truthmark-sync.prompt.md"),
      ).toContain("GitHub Copilot /truthmark-sync");
      expect(
        await repo.readFile(".github/prompts/truthmark-document.prompt.md"),
      ).toContain("GitHub Copilot /truthmark-document");
      await expect(fs.stat(`${repo.rootDir}/GEMINI.md`)).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/commands/truthmark/structure.toml`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/commands/truthmark/document.toml`),
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
      expect(
        await repo.readFile(".gemini/commands/truthmark/sync.toml"),
      ).toContain(
        'description = "Sync repository truth docs from functional code changes; skip docs-only/no-code changes."',
      );
      expect(
        await repo.readFile(".gemini/commands/truthmark/sync.toml"),
      ).toContain("name: truthmark-sync");
      expect(
        await repo.readFile(".gemini/commands/truthmark/document.toml"),
      ).toContain("name: truthmark-document");
      expect(
        await repo.readFile(".gemini/commands/truthmark/realize.toml"),
      ).toContain('description = "Realize repository truth docs into code."');
      const geminiInstructions = await repo.readFile("GEMINI.md");
      expect(geminiInstructions).toContain("/truthmark:sync");
      expect(geminiInstructions).toContain(
        "Use that file as the primary repository instruction source for this agent.",
      );
      expect(geminiInstructions).toContain("Agent-specific:");
      expect(geminiInstructions).not.toContain("for Codex");
      expect(geminiInstructions).not.toContain("Codex-specific");
      expect(await repo.readFile("AGENTS.md")).toContain("Truthmark Workflow");
      await expect(fs.stat(`${repo.rootDir}/CLAUDE.md`)).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/skills/truthmark-sync/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/.opencode/skills/truthmark-sync/SKILL.md`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("installs Claude Code project skills when only claude-code is configured", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
platforms:
  - claude-code
authority:
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

      expect(await repo.readFile("CLAUDE.md")).toContain("Truthmark Workflow");
      expect(await repo.readFile("CLAUDE.md")).toContain(
        "Claude Code /truthmark-sync",
      );
      expect(
        await repo.readFile(".claude/skills/truthmark-sync/SKILL.md"),
      ).toContain("Claude Code /truthmark-sync");
      expect(
        await repo.readFile(".claude/skills/truthmark-structure/SKILL.md"),
      ).toContain("name: truthmark-structure");
      expect(
        await repo.readFile(".claude/skills/truthmark-document/SKILL.md"),
      ).toContain("Claude Code /truthmark-document");
      expect(
        await repo.readFile(".claude/skills/truthmark-check/SKILL.md"),
      ).toContain("name: truthmark-check");
      expect(
        await repo.readFile(".claude/skills/truthmark-realize/SKILL.md"),
      ).toContain("Claude Code /truthmark-realize");
      await expect(
        fs.stat(`${repo.rootDir}/.codex/skills/truthmark-sync/SKILL.md`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("installs GitHub Copilot prompt files when only github-copilot is configured", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
platforms:
  - github-copilot
authority:
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

      expect(await repo.readFile(".github/copilot-instructions.md")).toContain(
        "Truthmark Workflow",
      );
      expect(
        await repo.readFile(".github/prompts/truthmark-sync.prompt.md"),
      ).toContain("GitHub Copilot /truthmark-sync");
      expect(
        await repo.readFile(".github/prompts/truthmark-structure.prompt.md"),
      ).toContain("name: truthmark-structure");
      expect(
        await repo.readFile(".github/prompts/truthmark-document.prompt.md"),
      ).toContain("GitHub Copilot /truthmark-document");
      expect(
        await repo.readFile(".github/prompts/truthmark-check.prompt.md"),
      ).toContain("name: truthmark-check");
      expect(
        await repo.readFile(".github/prompts/truthmark-realize.prompt.md"),
      ).toContain("GitHub Copilot /truthmark-realize");
      await expect(
        fs.stat(`${repo.rootDir}/.codex/skills/truthmark-sync/SKILL.md`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves existing docs and authored AGENTS content while scaffolding hierarchy", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/architecture/system.md",
        "# System Architecture\n",
      );
      await repo.writeFile(
        "docs/features/authentication.md",
        "# Authentication\n",
      );
      await repo.writeFile(
        "AGENTS.md",
        "# Local Instructions\n\nKeep this section.\n",
      );

      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);

      expect(await repo.readFile("docs/architecture/system.md")).toBe(
        "# System Architecture\n",
      );
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

  it("uses an authored feature doc template for new scaffolded leaf docs", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "docs/templates/feature-doc.md",
        `---
status: active
doc_type: feature
last_reviewed: 2026-05-12
source_of_truth:
  - {{source_of_truth}}
---

# {{title}}

## Local Standard

Custom template for {{area}}.
`,
      );

      await runInit(repo.rootDir);

      expect(await repo.readFile("docs/templates/feature-doc.md")).toContain(
        "## Local Standard",
      );
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("## Local Standard");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).toContain("Custom template for repository.");
      expect(
        await repo.readFile("docs/features/repository/overview.md"),
      ).not.toContain("{{");
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects a broken feature-doc template symlink that would write outside the repo", async () => {
    const repo = await createTempRepo();
    const outsideTemplatePath = path.resolve(
      repo.rootDir,
      "..",
      "truthmark-outside-feature-doc-template.md",
    );

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile("docs/templates/.keep", "");
      await fs.symlink(
        outsideTemplatePath,
        path.join(repo.rootDir, "docs", "templates", "feature-doc.md"),
      );

      await expect(runInit(repo.rootDir)).rejects.toThrow(
        "must stay inside the repository root",
      );
      await expect(fs.stat(outsideTemplatePath)).rejects.toThrow();
    } finally {
      await fs.rm(outsideTemplatePath, { force: true });
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
          diagnostic.message.includes(
            "Unchanged .codex/skills/truthmark-sync/SKILL.md",
          ),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes(
            "Unchanged .codex/skills/truthmark-structure/SKILL.md",
          ),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes(
            "Unchanged .codex/skills/truthmark-check/SKILL.md",
          ),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes(
            "Unchanged .codex/skills/truthmark-realize/SKILL.md",
          ),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.map((diagnostic) => diagnostic.file),
      ).not.toContain("skills/truthmark-sync/SKILL.md");
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
      expect(await repo.readFile("docs/features/README.md")).toContain(
        "Feature Docs",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("does not overwrite authored config and routing files on rerun", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        `${await repo.readFile(".truthmark/config.yml")}\ncustom: true\n`,
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `${await repo.readFile("docs/truthmark/areas.md")}\n## Local Area Notes\nKeep this routing note.\n`,
      );

      await runInit(repo.rootDir);

      expect(await repo.readFile(".truthmark/config.yml")).toContain(
        "custom: true",
      );
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
