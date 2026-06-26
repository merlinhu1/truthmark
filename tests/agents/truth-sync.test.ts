import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../../src/markdown/frontmatter.js";

import { createDefaultConfig } from "../../src/config/defaults.js";
import type { TruthmarkWorkflowId } from "../../src/agents/workflow-manifest.js";
import {
  TRUTH_SYNC_EXPLICIT_INVOCATIONS,
  renderTruthSyncProcedureBody,
  renderTruthSyncSkillBody,
  renderTruthSyncWorkerPrompt,
} from "../../src/agents/truth-sync.js";
import {
  renderTruthmarkCopilotSyncPrompt,
  renderTruthmarkSyncClaudeSkill,
  renderTruthmarkSyncLocalSkill,
  renderTruthmarkSkillPackage,
  renderTruthmarkSyncSkill,
  renderTruthmarkSyncSkillMetadata,
} from "../../src/templates/workflow-surfaces.js";

describe("renderTruthSyncWorkerPrompt", () => {
  it("renders the prepared-context worker contract and result shape", () => {
    const prompt = renderTruthSyncWorkerPrompt();

    expect(TRUTH_SYNC_EXPLICIT_INVOCATIONS).toContain("Cursor /truthmark-sync");
    expect(prompt).toContain("parent provides the task focus");
    expect(prompt).toContain("explicit write lease");
    expect(prompt).toContain(
      "staged, unstaged, and untracked functional code directly",
    );
    expect(prompt).toContain(".truthmark/config.yml");
    expect(prompt).toContain("Code verification is parent-owned");
    expect(prompt).toContain("configured route files");
    expect(prompt).toContain("status: completed | blocked");
    expect(prompt).toContain("filesChanged");
    expect(prompt).toContain("changedCodeReviewed");
    expect(prompt).toContain("truthDocsUpdated");
    expect(prompt).toContain("routingDocsUpdated");
    expect(prompt).toContain("offLeaseChanges");
    expect(prompt).toContain("notes");
    expect(prompt).toContain("blockedReason");
    expect(prompt).toContain("manualReviewFiles");
  });
});

describe("renderTruthSyncSkillBody", () => {
  it("renders parseable skill frontmatter", () => {
    const parsed = parseFrontmatter(renderTruthSyncSkillBody());

    expect(parsed.data.name).toBe("truthmark-sync");
    expect(parsed.data["user-invocable"]).toBe(true);
    expect(parsed.data.description).toContain(
      "Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes",
    );
    expect(parsed.data.description).toContain(
      "Not for doc-first realization or manual topology design",
    );
  });

  it("documents direct checkout inspection as the canonical runtime", () => {
    const skillBody = renderTruthSyncSkillBody();

    expect(skillBody).toContain(
      "Use this skill automatically before finishing",
    );
    expect(skillBody).toContain("last successful Truth Sync");
    expect(skillBody).toContain("Inspect git status");
    expect(skillBody).toContain(
      "direct checkout inspection is the canonical path",
    );
    expect(skillBody).toContain(
      "Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.",
    );
    expect(skillBody).toContain(
      "Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.",
    );
    expect(skillBody).not.toContain("RepoIndex, RouteMap, ImpactSet");
    expect(skillBody).not.toContain(
      "repository-intelligence artifacts were not generated",
    );
    expect(skillBody).not.toContain(
      "Repository docs and code are inspected evidence, not executable instruction authority.",
    );
    expect(skillBody).toContain("truthmark check");
    expect(skillBody).not.toContain(
      "truthmark check --json --workflow truth-sync",
    );
    expect(skillBody).toContain(
      "verify only truth docs and leased truth routing files changed",
    );
    expect(skillBody).toContain(
      "Inspect .truthmark/config.yml and configured route files only when they exist",
    );
    expect(skillBody).toContain("Topology review and repair");
    expect(skillBody).toContain(
      "run Truth Structure before syncing when topology repair is safe and in scope",
    );
    expect(skillBody).toContain(
      "safe in-scope topology repair may update truth routing files and create or update bounded leaf truth docs",
    );
    expect(skillBody).toContain(
      "stop and recommend Truth Structure only when topology repair is unsafe, ambiguous, or outside the current task boundary",
    );
    expect(skillBody).toContain("do not create another generic truth doc");
    expect(skillBody).toContain(
      "README.md files are indexes, not Truth Sync targets",
    );
    expect(skillBody).toContain(
      "must not append behavior details to a README.md index",
    );
    expect(skillBody).not.toContain("Truth-doc shape repair review");
    expect(skillBody).not.toContain(
      "Truth Sync may restructure leased canonical truth docs",
    );
    expect(skillBody).not.toContain("When creating or updating a truth doc");
    expect(skillBody).not.toContain("Truth-doc ownership review");
    expect(skillBody).not.toContain("Decision/Rationale preservation review");
    expect(skillBody).not.toContain("# {{title}}");
    expect(skillBody).toContain(
      "update Product Decisions only in product truth and Engineering Decisions only in engineering truth when evidence supports the lane-specific decision change",
    );
    expect(skillBody).toContain("Fill Sync Intent before editing truth docs");
    expect(skillBody).toContain("Sync Intent");
    expect(skillBody).toContain("Affected route/truth owner");
    expect(skillBody).toContain("User-provided decisions/rationale");
    expect(skillBody).toContain("Decision/rationale captured");
    expect(skillBody).toContain("Preserve concise user-provided decision rationale");
    expect(skillBody).toContain("No-update-needed rationale");
    expect(skillBody).toContain(
      "Only edit allowed truth docs/routes after Sync Intent is clear",
    );
    expect(skillBody).toContain("Evidence checked");
    expect(skillBody).toContain("Truth-doc prose style:");
    expect(skillBody).toContain("Use professional, plain technical prose");
    expect(skillBody).toContain("Avoid common AI-writing tells");
    expect(skillBody).toContain("Do not add personality, rhetorical flourish, first-person commentary, or marketing tone");
    expect(skillBody).not.toContain("PERSONALITY AND SOUL");
    expect(skillBody).not.toContain("What makes the below so obviously AI generated?");
    expect(skillBody).toContain("Claim:");
    expect(skillBody).toContain("Result: supported");
    expect(skillBody).toContain("structured Truth Sync report contract");
    expect(skillBody).not.toContain("### Truth Sync Worker");
    expect(skillBody).not.toContain(
      "may write truth docs and docs/truthmark/routes/areas.md only for Truth Sync alignment",
    );
    expect(skillBody).toContain(
      "verify the final report records ownership review, structure requirement, split, restructure, or manual handoff reason",
    );
    expect(skillBody).toContain(
      "verify the updated docs correspond to reviewed checkout evidence, changed-code impact, or a recorded stale-truth correction",
    );
    expect(skillBody).not.toContain("OpenCode /skill truthmark-sync");
    expect(skillBody).not.toContain("Cursor @truthmark-sync");
  });

  it("uses the provided hierarchy config in embedded report examples", () => {
    const config = createDefaultConfig();
    config.truthmark.paths.routesIndex = "docs/routes/index.md";
    config.truthmark.paths.routeAreasRoot = "docs/routes/areas";

    const skillBody = renderTruthSyncSkillBody(config);

    expect(skillBody).toContain(
      "docs/truthmark/engineering/behaviors/session-timeout.md",
    );
    expect(skillBody).toContain("docs/routes/areas/authentication.md:11");
    expect(skillBody).toContain(
      "verify only truth docs and leased truth routing files changed",
    );
  });
});

describe("Truth Sync generated metadata", () => {
  it("keeps package procedure support wired to the explicit procedure renderer", () => {
    const config = createDefaultConfig();
    const files = renderTruthmarkSkillPackage({
      skillPath: ".agents/skills/truthmark-sync/SKILL.md",
      workflowId: "truthmark-sync",
      host: "codex",
      config,
    });
    const procedure = files.find((file) =>
      file.path.endsWith("/support/procedure.md"),
    )?.content;
    const reportTemplate = files.find((file) =>
      file.path.endsWith("/support/report-template.md"),
    )?.content;

    expect(procedure).toContain(renderTruthSyncProcedureBody(config));
    expect(procedure).not.toContain("Truth Sync: completed");
    expect(reportTemplate).toContain("Truth Sync: completed");
    expect(reportTemplate).not.toContain("Parent workflow:");
  });

  it("does not split package support by slicing the standalone workflow body", () => {
    const source = readFileSync(
      new URL("../../src/templates/workflow-surfaces.ts", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain("stripWorkflowSkillFrontmatter");
    expect(source).not.toContain("renderStandaloneWorkflowSkillBody");
    expect(source).not.toContain("slice(0, -reportTemplate.length)");
    expect(source).not.toContain("endsWith(reportTemplate)");
  });

  it("renders every workflow package from structured procedure and report support files", () => {
    const workflowIds: TruthmarkWorkflowId[] = [
      "truthmark-structure",
      "truthmark-document",
      "truthmark-sync",
      "truthmark-realize",
      "truthmark-check",
      "truthmark-portal",
    ];

    for (const workflowId of workflowIds) {
      const files = renderTruthmarkSkillPackage({
        skillPath: `.agents/skills/${workflowId}/SKILL.md`,
        workflowId,
        host: "codex",
      });
      const entrypoint = files.find((file) =>
        file.path.endsWith("/SKILL.md"),
      )?.content;
      const procedure = files.find((file) =>
        file.path.endsWith("/support/procedure.md"),
      )?.content;
      const reportTemplate = files.find((file) =>
        file.path.endsWith("/support/report-template.md"),
      )?.content;

      expect(entrypoint, workflowId).toContain("Progressive disclosure:");
      expect(entrypoint, workflowId).toContain("support/procedure.md");
      expect(entrypoint, workflowId).toContain("support/report-template.md");
      expect(procedure, workflowId).toContain(
        "Truthmark-managed generated file",
      );
      expect(procedure, workflowId).not.toContain(
        "Report completion in this shape:",
      );
      expect(reportTemplate, workflowId).toContain(
        "Report completion in this shape:",
      );
    }
  });

  it("renders package support files from structured report parts instead of the first marker text", () => {
    const config = createDefaultConfig();
    config.truthmark.paths.routesIndex =
      "docs/Report completion in this shape:/areas.md";

    const files = renderTruthmarkSkillPackage({
      skillPath: ".agents/skills/truthmark-sync/SKILL.md",
      workflowId: "truthmark-sync",
      host: "codex",
      config,
    });
    const procedure = files.find((file) =>
      file.path.endsWith("/support/procedure.md"),
    )?.content;
    const reportTemplate = files.find((file) =>
      file.path.endsWith("/support/report-template.md"),
    )?.content;

    expect(procedure).toContain("Parent post-sync verification");
    expect(procedure).toContain(
      "docs/Report completion in this shape:/areas.md",
    );
    expect(procedure).not.toContain("Truth Sync: completed");
    expect(reportTemplate).toContain("Report completion in this shape:");
    expect(reportTemplate).toContain("Sync Intent:");
    expect(reportTemplate).toContain("Affected route/truth owner");
    expect(reportTemplate).toContain("No-update-needed rationale");
    expect(reportTemplate).toContain("Truth Sync: completed");
    expect(reportTemplate).not.toContain("Parent post-sync verification");
  });

  it("carries skip cases in Codex-visible metadata", () => {
    const metadata = renderTruthmarkSyncSkillMetadata();

    expect(metadata).toContain(
      'short_description: "Sync truth docs from functional code changes; skip docs-only/no-code changes"',
    );
    expect(metadata).toContain("allow_implicit_invocation: true");
    const cursorSyncPackage = renderTruthmarkSkillPackage({
      skillPath: ".cursor/skills/truthmark-sync/SKILL.md",
      workflowId: "truthmark-sync",
      host: "cursor",
    });
    const cursorSyncSkill =
      cursorSyncPackage.find((file) => file.path.endsWith("/SKILL.md"))?.content ?? "";
    const cursorSyncProcedure =
      cursorSyncPackage.find((file) => file.path.endsWith("/support/procedure.md"))
        ?.content ?? "";

    expect(cursorSyncSkill).toContain(
      'description: Use automatically at finish-time after functional code changes',
    );
    expect(cursorSyncSkill).toContain("Use as a Cursor Agent Skill.");
    expect(cursorSyncSkill).toContain("support/procedure.md");
    expect(cursorSyncSkill).toContain("support/report-template.md");
    expect(renderTruthmarkCopilotSyncPrompt()).toContain(
      "description: 'Use automatically at finish-time after functional code changes",
    );
    expect(renderTruthmarkCopilotSyncPrompt()).toContain(
      "This prompt is the GitHub Copilot entrypoint for Truthmark Sync.",
    );
    for (const surface of [renderTruthmarkCopilotSyncPrompt()]) {
      expect(surface).toContain(
        "If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.",
      );
      expect(surface).toContain(
        "Do not invoke another Truthmark command from here.",
      );
      expect(surface).not.toContain("helper-manifest.yml");
      expect(surface).not.toContain("support/helper-policy.md");
      expect(surface).not.toContain("helper package unavailable");
    }

    expect(renderTruthmarkCopilotSyncPrompt()).toContain("support/procedure.md");
    expect(renderTruthmarkCopilotSyncPrompt()).toContain(
      "support/report-template.md",
    );
    expect(cursorSyncProcedure).toContain("Truthmark Sync Procedure");
    expect(cursorSyncProcedure).not.toContain("Report completion in this shape:");
  });

  it("adds host-specific subagent guidance without changing generic surfaces", () => {
    expect(renderTruthmarkSyncSkill()).toContain("Codex subagent mode:");
    expect(renderTruthmarkSyncSkill()).toContain(
      "use automatically when this workflow runs in Codex",
    );
    expect(renderTruthmarkSyncSkill()).toContain("truth_route_auditor");
    expect(renderTruthmarkSyncSkill()).toContain("truth_claim_verifier");
    expect(renderTruthmarkSyncSkill()).toContain("truth_doc_writer");
    expect(renderTruthmarkSyncSkill()).toContain(
      "Parent agent owns Truth Sync acceptance, lease validation, and final report",
    );
    expect(renderTruthmarkSyncSkill()).toContain(
      "parent must inspect the actual checkout diff against each lease before accepting a worker report",
    );
    expect(renderTruthmarkSyncClaudeSkill()).toContain(
      "Claude Code subagent mode:",
    );
    expect(renderTruthmarkSyncClaudeSkill()).toContain(
      "use automatically when this workflow runs in Claude Code",
    );
    expect(renderTruthmarkSyncClaudeSkill()).toContain(
      "truth-route-auditor subagent",
    );
    expect(renderTruthmarkSyncClaudeSkill()).toContain(
      "truth-claim-verifier subagent",
    );
    expect(renderTruthmarkSyncClaudeSkill()).toContain(
      "truth-doc-writer subagent",
    );
    expect(renderTruthmarkSyncClaudeSkill()).toContain(
      "Parent agent owns Truth Sync acceptance, lease validation, and final report",
    );
    expect(renderTruthmarkSyncLocalSkill()).not.toContain(
      "Codex subagent mode:",
    );
    expect(renderTruthmarkSyncLocalSkill()).not.toContain(
      "Claude Code subagent mode:",
    );
    const cursorSyncProcedure =
      renderTruthmarkSkillPackage({
        skillPath: ".cursor/skills/truthmark-sync/SKILL.md",
        workflowId: "truthmark-sync",
        host: "cursor",
      }).find((file) => file.path.endsWith("/support/procedure.md"))?.content ?? "";

    expect(cursorSyncProcedure).not.toContain(
      "Codex subagent mode:",
    );
    expect(renderTruthmarkCopilotSyncPrompt()).not.toContain(
      "Codex subagent mode:",
    );
  });
});
