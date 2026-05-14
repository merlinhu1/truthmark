import { createDefaultConfig } from "../config/defaults.js";
import type { TruthmarkConfig } from "../config/schema.js";
import { resolveTruthDocsRoot } from "../truth/docs.js";

export { resolveTruthDocsRoot } from "../truth/docs.js";
export type {
  AuditEvidenceConfidence,
  AuditEvidenceItem,
  ClaimEvidenceItem,
  ClaimEvidenceResult,
} from "../truth/evidence.js";
export {
  renderAuditEvidenceCheckedSection,
  renderClaimEvidenceCheckedSection,
} from "../truth/evidence.js";

export const DECISION_TRUTH_INSTRUCTIONS = [
  "Decision truth lives in the canonical doc it governs.",
  "Date active decisions inline when added or changed, for example `Decision (2026-05-09): ...`.",
  "Do not create separate timestamped ADR logs or planning tickets for active decisions.",
  "Replace old active decisions instead of appending separate timestamped decision logs; Git history is the audit trail.",
  "Update Product Decisions and Rationale when a behavior change comes from a decision change.",
].join("\n");

export const EVIDENCE_AUTHORITY_INSTRUCTIONS = [
  "Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.",
  "Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.",
].join("\n");

export const FEATURE_DOC_TEMPLATE_INSTRUCTIONS = [
  "When creating or updating a truth doc, inspect the routed truth kind and use the matching template under docs/templates/.",
  "Use docs/templates/behavior-doc.md for behavior truth docs, docs/templates/contract-doc.md for contract docs, docs/templates/architecture-doc.md for architecture docs, docs/templates/workflow-doc.md for workflow docs, docs/templates/operations-doc.md for operations docs, and docs/templates/test-behavior-doc.md for test-behavior docs.",
  "When updating an existing truth doc, align it to the selected template standard while preserving authored content that remains accurate.",
  "If the selected template is missing, use a minimal structure with Scope, Product Decisions, Rationale, and the kind-specific current-truth section.",
  "Teams may edit the template files under docs/templates/ to define their local truth-doc standards.",
].join("\n");

export const renderTruthDocRestructureGateSection = (scope: string): string => {
  return [
    "Truth-doc restructure gate:",
    `- ${scope}`,
    "- before editing a truth doc, check whether the target doc is still a good fit for a narrow update",
    "- restructure only if a narrow append or section replacement would make truth worse",
    "- restructure when required template sections are missing, one doc mixes multiple owners or behaviors, stale sections conflict with implementation evidence, the update spans unrelated sections, an index-like summary is being used as a bounded behavior doc, or frontmatter/source evidence/headings no longer match the routed truth kind or template",
    "- prefer the smallest restructure that restores a maintainable truth shape",
    "- preserve supported existing claims; remove, narrow, or block unsupported or stale claims instead of carrying them forward silently",
    "- prefer bounded leaf docs and routing updates for large ownership splits",
    "- report which truth docs were restructured and why a narrow edit was not sufficient",
  ].join("\n");
};

export const ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS = [
  "Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.",
  "Do not put ordinary product behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.",
  "Keep architecture docs focused on structure and ownership; keep current product behavior in behavior or contract docs.",
].join("\n");

export const renderRouteFirstEvidenceGateSection = (
  subject: string,
  noImpactedDocOutcome: string,
): string => {
  return [
    "Evidence Gate:",
    "- before finishing, perform a route-first impacted-doc check",
    `- map ${subject} to bounded route owners and primary canonical docs`,
    "- use source_of_truth entries, nearby tests, architecture docs, contract docs, and generated-surface templates as secondary impacted-doc signals when they govern the behavior",
    "- review each new or changed behavior-bearing claim in touched truth docs, route ownership, Product Decisions, and Rationale",
    "- support each claim with primary evidence from implementation code, config files, routing files, generated surface templates, schemas, or contract definitions in the active checkout",
    "- use tests, examples, snapshots, and existing canonical docs as corroborating evidence, not as the sole source when implementation says otherwise",
    "- remove, narrow, or block unsupported claims instead of leaving unsupported truth behind",
    `- ${noImpactedDocOutcome}`,
  ].join("\n");
};

export const renderTopologyEvidenceGateSection = (): string => {
  return [
    "Evidence Gate:",
    "- when Truth Structure writes routed docs, ownership claims, Product Decisions, or Rationale, apply the Evidence Gate before finishing",
    "- Route ownership changes require topology evidence from repository layout, implementation boundaries, current docs, config, tests, or route files.",
    "- review each new or changed behavior-bearing claim or ownership claim in touched truth docs",
    "- support each claim with primary evidence from implementation code, config files, routing files, generated surface templates, schemas, or contract definitions in the active checkout",
    "- use tests, examples, snapshots, and existing canonical docs as corroborating evidence, not as the sole source when implementation says otherwise",
    "- remove, narrow, or block unsupported claims instead of leaving unsupported truth behind",
  ].join("\n");
};

export const renderAuditEvidenceGateSection = (): string => {
  return [
    "Evidence Gate:",
    "- support each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests",
    "- existing canonical docs are context, not sole proof when implementation conflicts",
    "- remove unsupported findings or mark them as open questions with explicit confidence",
    "- if you edit docs as a follow-up, validate new or changed behavior-bearing claims before finishing",
  ].join("\n");
};

export const defaultAgentConfig = (): TruthmarkConfig => {
  return createDefaultConfig();
};

export const renderHierarchySummary = (config: TruthmarkConfig): string => {
  const truthRoot = resolveTruthDocsRoot(config);

  return [
    "Truthmark hierarchy:",
    "- Config: .truthmark/config.yml",
    `- Root route index: ${config.docs.routing.rootIndex}`,
    `- Area route files: ${config.docs.routing.areaFilesRoot}/**/*.md`,
    `- Truth docs: ${truthRoot}/**/*.md`,
  ].join("\n");
};
