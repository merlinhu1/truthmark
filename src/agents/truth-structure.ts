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

export const TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-structure; Codex /truthmark-structure or $truthmark-structure; Gemini CLI /truthmark:structure.";

export const renderTruthStructureReportExample = (): string => {
  return `Truth Structure: completed
Topology reviewed:
- controllers: src/auth/**
- docs root: docs/features
- route files: docs/truthmark/areas.md
Areas reviewed:
- src/auth/**
Routing updated:
- docs/truthmark/areas.md
Truth docs created:
- docs/features/authentication.md
Topology decisions:
- Added an Authentication area because session behavior has a distinct code surface and truth owner.
Notes:
- Added an Authentication area for session behavior.`;
};

export const renderTruthStructureSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `---
name: truthmark-structure
description: Use when the user asks to design, repair, or refresh Truthmark area routing. Inspects the repository directly, updates docs/truthmark/areas.md, and may create starter canonical truth docs.
argument-hint: Optional area, directory, or routing concern
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

Use this skill to design or repair Truthmark area structure.
Invocations: ${TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS}
Truth Structure is agent-native:
- inspect repository layout, current docs, .truthmark/config.yml, TRUTHMARK.md, docs/truthmark/areas.md, and relevant code directly
- ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
- inspect the configured root route index at ${config.docs.routing.rootIndex} and relevant child route files under ${config.docs.routing.areaFilesRoot}/
- define areas by product or behavior ownership, not by mechanical directory mirroring
- create or repair docs/truthmark/areas.md
- create starter truth docs when useful and when they belong in the canonical current-truth surface
- use docs/features/**, docs/architecture/**, or docs/standards/** for current truth destinations
- use only canonical current-truth destinations for starter truth docs
- keep active Product Decisions and Rationale in the canonical doc that owns the behavior
- preserve unrelated authored content
## Topology Governance
Truth Structure owns documentation topology. Do not depend on humans to manually organize ${config.docs.roots.features ?? config.docs.roots.features_current ?? "docs/features"}. Treat the configured feature root as a managed semantic root.
Inspect controllers, routes, handlers, services, packages, tests, existing truth docs, and route files; infer product and domain ownership from behavior boundaries, not from mechanical directory mirroring.
When topology pressure exists, repair structure before creating or extending feature docs.
Topology pressure signals:
- one area maps broad code such as src/**, app/**, server/**, services/**, or packages/**
- one area maps multiple unrelated controllers, route groups, services, or bounded contexts
- one truth doc owns unrelated behaviors or unrelated endpoint families
- the configured feature root has many direct non-index docs
- a changed controller, route, or service cannot map to a specific behavior doc
- Truth Sync would need to create a new generic feature doc because routing is too broad
- endpoint or controller names reveal domains missing from ${config.docs.routing.areaFilesRoot}/**
Use these review thresholds as guidance:
- more than 10 direct feature docs in one folder
- more than 15 leaf areas in one child route file
- more than 8 truth docs mapped to one area
- more than 5 controllers mapped through one catch-all area
Repair rules:
- split broad catch-all areas into behavior-owned child route files
- create route files under ${config.docs.routing.areaFilesRoot}/ when a product/domain boundary is clear
- create feature docs under the configured feature root only when behavior lacks a current doc
- README.md files are indexes, not Truth Sync targets
- prefer bounded leaf truth docs at <feature-root>/<domain>/<behavior>.md
- keep feature docs behavior-oriented, not endpoint-oriented
- keep API endpoint details in the nearest contract truth doc when such a doc exists
- update routing so future Truth Sync can target small docs
- preserve existing authored docs; move or rewrite only when needed to remove ambiguity
Portable fallback:
- If this skill surface is unavailable, perform the same workflow directly from committed repository files.
- Do not require the truthmark CLI.
- Read .truthmark/config.yml, TRUTHMARK.md, ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, canonical docs, and representative implementation code.
- Use a subagent only when the host supports that pattern; otherwise perform the topology repair inline.
${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}
Report completion in this shape:
${renderMarkdownExample(renderTruthStructureReportExample())}`;
};
