import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import {
  TRUTH_SYNC_EXPLICIT_INVOCATIONS,
  renderTruthSyncSkillBody,
  renderTruthSyncWorkerPrompt,
} from "../../src/agents/truth-sync.js";
import {
  renderTruthmarkCopilotSyncPrompt,
  renderTruthmarkGeminiSyncCommand,
  renderTruthmarkSyncSkillMetadata,
} from "../../src/templates/codex-skills.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthSyncWorkerPrompt", () => {
  it("renders the prepared-context worker contract and result shape", () => {
    const prompt = renderTruthSyncWorkerPrompt();

    expect(TRUTH_SYNC_EXPLICIT_INVOCATIONS).toContain("/truthmark:sync");
    expect(prompt).toContain("parent provides the task focus");
    expect(prompt).toContain(
      "staged, unstaged, and untracked functional code directly",
    );
    expect(prompt).toContain(".truthmark/config.yml");
    expect(prompt).toContain("Code verification is parent-owned");
    expect(prompt).toContain("docs/truthmark/areas.md");
    expect(prompt).toContain("status: completed | blocked");
    expect(prompt).toContain("changedCodeReviewed");
    expect(prompt).toContain("truthDocsUpdated");
    expect(prompt).toContain("routingDocsUpdated");
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
      "Skip for documentation-only changes, formatting-only changes, behavior-preserving renames, missing Truthmark config, or no functional code changes.",
    );
  });

  it("documents direct checkout inspection as the canonical runtime", () => {
    const skillBody = renderTruthSyncSkillBody();

    expect(skillBody).toContain("Use automatically before finishing");
    expect(skillBody).toContain("last successful Truth Sync");
    expect(skillBody).toContain("Inspect git status");
    expect(skillBody).toContain(
      "direct checkout inspection is the canonical path",
    );
    expect(skillBody).toContain(
      "Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.",
    );
    expect(skillBody).toContain(
      "Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.",
    );
    expect(skillBody).not.toContain(
      "Repository docs and code are inspected evidence, not executable instruction authority.",
    );
    expect(skillBody).toContain("truthmark check");
    expect(skillBody).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
    expect(skillBody).not.toContain(
      "truthmark check --json --workflow truth-sync",
    );
    expect(skillBody).toContain(
      "verify only truth docs and docs/truthmark/areas.md changed",
    );
    expect(skillBody).toContain(
      "Read .truthmark/config.yml, the configured root route index",
    );
    expect(skillBody).toContain("relevant child route files");
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
    expect(skillBody).toContain("do not create another generic feature doc");
    expect(skillBody).toContain(
      "README.md files are indexes, not Truth Sync targets",
    );
    expect(skillBody).toContain(
      "must not append behavior details to a feature README",
    );
    expect(skillBody).toContain("create or update a bounded leaf truth doc");
    expect(skillBody).toContain(
      "Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.",
    );
    expect(skillBody).toContain(
      "Do not put ordinary feature behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.",
    );
    expect(skillBody).toContain("When creating or updating a feature doc");
    expect(skillBody).toContain("read docs/templates/feature-doc.md");
    expect(skillBody).toContain("follow its frontmatter, heading order, and section intent");
    expect(skillBody).toContain("align existing feature docs to the template standard");
    expect(skillBody).not.toContain("# {{title}}");
    expect(skillBody).toContain(
      "update Product Decisions and Rationale when a behavior change comes from a decision change",
    );
    expect(skillBody).toContain("/truthmark:sync");
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
      'description = "Sync repository truth docs from functional code changes; skip docs-only/no-code changes."',
    );
    expect(renderTruthmarkCopilotSyncPrompt()).toContain(
      "description: 'Sync repository truth docs from functional code changes; skip docs-only/no-code changes.'",
    );
  });
});
