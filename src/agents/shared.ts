import { createDefaultConfig } from "../config/defaults.js";
import type { TruthmarkConfig } from "../config/schema.js";

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
  "When creating or updating a feature doc, read docs/templates/feature-doc.md and follow its frontmatter, heading order, and section intent.",
  "When updating an existing feature doc, align existing feature docs to the template standard while preserving authored content that remains accurate.",
  "If docs/templates/feature-doc.md is missing, use the built-in minimal feature-doc structure with Current Behavior, Product Decisions, and Rationale sections.",
  "Teams may edit docs/templates/feature-doc.md to define their local feature-doc standard.",
].join("\n");

export const ARCHITECTURE_DOC_BOUNDARY_INSTRUCTIONS = [
  "Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.",
  "Do not put ordinary feature behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.",
  "Keep architecture docs focused on structure and ownership; keep current product behavior in feature or contract docs.",
].join("\n");

export const defaultAgentConfig = (): TruthmarkConfig => {
  return createDefaultConfig();
};

export const renderHierarchySummary = (config: TruthmarkConfig): string => {
  const featureRoot = config.docs.roots.features ?? config.docs.roots.features_current ?? "docs/features";

  return [
    "Truthmark hierarchy:",
    "- Config: .truthmark/config.yml",
    `- Root route index: ${config.docs.routing.rootIndex}`,
    `- Area route files: ${config.docs.routing.areaFilesRoot}/**/*.md`,
    `- Feature docs: ${featureRoot}/**/*.md`,
  ].join("\n");
};
