import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import { createDefaultConfig } from "../../src/config/defaults.js";
import {
  TRUTH_SYNC_EXPLICIT_INVOCATIONS,
  renderTruthSyncSkillBody,
  renderTruthSyncWorkerPrompt,
} from "../../src/agents/truth-sync.js";
import {
  renderTruthmarkCopilotSyncPrompt,
  renderTruthmarkGeminiSyncCommand,
  renderTruthmarkSyncClaudeSkill,
  renderTruthmarkSyncLocalSkill,
  renderTruthmarkSyncSkill,
  renderTruthmarkSyncSkillMetadata,
} from "../../src/templates/workflow-surfaces.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthSyncWorkerPrompt", () => {
  it("renders the prepared-context worker contract and result shape", () => {
    const prompt = renderTruthSyncWorkerPrompt();

    expect(TRUTH_SYNC_EXPLICIT_INVOCATIONS).toContain("/truthmark:sync");
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
    const parsed = matter(renderTruthSyncSkillBody());

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

    expect(skillBody).toContain("Use this skill automatically before finishing");
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
    expect(skillBody).toContain("RepoIndex, RouteMap, ImpactSet, and ContextPack");
    expect(skillBody).toContain("repository-intelligence artifacts were not generated");
    expect(skillBody).not.toContain(
      "Repository docs and code are inspected evidence, not executable instruction authority.",
    );
    expect(skillBody).toContain("truthmark check");
    expect(skillBody).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
    expect(skillBody).not.toContain(
      "truthmark check --json --workflow truth-sync",
    );
    expect(skillBody).toContain(
      "verify only truth docs and leased truth routing files changed",
    );
    expect(skillBody).toContain(
      "Inspect .truthmark/config.yml and configured route files only when they exist",
    );
    expect(skillBody).toContain("configured route files");
    expect(skillBody).toContain("Topology quality gate");
    expect(skillBody).toContain(
      "missing, stale, broad, overloaded, catch-all route only",
    );
    expect(skillBody).toContain(
      "run Truth Structure before syncing when topology repair is safe and in scope",
    );
    expect(skillBody).toContain(
      "block and recommend Truth Structure when topology repair is unsafe, ambiguous, or outside the current task boundary",
    );
    expect(skillBody).toContain("do not create another generic truth doc");
    expect(skillBody).toContain(
      "README.md files are indexes, not Truth Sync targets",
    );
    expect(skillBody).toContain(
      "must not append behavior details to a README.md index",
    );
    expect(skillBody).toContain("create or update a bounded leaf truth doc");
    expect(skillBody).toContain("Evidence Gate");
    expect(skillBody).toContain(
      "route-first: map changed functional files to bounded route owners and primary canonical docs",
    );
    expect(skillBody).toContain(
      "support claims with primary checkout evidence",
    );
    expect(skillBody).toContain(
      "tests/examples/canonical docs corroborate",
    );
    expect(skillBody).toContain(
      "remove, narrow, or block unsupported claims",
    );
    expect(skillBody).toContain(
      "Maintain architecture docs only for structure-level changes",
    );
    expect(skillBody).toContain(
      "Keep ordinary behavior, endpoints, UI copy, validation rules, and bug fixes in behavior or contract docs",
    );
    expect(skillBody).toContain("When creating or updating a truth doc");
    expect(skillBody).toContain("configured Truthmark templates root");
    expect(skillBody).toContain("inspect the routed truth kind");
    expect(skillBody).toContain("Align existing docs to that template");
    expect(skillBody).toContain("HTML comments under each template section");
    expect(skillBody).toContain("normative authoring guidance");
    expect(skillBody).toContain("Truth-doc ownership gate");
    expect(skillBody).toContain(
      "if an impacted doc is broad, mixed-owner, index-like, or the update spans independent behavior owners",
    );
    expect(skillBody).toContain(
      "report Ownership reviewed, Structure required, Truth docs split, Truth docs restructured, or Blocked reason",
    );
    expect(skillBody).toContain(
      "Decision/Rationale preservation gate",
    );
    expect(skillBody).toContain(
      "before any truth-doc split, restructure, or shape repair, inventory existing Product Decisions, Engineering Decisions, and Rationale sections",
    );
    expect(skillBody).toContain(
      "preserve each current decision and rationale in the correct product or engineering lane owner",
    );
    expect(skillBody).toContain(
      "if ownership of a decision or rationale is unclear, block with manual-review files",
    );
    expect(skillBody).toContain("Truth-doc shape repair gate");
    expect(skillBody).toContain(
      "Truth Sync may restructure only truth docs impacted by the current functional-code change.",
    );
    expect(skillBody).toContain("use Truth Structure for ownership splits");
    expect(skillBody).toContain(
      "repair shape when a narrow edit would make truth worse",
    );
    expect(skillBody).toContain(
      "report docs restructured and why",
    );
    expect(skillBody).not.toContain("# {{title}}");
    expect(skillBody).toContain(
      "update Product Decisions only in product truth and Engineering Decisions only in engineering truth when evidence supports the lane-specific decision change",
    );
    expect(skillBody).toContain("Evidence checked");
    expect(skillBody).toContain("Claim:");
    expect(skillBody).toContain("Result: supported");
    expect(skillBody).toContain("structured Truth Sync report contract");
    expect(skillBody).not.toContain("### Truth Sync Worker");
    expect(skillBody).not.toContain(
      "may write truth docs and docs/truthmark/routes/areas.md only for Truth Sync alignment",
    );
    expect(skillBody).toContain(
      "verify the final report records ownership review, structure requirement, split, restructure, or blocked reason",
    );
    expect(skillBody).toContain("/truthmark:sync");
  });

  it("uses the provided hierarchy config in embedded report examples", () => {
    const config = createDefaultConfig();
    config.truthmark.paths.routesIndex = "docs/routes/index.md";
    config.truthmark.paths.routeAreasRoot = "docs/routes/areas";

    const skillBody = renderTruthSyncSkillBody(config);

    expect(skillBody).toContain("docs/truthmark/engineering/repository/overview.md");
    expect(skillBody).toContain("docs/routes/index.md:11");
    expect(skillBody).toContain(
      "verify only truth docs and leased truth routing files changed",
    );
  });
});

describe("Truth Sync generated metadata", () => {
  it("carries skip cases in Codex-visible metadata", () => {
    const metadata = renderTruthmarkSyncSkillMetadata();

    expect(metadata).toContain(
      'short_description: "Sync truth docs from functional code changes; skip docs-only/no-code changes"',
    );
    expect(metadata).toContain("allow_implicit_invocation: true");
    expect(renderTruthmarkGeminiSyncCommand()).toContain(
      'description = "Use automatically at finish-time after functional code changes',
    );
    expect(renderTruthmarkCopilotSyncPrompt()).toContain(
      "description: 'Use automatically at finish-time after functional code changes",
    );
    for (const surface of [
      renderTruthmarkGeminiSyncCommand(),
      renderTruthmarkCopilotSyncPrompt(),
    ]) {
      expect(surface).toContain(
        "Use this prompt as a light-weight adapter for Truthmark Sync.",
      );
      expect(surface).toContain(
        "To run the full workflow, use the installed skill surface:",
      );
      expect(surface).toContain(
        "OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Claude Code /truthmark-sync; GitHub Copilot /truthmark-sync; Gemini CLI /truthmark:sync.",
      );
      expect(surface).toContain("support/procedure.md");
      expect(surface).toContain("support/report-template.md");
      expect(surface).toContain("helper-manifest.yml");
      expect(surface).toContain("support/helper-policy.md");
      expect(surface).not.toContain("helper package unavailable");
    }
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
      "validate the worker report against the actual worker diff",
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
    expect(renderTruthmarkSyncLocalSkill()).not.toContain("Codex subagent mode:");
    expect(renderTruthmarkSyncLocalSkill()).not.toContain(
      "Claude Code subagent mode:",
    );
    expect(renderTruthmarkGeminiSyncCommand()).not.toContain("Codex subagent mode:");
    expect(renderTruthmarkCopilotSyncPrompt()).not.toContain("Codex subagent mode:");
  });
});
