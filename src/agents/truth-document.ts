import type { TruthmarkConfig } from "../config/schema.js";
import {
  ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS,
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  FEATURE_DOC_TEMPLATE_INSTRUCTIONS,
  REPOSITORY_INTELLIGENCE_INSTRUCTIONS,
  TRUTH_DOC_AUTHORING_STYLE_INSTRUCTIONS,
  TRUTH_DOC_DECISION_RATIONALE_PRESERVATION_INSTRUCTIONS,
  defaultAgentConfig,
  renderBulletBlock,
  renderLaneClassificationRuleBlock,
  renderClaimEvidenceCheckedSection,
  renderClaudeSubagentModeSection,
  renderCodexSubagentModeSection,
  renderCopilotCustomAgentModeSection,
  renderOpenCodeSubagentModeSection,
  renderRouteFirstEvidenceGateSection,
  renderHierarchySummary,
  renderTruthDocOwnershipGateSection,
  renderTruthDocRestructureGateSection,
  resolveEngineeringTruthRoot,
} from "./shared.js";

import { getTruthmarkWorkflow } from "./workflow-manifest.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Antigravity @truthmark-document; Cursor @truthmark-document.";

export const renderTruthDocumentReportExample = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);
  return `Truth Document: completed

Implementation reviewed:
- src/routing/area-resolver.ts

Ownership reviewed:
- ${config.truthmark.paths.routesIndex}

Truth docs created:
- ${engineeringTruthRoot}/contracts/routing.md

Truth docs updated:
- ${engineeringTruthRoot}/behaviors/check-diagnostics.md

Truth docs restructured:
- ${engineeringTruthRoot}/behaviors/check-diagnostics.md

Routing updated:
- ${config.truthmark.paths.routesIndex}

${renderClaimEvidenceCheckedSection([
    {
      claim: "Route resolution behavior is documented in the contracts truth doc.",
      evidence: [
        "src/routing/area-resolver.ts:14",
        `${config.truthmark.paths.routesIndex}:9`,
      ],
      result: "supported",
    },
  ])}

Notes:
- Documented routing and behavior from route handlers and tests.`;
};

export const renderTruthDocumentProcedureBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCodexSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
    includeOpenCodeSubagentMode?: boolean;
  } = {},
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-document");
  const claudeSubagentMode = options.includeClaudeSubagentMode
    ? `${renderClaudeSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Document acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const codexSubagentMode = options.includeCodexSubagentMode
    ? `${renderCodexSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Document acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const copilotCustomAgentMode = options.includeCopilotCustomAgentMode
    ? `${renderCopilotCustomAgentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Document acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const openCodeSubagentMode = options.includeOpenCodeSubagentMode
    ? `${renderOpenCodeSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns Truth Document acceptance, lease validation, and final report",
        workflow.writeSubagents ?? [],
      )}\n`
    : "";
  const subagentMode = `${claudeSubagentMode}${codexSubagentMode}${copilotCustomAgentMode}${openCodeSubagentMode}`;

  return `# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.
Invocations: ${TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS}

Truth Document is manual and implementation-first:

- run only when the user explicitly asks to generate or update truth docs for existing behavior, or when Truth Sync, Truth Check, or Truth Structure reports implemented behavior that lacks canonical truth docs
- inspect .truthmark/config.yml and configured route files only when they exist; then inspect existing canonical docs, implementation code, and tests directly
- Evidence authority:
${renderBulletBlock(EVIDENCE_AUTHORITY_INSTRUCTIONS)}
- Lane classification:
${renderLaneClassificationRuleBlock(config)}
- document current implemented behavior; do not invent future behavior or planned endpoints
- may write canonical truth docs and ${config.truthmark.paths.routesIndex} or relevant child route files only
- must not write functional code
- when routing is missing, stale, broad, overloaded, catch-all, or cannot map the behavior to a bounded truth owner, run Truth Structure first when routing repair is safe and in scope
- stop and recommend Truth Structure when routing repair is unsafe, ambiguous, or outside the task boundary
- keep feature README.md files as indexes rather than truth-document targets
- create or update bounded leaf truth docs when behavior does not fit an existing leaf doc
- write product capability/boundary truth under ${config.truthmark.paths.productTruthRoot} when documenting product promise, boundary, rationale, or user/stakeholder value
- write engineering truth under ${config.truthmark.paths.engineeringTruthRoot} when documenting implementation behavior, contracts, architecture, workflows, operations, or tests
- for both-lane documentation requests, write separate product and engineering docs and cross-link them in route YAML with realized_by and realizes, not in doc frontmatter
- keep engineering behavior truth behavior-oriented, not endpoint-oriented, unless the endpoint itself is the behavior boundary
- keep API endpoint details in the nearest contract truth doc when such a doc owns the API contract
- preserve unrelated authored content
${renderTruthDocOwnershipGateSection(
    "the implemented behavior and candidate truth docs",
    "if the target doc is broad, mixed-owner, index-like, or the documented behavior spans independent owners, run Truth Structure first when safe and in scope; otherwise stop and recommend Truth Structure",
  )}
${TRUTH_DOC_DECISION_RATIONALE_PRESERVATION_INSTRUCTIONS}
${renderRouteFirstEvidenceGateSection(
    "the documented behavior",
    "if no truth doc changed, report why current truth was already sufficient or why documentation was blocked",
  )}
${subagentMode}${REPOSITORY_INTELLIGENCE_INSTRUCTIONS}
${FEATURE_DOC_TEMPLATE_INSTRUCTIONS}
${TRUTH_DOC_AUTHORING_STYLE_INSTRUCTIONS}
${renderTruthDocRestructureGateSection(
    "Truth Document may restructure only truth docs for the implemented behavior being documented.",
  )}
${ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS}
${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}
Optional validation: when local tooling is available, you may validate the final report with \`truthmark validate document-report <report-file> --json\`; direct checkout inspection and evidence review remain authoritative.
Parent post-document verification:
- verify only truth docs and leased truth routing files changed during document work
- stop on functional code, generated host surfaces, or unrelated diffs caused by document work
- for each write lease, validate the worker report against the actual worker diff, allowedWrites, forbiddenWrites, identity fields, filesChanged, offLeaseChanges, blockers, and expected report fields before accepting it
- verify the final report records ownership review, structure requirement, restructure, routing update, or manual handoff reason when applicable`;
};

export const renderTruthDocumentSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCodexSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
    includeOpenCodeSubagentMode?: boolean;
  } = {},
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-document");

  return `---
name: truthmark-document
description: ${workflow.description}
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
---

${renderTruthDocumentProcedureBody(config, options)}
Report completion in this shape:
${renderMarkdownExample(renderTruthDocumentReportExample(config))}`;
};
