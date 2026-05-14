import type { TruthmarkConfig } from "../config/schema.js";
import {
  ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS,
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  FEATURE_DOC_TEMPLATE_INSTRUCTIONS,
  defaultAgentConfig,
  renderRouteFirstEvidenceGateSection,
  renderHierarchySummary,
  renderTruthDocRestructureGateSection,
  resolveTruthDocsRoot,
} from "./shared.js";
import {
  renderTruthSyncBlockedReport,
  renderTruthSyncCompletedReport,
} from "../sync/report.js";
import { TRUTHMARK_VERSION } from "../version.js";

export const TRUTH_SYNC_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Claude Code /truthmark-sync; GitHub Copilot /truthmark-sync; Gemini CLI /truthmark:sync.";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const renderTruthSyncWorkerPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `### Truth Sync Worker
The parent provides the task focus and any repository context already gathered.
Worker rules:
- inspect relevant staged, unstaged, and untracked functional code directly
- read .truthmark/config.yml, ${config.docs.routing.rootIndex}, and canonical truth docs directly
- Code verification is parent-owned; report what was run or why it was not run
- may write truth docs and ${config.docs.routing.rootIndex} only for Truth Sync alignment
- must not rewrite functional code
Return result in this shape:
- status: completed | blocked
- changedCodeReviewed: string[]
- truthDocsUpdated: string[]
- routingDocsUpdated: string[]
- evidenceChecked: { claim: string; evidence: string[]; result: supported | narrowed | removed | blocked }[]
- notes: string[]
- blockedReason?: string
- manualReviewFiles?: string[]`;
};

export const renderTruthSyncSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const truthDocsRoot = resolveTruthDocsRoot(config);

  return `---
name: truthmark-sync
description: Use automatically before finishing when functional code changed since the last successful Truth Sync, and when the user explicitly invokes /truthmark-sync, $truthmark-sync, or /truthmark:sync. Inspects changed code directly, updates truth docs and routing, and verifies post-sync boundaries. Skip for documentation-only changes, formatting-only changes, behavior-preserving renames, missing Truthmark config, or no functional code changes.
argument-hint: Optional changed-code area, truth-doc area, or sync focus
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.
Invocations: ${TRUTH_SYNC_EXPLICIT_INVOCATIONS}
Explicit invocation runs immediately. Later functional-code changes reopen the finish-time requirement, and an earlier explicit run satisfies the finish gate only if no later functional-code changes occur.
Skip when changes are documentation-only, formatting-only, clearly behavior-preserving renames with no truth impact, when no Truthmark config exists yet, or when there are no functional code changes.
Parent workflow:
1. Inspect git status, staged changes, unstaged changes, and untracked files directly.
2. Read .truthmark/config.yml, the configured root route index at ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, and relevant canonical docs.
3. Identify functional-code changes and the nearest truth docs or routing repairs.
4. ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
5. Code verification is parent-owned: follow repository instructions and task context, and report what ran or why it did not run.
6. Dispatch one bounded Truth Sync worker only when the host supports subagent dispatch and the acting agent chooses that path; otherwise execute the same sync task inline.
Topology quality gate:
- before updating truth docs, verify the changed code resolves to a specific behavior-owned area and bounded truth owner
- if routing is missing, stale, broad, overloaded, catch-all route only, or cannot map changed code to a bounded truth owner, do not create another generic truth doc
- run Truth Structure before syncing when topology repair is safe and in scope
- block and recommend Truth Structure when topology repair is unsafe, ambiguous, or outside the current task boundary
- report the route files and changed code paths that require structure repair
- README.md files are indexes, not Truth Sync targets
- must not append behavior details to a README.md index
- create or update a bounded leaf truth doc when behavior changes do not fit an existing leaf doc
${FEATURE_DOC_TEMPLATE_INSTRUCTIONS}
${renderTruthDocRestructureGateSection(
    "Truth Sync may restructure only truth docs impacted by the current functional-code change.",
  )}
${ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS}
${renderRouteFirstEvidenceGateSection(
    "changed functional files",
    "if no impacted doc changed, report why truth was already current or why sync was skipped",
  )}
Optional validation tooling:
- you may run truthmark check when local tooling is available
- do not require the truthmark binary; direct checkout inspection is the canonical path
- optional validation must not replace agent judgment about docs and routing
- update Product Decisions and Rationale when a behavior change comes from a decision change
${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}
${renderTruthSyncWorkerPrompt(config)}
Parent post-sync verification:
- verify only truth docs and ${config.docs.routing.rootIndex} changed during sync
- block on any unrelated diff caused by the sync step
- block if functional code changed during sync
- verify the worker report matches the required headings and sections
- validate the final report against the structured Truth Sync report contract, including Claim, Evidence, and Result entries under Evidence checked
- verify the updated docs correspond to the reviewed changed-code surface
- blocked outcomes must preserve the working tree as-is: no rollback, no post-block cleanup edits, and manual-review reporting of any remaining files
Report completion in this shape:
${renderMarkdownExample(
    renderTruthSyncCompletedReport({
      changedCode: ["src/auth/session.ts"],
      truthDocsUpdated: [`${truthDocsRoot}/repository/overview.md`],
      evidenceChecked: [
        {
          claim: "Session timeout behavior is documented in the mapped repository truth doc.",
          evidence: ["src/auth/session.ts:12", `${config.docs.routing.rootIndex}:11`],
          result: "supported",
        },
      ],
      notes: ["Updated session timeout behavior."],
    }),
  )}
Blocked report example:
${renderMarkdownExample(
  renderTruthSyncBlockedReport({
      reason: "routing repair is not allowed",
      manualReviewFiles: [config.docs.routing.rootIndex],
      nextAction: "update routing metadata and rerun Truth Sync",
    }),
  )}`;
};
