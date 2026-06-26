import type { TruthmarkConfig } from "../config/schema.js";
import {
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  TRUTH_DOC_AUTHORING_STYLE_INSTRUCTIONS,
  defaultAgentConfig,
  renderClaudeSubagentModeSection,
  renderCodexSubagentModeSection,
  renderCopilotCustomAgentModeSection,
  renderOpenCodeSubagentModeSection,
  renderHierarchySummary,
  renderBulletBlock,
  resolveEngineeringTruthRoot,
} from "./shared.js";
import {
  renderTruthSyncBlockedReport,
  renderTruthSyncCompletedReport,
} from "../sync/report.js";
import { getTruthmarkWorkflow } from "./workflow-manifest.js";

export const TRUTH_SYNC_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Claude Code /truthmark-sync; GitHub Copilot /truthmark-sync; Antigravity @truthmark-sync; Cursor /truthmark-sync.";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

const renderTruthSyncProductDecisionRuleBlock = (
  config: TruthmarkConfig,
): string => {
  return renderBulletBlock(
    [
      "ask whether a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed",
      `if yes, update or route product truth under ${config.truthmark.paths.productTruthRoot} as well as engineering truth under ${config.truthmark.paths.engineeringTruthRoot}`,
      `if no, default to engineering truth under ${config.truthmark.paths.engineeringTruthRoot} for internal implementation changes`,
      "when both lanes change, keep separate product and engineering docs cross-linked through route YAML with realized_by and realizes",
      "when ownership is ambiguous, stop or route to Truth Structure instead of writing a mixed document",
    ].join("\n"),
  );
};

export const renderTruthSyncWorkerPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `### Truth Sync Worker
The parent provides the task focus, explicit write lease, and any repository context already gathered.
Worker rules:
- require a write lease with workflow, worker, shard, objective, requiredReads, allowedWrites, forbiddenWrites, evidenceRequired, verification, and reportFields before editing
- inspect relevant staged, unstaged, and untracked functional code directly
- inspect .truthmark/config.yml and configured route files (${config.truthmark.paths.routesIndex}; ${config.truthmark.paths.routeAreasRoot}/) only when they exist; then inspect canonical truth docs directly
- ask whether a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed
- review the task conversation for user-provided decisions, rationale, constraints, tradeoffs, rejection reasons, or scope boundaries before writing truth docs
- if yes, carry that user-provided decision context into Sync Intent and report where it was placed or why it needs manual handoff
- if yes, update or route product truth as well as engineering truth; if no, default internal implementation changes to engineering truth
- Code verification is parent-owned; report what was run or why it was not run
- may write only leased truth docs and leased truth routing files for Truth Sync alignment
- must not rewrite functional code or generated host surfaces
- stop and report blocked when the required edit needs an off-lease file
Return result in this shape:
- status: completed | blocked
- worker: string
- shard: string
- filesChanged: string[]
- changedCodeReviewed: string[]
- userProvidedDecisionRationale: string[]
- ownershipReviewed: string[]
- structureRequired?: string[]
- truthDocsUpdated: string[]
- routingDocsUpdated: string[]
- truthDocsSplit?: string[]
- evidenceChecked: { claim: string; evidence: string[]; result: supported | narrowed | removed | blocked }[]
- decisionRationaleCaptured: string[]
- offLeaseChanges: string[]
- notes: string[]
- blockedReason?: string
- manualReviewFiles: string[] required when status is blocked; at least one file`;
};

export const renderTruthSyncProcedureBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCodexSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
    includeOpenCodeSubagentMode?: boolean;
  } = {},
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-sync");
  const claudeSubagentMode = options.includeClaudeSubagentMode
    ? `${renderClaudeSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Sync acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const codexSubagentMode = options.includeCodexSubagentMode
    ? `${renderCodexSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Sync acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const copilotCustomAgentMode = options.includeCopilotCustomAgentMode
    ? `${renderCopilotCustomAgentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Sync acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const openCodeSubagentMode = options.includeOpenCodeSubagentMode
    ? `${renderOpenCodeSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Sync acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const subagentMode = `${claudeSubagentMode}${codexSubagentMode}${copilotCustomAgentMode}${openCodeSubagentMode}`;

  return `Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.
Explicit invocation runs immediately when the user directly requests this workflow. Later functional-code changes need a fresh finish-time review, and an earlier explicit run satisfies the finish-time review only if no later functional-code changes occur.
Skip when changes are documentation-only, formatting-only, clearly behavior-preserving renames with no truth impact, when no Truthmark config exists yet, or when there are no functional code changes.
Parent workflow:
1. Inspect git status, staged changes, unstaged changes, and untracked files directly.
2. Inspect .truthmark/config.yml and configured route files only when they exist; then inspect relevant canonical docs.
3. Identify functional-code changes and the nearest truth docs or routing repairs.
4. Evidence authority:
${renderBulletBlock(EVIDENCE_AUTHORITY_INSTRUCTIONS)}
5. Product truth decision:
${renderTruthSyncProductDecisionRuleBlock(config)}
6. Capture decision context from the task conversation: ask whether the user provided a product or technical decision, rationale, constraint, tradeoff, rejection reason, or scope boundary. Preserve concise user-provided decision rationale in Sync Intent before truth edits, route it to Product Decisions, Engineering Decisions, Rationale, Capability Scope, Non-Goals, Maintenance Notes, or the relevant workflow/contract section, and report whether it was placed, skipped because none was provided, or needs manual handoff.
7. Update engineering truth first after code changes. Product truth is opt-in for externally visible promises, product boundaries, APIs, acceptance criteria, or explicit user/product evidence.
8. Code verification is parent-owned: follow repository instructions and task context, and report what ran or why it did not run.
9. Dispatch bounded Truth Sync workers only when the host supports subagent dispatch and the acting agent chooses that path; otherwise execute the same sync task inline.
10. Fill Sync Intent before editing truth docs or truth routing files:
   - Changed code reviewed: functional files, tests, configs, generated outputs, or other implementation evidence inspected
   - Affected route/truth owner: bounded route area or canonical truth owner that maps the change
   - Target truth docs: docs expected to change, or docs reviewed and left unchanged
   - Intended update: claim/doc/routing update planned before writing
   - Evidence to verify: checkout evidence that will support, narrow, remove, or record each claim for manual handoff
   - User-provided decisions/rationale: decisions, rationale, constraints, tradeoffs, rejection reasons, or scope boundaries from the current task conversation, or "none provided"
   - No-update-needed rationale: why mapped truth is already current when no truth doc should change
   - Blockers: missing routing, ambiguous ownership, failed verification, unavailable evidence, or off-boundary write needs
11. Only edit allowed truth docs/routes after Sync Intent is clear; if ownership is ambiguous, repair topology first when the repair is safe and in scope, otherwise stop and recommend Truth Structure instead of guessing.
${TRUTH_DOC_AUTHORING_STYLE_INSTRUCTIONS}
${subagentMode}Topology review and repair:
- before updating truth docs, verify the changed code resolves to a specific behavior-owned area and bounded truth owner
- if routing is missing, stale, broad, overloaded, catch-all route only, or cannot map changed code to a bounded truth owner, run Truth Structure before syncing when topology repair is safe and in scope
- safe in-scope topology repair may update truth routing files and create or update bounded leaf truth docs needed to map the changed functional code; keep the repair limited to the affected route owner
- stop and recommend Truth Structure only when topology repair is unsafe, ambiguous, or outside the current task boundary
- report the route files and changed code paths that required structure repair
- do not create another generic truth doc
- README.md files are indexes, not Truth Sync targets
- must not append behavior details to a README.md index
- write engineering truth under ${config.truthmark.paths.engineeringTruthRoot}; product truth updates under ${config.truthmark.paths.productTruthRoot} are allowed only for explicit current product behavior changes
Optional validation tooling:
- you may run truthmark check when local tooling is available
- you may validate the final report with \`truthmark validate sync-report <report-file> --json\` when available
- do not require the truthmark binary; direct checkout inspection is the canonical path
- optional validation must not replace agent judgment about docs and routing
- update Product Decisions only in product truth and Engineering Decisions only in engineering truth when evidence supports the lane-specific decision change
${renderHierarchySummary(config)}
Parent post-sync verification:
- verify only truth docs and leased truth routing files changed during sync
- stop on any unrelated diff caused by the sync step
- stop if functional code changed during sync
- validate the final report against the structured Truth Sync report contract, including Claim, indented Evidence, and Result values supported, narrowed, removed, or blocked under Evidence checked
- verify the updated docs correspond to reviewed checkout evidence, changed-code impact, or a recorded stale-truth correction made within the sync write lease
- verify the final report records ownership review, structure requirement, split, restructure, or manual handoff reason when the ownership review applies
- manual handoff outcomes must preserve the working tree as-is: no rollback, no post-block cleanup edits, and manual-review reporting of any remaining files`;
};

export const renderTruthSyncSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCodexSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
    includeOpenCodeSubagentMode?: boolean;
  } = {},
): string => {
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);
  const workflow = getTruthmarkWorkflow("truthmark-sync");
  return `---
name: truthmark-sync
description: ${workflow.description}
argument-hint: Optional changed-code area, truth-doc area, or sync focus
user-invocable: true
---

${renderTruthSyncProcedureBody(config, options)}
Report completion in this shape:
${renderMarkdownExample(
  renderTruthSyncCompletedReport({
    changedCode: ["src/auth/session.ts"],
    syncIntent: {
      changedCodeReviewed: ["src/auth/session.ts"],
      affectedRouteOrTruthOwner: [
        `${config.truthmark.paths.routeAreasRoot}/authentication.md`,
      ],
      targetTruthDocs: [`${engineeringTruthRoot}/behaviors/session-timeout.md`],
      intendedUpdate: ["Update session timeout behavior."],
      evidenceToVerify: [
        "src/auth/session.ts:12",
        `${config.truthmark.paths.routeAreasRoot}/authentication.md:11`,
      ],
      userProvidedDecisionRationale: [
        "User rationale: session timeout behavior changed for internal implementation consistency",
      ],
      noUpdateNeededRationale: ["not applicable; mapped truth is stale"],
      blockers: ["none"],
    },
    ownershipReviewed: [`${config.truthmark.paths.routeAreasRoot}/authentication.md`],
    truthDocsUpdated: [`${engineeringTruthRoot}/behaviors/session-timeout.md`],
    evidenceChecked: [
      {
        claim:
          "Session timeout behavior is documented in the bounded authentication behavior truth doc.",
        evidence: [
          "src/auth/session.ts:12",
          `${config.truthmark.paths.routeAreasRoot}/authentication.md:11`,
        ],
        result: "supported",
      },
    ],
    decisionRationaleCaptured: [
      "Placed user rationale in the bounded authentication behavior truth doc under Engineering Decisions/Rationale.",
    ],
    notes: ["Updated session timeout behavior."],
  }),
)}
Blocked report example:
${renderMarkdownExample(
  renderTruthSyncBlockedReport({
    reason: "Changed code maps only to the provisional bootstrap route.",
    manualReviewFiles: [
      "src/auth/**",
      `${config.truthmark.paths.routeAreasRoot}/${config.truthmark.routes.defaultArea}.md`,
    ],
    nextAction: "Run Truth Structure for src/auth/** before updating behavior truth.",
  }),
)}`;
};
