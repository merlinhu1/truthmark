import type { TruthmarkConfig } from "../config/schema.js";
import {
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderHierarchySummary,
} from "./shared.js";
import { TRUTHMARK_VERSION } from "../version.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_CHECK_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.";

export const renderTruthCheckReportExample = (): string => {
  return `Truth Check: completed

Files reviewed:
- TRUTHMARK.md
- docs/truthmark/areas.md

Issues found:
- none

Fixes suggested:
- none

Validation:
- truthmark check`;
};

export const renderTruthCheckSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `---
name: truthmark-check
description: Use when the user asks to audit repository truth health. Inspects truth docs, routing, and implementation directly; may optionally run truthmark check when available.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

# Truthmark Check

Use this skill to audit repository truth health.

Invocations: ${TRUTH_CHECK_EXPLICIT_INVOCATIONS}

Truth Check is agent-led:

- inspect .truthmark/config.yml, TRUTHMARK.md, docs/truthmark/areas.md, canonical docs, and relevant implementation directly
- ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
- inspect the configured root route index at ${config.docs.routing.rootIndex} and relevant child route files under ${config.docs.routing.areaFilesRoot}/
- check that current docs describe current code rather than historical plans
- check that docs/truthmark/areas.md routes code surfaces to canonical truth docs
- check that canonical behavior docs keep active Product Decisions and Rationale sections
- optionally run truthmark check when local tooling is available
- must not require the truthmark binary; direct inspection is always valid
- report issues and suggested fixes without silently rewriting unrelated files

${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}

Report completion in this shape:

${renderMarkdownExample(renderTruthCheckReportExample())}`;
};
