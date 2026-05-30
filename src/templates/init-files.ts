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

type TemplateSectionSpec = {
  heading: string;
  placeholder: string;
  guidance: string[];
};

type ParsedTemplateSection = {
  heading: string;
  block: string;
};

const renderTemplateSection = (section: TemplateSectionSpec): string[] => {
  return [
    section.heading,
    "",
    "<!--",
    ...section.guidance,
    "-->",
    "",
    `{{${section.placeholder}}}`,
    "",
  ];
};

const titleToPlaceholder = (title: string): string => {
  return title
    .replace(/^#+\s+/u, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const findTemplateSectionHeadings = (template: string): Array<{ heading: string; index: number }> => {
  const matches: Array<{ heading: string; index: number }> = [];
  let fencedCodeMarker: "`" | "~" | null = null;
  let fencedCodeLength = 0;

  for (const lineMatch of template.matchAll(/^.*(?:\r?\n|$)/gm)) {
    const rawLine = lineMatch[0];
    if (rawLine.length === 0) {
      continue;
    }

    const line = rawLine.replace(/\r?\n$/u, "");
    const fenceMatch = /^(?: {0,3})(`{3,}|~{3,})/u.exec(line);

    if (fenceMatch) {
      const marker = fenceMatch[1]?.[0] as "`" | "~";
      const length = fenceMatch[1]?.length ?? 0;

      if (fencedCodeMarker === null) {
        fencedCodeMarker = marker;
        fencedCodeLength = length;
      } else if (marker === fencedCodeMarker && length >= fencedCodeLength) {
        fencedCodeMarker = null;
        fencedCodeLength = 0;
      }

      continue;
    }

    if (fencedCodeMarker === null && /^## .+$/u.test(line)) {
      matches.push({ heading: line.trim(), index: lineMatch.index });
    }
  }

  return matches;
};

const parseTemplateSections = (template: string): { preamble: string; sections: ParsedTemplateSection[] } => {
  const matches = findTemplateSectionHeadings(template);

  if (matches.length === 0) {
    return { preamble: template.trimEnd(), sections: [] };
  }

  const sections = matches.map((match, index) => {
    const start = match.index;
    const next = matches[index + 1];
    const end = next?.index ?? template.length;

    return {
      heading: match.heading,
      block: template.slice(start, end).trimEnd(),
    };
  });

  return {
    preamble: template.slice(0, matches[0]?.index ?? 0).trimEnd(),
    sections,
  };
};

export const mergeTruthDocTemplate = (existingTemplate: string, defaultTemplate: string): string => {
  if (existingTemplate.trim().length === 0) {
    return defaultTemplate;
  }

  const defaultParsed = parseTemplateSections(defaultTemplate);
  const existingParsed = parseTemplateSections(existingTemplate);
  const defaultHeadings = new Set(defaultParsed.sections.map((section) => section.heading));
  const customBeforeDefault = new Map<string, ParsedTemplateSection[]>();
  const trailingCustomSections: ParsedTemplateSection[] = [];

  existingParsed.sections.forEach((section, index) => {
    if (defaultHeadings.has(section.heading)) {
      return;
    }

    const nextDefaultSection = existingParsed.sections
      .slice(index + 1)
      .find((candidate) => defaultHeadings.has(candidate.heading));

    if (nextDefaultSection) {
      const bucket = customBeforeDefault.get(nextDefaultSection.heading) ?? [];
      bucket.push(section);
      customBeforeDefault.set(nextDefaultSection.heading, bucket);
      return;
    }

    trailingCustomSections.push(section);
  });

  const mergedSections = defaultParsed.sections.flatMap((section) => [
    ...(customBeforeDefault.get(section.heading) ?? []),
    section,
  ]);

  return [
    existingParsed.preamble,
    ...mergedSections.map((section) => section.block),
    ...trailingCustomSections.map((section) => section.block),
    "",
  ]
    .filter((block) => block.length > 0)
    .join("\n\n");
};

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
    "<!--",
    "State the user/system outcome this behavior protects and why it exists.",
    "Include the problem boundary and durable value; exclude roadmap, implementation plan, and historical narrative.",
    "List the code, config, docs, or tests that support the claim in source_of_truth rather than prose-only assertion.",
    "-->",
    "",
    "{{purpose}}",
    "",
    "## Scope",
    "",
    "<!--",
    "Define the one coherent behavior surface this document owns.",
    "Include in-scope actors, entrypoints, state/data owned by this doc, and explicit handoffs to neighboring truth docs.",
    "Split into another leaf doc when content introduces a distinct outcome, state machine, rule family, external contract, or route owner.",
    "Keep README.md files as indexes only.",
    "-->",
    "",
    "{{scope}}",
    "",
    "This doc was created from the editable behavior-doc template at {{template_path}}.",
    "",
    "## Current Behavior",
    "",
    "<!--",
    "Describe only current implemented behavior in present tense.",
    "Cover observable behavior, important defaults, and user/system-visible effects; exclude desired future behavior and speculative design.",
    "Every non-obvious claim should be checkable from source_of_truth evidence.",
    "-->",
    "",
    "{{current_behavior}}",
    "",
    "## Core Rules",
    "",
    "<!--",
    "Capture stable business rules, invariants, precedence rules, validation rules, and must-never constraints.",
    "Separate rules from incidental implementation details; cite current implementation or tests for rule enforcement.",
    "-->",
    "",
    "{{core_rules}}",
    "",
    "## Flows And States",
    "",
    "<!--",
    "Document state transitions, lifecycle stages, retries, fallbacks, route switches, and important error paths.",
    "State 'None beyond current behavior.' when this behavior has no distinct flow or state model.",
    "-->",
    "",
    "{{flows_and_states}}",
    "",
    "## Contracts",
    "",
    "<!--",
    "Capture user-visible or integration contracts: CLI/API shape, inputs, outputs, diagnostics, files, events, permissions, or links to canonical contract docs.",
    "Avoid duplicating a separate canonical contract doc; link to it when contract ownership lives elsewhere.",
    "-->",
    "",
    "{{contracts}}",
    "",
    "## Product Decisions",
    "",
    "<!--",
    "Keep active decisions only, dated inline when added or changed.",
    "Explain decisions that shape behavior, boundaries, rejected alternatives, or migration constraints; replace stale decisions instead of appending historical logs.",
    "-->",
    "",
    "{{decision}}",
    "",
    "## Rationale",
    "",
    "<!--",
    "Explain why the current behavior and active decisions are this way, including tradeoffs and constraints.",
    "Tie rationale to evidence-backed behavior; do not use this as a changelog.",
    "-->",
    "",
    "{{rationale}}",
    "",
    "## Non-Goals",
    "",
    "<!--",
    "Name adjacent behavior this doc intentionally does not own, especially tempting future expansions or neighboring route owners.",
    "Use this section to prevent scope creep and duplicate truth ownership.",
    "-->",
    "",
    "{{non_goals}}",
    "",
    "## Maintenance Notes",
    "",
    "<!--",
    "List related tests, routing cautions, migration notes, evidence drift risks, and review triggers for future maintainers or agents.",
    "Keep this operational and current-state focused, not historical.",
    "-->",
    "",
    "{{maintenance_notes}}",
    "",
  ].join("\n");
};

const sectionSpec = (
  heading: string,
  guidance: string[],
  placeholder = titleToPlaceholder(heading),
): TemplateSectionSpec => ({ heading, guidance, placeholder });

const PURPOSE_SECTION = sectionSpec("## Purpose", [
  "State the software-engineering outcome this document protects and why the documented surface exists.",
  "Include durable value, impacted users/systems, and the problem boundary; exclude roadmap, implementation plans, and historical narrative.",
  "Keep claims traceable to source_of_truth evidence rather than prose-only assertion.",
]);

const SCOPE_SECTION = sectionSpec("## Scope", [
  "Define the one coherent surface this document owns, including actors, entrypoints, owned state/data, and handoffs to neighboring truth docs.",
  "Call out important out-of-scope boundaries here or in Non-Goals; split the doc when it mixes distinct outcomes, lifecycles, contracts, or owners.",
]);

const PRODUCT_DECISIONS_SECTION = sectionSpec("## Product Decisions", [
  "Keep active decisions only, dated inline when added or changed.",
  "Capture decisions that shape behavior, interfaces, boundaries, compatibility, risk acceptance, or migration constraints.",
  "Replace stale decisions instead of appending historical logs.",
], "decision");

const RATIONALE_SECTION = sectionSpec("## Rationale", [
  "Explain why the current behavior, structure, or contract is this way, including tradeoffs and constraints.",
  "Tie rationale to evidence-backed facts and active decisions; do not use this as a changelog.",
]);

const NON_GOALS_SECTION = sectionSpec("## Non-Goals", [
  "Name adjacent behavior, responsibilities, interfaces, or future expansions this doc intentionally does not own.",
  "Use this section to prevent scope creep and duplicate truth ownership.",
]);

const MAINTENANCE_NOTES_SECTION = sectionSpec("## Maintenance Notes", [
  "List related tests, routing cautions, migration notes, compatibility risks, evidence drift risks, and review triggers for future maintainers or agents.",
  "Keep this operational and current-state focused, not historical.",
]);

const renderTypedTruthDocTemplate = (
  truthKind: string,
  docType: string,
  title: string,
  sections: TemplateSectionSpec[],
): string => {
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
    ...renderTemplateSection(PURPOSE_SECTION),
    ...renderTemplateSection(SCOPE_SECTION),
    ...sections.flatMap(renderTemplateSection),
    ...renderTemplateSection(PRODUCT_DECISIONS_SECTION),
    ...renderTemplateSection(RATIONALE_SECTION),
    ...renderTemplateSection(NON_GOALS_SECTION),
    ...renderTemplateSection(MAINTENANCE_NOTES_SECTION),
  ].join("\n");
};

export const renderContractDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("contract", "contract", "{{title}}", [
    sectionSpec("## Contract Surface", [
      "Identify the owned API, CLI, file format, event, protocol, permission boundary, or integration surface.",
      "State consumers/producers, stability level, and the source files/tests that define the contract.",
    ]),
    sectionSpec("## Inputs", [
      "Document accepted parameters, payloads, files, environment/config keys, permissions, and validation rules.",
      "Include required/optional status, defaults, constraints, and normalization behavior.",
    ]),
    sectionSpec("## Outputs", [
      "Document returned values, emitted files/events, state changes, side effects, and success diagnostics.",
      "Make externally observable behavior explicit enough for compatibility review.",
    ]),
    sectionSpec("## Errors And Diagnostics", [
      "List error classes, exit/status codes, user-facing diagnostics, retries, and recoverability expectations.",
      "Distinguish validation errors, dependency failures, authorization failures, and internal faults when applicable.",
    ]),
    sectionSpec("## Compatibility Rules", [
      "State backward/forward compatibility guarantees, tolerated inputs, deprecation rules, and breaking-change triggers.",
      "Include compatibility tests or review gates that protect the contract.",
    ]),
    sectionSpec("## Versioning And Migration", [
      "Document version negotiation, schema/API version fields, rollout requirements, migration steps, and rollback expectations.",
      "State 'Not versioned' only when the implementation truly has no versioning or migration surface.",
    ]),
  ]);
};

export const renderArchitectureDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("architecture", "architecture", "{{title}}", [
    sectionSpec("## System Role", [
      "Describe the current architectural role of this subsystem/component in the larger system.",
      "State the primary responsibilities, consumers, providers, and why this boundary exists now.",
    ]),
    sectionSpec("## Boundaries", [
      "Define owned code/config/data, external dependencies, trust boundaries, and interfaces crossed by this architecture.",
      "Name what is deliberately outside the boundary and link neighboring architecture or contract docs when they own it.",
    ]),
    sectionSpec("## Components", [
      "List the major runtime/build-time components, modules, services, jobs, or generated artifacts and their responsibilities.",
      "Keep the component list current and evidence-backed; avoid speculative target architecture.",
    ]),
    sectionSpec("## Data And Control Flow", [
      "Describe important data movement, command/control paths, synchronization points, state ownership, and failure paths.",
      "Call out persistence, queues, caches, external calls, and security-sensitive transitions where relevant.",
    ]),
    sectionSpec("## Ownership", [
      "Document team/module ownership, review responsibility, operational responsibility, and escalation paths if known.",
      "If ownership is inferred from codeowners, config, or repository structure, cite that evidence.",
    ]),
    sectionSpec("## Cross-Cutting Constraints", [
      "Record active constraints such as security, privacy, reliability, performance, portability, maintainability, compliance, and cost.",
      "Tie constraints to source evidence, tests, standards, or operational requirements where available.",
    ]),
  ]);
};

export const renderWorkflowDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("workflow", "behavior", "{{title}}", [
    sectionSpec("## Triggers", [
      "List events, commands, schedules, user actions, webhooks, or dependency signals that start this workflow.",
      "Include preconditions, authorization requirements, debounce/coalescing behavior, and disabled states when applicable.",
    ]),
    sectionSpec("## Inputs", [
      "Document data, files, config, context, credentials, and environmental assumptions consumed by the workflow.",
      "Include validation, defaults, and normalization that happen before execution.",
    ]),
    sectionSpec("## Execution Model", [
      "Describe synchronous/asynchronous execution, concurrency, locking, leases, batching, ordering, and idempotency behavior.",
      "State whether the workflow is user-blocking, background, distributed, or delegated to another system.",
    ]),
    sectionSpec("## Steps", [
      "Capture the current ordered steps or phases at a level useful for maintenance and review.",
      "Reference implementation entrypoints instead of duplicating line-by-line code behavior.",
    ]),
    sectionSpec("## State, Retry, And Failure Behavior", [
      "Document state transitions, retries, timeouts, compensation, fallback, partial-success, and terminal-failure behavior.",
      "Make externally visible failure semantics and recovery responsibilities clear.",
    ]),
    sectionSpec("## Outputs", [
      "List artifacts, state changes, notifications, logs, metrics, diagnostics, and downstream triggers produced by the workflow.",
      "Include success criteria and handoff points to other truth docs or systems.",
    ]),
  ]);
};

export const renderOperationsDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("operations", "behavior", "{{title}}", [
    sectionSpec("## Operational Surface", [
      "Describe what operators, maintainers, or automated systems can observe or control for this surface.",
      "Include commands, dashboards, alerts, runbooks, jobs, or operational APIs that define current operations.",
    ]),
    sectionSpec("## Runtime Topology", [
      "Document services, processes, containers, hosts, regions, dependencies, queues, stores, and network boundaries involved at runtime.",
      "State single-node/local behavior explicitly when there is no distributed topology.",
    ]),
    sectionSpec("## Configuration", [
      "List operational config, environment variables, feature flags, secrets references, defaults, and reload/restart requirements.",
      "Do not include secret values; describe storage and rotation expectations instead.",
    ]),
    sectionSpec("## Permissions", [
      "Document required identities, roles, scopes, filesystem/network permissions, and least-privilege boundaries.",
      "Include user-facing authorization behavior and operator access requirements when relevant.",
    ]),
    sectionSpec("## Deployment And Rollback", [
      "Describe deployment mechanism, migration ordering, compatibility windows, rollback path, and known irreversible operations.",
      "Call out manual gates, smoke checks, and post-deploy verification responsibilities.",
    ]),
    sectionSpec("## Availability And Observability", [
      "Capture availability expectations, health checks, metrics, logs, traces, alerts, SLO/error-budget signals, and known blind spots.",
      "Include what maintainers should inspect first during incidents or degraded behavior.",
    ]),
  ]);
};

export const renderTestBehaviorDocTemplateFile = (): string => {
  return renderTypedTruthDocTemplate("test-behavior", "behavior", "{{title}}", [
    sectionSpec("## Test Surface", [
      "Define the behavior, contract, architecture, or workflow surface these tests verify.",
      "Link the canonical truth docs and code paths the tests are meant to protect.",
    ]),
    sectionSpec("## Fixtures And Data Model", [
      "Document fixtures, factories, seeds, mocks/fakes, test repositories, external-service substitutes, and data lifecycle rules.",
      "Include cleanup, determinism, privacy, and cross-test contamination constraints.",
    ]),
    sectionSpec("## Execution Model", [
      "Describe how tests run: command, framework, parallelism, isolation, network/filesystem assumptions, and required services.",
      "State whether tests are unit, integration, e2e, contract, smoke, regression, or generated checks.",
    ]),
    sectionSpec("## Assertions And Invariants", [
      "List the critical assertions, invariants, failure modes, and negative cases that make the tests meaningful.",
      "Tie assertions to product/contract rules rather than incidental implementation details.",
    ]),
    sectionSpec("## Isolation Rules", [
      "Document transaction boundaries, temp directories, fake clocks, network blocking, shared resources, and teardown rules.",
      "Call out known order dependencies or flake risks and how they are controlled.",
    ]),
    sectionSpec("## Reporting And Failure Semantics", [
      "Describe diagnostics, snapshots, logs, coverage signals, retry policy, and how maintainers should interpret failures.",
      "Include escalation or quarantine criteria for flaky or environment-sensitive tests.",
    ]),
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
