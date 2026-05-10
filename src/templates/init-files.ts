import { stringify } from "yaml";

import type { TruthmarkConfig } from "../config/schema.js";
import type { DiscoveredMarkdownDocument } from "../markdown/discovery.js";
import { createDefaultRawConfig } from "../config/defaults.js";
import { TRUTHMARK_VERSION } from "../version.js";

export const renderConfigTemplate = (): string => {
  return stringify(createDefaultRawConfig());
};

export const renderTruthmarkTemplate = (): string => {
  return `---
status: active
doc_type: workflow-contract
last_reviewed: 2026-05-10
source_of_truth:
  - .truthmark/config.yml
---

# Truthmark

Markdown in the current checkout is authoritative for this branch.

Installed workflow surfaces include a Truthmark ${TRUTHMARK_VERSION} version marker. After upgrading Truthmark, rerun \`truthmark init\` and review generated workflow diffs.

Workflow runtime lives in installed skills and managed instruction blocks. Agents inspect the checkout directly; \`truthmark check\` is optional validation.

Truth Sync follows code; Truth Realize follows docs. Truth Sync may update mapped truth docs; Truth Realize never edits truth docs or routing.
`;
};

export const renderAreasTemplate = (
  documents: DiscoveredMarkdownDocument[],
): string => {
  const truthDocuments = documents.map((document) => document.path);
  const truthDocumentLines =
    truthDocuments.length > 0
      ? truthDocuments.map((documentPath) => `- ${documentPath}`)
      : ["- docs/features/"];

  return [
    "# Truthmark Areas",
    "",
    "## Repository Truth Surface",
    "",
    "Truth documents:",
    ...truthDocumentLines,
    "",
    "Code surface:",
    "- src/**",
    "",
    "Update truth when:",
    "- behavior changes affect the routed truth documents",
    "- API contracts or current feature behavior changes",
    "",
  ].join("\n");
};

const titleCase = (value: string): string => {
  return value
    .split(/[-_\s]+/u)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

export const renderHierarchicalAreasIndexTemplate = (config: TruthmarkConfig): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const childPath = `${config.docs.routing.areaFilesRoot}/${defaultArea}.md`;
  const title = titleCase(defaultArea);

  return [
    "---",
    "status: active",
    "doc_type: route-index",
    "last_reviewed: 2026-05-09",
    "source_of_truth:",
    "  - ../../.truthmark/config.yml",
    "---",
    "",
    "# Truthmark Areas",
    "",
    `## ${title}`,
    "",
    "Area files:",
    `- ${childPath}`,
    "",
    "Code surface:",
    "- src/**",
    "",
    "Update truth when:",
    "- behavior changes affect the routed truth documents",
    "- API contracts or current feature behavior changes",
    "",
  ].join("\n");
};

export const renderChildAreaTemplate = (config: TruthmarkConfig): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const title = titleCase(defaultArea);
  const featureRoot = config.docs.roots.features ?? config.docs.roots.features_current ?? "docs/features";
  const leafTruthDoc = `${featureRoot}/${defaultArea}/overview.md`;

  return [
    "---",
    "status: active",
    "doc_type: area-route",
    "last_reviewed: 2026-05-09",
    "source_of_truth:",
    "  - ../../../.truthmark/config.yml",
    "---",
    "",
    `# ${title} Areas`,
    "",
    `## ${title}`,
    "",
    "Truth documents:",
    `- ${leafTruthDoc}`,
    "",
    "Code surface:",
    "- src/**",
    "",
    "Update truth when:",
    "- behavior changes affect repository truth",
    "",
  ].join("\n");
};

export const renderFeatureRootReadmeTemplate = (): string => {
  return [
    "---",
    "status: active",
    "doc_type: index",
    "last_reviewed: 2026-05-09",
    "source_of_truth:",
    "  - ../../truthmark/areas.md",
    "---",
    "",
    "# Feature Docs",
    "",
    "This directory is an index for current feature behavior docs organized by the configured Truthmark hierarchy.",
    "",
    "README.md files are indexes, not Truth Sync targets. Keep behavior truth in bounded leaf docs under `<domain>/<behavior>.md`.",
    "",
  ].join("\n");
};

export const renderFeatureDomainReadmeTemplate = (config: TruthmarkConfig): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const title = titleCase(defaultArea);

  return [
    "---",
    "status: active",
    "doc_type: index",
    "last_reviewed: 2026-05-09",
    "source_of_truth:",
    `  - ../../truthmark/areas/${defaultArea}.md`,
    "---",
    "",
    `# ${title} Feature Docs`,
    "",
    `This directory indexes bounded ${title.toLowerCase()} feature truth docs.`,
    "",
    "README.md files are indexes, not Truth Sync targets. Keep behavior truth in bounded leaf docs in this directory.",
    "",
    "Current leaf docs:",
    "",
    "- [Overview](overview.md)",
    "",
  ].join("\n");
};

export const renderFeatureLeafDocTemplate = (config: TruthmarkConfig): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const title = titleCase(defaultArea);

  return [
    "---",
    "status: active",
    "doc_type: feature",
    "last_reviewed: 2026-05-09",
    "source_of_truth:",
    `  - ../../truthmark/areas/${defaultArea}.md`,
    "---",
    "",
    `# ${title} Overview`,
    "",
    "## Scope",
    "",
    `This bounded leaf truth doc owns the default ${title.toLowerCase()} behavior surface created by Truthmark.`,
    "",
    "## Current Behavior",
    "",
    "- Document current behavior here when implementation changes make repository truth incomplete.",
    "",
    "## Product Decisions",
    "",
    "- Decision (2026-05-09): Feature README files are indexes; behavior truth belongs in bounded leaf docs.",
    "",
    "## Rationale",
    "",
    "Bounded leaf docs keep agent context focused and prevent large products from accumulating unreviewable feature manuals.",
    "",
  ].join("\n");
};
