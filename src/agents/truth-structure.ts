import type { TruthmarkConfig } from "../config/schema.js";
import {
  DECISION_TRUTH_INSTRUCTIONS,
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderBulletBlock,
  renderClaudeSubagentModeSection,
  renderClaimEvidenceCheckedSection,
  renderCopilotCustomAgentModeSection,
  renderHierarchySummary,
  renderLaneClassificationRuleBlock,
  renderTopologyEvidenceGateSection,
  renderTruthDocOwnershipGateSection,
  resolveEngineeringTruthRoot,
  resolveProductTruthRoot,
} from "./shared.js";


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

export const renderTruthStructureProcedureBody = (
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

  return `Use this skill to design or repair Truthmark area structure.
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
- create skeletal starter truth docs only when missing ownership would otherwise block future workflows
- Starter truth docs must use closed YAML frontmatter bounded by opening and closing --- lines; include status, truth_kind, and last_reviewed inside that frontmatter. Put source references in the final ## Source References section, not in frontmatter.
- Starter truth docs are ownership anchors, not behavior writeups: include only the title, bounded area/scope, and Source References needed to make routing explicit.
- Starter truth docs must keep product and engineering truth in separate files; leave substantive behavior, contract, architecture, workflow, operations, or test prose to Truth Document.
${subagentMode}
- use ${productTruthRoot}/** for product truth destinations
- use ${engineeringTruthRoot}/** for engineering truth destinations
- use only canonical current-truth destinations for starter truth docs
- keep Product Decisions in product truth and Engineering Decisions in engineering truth when selecting destinations; report any relocation need instead of rewriting decision prose during topology review
- preserve unrelated authored content
## New area setup
Use when a user asks to onboard a new code area into Truthmark, a new package, controller, domain, or product area lacks bounded truth ownership, or a new product area needs routing and starter truth docs.
Do:
- inspect the named code area
- infer bounded product or behavior ownership
- choose the owning route when ownership is clear; otherwise propose the route and stop for manual review
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
When topology pressure exists, repair route structure before creating or extending truth ownership anchors.
${renderTruthDocOwnershipGateSection(
  "candidate route owners and current truth docs",
  "if a truth doc mixes independent owners, route ownership is broad, or a split is required for bounded ownership, split or reroute only the ownership topology when safe; otherwise stop with manual-review files",
)}
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
- split or flag mixed-owner truth docs for bounded owners before any workflow adds new behavior claims
- create route files under ${config.truthmark.paths.routeAreasRoot}/ when a product/domain boundary is clear
- create skeletal engineering ownership anchors under ${engineeringTruthRoot} only when behavior lacks a current owner
- create skeletal product ownership anchors under ${productTruthRoot} only when product promise, boundary, rationale, or user-visible capability ownership is in scope
- README.md files are indexes, not Truth Sync targets
- prefer bounded product docs under product/capabilities or product/decisions and engineering docs under engineering/<kind>/<surface>.md
- keep behavior truth docs behavior-oriented, not endpoint-oriented
- keep API endpoint details in the nearest contract truth doc when such a doc exists
- update routing so future Truth Sync can target small docs
- preserve existing authored docs; move or rewrite only when needed to remove ambiguity
- report Truth docs split when one broad or mixed-owner truth doc becomes multiple bounded docs
${renderTopologyEvidenceGateSection()}
- Do not finish topology repair with mixed product/engineering authority in a single canonical truth doc.
- If an existing canonical doc has wrong-lane sections, report the lane repair needed and only move content when the topology split explicitly requires it.
Portable fallback:
- If this skill surface is unavailable, perform the same workflow directly from committed repository files.
- Do not require the truthmark CLI.
- Inspect .truthmark/config.yml and configured route files only when they exist; then inspect canonical docs and representative implementation code.
- Use a subagent only when the host supports that pattern; otherwise perform the topology repair inline.
${renderHierarchySummary(config)}
${DECISION_TRUTH_INSTRUCTIONS}`;
};

export const renderTruthStructureSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
  options: {
    includeClaudeSubagentMode?: boolean;
    includeCopilotCustomAgentMode?: boolean;
  } = {},
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-structure");

  return `---
name: truthmark-structure
description: ${workflow.description}
argument-hint: Optional area, directory, or routing concern
user-invocable: true
---

${renderTruthStructureProcedureBody(config, options)}
Report completion in this shape:
${renderMarkdownExample(renderTruthStructureReportExample(config))}`;
};
