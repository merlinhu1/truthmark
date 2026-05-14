import type { TruthmarkConfig } from "../config/schema.js";
import {
  ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS,
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  FEATURE_DOC_TEMPLATE_INSTRUCTIONS,
  TRUTH_DOC_DECISION_RATIONALE_PRESERVATION_INSTRUCTIONS,
  defaultAgentConfig,
  renderClaimEvidenceCheckedSection,
  renderRouteFirstEvidenceGateSection,
  renderHierarchySummary,
  renderTruthDocOwnershipGateSection,
  renderTruthDocRestructureGateSection,
  resolveTruthDocsRoot,
} from "./shared.js";
import { TRUTHMARK_VERSION } from "../version.js";
import { getTruthmarkWorkflow } from "./workflow-manifest.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Gemini CLI /truthmark:document.";

export const renderTruthDocumentReportExample = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const truthDocsRoot = resolveTruthDocsRoot(config);

  return `Truth Document: completed

Implementation reviewed:
- src/routing/area-resolver.ts

Truth docs created:
- ${truthDocsRoot}/contracts.md

Truth docs updated:
- ${truthDocsRoot}/check-diagnostics.md

Truth docs restructured:
- ${truthDocsRoot}/check-diagnostics.md

Routing updated:
- ${config.docs.routing.rootIndex}

${renderClaimEvidenceCheckedSection([
    {
      claim: "Route resolution behavior is documented in the contracts truth doc.",
      evidence: [
        "src/routing/area-resolver.ts:14",
        `${config.docs.routing.rootIndex}:9`,
      ],
      result: "supported",
    },
  ])}

Notes:
- Documented routing and behavior from route handlers and tests.`;
};

export const renderTruthDocumentSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-document");

  return `---
name: truthmark-document
description: ${workflow.description}
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.
Invocations: ${TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS}

Truth Document is manual and implementation-first:

- run only when the user explicitly asks to generate or update truth docs for existing behavior, or when Truth Sync, Truth Check, or Truth Structure reports implemented behavior that lacks canonical truth docs
- inspect .truthmark/config.yml, ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, existing canonical docs, implementation code, and tests directly
- ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
- document current implemented behavior; do not invent future behavior or planned endpoints
- may write canonical truth docs and ${config.docs.routing.rootIndex} or relevant child route files only
- must not write functional code
- when routing is missing, stale, broad, overloaded, catch-all, or cannot map the behavior to a bounded truth owner, run Truth Structure first when routing repair is safe and in scope
- block and recommend Truth Structure when routing repair is unsafe, ambiguous, or outside the task boundary
- keep feature README.md files as indexes rather than truth-document targets
- create or update bounded leaf truth docs when behavior does not fit an existing leaf doc
- keep behavior truth docs behavior-oriented, not endpoint-oriented, unless the endpoint itself is the behavior boundary
- keep API endpoint details in the nearest contract truth doc when such a doc owns the API contract
- preserve unrelated authored content
${renderTruthDocOwnershipGateSection(
    "the implemented behavior and candidate truth docs",
    "if the target doc is broad, mixed-owner, index-like, or the documented behavior spans independent owners, run Truth Structure first when safe and in scope; otherwise block and recommend Truth Structure",
  )}
${TRUTH_DOC_DECISION_RATIONALE_PRESERVATION_INSTRUCTIONS}
${renderRouteFirstEvidenceGateSection(
    "the documented behavior",
    "if no truth doc changed, report why current truth was already sufficient or why documentation was blocked",
  )}
${FEATURE_DOC_TEMPLATE_INSTRUCTIONS}
${renderTruthDocRestructureGateSection(
    "Truth Document may restructure only truth docs for the implemented behavior being documented.",
  )}
${ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS}
${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}

Report completion in this shape:
${renderMarkdownExample(renderTruthDocumentReportExample(config))}`;
};
