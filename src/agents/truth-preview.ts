import type { TruthmarkConfig } from "../config/schema.js";
import {
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderHierarchySummary,
  resolveTruthDocsRoot,
} from "./shared.js";
import { TRUTHMARK_VERSION } from "../version.js";
import { getTruthmarkWorkflow } from "./workflow-manifest.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_PREVIEW_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.";

export const renderTruthPreviewReportExample = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const truthDocsRoot = resolveTruthDocsRoot(config);

  return `Truth Preview: completed

Requested outcome:
- preview likely Truthmark workflow routing before edits

Likely workflow:
- truthmark-document

Why this workflow:
- positive trigger: document existing implemented behavior
- negative triggers considered: functional-code change, doc-first implementation, topology repair, truth audit
- forbidden adjacency considered: must not edit functional code

Likely route owner:
- route file: ${config.docs.routing.rootIndex}
- truth doc: ${truthDocsRoot}/example.md
- confidence: medium

Expected write classes:
- truth docs

Expected target files:
- ${truthDocsRoot}/example.md

Suggested subagent use:
- read-only verifiers: truth_route_auditor
- write workers: none in Preview
- leases needed: none in Preview

Blocking ambiguity:
- none identified in preview

Handoff:
- Run the selected Truthmark workflow after user approval.`;
};

export const renderTruthPreviewSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-preview");

  return `---
name: truthmark-preview
description: ${workflow.description}
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Invocations: ${TRUTH_PREVIEW_EXPLICIT_INVOCATIONS}

Truth Preview is read-only. Its report is intended, not authorized.

Purpose:
- preview the likely Truthmark workflow, route owner, target files, expected write classes, suggested subagent use, and blocking ambiguity before edits happen
- hand off to the selected workflow after user approval
- keep the selector thin so agents can avoid loading or acting through heavier workflows prematurely

Read:
- .truthmark/config.yml
- ${config.docs.routing.rootIndex}
- relevant child route files under ${config.docs.routing.areaFilesRoot}/
- relevant truth docs and implementation files needed to preview ownership
- ${EVIDENCE_AUTHORITY_INSTRUCTIONS}

Do not:
- must not edit files
- must not create truth docs
- must not update routing
- must not run Truth Sync automatically
- must not replace Truth Check
- must not claim final correctness
- must not issue write leases
- must not mutate code

Suggested subagent use:
- optional read-only verifier: truth_route_auditor
- write workers: none
- leases needed: none

${renderHierarchySummary(config)}

Report completion in this shape:
${renderMarkdownExample(renderTruthPreviewReportExample(config))}`;
};
