import type { TruthmarkConfig } from "../config/schema.js";
import {
  ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS,
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  FEATURE_DOC_TEMPLATE_INSTRUCTIONS,
  TRUTH_DOC_DECISION_RATIONALE_PRESERVATION_INSTRUCTIONS,
  defaultAgentConfig,
  renderBulletBlock,
  renderClaudeSubagentModeSection,
  renderClaimEvidenceCheckedSection,
  renderCopilotCustomAgentModeSection,
  renderHierarchySummary,
  renderLaneClassificationRuleBlock,
  renderTopologyEvidenceGateSection,
  renderTruthDocOwnershipGateSection,
  renderTruthDocRestructureGateSection,
  resolveEngineeringTruthRoot,
  resolveProductTruthRoot,
} from "./shared.js";

import { TRUTHMARK_VERSION } from "../version.js";

import { getTruthmarkWorkflow } from "./workflow-manifest.js";

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

export const TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-structure; Codex /truthmark-structure or $truthmark-structure; Claude Code /truthmark-structure; GitHub Copilot /truthmark-structure; Gemini CLI /truthmark:structure.";

export const renderTruthStructureReportExample = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const productTruthRoot = resolveProductTruthRoot(config);
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);

  return `Truth Structure: completed
Topology reviewed:
- controllers: src/auth/**
- product docs root: ${productTruthRoot}
- engineering docs root: ${engineeringTruthRoot}
- route files: ${config.truthmark.paths.routesIndex}
Areas reviewed:
- src/auth/**
Routing updated:
- ${config.truthmark.paths.routesIndex}
Initial truth boundary:
- Area: Authentication
- Code: src/auth/**
- Product owner: ${productTruthRoot}/capabilities/authentication-session.md
- Engineering owner: ${engineeringTruthRoot}/behaviors/authentication-session.md
- Scope: session behavior only
Truth docs created:
- ${productTruthRoot}/capabilities/authentication-session.md
- ${engineeringTruthRoot}/behaviors/authentication-session.md
Truth docs split:
- docs/truthmark/truth/authentication/README.md -> ${productTruthRoot}/capabilities/authentication-session.md and ${engineeringTruthRoot}/behaviors/authentication-session.md
Truth docs restructured:
- docs/truthmark/truth/authentication/README.md
${renderClaimEvidenceCheckedSection([
  {
    claim:
      "Session behavior belongs to a dedicated Authentication truth owner.",
    evidence: ["src/auth/**", `${config.truthmark.paths.routesIndex}:7`],
    result: "supported",
  },
])}
Topology decisions:
- Added an Authentication area because session behavior has a distinct code surface and truth owner.
Notes:
- Added an Authentication area for session behavior.`;
};

export const renderTruthStructureSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
  } = {},
): string => {
  const productTruthRoot = resolveProductTruthRoot(config);
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);
  const workflow = getTruthmarkWorkflow("truthmark-structure");
  const claudeSubagentMode = options.includeClaudeSubagentMode
    ? `${renderClaudeSubagentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns all Truth Structure writes and final topology decisions",
      )}\n`
    : "";
  const copilotCustomAgentMode = options.includeCopilotCustomAgentMode
    ? `${renderCopilotCustomAgentModeSection(
        workflow.subagents ?? [],
        "Parent agent owns all Truth Structure writes and final topology decisions",
      )}\n`
    : "";
  const subagentMode = `${claudeSubagentMode}${copilotCustomAgentMode}`;

  return `---
name: truthmark-structure
description: ${workflow.description}
argument-hint: Optional area, directory, or routing concern
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

Use this skill to design or repair Truthmark area structure.
Invocations: ${TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS}
Truth Structure is agent-native:
- inspect repository layout, current docs, Truthmark config and route files when present, and relevant code directly
- Evidence authority:
${renderBulletBlock(EVIDENCE_AUTHORITY_INSTRUCTIONS)}
- Lane classification:
${renderLaneClassificationRuleBlock(config)}
- inspect the configured root route index at ${config.truthmark.paths.routesIndex} and relevant child route files under ${config.truthmark.paths.routeAreasRoot}/ when they exist
- define areas by product or behavior ownership, not by mechanical directory mirroring
- create or repair ${config.truthmark.paths.routesIndex}
- create starter truth docs when useful and when they belong in the canonical current-truth surface
- Starter truth docs must use closed YAML frontmatter bounded by opening and closing --- lines; include status, truth_kind, and last_reviewed inside that frontmatter. Put source references in the final ## Source References section, not in frontmatter.
- Starter truth docs must use lane-specific templates and keep product and engineering truth in separate files.
${subagentMode}
${FEATURE_DOC_TEMPLATE_INSTRUCTIONS}
- use ${productTruthRoot}/** for product truth destinations
- use ${engineeringTruthRoot}/** for engineering truth destinations
- use only canonical current-truth destinations for starter truth docs
- keep active Product Decisions in product truth and Engineering Decisions in engineering truth
- preserve unrelated authored content
## New area setup
Use when a user asks to onboard a new code area into Truthmark, a new package, controller, domain, or product area lacks bounded truth ownership, or a new product area needs routing and starter truth docs.
Do:
- inspect the named code area
- infer bounded product or behavior ownership
- choose the owning route when ownership is clear; otherwise propose the route and block for review
- create or update the child route entry or file
- create starter truth docs only where current truth is missing
- report the initial truth boundary
Do not:
- do not edit functional code
- do not perform full behavior documentation unless evidence is inspected and the task explicitly asks for it
- do not patch broad or mixed-owner docs in place
- do not create generic catch-all docs
- do not treat README files as Sync targets
## Topology Governance
Truth Structure owns documentation topology, lane splits, decision relocation, and relationship repair. Do not depend on humans to manually organize ${productTruthRoot} or ${engineeringTruthRoot}. Treat both configured lane roots as managed semantic roots.
Inspect controllers, routes, handlers, services, packages, tests, existing truth docs, and route files; infer product and domain ownership from behavior boundaries, not from mechanical directory mirroring.
When topology pressure exists, repair structure before creating or extending truth docs.
${renderTruthDocOwnershipGateSection(
  "candidate route owners and current truth docs",
  "if a truth doc mixes independent owners, route ownership is broad, or a split is required for bounded ownership, split and reroute into bounded truth docs when safe; otherwise block with manual-review files",
)}
${TRUTH_DOC_DECISION_RATIONALE_PRESERVATION_INSTRUCTIONS}
Topology pressure signals:
- one area maps broad code such as src/**, app/**, server/**, services/**, or packages/**
- one area maps multiple unrelated controllers, route groups, services, or bounded contexts
- one truth doc owns unrelated behaviors or unrelated endpoint families
- either configured lane root has many direct non-index docs
- a changed controller, route, or service cannot map to a specific behavior doc
- Truth Sync would need to create a new generic truth doc because routing is too broad
- endpoint or controller names reveal domains missing from ${config.truthmark.paths.routeAreasRoot}/**
Use these review thresholds as guidance:
- more than 10 direct truth docs in one folder
- more than 15 leaf areas in one child route file
- more than 8 truth docs mapped to one area
- more than 5 controllers mapped through one catch-all area
Repair rules:
- split broad, overloaded, or catch-all areas into behavior-owned child route files
- split mixed-owner truth docs into bounded owner docs before adding new behavior claims
- create route files under ${config.truthmark.paths.routeAreasRoot}/ when a product/domain boundary is clear
- create engineering behavior truth docs under ${engineeringTruthRoot} only when behavior lacks a current doc
- create product truth docs under ${productTruthRoot} only when product promise, boundary, rationale, or user-visible capability truth is in scope
- README.md files are indexes, not Truth Sync targets
- prefer bounded product docs under product/capabilities or product/decisions and engineering docs under engineering/<kind>/<surface>.md
- keep behavior truth docs behavior-oriented, not endpoint-oriented
- keep API endpoint details in the nearest contract truth doc when such a doc exists
- update routing so future Truth Sync can target small docs
- preserve existing authored docs; move or rewrite only when needed to remove ambiguity
- report Truth docs split when one broad or mixed-owner truth doc becomes multiple bounded docs
${renderTruthDocRestructureGateSection(
  "Truth Structure may restructure broader routed docs when topology, ownership, or doc-shape repair is already in scope.",
)}
${renderTopologyEvidenceGateSection()}
${ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS}
- Do not finish topology repair with mixed product/engineering authority in a single canonical truth doc.
- If an existing canonical doc has wrong-lane sections, split or move them into the correct product or engineering lane.
Portable fallback:
- If this skill surface is unavailable, perform the same workflow directly from committed repository files.
- Do not require the truthmark CLI.
- Inspect .truthmark/config.yml and configured route files only when they exist; then inspect canonical docs and representative implementation code.
- Use a subagent only when the host supports that pattern; otherwise perform the topology repair inline.
${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}
Report completion in this shape:
${renderMarkdownExample(renderTruthStructureReportExample(config))}`;
};
