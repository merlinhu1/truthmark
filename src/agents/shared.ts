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
  "Decision truth lives in the canonical doc it governs; date active decisions inline when added or changed.",
  "Do not create separate active-decision ADR/planning logs; replace the active decision and let Git history carry the audit trail.",
  "Update Product Decisions and Rationale when a decision changes behavior.",
].join("\n");

export const EVIDENCE_AUTHORITY_INSTRUCTIONS = [
  "Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.",
  "Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.",
].join("\n");

export const REPOSITORY_INTELLIGENCE_INSTRUCTIONS = [
  "Repository intelligence artifacts are optional derived context: RepoIndex, RouteMap, ImpactSet, and ContextPack may guide routing, context selection, and verification planning when available.",
  "They do not override checkout evidence, canonical truth docs, route files, or workflow write boundaries.",
  "If unavailable, inspect .truthmark/config.yml, route files, source files, truth docs, and tests directly, then report that repository-intelligence artifacts were not generated.",
].join("\n");

export const FEATURE_DOC_TEMPLATE_INSTRUCTIONS = [
  "When creating or updating a truth doc, inspect the routed truth kind and use the matching `docs/templates/<kind>-doc.md` template.",
  "Supported kinds: behavior, contract, architecture, workflow, operations, and test-behavior.",
  "Align existing docs to that template while preserving accurate authored content.",
  "If the template is missing, use Scope, Product Decisions, Rationale, and the kind-specific current-truth section.",
  "Teams may edit the template files under docs/templates/ to define their local truth-doc standards.",
].join("\n");

export const renderTruthDocOwnershipGateSection = (
  subject: string,
  outcome: string,
): string => {
  return [
    "Truth-doc ownership gate:",
    `- before editing or relying on ${subject}, verify each target/source truth doc is a bounded owner for the behavior`,
    "- if a target/source doc mixes independent owners, spans unrelated behaviors, acts as an index, or needs cross-owner edits, do not patch or in-place repair it",
    `- ${outcome}`,
    "- report Ownership reviewed, Structure required, Truth docs split, Truth docs restructured, or Blocked reason as applicable",
  ].join("\n");
};

export const TRUTH_DOC_DECISION_RATIONALE_PRESERVATION_INSTRUCTIONS = [
  "Product Decisions/Rationale preservation gate:",
  "- before any truth-doc split, restructure, or shape repair, inventory existing Product Decisions and Rationale sections in every source or touched truth doc",
  "- preserve each current decision and rationale in the bounded owner doc it governs; when splitting, move it to the new owner doc rather than deleting it or leaving it in an index",
  "- remove or narrow a decision or rationale only when checkout evidence shows it is stale or unsupported, and report the exact claim, evidence, and result",
  "- if ownership of a decision or rationale is unclear, block with manual-review files instead of deleting it or guessing",
  "- after the edit, verify every touched truth doc still has Product Decisions and Rationale sections and every pre-existing entry is preserved, moved, narrowed, removed with evidence, or blocked",
].join("\n");

export const renderTruthDocRestructureGateSection = (scope: string): string => {
  return [
    "Truth-doc shape repair gate:",
    `- ${scope}`,
    "- repair shape in place only after the ownership gate confirms the doc is the right bounded owner",
    "- use Truth Structure for ownership splits; do not treat broad or mixed-owner docs as in-place repair work",
    "- repair shape when a narrow edit would make truth worse: missing template sections, stale evidence conflicts, cross-section updates within one owner, or wrong frontmatter/source/headings",
    "- preserve supported claims; remove, narrow, or block unsupported or stale claims",
    "- report docs restructured and why a narrow edit was not sufficient",
  ].join("\n");
};

export const ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS = [
  "Maintain architecture docs only for structure-level changes: system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.",
  "Keep ordinary behavior, endpoints, UI copy, validation rules, and bug fixes in behavior or contract docs unless they change those boundaries.",
].join("\n");

export const renderRouteFirstEvidenceGateSection = (
  subject: string,
  noImpactedDocOutcome: string,
): string => {
  return [
    "Evidence Gate:",
    `- route-first: map ${subject} to bounded route owners and primary canonical docs`,
    "- review new or changed behavior-bearing claims only in touched docs, route ownership, Product Decisions, and Rationale",
    "- support claims with primary checkout evidence: implementation, config, routing, generated templates, schemas, or contract definitions",
    "- tests/examples/canonical docs corroborate; they are not sole proof when implementation conflicts",
    "- remove, narrow, or block unsupported claims",
    `- ${noImpactedDocOutcome}`,
  ].join("\n");
};

export const renderTopologyEvidenceGateSection = (): string => {
  return [
    "Evidence Gate:",
    "- apply the Evidence Gate before finishing when Truth Structure writes routed docs, ownership claims, Product Decisions, or Rationale",
    "- support ownership/behavior claims with topology or primary checkout evidence from layout, implementation boundaries, docs, config, route files, tests, templates, schemas, or contracts",
    "- tests/examples/canonical docs corroborate; remove, narrow, or block unsupported claims",
  ].join("\n");
};

export const renderAuditEvidenceGateSection = (): string => {
  return [
    "Evidence Gate:",
    "- support each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests",
    "- canonical docs are context, not sole proof when implementation conflicts",
    "- remove unsupported findings or mark open questions; validate changed claims if you edit docs",
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
