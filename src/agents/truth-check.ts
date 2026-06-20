import type { TruthmarkConfig } from "../config/schema.js";
import {
  renderAuditEvidenceCheckedSection,
  renderAuditEvidenceGateSection,
  renderClaudeSubagentModeSection,
  renderCodexSubagentModeSection,
  renderCopilotCustomAgentModeSection,
  renderOpenCodeSubagentModeSection,
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderBulletBlock,
  renderHierarchySummary,
  renderReadOnlyLaneClassificationRuleBlock,
} from "./shared.js";
import { getTruthmarkWorkflow } from "./workflow-manifest.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_CHECK_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Antigravity @truthmark-check; Cursor @truthmark-check.";

export const renderTruthCheckReportExample = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const rootRouteIndex = config.truthmark.paths.routesIndex;
  return `Truth Check: completed

Files reviewed:
- ${rootRouteIndex}

Issues found:
- none

Fixes suggested:
- none

${renderAuditEvidenceCheckedSection([
  {
    finding:
      "The root route index is present and maps repository truth owners.",
    evidence: [`${rootRouteIndex}:1`],
    suggestedFix: "none",
    confidence: "high",
  },
])}

Validation:
- truthmark check`;
};

export const renderTruthCheckProcedureBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCodexSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
    includeOpenCodeSubagentMode?: boolean;
  } = {},
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-check");
  const claudeSubagentMode = options.includeClaudeSubagentMode
    ? `${renderClaudeSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns the final Truth Check report",
      )}\n\n`
    : "";
  const codexSubagentMode = options.includeCodexSubagentMode
    ? `${renderCodexSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns the final Truth Check report",
      )}\n\n`
    : "";
  const copilotCustomAgentMode = options.includeCopilotCustomAgentMode
    ? `${renderCopilotCustomAgentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns the final Truth Check report",
      )}\n\n`
    : "";
  const openCodeSubagentMode = options.includeOpenCodeSubagentMode
    ? `${renderOpenCodeSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns the final Truth Check report",
      )}\n\n`
    : "";
  const subagentMode = `${claudeSubagentMode}${codexSubagentMode}${copilotCustomAgentMode}${openCodeSubagentMode}`;

  return `# Truthmark Check

Use this skill to audit repository truth health.

Truth Check is agent-led:

- inspect .truthmark/config.yml and configured route files only when they exist; then inspect canonical docs and relevant implementation directly
- inspect the configured root route index at ${config.truthmark.paths.routesIndex} and relevant child route files under ${config.truthmark.paths.routeAreasRoot}/ when they exist
- Evidence authority:
${renderBulletBlock(EVIDENCE_AUTHORITY_INSTRUCTIONS)}
- Lane classification:
${renderReadOnlyLaneClassificationRuleBlock(config)}
- check that current docs describe current code rather than historical plans
- keep lane and cross-lane checks route-first and bounded:
  - for a narrow audit, inspect only the routed area and directly linked counterpart docs
  - for root-wide truth health, first build a cheap route-map/index from route files, then inspect only mismatches and linked leaves
  - inspect product counterparts for engineering docs only when route YAML claims a product relationship, or when the user explicitly asks for user-visible product coverage
- check lane root/kind alignment for product truth under ${config.truthmark.paths.productTruthRoot} and engineering truth under ${config.truthmark.paths.engineeringTruthRoot}
- check route YAML cross-lane realized_by and realizes links for existence and lane compatibility
- report missing product links for user-visible engineering docs only as a second-pass review diagnostic, not as default full-document reads or hard errors
- check product docs do not contain engineering execution flow, generated file inventories, or CLI envelope mechanics
- check engineering docs do not contain product promises, product rationale, or Product Decisions sections
- never judge whether a product decision is commercially correct, valuable, prioritized, or desirable
- check that route files map code surfaces to canonical truth docs when route files exist
- check for broad, catch-all, index-like, or mixed-owner truth docs and report them as topology issues requiring Truth Structure
- check that canonical docs keep lane-appropriate decisions and rationale sections
- optionally run truthmark check when local tooling is available
- must not require the truthmark binary; direct inspection is always valid
- report issues and suggested fixes without silently rewriting unrelated files
- if follow-up docs edits are needed for mixed-owner docs, run or recommend Truth Structure before editing
${renderAuditEvidenceGateSection()}

${subagentMode}${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}`;
};

export const renderTruthCheckSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCodexSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
    includeOpenCodeSubagentMode?: boolean;
  } = {},
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-check");

  return `---
name: truthmark-check
description: ${workflow.description}
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
---

${renderTruthCheckProcedureBody(config, options)}
Report completion in this shape:

${renderMarkdownExample(renderTruthCheckReportExample(config))}`;
};
