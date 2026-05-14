import path from "node:path";
import { stringify } from "yaml";

import type { TruthmarkConfig } from "../config/schema.js";
import type { DiscoveredMarkdownDocument } from "../markdown/discovery.js";
import {
  createDefaultConfig,
  createDefaultRawConfig,
} from "../config/defaults.js";
import { inferTruthDocumentKindFromPath } from "../routing/areas.js";
import { resolveTruthDocsRoot } from "../truth/docs.js";

const asRelativePath = (value: string): string => {
  return value.split(path.sep).join("/");
};

const currentDate = (): string => new Date().toISOString().slice(0, 10);

const resolveRelativePath = (fromPath: string, toPath: string): string => {
  return asRelativePath(path.relative(path.dirname(fromPath), toPath));
};

const truthRoot = resolveTruthDocsRoot;

const renderTruthDocumentsMetadata = (
  documents: Array<{ path: string; kind: string }>,
): string[] => {
  return [
    "```yaml",
    stringify({ truth_documents: documents }).trimEnd(),
    "```",
  ];
};

export const renderConfigTemplate = (): string => {
  return stringify(createDefaultRawConfig());
};

export const renderAreasTemplate = (
  documents: DiscoveredMarkdownDocument[],
): string => {
  const truthDocuments =
    documents.length > 0
      ? documents.map((document) => ({
          path: document.path,
          kind: inferTruthDocumentKindFromPath(document.path) ?? "behavior",
        }))
      : [{ path: "docs/truth/**/*.md", kind: "behavior" }];

  return [
    "# Truthmark Areas",
    "",
    "## Repository Truth Surface",
    "",
    "Truth documents:",
    ...renderTruthDocumentsMetadata(truthDocuments),
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

export const renderHierarchicalAreasIndexTemplate = (
  config: TruthmarkConfig,
): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const childPath = `${config.docs.routing.areaFilesRoot}/${defaultArea}.md`;
  const title = titleCase(defaultArea);
  const sourceOfTruth = resolveRelativePath(
    config.docs.routing.rootIndex,
    ".truthmark/config.yml",
  );

  return [
    "---",
    "status: active",
    "doc_type: route-index",
    `last_reviewed: ${currentDate()}`,
    "source_of_truth:",
    `  - ${sourceOfTruth}`,
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
  const truthDocsRoot = truthRoot(config);
  const leafTruthDoc = `${truthDocsRoot}/${defaultArea}/overview.md`;
  const templatePath = `${config.docs.routing.areaFilesRoot}/${defaultArea}.md`;
  const sourceOfTruth = resolveRelativePath(templatePath, ".truthmark/config.yml");

  return [
    "---",
    "status: active",
    "doc_type: area-route",
    `last_reviewed: ${currentDate()}`,
    "source_of_truth:",
    `  - ${sourceOfTruth}`,
    "---",
    "",
    `# ${title} Areas`,
    "",
    `## ${title}`,
    "",
    "Truth documents:",
    "```yaml",
    "truth_documents:",
    `  - path: ${leafTruthDoc}`,
    "    kind: behavior",
    "```",
    "",
    "Code surface:",
    "- src/**",
    "",
    "Update truth when:",
    "- behavior changes affect repository truth",
    "",
  ].join("\n");
};

export const renderTruthRootReadmeTemplate = (
  config: TruthmarkConfig = createDefaultConfig(),
): string => {
  const templatePath = `${truthRoot(config)}/README.md`;
  const sourceOfTruth = resolveRelativePath(
    templatePath,
    config.docs.routing.rootIndex,
  );

  return [
    "---",
    "status: active",
    "doc_type: index",
    `last_reviewed: ${currentDate()}`,
    "source_of_truth:",
    `  - ${sourceOfTruth}`,
    "---",
    "",
    "# Truth Docs",
    "",
    "This directory is an index for current truth docs organized by the configured Truthmark hierarchy.",
    "",
    "README.md files are indexes, not Truth Sync targets. Keep bounded truth in leaf docs under `<domain>/<behavior>.md`.",
    "",
  ].join("\n");
};

export const renderTruthDomainReadmeTemplate = (config: TruthmarkConfig): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const title = titleCase(defaultArea);
  const templatePath = `${truthRoot(config)}/${defaultArea}/README.md`;
  const sourceOfTruth = resolveRelativePath(
    templatePath,
    `${config.docs.routing.areaFilesRoot}/${defaultArea}.md`,
  );

  return [
    "---",
    "status: active",
    "doc_type: index",
    `last_reviewed: ${currentDate()}`,
    "source_of_truth:",
    `  - ${sourceOfTruth}`,
    "---",
    "",
    `# ${title} Truth Docs`,
    "",
    `This directory indexes bounded ${title.toLowerCase()} truth docs.`,
    "",
    "README.md files are indexes, not Truth Sync targets. Keep bounded truth in leaf docs in this directory.",
    "",
    "Current leaf docs:",
    "",
    "- [Overview](overview.md)",
    "",
  ].join("\n");
};

export const BEHAVIOR_DOC_TEMPLATE_PATH = "docs/templates/behavior-doc.md";
export const CONTRACT_DOC_TEMPLATE_PATH = "docs/templates/contract-doc.md";
export const ARCHITECTURE_DOC_TEMPLATE_PATH = "docs/templates/architecture-doc.md";
export const WORKFLOW_DOC_TEMPLATE_PATH = "docs/templates/workflow-doc.md";
export const OPERATIONS_DOC_TEMPLATE_PATH = "docs/templates/operations-doc.md";
export const TEST_BEHAVIOR_DOC_TEMPLATE_PATH = "docs/templates/test-behavior-doc.md";

export const renderBehaviorDocTemplateFile = (): string => {
  return [
    "---",
    "status: active",
    "doc_type: behavior",
    "truth_kind: behavior",
    `last_reviewed: ${currentDate()}`,
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
    "This doc was created from the editable behavior-doc template at {{template_path}}.",
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

const renderTypedTruthDocTemplate = (
  truthKind: string,
  docType: string,
  title: string,
  sections: string[],
): string => {
  const placeholderNameForSection = (section: string): string => {
    return section
      .replace(/^#+\s+/u, "")
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  return [
    "---",
    "status: active",
    `doc_type: ${docType}`,
    `truth_kind: ${truthKind}`,
    `last_reviewed: ${currentDate()}`,
    "source_of_truth:",
    "  - {{source_of_truth}}",
    "---",
    "",
    `# ${title}`,
    "",
    "## Purpose",
    "",
    "{{purpose}}",
    "",
    "## Scope",
    "",
    "{{scope}}",
    "",
    ...sections.flatMap((section) => [
      section,
      "",
      `{{${placeholderNameForSection(section)}}}`,
      "",
    ]),
    "## Product Decisions",
    "",
    "{{decision}}",
    "",
    "## Rationale",
    "",
    "{{rationale}}",
    "",
    "## Non-Goals",
    "",
    "{{non_goals}}",
    "",
    "## Maintenance Notes",
    "",
    "{{maintenance_notes}}",
    "",
  ].join("\n");
};

export const renderContractDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("contract", "contract", "{{title}}", [
    "## Contract Surface",
    "## Inputs",
    "## Outputs",
    "## Errors And Diagnostics",
    "## Compatibility Rules",
    "## Versioning And Migration",
  ]);
};

export const renderArchitectureDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("architecture", "architecture", "{{title}}", [
    "## System Role",
    "## Boundaries",
    "## Components",
    "## Data And Control Flow",
    "## Ownership",
    "## Cross-Cutting Constraints",
  ]);
};

export const renderWorkflowDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("workflow", "behavior", "{{title}}", [
    "## Triggers",
    "## Inputs",
    "## Execution Model",
    "## Steps",
    "## State, Retry, And Failure Behavior",
    "## Outputs",
  ]);
};

export const renderOperationsDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("operations", "behavior", "{{title}}", [
    "## Operational Surface",
    "## Runtime Topology",
    "## Configuration",
    "## Permissions",
    "## Deployment And Rollback",
    "## Availability And Observability",
  ]);
};

export const renderTestBehaviorDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("test-behavior", "behavior", "{{title}}", [
    "## Test Surface",
    "## Fixtures And Data Model",
    "## Execution Model",
    "## Assertions And Invariants",
    "## Isolation Rules",
    "## Reporting And Failure Semantics",
  ]);
};

const renderTemplate = (template: string, values: Record<string, string>): string => {
  return Object.entries(values).reduce((rendered, [key, value]) => {
    return rendered.split(`{{${key}}}`).join(value);
  }, template);
};

export const renderBehaviorLeafDocTemplate = (
  config: TruthmarkConfig,
  template = renderBehaviorDocTemplateFile(),
): string => {
  const defaultArea = config.docs.routing.defaultArea;
  const title = titleCase(defaultArea);
  const templatePath = `${truthRoot(config)}/${defaultArea}/overview.md`;
  const sourceOfTruth = resolveRelativePath(
    templatePath,
    `${config.docs.routing.areaFilesRoot}/${defaultArea}.md`,
  );
  const today = currentDate();

  return renderTemplate(template, {
    area: defaultArea,
    contracts:
      "- External contracts should link to the nearest canonical contract doc when one exists.",
    core_rules:
      "- Truth README files are indexes; behavior truth belongs in bounded leaf docs.",
    current_behavior:
      "- Document current behavior here when implementation changes make repository truth incomplete.",
    decision: `- Decision (${today}): Truth README files are indexes; behavior truth belongs in bounded leaf docs.`,
    flows_and_states: "- None beyond current behavior.",
    maintenance_notes:
      "- Update this doc when routed implementation changes alter current behavior, rules, contracts, or decisions.",
    non_goals:
      "- This doc is not a catch-all for unrelated repository behavior.",
    purpose: `Describe why the default ${title.toLowerCase()} behavior surface exists and what outcome it protects.`,
    rationale:
      "Bounded leaf docs keep agent context focused and prevent large products from accumulating unreviewable feature manuals.",
    scope: `This bounded leaf truth doc owns the default ${title.toLowerCase()} behavior surface created by Truthmark.`,
    source_of_truth: sourceOfTruth,
    template_path: BEHAVIOR_DOC_TEMPLATE_PATH,
    title: `${title} Overview`,
    truth_kind: "behavior",
  });
};
