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
  renderHierarchySummary,
  renderLaneClassificationInstructions,
} from "./shared.js";
import { TRUTHMARK_VERSION } from "../version.js";
import { getTruthmarkWorkflow } from "./workflow-manifest.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_CHECK_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.";

const renderTruthCheckReportExample = (
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
      finding: "The root route index is present and maps repository truth owners.",
      evidence: [`${rootRouteIndex}:1`],
      suggestedFix: "none",
      confidence: "high",
    },
  ])}

Validation:
- truthmark check`;
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

  return `---
name: truthmark-check
description: ${workflow.description}
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

# Truthmark Check

Use this skill to audit repository truth health.

Invocations: ${TRUTH_CHECK_EXPLICIT_INVOCATIONS}

Truth Check is agent-led:

- inspect .truthmark/config.yml and configured route files only when they exist; then inspect canonical docs and relevant implementation directly
- ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
- inspect the configured root route index at ${config.truthmark.paths.routesIndex} and relevant child route files under ${config.truthmark.paths.routeAreasRoot}/ when they exist
- check that current docs describe current code rather than historical plans
- check lane root/kind alignment for product truth under ${config.truthmark.paths.productTruthRoot} and engineering truth under ${config.truthmark.paths.engineeringTruthRoot}
- check cross-lane realized_by and realizes links for existence and lane compatibility
- report missing product links for user-visible engineering docs as review diagnostics, not hard errors
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
${renderLaneClassificationInstructions(config)}

${subagentMode}${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}

Report completion in this shape:

${renderMarkdownExample(renderTruthCheckReportExample(config))}`;
};
