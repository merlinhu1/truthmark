import { stringify } from "yaml";

import type { TruthmarkConfig } from "../config/schema.js";
import type { DiscoveredMarkdownDocument } from "../markdown/discovery.js";
import { createDefaultRawConfig } from "../config/defaults.js";

export const renderConfigTemplate = (): string => {
  return stringify(createDefaultRawConfig());
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

export const FEATURE_DOC_TEMPLATE_PATH = "docs/templates/feature-doc.md";

export const renderFeatureDocTemplateFile = (): string => {
  return [
    "---",
    "status: active",
    "doc_type: feature",
    "last_reviewed: 2026-05-12",
    "source_of_truth:",
    "  - {{source_of_truth}}",
    "---",
    "",
    "# {{title}}",
    "",
    "## Purpose",
    "",
    "<!-- State why this feature exists, the user or system outcome it protects, and the problem it solves. Keep roadmap or implementation plans out of this section. -->",
    "",
    "{{purpose}}",
    "",
    "## Scope",
    "",
    "{{scope}}",
    "",
    "<!--",
    "This doc must own one coherent behavior surface.",
    "Split into another leaf doc when content introduces:",
    "- a distinct user or system outcome",
    "- a separate lifecycle or state machine",
    "- an unrelated rule family",
    "- a different external contract",
    "- code that should route through a different owner",
    "Keep README.md files as indexes only.",
    "-->",
    "",
    "This doc was created from the editable feature-doc template at {{template_path}}.",
    "",
    "## Current Behavior",
    "",
    "<!-- Describe implemented behavior in present tense. Do not include desired future behavior. -->",
    "",
    "{{current_behavior}}",
    "",
    "## Core Rules",
    "",
    "<!-- Capture stable business rules, invariants, precedence rules, validation rules, and must-never constraints. Omit incidental implementation details. -->",
    "",
    "{{core_rules}}",
    "",
    "## Flows And States",
    "",
    "<!-- Use for route switches, state transitions, lifecycle stages, retries, fallbacks, and important error paths. Write 'None beyond current behavior.' when no distinct flow or state model exists. -->",
    "",
    "{{flows_and_states}}",
    "",
    "## Contracts",
    "",
    "<!-- Capture user-visible or integration contracts: CLI/API shape, inputs, outputs, diagnostics, files, events, permissions, or links to canonical contract docs. Avoid duplicating a separate canonical contract doc. -->",
    "",
    "{{contracts}}",
    "",
    "## Product Decisions",
    "",
    "<!-- Keep active decisions only. Replace stale decisions instead of appending historical logs. -->",
    "",
    "{{decision}}",
    "",
    "## Rationale",
    "",
    "<!-- Explain why the current behavior and active decisions are this way, including tradeoffs. -->",
    "",
    "{{rationale}}",
    "",
    "## Non-Goals",
    "",
    "<!-- Name adjacent behavior this doc intentionally does not own, especially tempting future expansions. -->",
    "",
    "{{non_goals}}",
    "",
    "## Maintenance Notes",
    "",
    "<!-- List related tests, routing cautions, migration notes, and common drift risks for future agents. Keep this operational, not historical. -->",
    "",
    "{{maintenance_notes}}",
    "",
  ].join("\n");
};

const renderTemplate = (template: string, values: Record<string, string>): string => {
  return Object.entries(values).reduce((rendered, [key, value]) => {
    return rendered.split(`{{${key}}}`).join(value);
  }, template);
};

export const renderFeatureLeafDocTemplate = (
  config: TruthmarkConfig,
  template = renderFeatureDocTemplateFile(),
): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const title = titleCase(defaultArea);

  return renderTemplate(template, {
    area: defaultArea,
    contracts:
      "- External contracts should link to the nearest canonical contract doc when one exists.",
    core_rules:
      "- Feature README files are indexes; behavior truth belongs in bounded leaf docs.",
    current_behavior:
      "- Document current behavior here when implementation changes make repository truth incomplete.",
    decision:
      "- Decision (2026-05-09): Feature README files are indexes; behavior truth belongs in bounded leaf docs.",
    flows_and_states: "- None beyond current behavior.",
    maintenance_notes:
      "- Update this doc when routed implementation changes alter current behavior, rules, contracts, or decisions.",
    non_goals:
      "- This doc is not a catch-all for unrelated repository behavior.",
    purpose:
      `Describe why the default ${title.toLowerCase()} behavior surface exists and what outcome it protects.`,
    rationale:
      "Bounded leaf docs keep agent context focused and prevent large products from accumulating unreviewable feature manuals.",
    scope: `This bounded leaf truth doc owns the default ${title.toLowerCase()} behavior surface created by Truthmark.`,
    source_of_truth: `../../truthmark/areas/${defaultArea}.md`,
    template_path: FEATURE_DOC_TEMPLATE_PATH,
    title: `${title} Overview`,
  });
};
