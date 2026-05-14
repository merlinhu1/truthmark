import type { TruthmarkConfig } from "../config/schema.js";
import {
  renderAuditEvidenceCheckedSection,
  renderAuditEvidenceGateSection,
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderHierarchySummary,
} from "./shared.js";
import { TRUTHMARK_VERSION } from "../version.js";
import { getTruthmarkWorkflow } from "./workflow-manifest.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_CHECK_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.";

export const renderTruthCheckReportExample = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const rootRouteIndex = config.docs.routing.rootIndex;
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
      evidence: [".truthmark/config.yml:1", `${rootRouteIndex}:1`],
      suggestedFix: "none",
      confidence: "high",
    },
  ])}

Validation:
- truthmark check`;
};

export const renderTruthCheckSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-check");

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

- inspect .truthmark/config.yml, ${config.docs.routing.rootIndex}, canonical docs, and relevant implementation directly
- ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
- inspect the configured root route index at ${config.docs.routing.rootIndex} and relevant child route files under ${config.docs.routing.areaFilesRoot}/
- check that current docs describe current code rather than historical plans
- check that ${config.docs.routing.rootIndex} routes code surfaces to canonical truth docs
- check for broad, catch-all, index-like, or mixed-owner truth docs and report them as topology issues requiring Truth Structure
- check that canonical behavior docs keep active Product Decisions and Rationale sections
- optionally run truthmark check when local tooling is available
- must not require the truthmark binary; direct inspection is always valid
- report issues and suggested fixes without silently rewriting unrelated files
- if follow-up docs edits are needed for mixed-owner docs, run or recommend Truth Structure before editing
${renderAuditEvidenceGateSection()}

${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}

Report completion in this shape:

${renderMarkdownExample(renderTruthCheckReportExample(config))}`;
};
