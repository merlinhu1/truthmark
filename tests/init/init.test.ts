import fs from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import {
  getTruthmarkWorkflow,
  TRUTHMARK_WORKFLOW_IDS,
} from "../../src/agents/workflow-manifest.js";
import { runCheck } from "../../src/checks/check.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const READ_ONLY_CONTEXT_BOUNDARY =
  "Do not preload AGENTS.md, CLAUDE.md, GEMINI.md, .github/copilot-instructions.md, or repo-wide policy docs unless the parent explicitly assigns them as evidence.";

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
        fs.stat(`${repo.rootDir}/docs/truthmark/routes/areas.md`),
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
        truthmark: Record<string, unknown>;
      };

      expect(result.command).toBe("init");
      expect(config.version).toBe(2);
      expect(config.platforms.length).toBeGreaterThan(0);
      expect(config.truthmark).toMatchObject({
        workspace: "docs/truthmark",
        generated: {
          portal: {
            enabled: false,
          },
        },
      });
      expect(config.truthmark).not.toHaveProperty("routes");
      expect(config.truthmark).not.toHaveProperty("templates");
      expect(config.truthmark).not.toHaveProperty("truth");
      await expect(
        fs.stat(`${repo.rootDir}/.truthmark/local.example.yml`),
      ).rejects.toThrow();
      expect(await repo.readFile("docs/truthmark/routes/areas.md")).toContain(
        "# Truthmark Areas",
      );
      expect(await repo.readFile("docs/truthmark/routes/areas.md")).toContain(
        "Area files:",
      );
      expect(await repo.readFile("docs/truthmark/routes/areas.md")).toContain(
        "- docs/truthmark/routes/areas/repository.md",
      );
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).toContain("# Repository Areas");
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).toContain("Truth documents:");
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).toContain(
        "path: docs/truthmark/engineering/repository/bootstrap-routing.md",
      );
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).toContain("kind: engineering-workflow");
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).toContain("provisional bootstrap route");
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).toContain("Run Truth Structure before normal Truth Sync");
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).not.toContain(
        "- docs/truthmark/engineering/repository/bootstrap-routing.md",
      );
      expect(
        await repo.readFile("docs/truthmark/routes/areas/repository.md"),
      ).not.toContain("- docs/truthmark/engineering/README.md");
      expect(
        await repo.readFile("docs/truthmark/engineering/README.md"),
      ).toContain("Truth Docs");
      expect(
        await repo.readFile("docs/truthmark/engineering/README.md"),
      ).toContain(
        "Keep engineering truth in bounded behavior, contract, architecture, workflow, operations, and test docs.",
      );
      expect(
        await repo.readFile("docs/truthmark/engineering/README.md"),
      ).not.toContain("<domain>/<behavior>.md");
      expect(await repo.readFile("docs/truthmark/product/README.md")).toContain(
        "Keep product truth in bounded capability docs.",
      );
      expect(
        await repo.readFile("docs/truthmark/product/README.md"),
      ).not.toContain("<domain>/<behavior>.md");
      expect(
        await repo.readFile("docs/truthmark/engineering/README.md"),
      ).toContain("index");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("# {{title}}");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("## Current Implementation Behavior");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("## Scope");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("{{scope}}");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("## Core Rules");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("## Flows And States");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("Split into another leaf doc when content introduces");
      expect(
        await repo.readFile("docs/truthmark/engineering/repository/README.md"),
      ).toContain("Repository Truth Docs");
      expect(
        await repo.readFile("docs/truthmark/engineering/repository/README.md"),
      ).toContain("index");
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/engineering/repository/overview.md`,
        ),
      ).rejects.toThrow();
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain("# Repository Bootstrap Routing");
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain("truth_kind: engineering-workflow");
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain("provisional broad route");
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain("Run Truth Structure before normal Truth Sync");
      const agents = await repo.readFile("AGENTS.md");
      const structureSkill = await repo.readFile(
        ".agents/skills/truthmark-structure/SKILL.md",
      );
      const structureReportTemplate = await repo.readFile(
        ".agents/skills/truthmark-structure/support/report-template.md",
      );
      const structureSkillMetadata = await repo.readFile(
        ".agents/skills/truthmark-structure/agents/openai.yaml",
      );
      const structureOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-structure/SKILL.md",
      );
      const documentSkill = await repo.readFile(
        ".agents/skills/truthmark-document/SKILL.md",
      );
      const documentSubagents = await repo.readFile(
        ".agents/skills/truthmark-document/support/subagents-and-leases.md",
      );
      const documentReportTemplate = await repo.readFile(
        ".agents/skills/truthmark-document/support/report-template.md",
      );
      const documentSkillMetadata = await repo.readFile(
        ".agents/skills/truthmark-document/agents/openai.yaml",
      );
      const documentOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-document/SKILL.md",
      );
      const documentHelperManifest = await repo.readFile(
        ".agents/skills/truthmark-document/helper-manifest.yml",
      );
      const syncSkill = await repo.readFile(
        ".agents/skills/truthmark-sync/SKILL.md",
      );
      const syncHelperManifest = await repo.readFile(
        ".agents/skills/truthmark-sync/helper-manifest.yml",
      );
      const syncHelperPolicy = await repo.readFile(
        ".agents/skills/truthmark-sync/support/helper-policy.md",
      );
      const syncProcedure = await repo.readFile(
        ".agents/skills/truthmark-sync/support/procedure.md",
      );
      const syncSubagents = await repo.readFile(
        ".agents/skills/truthmark-sync/support/subagents-and-leases.md",
      );
      const syncReportTemplate = await repo.readFile(
        ".agents/skills/truthmark-sync/support/report-template.md",
      );
      const syncSkillMetadata = await repo.readFile(
        ".agents/skills/truthmark-sync/agents/openai.yaml",
      );
      const syncOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-sync/SKILL.md",
      );
      const syncCopilotPrompt = await repo.readFile(
        ".github/prompts/truthmark-sync.prompt.md",
      );
      const syncCopilotSubagents = await repo.readFile(
        ".github/skills/truthmark-sync/support/subagents-and-leases.md",
      );
      const realizeSkill = await repo.readFile(
        ".agents/skills/truthmark-realize/SKILL.md",
      );
      const realizeSkillMetadata = await repo.readFile(
        ".agents/skills/truthmark-realize/agents/openai.yaml",
      );
      const realizeOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-realize/SKILL.md",
      );
      const previewSkill = await repo.readFile(
        ".agents/skills/truthmark-preview/SKILL.md",
      );
      const previewSubagents = await repo.readFile(
        ".agents/skills/truthmark-preview/support/subagents-and-leases.md",
      );
      const previewReportTemplate = await repo.readFile(
        ".agents/skills/truthmark-preview/support/report-template.md",
      );
      const previewSkillMetadata = await repo.readFile(
        ".agents/skills/truthmark-preview/agents/openai.yaml",
      );
      const previewOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-preview/SKILL.md",
      );
      const previewClaudeSkill = await repo.readFile(
        ".claude/skills/truthmark-preview/SKILL.md",
      );
      const previewCopilotPrompt = await repo.readFile(
        ".github/prompts/truthmark-preview.prompt.md",
      );
      const previewGeminiCommand = await repo.readFile(
        ".gemini/commands/truthmark/preview.toml",
      );
      const checkSkill = await repo.readFile(
        ".agents/skills/truthmark-check/SKILL.md",
      );
      const checkSkillMetadata = await repo.readFile(
        ".agents/skills/truthmark-check/agents/openai.yaml",
      );
      const checkOpenCodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-check/SKILL.md",
      );
      const routeAuditorAgent = await repo.readFile(
        ".codex/agents/truth-route-auditor.toml",
      );
      const claimVerifierAgent = await repo.readFile(
        ".codex/agents/truth-claim-verifier.toml",
      );
      const docReviewerAgent = await repo.readFile(
        ".codex/agents/truth-doc-reviewer.toml",
      );
      const docWriterAgent = await repo.readFile(
        ".codex/agents/truth-doc-writer.toml",
      );
      const openCodeRouteAuditorAgent = await repo.readFile(
        ".opencode/agents/truth-route-auditor.md",
      );
      const openCodeClaimVerifierAgent = await repo.readFile(
        ".opencode/agents/truth-claim-verifier.md",
      );
      const openCodeDocReviewerAgent = await repo.readFile(
        ".opencode/agents/truth-doc-reviewer.md",
      );
      const openCodeDocWriterAgent = await repo.readFile(
        ".opencode/agents/truth-doc-writer.md",
      );
      const copilotRouteAuditorAgent = await repo.readFile(
        ".github/agents/truth-route-auditor.md",
      );
      const copilotClaimVerifierAgent = await repo.readFile(
        ".github/agents/truth-claim-verifier.md",
      );
      const copilotDocReviewerAgent = await repo.readFile(
        ".github/agents/truth-doc-reviewer.md",
      );
      const copilotDocWriterAgent = await repo.readFile(
        ".github/agents/truth-doc-writer.md",
      );
      const claudeRouteAuditorAgent = await repo.readFile(
        ".claude/agents/truth-route-auditor.md",
      );
      const claudeClaimVerifierAgent = await repo.readFile(
        ".claude/agents/truth-claim-verifier.md",
      );
      const claudeDocReviewerAgent = await repo.readFile(
        ".claude/agents/truth-doc-reviewer.md",
      );
      const claudeDocWriterAgent = await repo.readFile(
        ".claude/agents/truth-doc-writer.md",
      );
      const claudeInstructions = await repo.readFile("CLAUDE.md");
      const syncClaudeSkill = await repo.readFile(
        ".claude/skills/truthmark-sync/SKILL.md",
      );
      const syncClaudeSubagents = await repo.readFile(
        ".claude/skills/truthmark-sync/support/subagents-and-leases.md",
      );

      expect(agents.match(/<!-- truthmark:start -->/g)).toHaveLength(1);
      expect(claudeInstructions).toContain("Truthmark Workflow");
      expect(claudeInstructions.split("\n").length).toBeLessThanOrEqual(20);
      expect(agents).not.toContain("### Truth Structure");
      expect(agents).toContain(`Generated by Truthmark ${TRUTHMARK_VERSION}`);
      expect(agents).toContain("After functional code changes");
      expect(agents).toContain("use the truthmark-sync skill before finishing");
      expect(agents).not.toContain("/skill truthmark-sync");
      expect(agents).not.toContain("Explicit invocation:");
      expect(agents).not.toContain("/skill truthmark-structure");
      expect(agents).not.toContain("/skill truthmark-check");
      expect(agents).toContain(
        "Explicit workflows: Truth Structure, Truth Document, Truth Preview, Truth Realize, Truth Check",
      );
      expect(agents).toContain("load the installed skill for details");
      expect(agents).toContain("Hierarchy hints: config .truthmark/config.yml");
      expect(agents).toContain("routes docs/truthmark/routes/areas.md");
      expect(agents).toContain("docs/truthmark/routes/areas/**/*.md");
      expect(agents).toContain(
        "Truth docs: docs/truthmark/product/**/*.md and docs/truthmark/engineering/**/*.md",
      );
      expect(agents).toContain(
        "Decisions live in the canonical doc they govern",
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
      expect(agents).toContain("docs-only/no-code changes");
      expect(agents).toContain("code changed -> tests -> Sync -> report");
      expect(agents).not.toContain("Truth Sync: completed");
      expect(agents).not.toContain("Truth Realize: completed");
      expect(agents.match(/Hierarchy hints: config/g)).toHaveLength(1);
      expect(agents.match(/Decisions live/g)).toHaveLength(1);
      expect(structureSkill).toContain("name: truthmark-structure");
      expect(structureSkill).toContain("support/procedure.md");
      expect(structureSkill).not.toContain("not the workflow source of truth");
      expect(structureSkill).not.toContain("Truth Structure: completed");
      expect(structureSkill.split("\n").length).toBeLessThanOrEqual(55);
      expect(structureReportTemplate).toContain("Truth Structure: completed");
      expect(structureSkillMetadata).toContain(
        'display_name: "Truthmark Structure"',
      );
      expect(structureOpenCodeSkill).toContain("name: truthmark-structure");
      expect(documentSkill).toContain("name: truthmark-document");
      expect(documentSkill).toContain("support/procedure.md");
      expect(documentSkill).not.toContain("not the workflow source of truth");
      expect(documentSkill).not.toContain("Truth Document: completed");
      expect(documentSkill).not.toContain("Parent workflow:");
      expect(documentSkill).not.toContain("truth_doc_writer");
      expect(documentSkill).toContain("support/helper-policy.md");
      expect(documentSkill.split("\n").length).toBeLessThanOrEqual(55);
      expect(documentHelperManifest).toContain("validate-document-report:");
      expect(documentSubagents).toContain("truth_doc_writer");
      expect(documentSubagents).toContain("write lease");
      expect(documentReportTemplate).toContain("Truth Document: completed");
      expect(documentSkillMetadata).toContain(
        'display_name: "Truthmark Document"',
      );
      expect(documentSkillMetadata).toContain(
        "allow_implicit_invocation: false",
      );
      expect(documentOpenCodeSkill).toContain("name: truthmark-document");
      expect(documentOpenCodeSkill).toContain("support/subagents-and-leases.md");
      expect(documentOpenCodeSkill).not.toContain("OpenCode subagent mode:");
      expect(syncSkill).toContain("name: truthmark-sync");
      expect(syncSkill).toContain("user-invocable: true");
      expect(syncSkill).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
      expect(syncSkill).toContain("Use this skill automatically before finishing");
      expect(syncSkill).not.toContain("not the workflow source of truth");
      expect(syncSkill).toContain("support/procedure.md");
      expect(syncSkill).not.toContain("validate-sync-report.mjs report.md");
      expect(syncSkill).not.toContain("host supports subagent dispatch");
      expect(syncSkill).not.toContain("truth_doc_writer");
      expect(syncSkill).not.toContain("Truth Sync: completed");
      expect(syncSkill.split("\n").length).toBeLessThanOrEqual(55);
      expect(syncHelperManifest).toContain("validate-sync-report:");
      expect(syncHelperManifest).toContain("optional: true");
      expect(syncHelperManifest).toContain("runner: truthmark>=");
      expect(syncHelperManifest).toContain("command:");
      expect(syncHelperManifest).toContain("argv:");
      expect(syncHelperManifest).toContain("- truthmark");
      expect(syncHelperManifest).toContain("- validate");
      expect(syncHelperManifest).toContain("- sync-report");
      expect(syncHelperManifest).toContain("- <report-file>");
      expect(syncHelperManifest).toContain("- --json");
      expect(syncHelperManifest).not.toContain(
        "cd .agents/skills/truthmark-sync",
      );
      expect(syncHelperManifest).not.toContain("node scripts/");
      expect(syncHelperManifest).toContain("writes: false");
      expect(syncHelperPolicy).toContain("Optional helper CLI commands");
      expect(syncHelperPolicy).toContain("manual fallback");
      expect(syncHelperPolicy).toContain("Helper scripts:");
      await expect(
        repo.readFile(
          ".agents/skills/truthmark-sync/scripts/validate-sync-report.mjs",
        ),
      ).rejects.toThrow();
      expect(syncProcedure).toContain("host supports subagent dispatch");
      expect(syncSubagents).toContain("truth_doc_writer");
      expect(syncSubagents).toContain("write lease");
      expect(syncReportTemplate).toContain("Truth Sync: completed");
      expect(syncReportTemplate).toContain("Truth Sync: blocked");
      expect(syncSkill).toContain("support/report-template.md");
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
      expect(syncOpenCodeSkill).toContain("Use this skill automatically before finishing");
      expect(syncOpenCodeSkill).not.toContain("not the workflow source of truth");
      expect(syncOpenCodeSkill).not.toContain("OpenCode subagent mode:");
      expect(
        await repo.readFile(".opencode/skills/truthmark-sync/helper-manifest.yml"),
      ).toContain("validate-sync-report:");
      expect(syncCopilotPrompt).toContain(
        "This prompt is the GitHub Copilot entrypoint for Truthmark Sync.",
      );
      expect(syncCopilotPrompt).toContain(
        "Do not invoke another Truthmark command from here.",
      );
      expect(syncCopilotPrompt).toContain(
        ".github/skills/truthmark-sync/support/subagents-and-leases.md",
      );
      expect(syncCopilotSubagents).toContain("Copilot custom-agent mode:");
      expect(syncCopilotSubagents).toContain("@truth-route-auditor");
      expect(syncCopilotSubagents).toContain("@truth-claim-verifier");
      expect(syncCopilotSubagents).toContain("@truth-doc-writer");
      expect(syncCopilotPrompt).not.toContain(
        "scripts/validate-sync-report.mjs",
      );
      expect(syncClaudeSkill).toContain("name: truthmark-sync");
      expect(syncClaudeSkill).toContain(
        "Use this skill automatically before finishing",
      );
      expect(syncClaudeSkill).toContain("support/subagents-and-leases.md");
      expect(syncClaudeSkill).not.toContain("Claude Code subagent mode:");
      expect(syncClaudeSubagents).toContain("Claude Code subagent mode:");
      expect(syncClaudeSubagents).toContain("truth-route-auditor subagent");
      expect(syncClaudeSubagents).toContain("truth-claim-verifier subagent");
      expect(syncClaudeSubagents).toContain("truth-doc-writer subagent");
      expect(
        await repo.readFile(
          ".claude/skills/truthmark-sync/helper-manifest.yml",
        ),
      ).toContain("validate-sync-report:");
      expect(realizeSkill).toContain("name: truthmark-realize");
      expect(realizeSkill).toContain("user-invocable: true");
      expect(realizeSkill).toContain("support/procedure.md");
      expect(realizeSkill).not.toContain("not the workflow source of truth");
      expect(realizeSkill).not.toContain("Truth Realize: completed");
      expect(realizeSkillMetadata).toContain(
        'display_name: "Truthmark Realize"',
      );
      expect(realizeSkillMetadata).toContain(
        'default_prompt: "Use $truthmark-realize to realize the updated truth docs into code."',
      );
      expect(realizeOpenCodeSkill).toContain("name: truthmark-realize");
      expect(realizeOpenCodeSkill).toContain("support/procedure.md");
      expect(previewSkill).toContain("name: truthmark-preview");
      expect(previewSkill).toContain("support/procedure.md");
      expect(previewSkill).not.toContain("not the workflow source of truth");
      expect(previewSkill).not.toContain("Truth Preview: completed");
      expect(previewSkill).not.toContain("truth_route_auditor");
      expect(previewReportTemplate).toContain("Truth Preview: completed");
      expect(previewReportTemplate).toContain("Handoff:");
      expect(previewSubagents).toContain("truth_route_auditor");
      expect(previewSkill).not.toContain("truth_doc_writer");
      expect(previewSkillMetadata).toContain(
        'display_name: "Truthmark Preview"',
      );
      expect(previewSkillMetadata).toContain(
        "allow_implicit_invocation: false",
      );
      expect(previewOpenCodeSkill).toContain("name: truthmark-preview");
      expect(previewOpenCodeSkill).toContain("support/procedure.md");
      expect(previewClaudeSkill).toContain("name: truthmark-preview");
      expect(previewCopilotPrompt).toContain(
        "This prompt is the GitHub Copilot entrypoint for Truthmark Preview.",
      );
      expect(previewCopilotPrompt).toContain(
        "Do not invoke another Truthmark command from here.",
      );
      expect(previewCopilotPrompt).toContain(
        ".github/skills/truthmark-preview/support/report-template.md",
      );
      expect(previewGeminiCommand).toContain(
        "This command is the Gemini CLI entrypoint for Truthmark Preview.",
      );
      expect(previewGeminiCommand).not.toContain("helper-manifest.yml");
      expect(checkSkill).toContain("name: truthmark-check");
      expect(checkSkill).toContain("support/procedure.md");
      expect(checkSkill).not.toContain("not the workflow source of truth");
      expect(checkSkill).not.toContain("Truth Check: completed");
      expect(checkSkill).not.toContain("Codex subagent mode:");
      expect(checkSkillMetadata).toContain('display_name: "Truthmark Check"');
      expect(checkOpenCodeSkill).toContain("name: truthmark-check");
      expect(checkOpenCodeSkill).toContain("support/subagents-and-leases.md");
      expect(checkOpenCodeSkill).not.toContain("OpenCode subagent mode:");
      expect(routeAuditorAgent).toContain('name = "truth_route_auditor"');
      expect(routeAuditorAgent).toContain('sandbox_mode = "read-only"');
      expect(routeAuditorAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(claimVerifierAgent).toContain('name = "truth_claim_verifier"');
      expect(claimVerifierAgent).toContain('sandbox_mode = "read-only"');
      expect(claimVerifierAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(docReviewerAgent).toContain('name = "truth_doc_reviewer"');
      expect(docReviewerAgent).toContain('sandbox_mode = "read-only"');
      expect(docReviewerAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(docWriterAgent).toContain('name = "truth_doc_writer"');
      expect(docWriterAgent).toContain('sandbox_mode = "workspace-write"');
      expect(docWriterAgent).toContain("Require an explicit write lease");
      expect(docWriterAgent).not.toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(openCodeRouteAuditorAgent).toContain("mode: subagent");
      expect(openCodeRouteAuditorAgent).toContain("edit: deny");
      expect(openCodeRouteAuditorAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(openCodeClaimVerifierAgent).toContain("mode: subagent");
      expect(openCodeClaimVerifierAgent).toContain("edit: deny");
      expect(openCodeClaimVerifierAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(openCodeDocReviewerAgent).toContain("mode: subagent");
      expect(openCodeDocReviewerAgent).toContain("edit: deny");
      expect(openCodeDocReviewerAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(openCodeDocWriterAgent).toContain("mode: subagent");
      expect(openCodeDocWriterAgent).toContain(
        '"docs/truthmark/engineering/**": allow',
      );
      expect(openCodeDocWriterAgent).toContain("@truth-doc-writer");
      expect(openCodeDocWriterAgent).not.toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(copilotRouteAuditorAgent).toContain("name: truth-route-auditor");
      expect(copilotRouteAuditorAgent).toContain("tools: [read, search]");
      expect(copilotRouteAuditorAgent).toContain("Stay read-only.");
      expect(copilotRouteAuditorAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(copilotClaimVerifierAgent).toContain("name: truth-claim-verifier");
      expect(copilotClaimVerifierAgent).toContain("unsupportedClaims");
      expect(copilotClaimVerifierAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(copilotDocReviewerAgent).toContain("name: truth-doc-reviewer");
      expect(copilotDocReviewerAgent).toContain("recommendedWorkflow");
      expect(copilotDocReviewerAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(copilotDocWriterAgent).toContain("name: truth-doc-writer");
      expect(copilotDocWriterAgent).toContain("tools: [read, search, edit]");
      expect(copilotDocWriterAgent).toContain("offLeaseChanges");
      expect(copilotDocWriterAgent).not.toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(claudeRouteAuditorAgent).toContain("name: truth-route-auditor");
      expect(claudeRouteAuditorAgent).toContain("tools: Read, Grep, Glob, LS");
      expect(claudeRouteAuditorAgent).toContain(
        "Manual invocation: use the truth-route-auditor subagent",
      );
      expect(claudeRouteAuditorAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(claudeRouteAuditorAgent).toContain("Do not edit files");
      expect(claudeClaimVerifierAgent).toContain("name: truth-claim-verifier");
      expect(claudeClaimVerifierAgent).toContain("tools: Read, Grep, Glob, LS");
      expect(claudeClaimVerifierAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(claudeClaimVerifierAgent).toContain("Do not edit files");
      expect(claudeDocReviewerAgent).toContain("name: truth-doc-reviewer");
      expect(claudeDocReviewerAgent).toContain("tools: Read, Grep, Glob, LS");
      expect(claudeDocReviewerAgent).toContain(READ_ONLY_CONTEXT_BOUNDARY);
      expect(claudeDocReviewerAgent).toContain("Product Decisions");
      expect(claudeDocReviewerAgent).toContain("Engineering Decisions");
      expect(claudeDocReviewerAgent).toContain(
        "lane-appropriate decision sections",
      );
      expect(claudeDocWriterAgent).toContain("name: truth-doc-writer");
      expect(claudeDocWriterAgent).toContain(
        "tools: Read, Grep, Glob, LS, Edit, MultiEdit",
      );
      expect(claudeDocWriterAgent).toContain("explicit parent write lease");
      expect(claudeDocWriterAgent).not.toContain(READ_ONLY_CONTEXT_BOUNDARY);
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
            diagnostic.file === ".agents/skills/truthmark-sync/SKILL.md",
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
            diagnostic.file === ".claude/agents/truth-route-auditor.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".agents/skills/truthmark-structure/SKILL.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".agents/skills/truthmark-document/SKILL.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".agents/skills/truthmark-check/SKILL.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "truth-sync" &&
            diagnostic.file === ".opencode/agents/truth-route-auditor.md",
        ),
      ).toBe(true);
      const diagnosticCategoriesByFile = new Map(
        result.diagnostics.map((diagnostic) => [
          diagnostic.file,
          diagnostic.category,
        ]),
      );
      for (const file of [
        ".github/prompts/truthmark-realize.prompt.md",
        ".github/skills/truthmark-realize/SKILL.md",
        ".claude/skills/truthmark-realize/SKILL.md",
        ".opencode/skills/truthmark-realize/SKILL.md",
        ".gemini/skills/truthmark-realize/SKILL.md",
      ]) {
        expect(diagnosticCategoriesByFile.get(file)).toBe("realization");
      }
      expect(
        result.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Created"),
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("scaffolds typed truth-doc defaults under the workspace truth root", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);

      const config = parse(await repo.readFile(".truthmark/config.yml")) as {
        truthmark: { workspace: string };
      };

      expect(config.truthmark.workspace).toBe("docs/truthmark");
      expect(
        await repo.readFile("docs/truthmark/engineering/README.md"),
      ).toContain("Truth Docs");
      expect(
        await repo.readFile("docs/truthmark/engineering/repository/README.md"),
      ).toContain("Repository Truth Docs");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("truth_kind: engineering-behavior");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("## Current Implementation Behavior");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-contract.md"),
      ).toContain("## Contract Surface");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-contract.md"),
      ).toContain("{{contract_surface}}");
      expect(
        await repo.readFile(
          "docs/truthmark/templates/engineering-architecture.md",
        ),
      ).toContain("## Boundaries");
      expect(
        await repo.readFile("docs/truthmark/templates/engineering-workflow.md"),
      ).toContain("## Execution Model");
      expect(
        await repo.readFile(
          "docs/truthmark/templates/engineering-operations.md",
        ),
      ).toContain("## Runtime Topology");
      expect(
        await repo.readFile(
          "docs/truthmark/templates/engineering-test-behavior.md",
        ),
      ).toContain("## Assertions And Invariants");
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain("truth_kind: engineering-workflow");
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain(
        "This doc is a bootstrap handoff, not a behavior truth dumping ground.",
      );
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain(
        "Run Truth Structure before normal Truth Sync when real code changes touch only this broad route.",
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
        `version: 2
platforms:
  - codex
  - github-copilot
  - gemini-cli
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended: []
ignore: []
`,
      );
      await runInit(repo.rootDir);

      await expect(
        fs.stat(`${repo.rootDir}/.agents/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.github/copilot-instructions.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.github/prompts/truthmark-sync.prompt.md`),
      ).resolves.toBeTruthy();
      expect(
        await repo.readFile(".github/prompts/truthmark-sync.prompt.md"),
      ).toContain(
        "This prompt is the GitHub Copilot entrypoint for Truthmark Sync.",
      );
      expect(
        await repo.readFile(".github/prompts/truthmark-document.prompt.md"),
      ).toContain(
        "This prompt is the GitHub Copilot entrypoint for Truthmark Document.",
      );
      await expect(
        fs.stat(`${repo.rootDir}/.github/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();
      expect(
        await repo.readFile(".github/skills/truthmark-sync/SKILL.md"),
      ).toContain("Use as a Copilot agent skill.");
      expect(
        await repo.readFile(".github/skills/truthmark-sync/SKILL.md"),
      ).toContain("helper-manifest.yml");
      expect(
        await repo.readFile(
          ".github/skills/truthmark-sync/support/subagents-and-leases.md",
        ),
      ).toContain("@truth-doc-writer");
      expect(
        await repo.readFile(
          ".github/skills/truthmark-document/helper-manifest.yml",
        ),
      ).toContain("validate-document-report:");
      expect(
        await repo.readFile(
          ".github/skills/truthmark-document/support/helper-policy.md",
        ),
      ).not.toContain("scripts/validate-document-report.mjs");
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
        `description = "${getTruthmarkWorkflow("truthmark-sync").description}"`,
      );
      expect(
        await repo.readFile(".gemini/commands/truthmark/sync.toml"),
      ).toContain(
        "This command is the Gemini CLI entrypoint for Truthmark Sync.",
      );
      expect(
        await repo.readFile(".gemini/commands/truthmark/sync.toml"),
      ).toContain(".gemini/skills/truthmark-sync/SKILL.md");
      expect(
        await repo.readFile(".gemini/commands/truthmark/document.toml"),
      ).toContain(
        `description = "${getTruthmarkWorkflow("truthmark-document").description}"`,
      );
      expect(
        await repo.readFile(".gemini/commands/truthmark/realize.toml"),
      ).toContain(
        `description = "${getTruthmarkWorkflow("truthmark-realize").description}"`,
      );
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();
      expect(
        await repo.readFile(".gemini/skills/truthmark-sync/SKILL.md"),
      ).toContain("Use as a Gemini CLI Agent Skill");
      expect(
        await repo.readFile(".gemini/skills/truthmark-sync/SKILL.md"),
      ).toContain("helper-manifest.yml");
      expect(
        await repo.readFile(
          ".gemini/skills/truthmark-document/helper-manifest.yml",
        ),
      ).toContain("validate-document-report:");
      expect(
        await repo.readFile(
          ".gemini/skills/truthmark-sync/support/subagents-and-leases.md",
        ),
      ).toContain("@truth-doc-writer");
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/agents/truth-route-auditor.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.gemini/agents/truth-doc-writer.md`),
      ).resolves.toBeTruthy();
      const geminiInstructions = await repo.readFile("GEMINI.md");
      expect(geminiInstructions).not.toContain("/truthmark:sync");
      expect(geminiInstructions).toContain("Truthmark Workflow");
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

  it("writes host-native skill package files without repo-local workflow copies", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);

      await expect(
        repo.readFile(".truthmark/agent/manifest.json"),
      ).rejects.toThrow();

      for (const workflowId of TRUTHMARK_WORKFLOW_IDS.filter(
        (id) => id !== "truthmark-portal",
      )) {
        const skillPath = `.agents/skills/${workflowId}/SKILL.md`;
        const skill = await repo.readFile(skillPath);

        expect(skill).toContain(`name: ${workflowId}`);
        expect(skill).toContain("support/procedure.md");
        expect(skill).not.toContain("not the workflow source of truth");
      }

      const agentsSkill = await repo.readFile(
        ".agents/skills/truthmark-sync/SKILL.md",
      );
      const opencodeSkill = await repo.readFile(
        ".opencode/skills/truthmark-sync/SKILL.md",
      );

      for (const skill of [agentsSkill, opencodeSkill]) {
        expect(skill).toContain("Use this skill automatically before finishing");
        expect(skill).toContain("support/procedure.md");
        expect(skill).not.toContain("not the workflow source of truth");
      }
      expect(
        await repo.readFile(".agents/skills/truthmark-sync/support/procedure.md"),
      ).toContain("Parent workflow:");
      expect(
        await repo.readFile(
          ".opencode/skills/truthmark-sync/support/report-template.md",
        ),
      ).toContain("Changed code reviewed:");
    } finally {
      await repo.cleanup();
    }
  });

  it("installs Claude Code project skills when only claude-code is configured", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 2
platforms:
  - claude-code
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended: []
ignore: []
`,
      );

      await runInit(repo.rootDir);

      expect(await repo.readFile("CLAUDE.md")).toContain("Truthmark Workflow");
      expect(await repo.readFile("CLAUDE.md")).not.toContain(
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
        await repo.readFile(
          ".claude/skills/truthmark-document/support/subagents-and-leases.md",
        ),
      ).toContain("Claude Code subagent mode:");
      expect(
        await repo.readFile(".claude/agents/truth-route-auditor.md"),
      ).toContain("name: truth-route-auditor");
      expect(
        await repo.readFile(".claude/agents/truth-claim-verifier.md"),
      ).toContain("tools: Read, Grep, Glob, LS");
      expect(
        await repo.readFile(".claude/agents/truth-doc-reviewer.md"),
      ).toContain("recommendedWorkflow");
      expect(
        await repo.readFile(".claude/skills/truthmark-check/SKILL.md"),
      ).toContain("name: truthmark-check");
      expect(
        await repo.readFile(".claude/skills/truthmark-realize/SKILL.md"),
      ).toContain("Claude Code /truthmark-realize");
      await expect(
        fs.stat(`${repo.rootDir}/.agents/skills/truthmark-sync/SKILL.md`),
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
        "docs/truthmark/engineering/authentication.md",
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
      expect(
        await repo.readFile("docs/truthmark/engineering/authentication.md"),
      ).toBe("# Authentication\n");

      const areas = await repo.readFile("docs/truthmark/routes/areas.md");

      expect(areas).toContain("Area files:");
      expect(areas).toContain("docs/truthmark/routes/areas/repository.md");

      const agents = await repo.readFile("AGENTS.md");

      expect(agents).toContain("# Local Instructions");
      expect(agents).toContain("Keep this section.");
      expect(agents).toContain("<!-- truthmark:start -->");
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves authored behavior templates without creating a default catch-all behavior doc", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "docs/truthmark/templates/engineering-behavior.md",
        `---
status: active
      doc_type: behavior
      truth_kind: engineering-behavior
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

      expect(
        await repo.readFile("docs/truthmark/templates/engineering-behavior.md"),
      ).toContain("## Local Standard");
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/engineering/repository/overview.md`,
        ),
      ).rejects.toThrow();
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).not.toContain("## Local Standard");
      expect(
        await repo.readFile(
          "docs/truthmark/engineering/repository/bootstrap-routing.md",
        ),
      ).toContain("truth_kind: engineering-workflow");
    } finally {
      await repo.cleanup();
    }
  });

  it("updates default truth doc template sections while preserving custom preamble and section order", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile(
        "docs/truthmark/templates/engineering-behavior.md",
        `---
status: active
doc_type: behavior
truth_kind: engineering-behavior
last_reviewed: 2026-05-12
owner: local-platform
source_of_truth:
  - docs/local-source.md
---

# Custom {{title}} Template

Local introduction that should remain before managed sections.

## Purpose

Old local purpose copy that should be replaced.

## Team Notes Before Scope

Keep this project-specific section before Scope.

\`\`\`markdown
## Contracts
\`\`\`

This fenced heading example should remain part of the custom section.

## Scope

Old local scope copy that should be replaced.

## Current Implementation Behavior

Old current-behavior copy that should be replaced.

## Domain Vocabulary

Keep this project-specific section before Core Rules.

## Core Rules

Old core-rules copy that should be replaced.

## Maintenance Notes

Old maintenance copy that should be replaced.

## Local Appendices

Keep this project-specific trailing section.
`,
      );

      await runInit(repo.rootDir);

      const updatedTemplate = await repo.readFile(
        "docs/truthmark/templates/engineering-behavior.md",
      );

      expect(updatedTemplate).toContain(
        "State the user/system outcome this behavior protects and why it exists.",
      );
      expect(updatedTemplate).toContain("owner: local-platform");
      expect(updatedTemplate).not.toContain("source_of_truth:");
      expect(updatedTemplate).not.toContain("  - docs/local-source.md");
      expect(updatedTemplate).toContain("## Source References");
      expect(updatedTemplate).toContain("{{source_references}}");
      expect(updatedTemplate).toContain("# Custom {{title}} Template");
      expect(updatedTemplate).toContain(
        "Local introduction that should remain before managed sections.",
      );
      expect(updatedTemplate).toContain(
        "Split into another leaf doc when content introduces a distinct outcome",
      );
      expect(updatedTemplate).not.toContain("Old local purpose copy");
      expect(updatedTemplate).not.toContain("Old local scope copy");
      expect(updatedTemplate).not.toContain("Old current-behavior copy");
      expect(updatedTemplate).not.toContain("Old core-rules copy");
      expect(updatedTemplate).not.toContain("Old maintenance copy");
      expect(updatedTemplate).toContain("## Team Notes Before Scope");
      expect(updatedTemplate).toContain("```markdown\n## Contracts\n```");
      expect(updatedTemplate).toContain(
        "This fenced heading example should remain part of the custom section.",
      );
      expect(updatedTemplate).toContain("## Domain Vocabulary");
      expect(updatedTemplate).toContain("## Local Appendices");

      const headingOrder = [
        "## Purpose",
        "## Team Notes Before Scope",
        "## Scope",
        "## Current Implementation Behavior",
        "## Domain Vocabulary",
        "## Core Rules",
        "## Maintenance Notes",
        "## Source References",
        "## Local Appendices",
      ].map((heading) => updatedTemplate.indexOf(heading));

      expect(headingOrder.every((index) => index >= 0)).toBe(true);
      expect(headingOrder).toEqual(
        [...headingOrder].sort((left, right) => left - right),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves custom preambles across every truth doc template on rerun", async () => {
    const repo = await createTempRepo();
    const templatePaths = [
      "docs/truthmark/templates/engineering-behavior.md",
      "docs/truthmark/templates/engineering-contract.md",
      "docs/truthmark/templates/engineering-architecture.md",
      "docs/truthmark/templates/engineering-workflow.md",
      "docs/truthmark/templates/engineering-operations.md",
      "docs/truthmark/templates/engineering-test-behavior.md",
    ];

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);

      for (const templatePath of templatePaths) {
        const template = await repo.readFile(templatePath);
        const customPreamble = [
          "---",
          "status: active",
          "owner: local-platform",
          `template_path: ${templatePath}`,
          "---",
          "",
          `# Local Template For ${templatePath}`,
          "",
          "Repository-specific introductory guidance.",
          "",
        ].join("\n");
        await repo.writeFile(
          templatePath,
          template.replace(/^[\s\S]*?(?=^## )/mu, customPreamble),
        );
      }

      await runInit(repo.rootDir);

      for (const templatePath of templatePaths) {
        const updatedTemplate = await repo.readFile(templatePath);
        expect(updatedTemplate).toContain(`template_path: ${templatePath}`);
        expect(updatedTemplate).toContain(
          `# Local Template For ${templatePath}`,
        );
        expect(updatedTemplate).toContain(
          "Repository-specific introductory guidance.",
        );
      }
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects a broken engineering-behavior template symlink that would write outside the repo", async () => {
    const repo = await createTempRepo();
    const outsideTemplatePath = path.resolve(
      repo.rootDir,
      "..",
      "truthmark-outside-engineering-behavior-template.md",
    );

    try {
      await runConfig(repo.rootDir, {});
      await repo.writeFile("docs/truthmark/templates/.keep", "");
      await fs.symlink(
        outsideTemplatePath,
        path.join(
          repo.rootDir,
          "docs",
          "truthmark",
          "templates",
          "engineering-behavior.md",
        ),
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
            "Unchanged .agents/skills/truthmark-sync/SKILL.md",
          ),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes(
            "Unchanged .agents/skills/truthmark-structure/SKILL.md",
          ),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes(
            "Unchanged .agents/skills/truthmark-check/SKILL.md",
          ),
        ),
      ).toBe(true);
      expect(
        secondResult.diagnostics.some((diagnostic) =>
          diagnostic.message.includes(
            "Unchanged .agents/skills/truthmark-realize/SKILL.md",
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

  it("rejects legacy config shapes instead of migrating old docs roots", async () => {
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
    truth: docs/product
  routing:
    root_index: docs/truthmark/routes/areas.md
    area_files_root: docs/truthmark/routes/areas
    default_area: repository
    max_delegation_depth: 1
authority:
  - docs/truthmark/routes/areas.md
  - docs/truthmark/routes/areas/**/*.md
  - docs/product/**/*.md
`,
      );

      const result = await runInit(repo.rootDir);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "error",
            message: expect.stringContaining(
              "Unsupported Truthmark config shape",
            ),
          }),
        ]),
      );
      expect(
        await repo.readFile("docs/truthmark/engineering/README.md"),
      ).toContain("Truth Docs");
    } finally {
      await repo.cleanup();
    }
  });

  it("scaffolds explicit truth kind metadata for a configured truth root", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 2
truthmark:
  workspace: docs/product
  generated:
    portal:
      enabled: false
`,
      );

      await runInit(repo.rootDir);

      const childRoute = await repo.readFile(
        "docs/product/routes/areas/repository.md",
      );
      expect(childRoute).toContain("```yaml");
      expect(childRoute).toContain(
        "path: docs/product/engineering/repository/bootstrap-routing.md",
      );
      expect(childRoute).toContain("kind: engineering-workflow");
      expect(childRoute).toContain("provisional bootstrap route");
      expect(childRoute).not.toContain("- docs/product/repository/overview.md");

      const result = await runCheck(repo.rootDir);
      expect(result.diagnostics).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            file: "docs/product/routes/areas/repository.md",
            message: expect.stringContaining("defaulting to behavior"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("renders OpenCode doc-writer edit permissions from configured truth and routing paths", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 2
platforms:
  - opencode
truthmark:
  workspace: product
  generated:
    portal:
      enabled: false
`,
      );

      await runInit(repo.rootDir);

      const openCodeDocWriterAgent = await repo.readFile(
        ".opencode/agents/truth-doc-writer.md",
      );
      expect(openCodeDocWriterAgent).toContain(
        '"product/engineering/**": allow',
      );
      expect(openCodeDocWriterAgent).toContain(
        '"product/routes/areas.md": allow',
      );
      expect(openCodeDocWriterAgent).toContain(
        '"product/routes/areas/**/*.md": allow',
      );
      expect(openCodeDocWriterAgent).not.toContain(
        '"docs/truthmark/engineering/**": allow',
      );
      expect(openCodeDocWriterAgent).not.toContain(
        '"docs/truthmark/routes/areas.md": allow',
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
        "docs/truthmark/routes/areas.md",
        `${await repo.readFile("docs/truthmark/routes/areas.md")}\n## Local Area Notes\nKeep this routing note.\n`,
      );

      await runInit(repo.rootDir);

      expect(await repo.readFile(".truthmark/config.yml")).toContain(
        "custom: true",
      );
      expect(await repo.readFile("docs/truthmark/routes/areas.md")).toContain(
        "Keep this routing note.",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("does not recreate the default child route after the root index stops delegating it", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.writeFile(
        "docs/truthmark/routes/areas.md",
        `# Truthmark Areas

## Local

Area files:
- docs/truthmark/routes/areas/local.md

Code surface:
- src/local/**

Update truth when:
- local behavior changes
`,
      );
      await fs.rm(
        path.join(repo.rootDir, "docs/truthmark/routes/areas/repository.md"),
      );

      await runInit(repo.rootDir);

      await expect(
        fs.stat(
          path.join(repo.rootDir, "docs/truthmark/routes/areas/repository.md"),
        ),
      ).rejects.toThrow();
      expect(
        await repo.readFile("docs/truthmark/routes/areas.md"),
      ).not.toContain("docs/truthmark/routes/areas/repository.md");
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects partial legacy docs roots instead of applying defaults", async () => {
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
    root_index: docs/truthmark/routes/areas.md
    area_files_root: docs/truthmark/routes/areas
    default_area: repository
    max_delegation_depth: 1
authority:
  - docs/truthmark/routes/areas.md
`,
      );

      const result = await runInit(repo.rootDir);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "error",
            message: expect.stringContaining(
              "Unsupported Truthmark config shape",
            ),
          }),
        ]),
      );
      await expect(
        fs.stat(`${repo.rootDir}/docs/truthmark/engineering/README.md`),
      ).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
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
      const firstAreas = await repo.readFile("docs/truthmark/routes/areas.md");

      await runInit(repo.rootDir);
      const secondAreas = await repo.readFile("docs/truthmark/routes/areas.md");

      expect(secondAreas).toBe(firstAreas);
    } finally {
      await repo.cleanup();
    }
  });
});
