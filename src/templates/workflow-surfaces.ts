import { createHash } from "node:crypto";

import { stringify } from "yaml";

import type { TruthmarkConfig } from "../config/schema.js";
import {
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderClaudeSubagentModeSection,
  renderCodexSubagentModeSection,
  renderCopilotCustomAgentModeSection,
  renderGeminiSubagentModeSection,
  renderHierarchySummary,
  renderOpenCodeSubagentModeSection,
  renderTruthDocOwnershipGateSection,
  resolveEngineeringTruthRoot,
  resolveProductTruthRoot,
} from "../agents/shared.js";
import {
  TRUTH_CHECK_EXPLICIT_INVOCATIONS,
  renderTruthCheckProcedureBody,
  renderTruthCheckReportExample,
  renderTruthCheckSkillBody,
} from "../agents/truth-check.js";
import {
  TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS,
  renderTruthDocumentProcedureBody,
  renderTruthDocumentReportExample,
  renderTruthDocumentSkillBody,
} from "../agents/truth-document.js";
import {
  TRUTH_PREVIEW_EXPLICIT_INVOCATIONS,
  renderTruthPreviewProcedureBody,
  renderTruthPreviewReportExample,
  renderTruthPreviewSkillBody,
} from "../agents/truth-preview.js";
import {
  TRUTHMARK_PORTAL_EXPLICIT_INVOCATIONS,
  renderTruthmarkPortalProcedureBody,
  renderTruthmarkPortalSkillBody,
} from "../agents/truthmark-portal.js";
import {
  TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS,
  renderTruthStructureProcedureBody,
  renderTruthStructureReportExample,
  renderTruthStructureSkillBody,
} from "../agents/truth-structure.js";
import {
  TRUTH_SYNC_EXPLICIT_INVOCATIONS,
  renderTruthSyncProcedureBody,
  renderTruthSyncSkillBody,
} from "../agents/truth-sync.js";
import {
  renderTruthSyncBlockedReport,
  renderTruthSyncCompletedReport,
} from "../sync/report.js";
import { TRUTHMARK_WRITE_WORKER_REPORT_FIELDS } from "../agents/write-lease.js";
import {
  getTruthmarkWorkflow,
  TRUTHMARK_WORKFLOW_IDS,
  type TruthmarkWorkflowHelper,
  type TruthmarkWorkflowId,
  type TruthmarkReadOnlySubagentId,
  type TruthmarkWriteSubagentId,
} from "../agents/workflow-manifest.js";
import { TRUTHMARK_VERSION } from "../version.js";

export const TRUTHMARK_STRUCTURE_SKILL_PATH =
  ".agents/skills/truthmark-structure/SKILL.md";

export const TRUTHMARK_STRUCTURE_SKILL_METADATA_PATH =
  ".agents/skills/truthmark-structure/agents/openai.yaml";

export const TRUTHMARK_DOCUMENT_SKILL_PATH =
  ".agents/skills/truthmark-document/SKILL.md";

export const TRUTHMARK_DOCUMENT_SKILL_METADATA_PATH =
  ".agents/skills/truthmark-document/agents/openai.yaml";

export const TRUTHMARK_SYNC_SKILL_PATH =
  ".agents/skills/truthmark-sync/SKILL.md";

export const TRUTHMARK_SYNC_SKILL_METADATA_PATH =
  ".agents/skills/truthmark-sync/agents/openai.yaml";

export const TRUTHMARK_REALIZE_SKILL_PATH =
  ".agents/skills/truthmark-realize/SKILL.md";

export const TRUTHMARK_REALIZE_SKILL_METADATA_PATH =
  ".agents/skills/truthmark-realize/agents/openai.yaml";

export const TRUTHMARK_CHECK_SKILL_PATH =
  ".agents/skills/truthmark-check/SKILL.md";

export const TRUTHMARK_CHECK_SKILL_METADATA_PATH =
  ".agents/skills/truthmark-check/agents/openai.yaml";

export const TRUTHMARK_PREVIEW_SKILL_PATH =
  ".agents/skills/truthmark-preview/SKILL.md";

export const TRUTHMARK_PREVIEW_SKILL_METADATA_PATH =
  ".agents/skills/truthmark-preview/agents/openai.yaml";

export const TRUTHMARK_PORTAL_SKILL_PATH =
  ".agents/skills/truthmark-portal/SKILL.md";

export const TRUTHMARK_PORTAL_SKILL_METADATA_PATH =
  ".agents/skills/truthmark-portal/agents/openai.yaml";

export const TRUTHMARK_ROUTE_AUDITOR_AGENT_PATH =
  ".codex/agents/truth-route-auditor.toml";

export const TRUTHMARK_CLAIM_VERIFIER_AGENT_PATH =
  ".codex/agents/truth-claim-verifier.toml";

export const TRUTHMARK_DOC_REVIEWER_AGENT_PATH =
  ".codex/agents/truth-doc-reviewer.toml";
export const TRUTHMARK_DOC_WRITER_AGENT_PATH =
  ".codex/agents/truth-doc-writer.toml";

export const TRUTHMARK_OPENCODE_ROUTE_AUDITOR_AGENT_PATH =
  ".opencode/agents/truth-route-auditor.md";

export const TRUTHMARK_OPENCODE_CLAIM_VERIFIER_AGENT_PATH =
  ".opencode/agents/truth-claim-verifier.md";

export const TRUTHMARK_OPENCODE_DOC_REVIEWER_AGENT_PATH =
  ".opencode/agents/truth-doc-reviewer.md";
export const TRUTHMARK_OPENCODE_DOC_WRITER_AGENT_PATH =
  ".opencode/agents/truth-doc-writer.md";

export const TRUTHMARK_CLAUDE_ROUTE_AUDITOR_AGENT_PATH =
  ".claude/agents/truth-route-auditor.md";

export const TRUTHMARK_CLAUDE_CLAIM_VERIFIER_AGENT_PATH =
  ".claude/agents/truth-claim-verifier.md";

export const TRUTHMARK_CLAUDE_DOC_REVIEWER_AGENT_PATH =
  ".claude/agents/truth-doc-reviewer.md";
export const TRUTHMARK_CLAUDE_DOC_WRITER_AGENT_PATH =
  ".claude/agents/truth-doc-writer.md";

export const TRUTHMARK_GEMINI_STRUCTURE_COMMAND_PATH =
  ".gemini/commands/truthmark/structure.toml";

export const TRUTHMARK_GEMINI_DOCUMENT_COMMAND_PATH =
  ".gemini/commands/truthmark/document.toml";

export const TRUTHMARK_GEMINI_SYNC_COMMAND_PATH =
  ".gemini/commands/truthmark/sync.toml";

export const TRUTHMARK_GEMINI_REALIZE_COMMAND_PATH =
  ".gemini/commands/truthmark/realize.toml";

export const TRUTHMARK_GEMINI_CHECK_COMMAND_PATH =
  ".gemini/commands/truthmark/check.toml";

export const TRUTHMARK_GEMINI_PREVIEW_COMMAND_PATH =
  ".gemini/commands/truthmark/preview.toml";

export const TRUTHMARK_GEMINI_PORTAL_COMMAND_PATH =
  ".gemini/commands/truthmark/portal.toml";

export const TRUTHMARK_GEMINI_ROUTE_AUDITOR_AGENT_PATH =
  ".gemini/agents/truth-route-auditor.md";

export const TRUTHMARK_GEMINI_CLAIM_VERIFIER_AGENT_PATH =
  ".gemini/agents/truth-claim-verifier.md";

export const TRUTHMARK_GEMINI_DOC_REVIEWER_AGENT_PATH =
  ".gemini/agents/truth-doc-reviewer.md";
export const TRUTHMARK_GEMINI_DOC_WRITER_AGENT_PATH =
  ".gemini/agents/truth-doc-writer.md";

export const TRUTHMARK_COPILOT_STRUCTURE_PROMPT_PATH =
  ".github/prompts/truthmark-structure.prompt.md";

export const TRUTHMARK_COPILOT_DOCUMENT_PROMPT_PATH =
  ".github/prompts/truthmark-document.prompt.md";

export const TRUTHMARK_COPILOT_SYNC_PROMPT_PATH =
  ".github/prompts/truthmark-sync.prompt.md";

export const TRUTHMARK_COPILOT_REALIZE_PROMPT_PATH =
  ".github/prompts/truthmark-realize.prompt.md";

export const TRUTHMARK_COPILOT_CHECK_PROMPT_PATH =
  ".github/prompts/truthmark-check.prompt.md";

export const TRUTHMARK_COPILOT_PREVIEW_PROMPT_PATH =
  ".github/prompts/truthmark-preview.prompt.md";

export const TRUTHMARK_COPILOT_PORTAL_PROMPT_PATH =
  ".github/prompts/truthmark-portal.prompt.md";

export const TRUTHMARK_COPILOT_ROUTE_AUDITOR_AGENT_PATH =
  ".github/agents/truth-route-auditor.md";

export const TRUTHMARK_COPILOT_CLAIM_VERIFIER_AGENT_PATH =
  ".github/agents/truth-claim-verifier.md";

export const TRUTHMARK_COPILOT_DOC_REVIEWER_AGENT_PATH =
  ".github/agents/truth-doc-reviewer.md";
export const TRUTHMARK_COPILOT_DOC_WRITER_AGENT_PATH =
  ".github/agents/truth-doc-writer.md";

export const TRUTHMARK_AGENT_MANIFEST_PATH = ".truthmark/agent/manifest.json";
export const TRUTHMARK_AGENT_WORKFLOWS_ROOT = ".truthmark/agent/workflows";

const renderGeminiCommand = (description: string, prompt: string): string => {
  const promptWithArgs = `${prompt.trimEnd()}\nUser focus or arguments: {{args}}`;

  return `description = "${description}"
prompt = '''
${promptWithArgs}
'''
`;
};

const renderCopilotPromptFile = (
  description: string,
  prompt: string,
): string => {
  return `---
agent: 'agent'
description: '${description}'
---

${prompt}
`;
};

const workflowSupportFiles = (workflowId: TruthmarkWorkflowId): string[] => {
  const workflow = getTruthmarkWorkflow(workflowId);
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const hasSubagentSupport =
    definition.parentRule !== undefined &&
    ((workflow.subagents?.length ?? 0) > 0 ||
      (workflow.writeSubagents?.length ?? 0) > 0);
  const hasHelperSupport = (workflow.helpers?.length ?? 0) > 0;

  return [
    "support/procedure.md",
    "support/report-template.md",
    ...(hasSubagentSupport ? ["support/subagents-and-leases.md"] : []),
    ...(hasHelperSupport
      ? ["helper-manifest.yml", "support/helper-policy.md"]
      : []),
  ];
};

const renderWorkflowCommandAdapterInstructions = (
  workflowId: TruthmarkWorkflowId,
  root: string,
  hostName: string,
  surfaceKind: "command" | "prompt",
): string => {
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const canonicalFiles = ["SKILL.md", ...workflowSupportFiles(workflowId)]
    .map((supportFile) => `- ${root}/${supportFile}`)
    .join("\n");

  return `This ${surfaceKind} is the ${hostName} entrypoint for ${definition.title}.

Do not invoke another Truthmark command from here.

Read these host-local files in order only as needed:
${canonicalFiles}

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.`;
};

const renderTomlString = (value: string): string => {
  return `"${value.replace(/\\/gu, "\\\\").replace(/"/gu, '\\"')}"`;
};

const renderTomlStringArray = (values: string[]): string => {
  return `[${values.map(renderTomlString).join(", ")}]`;
};

const sha256 = (content: string): string =>
  createHash("sha256").update(content).digest("hex");

type TruthmarkSkillPackageHost =
  | "codex"
  | "opencode"
  | "claude-code"
  | "github-copilot"
  | "gemini-cli";

type TruthmarkSkillPackageFile = {
  path: string;
  content: string;
};

export type TruthmarkAdapterMode = "adapter" | "expanded-adapter";

type TruthmarkCanonicalManifestFile = {
  path: string;
  sha256: string;
};

type TruthmarkCanonicalManifestWorkflow = {
  id: TruthmarkWorkflowId;
  displayName: string;
  description: string;
  canonicalRoot: string;
  entrypoint: TruthmarkCanonicalManifestFile;
  supportFiles: TruthmarkCanonicalManifestFile[];
  adapterModes: Record<string, TruthmarkAdapterMode>;
};

type WorkflowPackageDefinition = {
  title: string;
  argumentHint: string;
  invocations: string;
  use: (config: TruthmarkConfig) => string;
  quickRules: (config: TruthmarkConfig) => string[];
  parentRule?: string;
};

const TRUTH_REALIZE_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.";

const routeFilesHint = (config: TruthmarkConfig): string =>
  `${config.truthmark.paths.routesIndex}; ${config.truthmark.paths.routeAreasRoot}/`;

const WORKFLOW_PACKAGE_DEFINITIONS: Record<
  TruthmarkWorkflowId,
  WorkflowPackageDefinition
> = {
  "truthmark-structure": {
    title: "Truthmark Structure",
    argumentHint: "Optional area, directory, or routing concern",
    invocations: TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS,
    use: () => "Use this skill to design or repair Truthmark area structure.",
    quickRules: (config) => [
      "Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.",
      `Inspect .truthmark/config.yml and configured route files (${routeFilesHint(config)}) only when they exist; then inspect current docs and relevant code directly.`,
      "Define areas by product or behavior ownership, not by mechanical directory mirroring.",
      "Do not edit functional code.",
      "Read support/procedure.md before writing route or starter truth-doc changes.",
      "Read support/report-template.md before the final report.",
    ],
    parentRule:
      "Parent agent owns all Truth Structure writes and final topology decisions",
  },
  "truthmark-document": {
    title: "Truthmark Document",
    argumentHint:
      "Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document",
    invocations: TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS,
    use: () =>
      "Use this skill to document existing implemented behavior when no functional-code changes are required for the task.",
    quickRules: (config) => [
      "Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.",
      `Inspect .truthmark/config.yml and configured route files (${routeFilesHint(config)}) only when they exist; then inspect existing canonical docs, implementation code, and tests directly.`,
      "Document current implemented behavior; do not invent future behavior.",
      "May write canonical truth docs and truth routing files only; must not write functional code.",
      "Read support/procedure.md before editing truth docs.",
      "Read support/subagents-and-leases.md only when dispatching or accepting worker output.",
      "Read support/report-template.md before the final report.",
    ],
    parentRule:
      "Parent agent owns Truth Document acceptance, lease validation, and final report",
  },
  "truthmark-sync": {
    title: "Truthmark Sync",
    argumentHint: "Optional changed-code area, truth-doc area, or sync focus",
    invocations: TRUTH_SYNC_EXPLICIT_INVOCATIONS,
    use: () =>
      "Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.",
    quickRules: (config) => [
      "Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.",
      "Skip docs-only, formatting-only, behavior-preserving renames with no truth impact, missing config, and no-code changes.",
      `Inspect .truthmark/config.yml and configured route files (${routeFilesHint(config)}) only when they exist; then inspect relevant canonical docs directly.`,
      "direct checkout inspection is the canonical path; do not require the truthmark binary.",
      "May write canonical truth docs and truth routing files only; must not rewrite functional code.",
      "Read support/procedure.md before editing truth docs.",
      "Read support/subagents-and-leases.md only when dispatching or accepting worker output.",
      "Read support/report-template.md before the final report.",
    ],
    parentRule:
      "Parent agent owns Truth Sync acceptance, lease validation, and final report",
  },
  "truthmark-preview": {
    title: "Truthmark Preview",
    argumentHint:
      "Optional requested outcome, code area, doc path, or routing question",
    invocations: TRUTH_PREVIEW_EXPLICIT_INVOCATIONS,
    use: () =>
      "Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.",
    quickRules: (config) => [
      "Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.",
      `Inspect .truthmark/config.yml and the root route index (${config.truthmark.paths.routesIndex}) first when present; then inspect only child route files under ${config.truthmark.paths.routeAreasRoot}/ that are relevant to the selected scope or changed paths, plus the truth docs or implementation files needed to preview ownership.`,
      "Truth Preview is read-only; this report is intended, not authorized.",
      "must not edit files and must not issue write leases; do not run Truth Sync automatically, replace Truth Check, claim final correctness, or mutate code.",
      "Use optional read-only route-auditor evidence only when it reduces context or clarifies ownership.",
      "Hand off to the selected workflow after user approval.",
    ],
    parentRule: "Parent agent owns the final Truth Preview report",
  },
  "truthmark-realize": {
    title: "Truthmark Realize",
    argumentHint:
      "Optional truth doc path, area, or desired code behavior to realize",
    invocations: TRUTH_REALIZE_EXPLICIT_INVOCATIONS,
    use: () =>
      "Use this skill only when the user explicitly asks to realize truth docs into code.",
    quickRules: (config) => [
      "Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.",
      `Read the source truth docs, inspect .truthmark/config.yml and configured route files (${routeFilesHint(config)}) only when they exist, then inspect tests and relevant functional code directly.`,
      "Truth docs lead; code follows.",
      "may write functional code only; must not edit truth docs or truth routing while realizing those docs.",
      "Read support/procedure.md before changing code.",
      "Read support/report-template.md before the final report.",
    ],
  },
  "truthmark-check": {
    title: "Truthmark Check",
    argumentHint: "Optional area, doc path, or audit focus",
    invocations: TRUTH_CHECK_EXPLICIT_INVOCATIONS,
    use: () => "Use this skill to audit repository truth health.",
    quickRules: (config) => [
      "Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.",
      `Inspect .truthmark/config.yml and configured route files (${routeFilesHint(config)}) only when they exist; then inspect canonical docs and relevant implementation directly.`,
      "Report issues and suggested fixes; do not silently rewrite unrelated files.",
      "Read support/procedure.md before auditing details.",
      "Read support/subagents-and-leases.md only when dispatching verifier subagents.",
      "Read support/report-template.md before the final report.",
    ],
    parentRule: "Parent agent owns the final Truth Check report",
  },
  "truthmark-portal": {
    title: "Truthmark Portal",
    argumentHint: "Optional portal generation focus",
    invocations: TRUTHMARK_PORTAL_EXPLICIT_INVOCATIONS,
    use: () =>
      "Use this skill only when the user explicitly asks to generate or refresh the committed static HTML Truthmark Portal.",
    quickRules: (config) => [
      "Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.",
      "Truthmark Portal is manual-only; never run it automatically at completion and never treat it as Truth Sync.",
      "Markdown remains canonical; generated HTML is non-canonical presentation only.",
      "Read Markdown directly; the workflow does not require the truthmark CLI or package.",
      "Generate committed, generated non-canonical static files for humans.",
      `Write only under fixed Portal output ${config.truthmark.paths.portalOutput}.`,
      `Use determined Portal template ${config.truthmark.paths.portalTemplate} when present; no .truthmark/index.json dependency.`,
      "Use no remote dependencies by default and include source provenance on every page.",
      "Read support/procedure.md before generating Portal output.",
      "Read support/report-template.md before the final report.",
    ],
  },
};

const renderMarkdownExample = (content: string): string => {
  return ["```md", content, "```"].join("\n");
};

const renderWorkflowReportTemplate = (
  workflowId: TruthmarkWorkflowId,
  config: TruthmarkConfig,
): string => {
  const productTruthRoot = resolveProductTruthRoot(config);
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);

  switch (workflowId) {
    case "truthmark-structure":
      return `Report completion in this shape:\n${renderMarkdownExample(
        renderTruthStructureReportExample(config),
      )}`;
    case "truthmark-document":
      return `Report completion in this shape:\n${renderMarkdownExample(
        renderTruthDocumentReportExample(config),
      )}`;
    case "truthmark-sync":
      return `Report completion in this shape:\n${renderMarkdownExample(
        renderTruthSyncCompletedReport({
          changedCode: ["src/auth/session.ts"],
          syncIntent: {
            changedCodeReviewed: ["src/auth/session.ts"],
            affectedRouteOrTruthOwner: [config.truthmark.paths.routesIndex],
            targetTruthDocs: [
              `${engineeringTruthRoot}/repository/bootstrap-routing.md`,
            ],
            intendedUpdate: ["Update session timeout behavior."],
            evidenceToVerify: [
              "src/auth/session.ts:12",
              `${config.truthmark.paths.routesIndex}:11`,
            ],
            noUpdateNeededRationale: ["not applicable; mapped truth is stale"],
            blockers: ["none"],
          },
          ownershipReviewed: [config.truthmark.paths.routesIndex],
          truthDocsUpdated: [
            `${engineeringTruthRoot}/repository/bootstrap-routing.md`,
          ],
          evidenceChecked: [
            {
              claim:
                "Session timeout behavior is documented in the mapped repository truth doc.",
              evidence: [
                "src/auth/session.ts:12",
                `${config.truthmark.paths.routesIndex}:11`,
              ],
              result: "supported",
            },
          ],
          helperScripts: ["validate-write-lease: skipped, no write lease used"],
          notes: ["Updated session timeout behavior."],
        }),
      )}\nBlocked report example:\n${renderMarkdownExample(
        renderTruthSyncBlockedReport({
          reason: "routing repair is not allowed",
          manualReviewFiles: [config.truthmark.paths.routesIndex],
          nextAction: "update routing metadata and rerun Truth Sync",
        }),
      )}`;
    case "truthmark-preview":
      return `Report completion in this shape:\n${renderMarkdownExample(
        renderTruthPreviewReportExample(config),
      )}`;
    case "truthmark-realize":
      return `Report completion in this shape:\n\n${renderMarkdownExample(`Truth Realize: completed

Truth docs used:
- ${productTruthRoot}/capabilities/authentication-session.md
- ${engineeringTruthRoot}/behaviors/authentication-session.md

Code updated:
- src/auth/session.ts

Verification:
- npm test -- auth`)}`;
    case "truthmark-check":
      return `Report completion in this shape:\n\n${renderMarkdownExample(
        renderTruthCheckReportExample(config),
      )}`;
    case "truthmark-portal":
      return `Report completion in this shape:\n\n${renderMarkdownExample(`Truthmark Portal: completed

Output path:
- ${config.truthmark.paths.portalOutput}

Page count:
- <count>

Diagrams/assets:
- <generated diagrams/assets or none>

Source docs reviewed:
- <source markdown paths>

Skipped/ambiguous docs:
- <paths and reason, or none>

Validation:
- <checks performed>

Markdown canonical statement:
- Markdown remains canonical; generated Portal HTML is non-canonical presentation only.`)}`;
  }
};

const renderWorkflowSupportParts = (
  workflowId: TruthmarkWorkflowId,
  config: TruthmarkConfig,
): { procedure: string; reportTemplate: string } => {
  return {
    procedure: renderWorkflowProcedure(workflowId, config),
    reportTemplate: renderWorkflowReportTemplate(workflowId, config),
  };
};

const renderSkillSupportFile = (title: string, body: string): string => {
  return `# ${title}

Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

${body}
`;
};

const renderHelperManifest = (helpers: TruthmarkWorkflowHelper[]): string => {
  const manifest = {
    helpers: Object.fromEntries(
      helpers.map((helper) => [
        helper.id,
        {
          optional: helper.optional,
          runner: helper.runner,
          command: helper.command,
          inputs: helper.inputs,
          output: helper.output,
          writes: helper.writes,
          ...(helper.allowedWrites === undefined
            ? {}
            : { allowedWrites: helper.allowedWrites }),
          fallback: helper.fallback,
        },
      ]),
    ),
  };

  return [
    `# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.`,
    stringify(manifest, { lineWidth: 0 }),
  ].join("\n");
};

const renderHelperPolicySupport = (
  helpers: TruthmarkWorkflowHelper[],
): string => {
  const reportHelperId =
    helpers.find((helper) => helper.id.endsWith("-report"))?.id ??
    helpers[0]?.id;
  const helperLines = helpers
    .map(
      (helper) =>
        `- ${helper.id}: optional ${helper.runner}; manual fallback: ${helper.fallback}`,
    )
    .join("\n");

  return renderSkillSupportFile(
    "Optional Helper CLI Policy",
    `Optional helper CLI commands may collect deterministic checkout facts or validate artifacts. If the Truthmark CLI is unavailable or too old for a declared helper, continue manually using this procedure and report which helper was skipped. Helper output is derived evidence; it does not override direct checkout inspection, workflow write boundaries, or parent acceptance.

Runner detection:
- Check the declared Truthmark CLI runner before invoking a helper.
- Invoke helpers through the installed \`truthmark validate ... --json\` CLI command using argv-style arguments from helper-manifest.yml.
- If unavailable or version-mismatched, treat the helper as skipped and use the manual fallback.
- Do not fail the workflow solely because a helper cannot run.

Available helpers:
${helperLines}

Final reports should include helper status when helpers are declared for this workflow:

\`\`\`md
Helper scripts:
- ${reportHelperId}: ran, passed
- validate-write-lease: skipped, no write lease used
\`\`\``,
  );
};

const renderWorkflowProcedure = (
  workflowId: TruthmarkWorkflowId,
  config: TruthmarkConfig,
): string => {
  switch (workflowId) {
    case "truthmark-structure":
      return renderTruthStructureProcedureBody(config);
    case "truthmark-document":
      return renderTruthDocumentProcedureBody(config);
    case "truthmark-sync":
      return renderTruthSyncProcedureBody(config);
    case "truthmark-preview":
      return renderTruthPreviewProcedureBody(config);
    case "truthmark-realize":
      return renderTruthmarkRealizeProcedureBody(config);
    case "truthmark-check":
      return renderTruthCheckProcedureBody(config);
    case "truthmark-portal":
      return renderTruthmarkPortalProcedureBody(config);
  }
};

const renderWorkflowEntrypoint = (
  workflowId: TruthmarkWorkflowId,
  config: TruthmarkConfig,
  supportFiles: string[],
  host: TruthmarkSkillPackageHost,
): string => {
  const workflow = getTruthmarkWorkflow(workflowId);
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const supportFileUsage = (supportFile: string): string => {
    if (supportFile === "support/procedure.md") {
      return "read before edits or detailed auditing; contains core review questions";
    }

    if (supportFile === "support/report-template.md") {
      return "read before the final report";
    }

    if (supportFile === "support/subagents-and-leases.md") {
      return "read only when using subagents, leases, or accepting worker output";
    }

    if (supportFile === "support/helper-policy.md") {
      return "read only when invoking helper validators or reporting helper status";
    }

    if (supportFile === "helper-manifest.yml") {
      return "read only when invoking helper validators or validating helper registration";
    }

    return "available when relevant to the current step";
  };
  const supportFileList = supportFiles
    .map((supportFile) => `- ${supportFile} — ${supportFileUsage(supportFile)}`)
    .join("\n");
  const hostUsage =
    host === "github-copilot"
      ? "Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs."
      : host === "gemini-cli"
        ? "Use as a Gemini CLI Agent Skill; commands remain available under `/truthmark:*` for command-first invocation."
        : undefined;

  return `---
name: ${workflowId}
description: ${workflow.description}
argument-hint: ${definition.argumentHint}
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

# ${definition.title}

${definition.use(config)}${hostUsage === undefined ? "" : `\n\n${hostUsage}`}

Invocations: ${definition.invocations}

Quick procedure:
${definition
  .quickRules(config)
  .map((rule) => `- ${rule}`)
  .join("\n")}

Progressive disclosure:
${supportFileList}
`;
};

const renderWorkflowSubagentSupport = (
  workflowId: TruthmarkWorkflowId,
  host: TruthmarkSkillPackageHost,
): string | undefined => {
  const workflow = getTruthmarkWorkflow(workflowId);
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const readAgents = workflow.subagents ?? [];
  const writeAgents = workflow.writeSubagents ?? [];

  if (readAgents.length === 0 && writeAgents.length === 0) {
    return undefined;
  }

  if (definition.parentRule === undefined) {
    return undefined;
  }

  switch (host) {
    case "codex":
      return renderCodexSubagentModeSection(
        readAgents,
        definition.parentRule,
        writeAgents,
      );
    case "opencode":
      return renderOpenCodeSubagentModeSection(
        readAgents,
        definition.parentRule,
        writeAgents,
      );
    case "claude-code":
      return renderClaudeSubagentModeSection(
        readAgents,
        definition.parentRule,
        writeAgents,
      );
    case "github-copilot":
      return renderCopilotCustomAgentModeSection(
        readAgents,
        definition.parentRule,
        writeAgents,
      );
    case "gemini-cli":
      return renderGeminiSubagentModeSection(
        readAgents,
        definition.parentRule,
        writeAgents,
      );
  }
};

export const renderTruthmarkSkillPackage = ({
  skillPath,
  workflowId,
  host,
  config = defaultAgentConfig(),
}: {
  skillPath: string;
  workflowId: TruthmarkWorkflowId;
  host: TruthmarkSkillPackageHost;
  config?: TruthmarkConfig;
}): TruthmarkSkillPackageFile[] => {
  const skillDirectory = skillPath.replace(/\/SKILL\.md$/u, "");
  const supportDirectory = `${skillDirectory}/support`;
  const { procedure, reportTemplate } = renderWorkflowSupportParts(
    workflowId,
    config,
  );
  const subagents = renderWorkflowSubagentSupport(workflowId, host);
  const helpers = getTruthmarkWorkflow(workflowId).helpers ?? [];
  const supportFiles = workflowSupportFiles(workflowId);
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const files: TruthmarkSkillPackageFile[] = [
    {
      path: skillPath,
      content: renderWorkflowEntrypoint(workflowId, config, supportFiles, host),
    },
    {
      path: `${supportDirectory}/procedure.md`,
      content: renderSkillSupportFile(
        `${definition.title} Procedure`,
        procedure,
      ),
    },
    {
      path: `${supportDirectory}/report-template.md`,
      content: renderSkillSupportFile(
        `${definition.title} Report Template`,
        reportTemplate,
      ),
    },
  ];

  if (subagents !== undefined) {
    files.push({
      path: `${supportDirectory}/subagents-and-leases.md`,
      content: renderSkillSupportFile(
        `${definition.title} Subagents And Leases`,
        subagents,
      ),
    });
  }

  if (helpers.length > 0) {
    files.push(
      {
        path: `${skillDirectory}/helper-manifest.yml`,
        content: renderHelperManifest(helpers),
      },
      {
        path: `${supportDirectory}/helper-policy.md`,
        content: renderHelperPolicySupport(helpers),
      },
    );
  }

  return files;
};

export const canonicalWorkflowRoot = (
  workflowId: TruthmarkWorkflowId,
): string => `${TRUTHMARK_AGENT_WORKFLOWS_ROOT}/${workflowId}`;

export const canonicalWorkflowSkillPath = (
  workflowId: TruthmarkWorkflowId,
): string => `${canonicalWorkflowRoot(workflowId)}/SKILL.md`;

const manifestFileFor = (
  file: TruthmarkSkillPackageFile,
): TruthmarkCanonicalManifestFile => ({
  path: file.path,
  sha256: sha256(`${file.path}\n${file.content}`),
});

export const renderCanonicalAgentPackage = (
  config: TruthmarkConfig = defaultAgentConfig(),
): TruthmarkSkillPackageFile[] => {
  const packageFiles = TRUTHMARK_WORKFLOW_IDS.flatMap((workflowId) =>
    renderTruthmarkSkillPackage({
      skillPath: canonicalWorkflowSkillPath(workflowId),
      workflowId,
      host: "codex",
      config,
    }),
  );
  const manifestWorkflows = TRUTHMARK_WORKFLOW_IDS.map((workflowId) => {
    const workflowRoot = canonicalWorkflowRoot(workflowId);
    const files = packageFiles.filter((file) =>
      file.path.startsWith(`${workflowRoot}/`),
    );
    const workflow = getTruthmarkWorkflow(workflowId);
    const entrypoint = files.find(
      (file) => file.path === canonicalWorkflowSkillPath(workflowId),
    );

    if (entrypoint === undefined) {
      throw new Error(`Missing canonical entrypoint for ${workflowId}`);
    }

    return [
      workflowId,
      {
        id: workflowId,
        displayName: workflow.displayName,
        description: workflow.description,
        canonicalRoot: workflowRoot,
        entrypoint: manifestFileFor(entrypoint),
        supportFiles: files
          .filter((file) => file.path !== entrypoint.path)
          .map(manifestFileFor)
          .sort((left, right) => left.path.localeCompare(right.path)),
        adapterModes: {
          ".agents": "adapter",
          ".opencode": "adapter",
          ".claude": "expanded-adapter",
          ".github": "expanded-adapter",
          ".gemini": "expanded-adapter",
        },
      } satisfies TruthmarkCanonicalManifestWorkflow,
    ] as const;
  });
  const manifest = {
    schemaVersion: "truthmark-agent-package/v1",
    truthmarkVersion: TRUTHMARK_VERSION,
    generatedBy: "truthmark init",
    manifestPath: TRUTHMARK_AGENT_MANIFEST_PATH,
    packageRoot: ".truthmark/agent",
    workflows: Object.fromEntries(manifestWorkflows),
  };

  return [
    ...packageFiles,
    {
      path: TRUTHMARK_AGENT_MANIFEST_PATH,
      content: `${JSON.stringify(manifest, null, 2)}\n`,
    },
  ].sort((left, right) => left.path.localeCompare(right.path));
};

export const renderTruthmarkSkillAdapterPackage = ({
  skillPath,
  workflowId,
  host,
}: {
  skillPath: string;
  workflowId: TruthmarkWorkflowId;
  host: TruthmarkSkillPackageHost;
}): TruthmarkSkillPackageFile[] => {
  const workflow = getTruthmarkWorkflow(workflowId);
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const canonicalFiles = [
    canonicalWorkflowSkillPath(workflowId),
    ...workflowSupportFiles(workflowId).map(
      (supportFile) => `${canonicalWorkflowRoot(workflowId)}/${supportFile}`,
    ),
  ];
  const hostLabel =
    host === "opencode"
      ? "OpenCode"
      : host === "codex"
        ? "Codex/OpenAI agents"
        : host;

  return [
    {
      path: skillPath,
      content: `---
name: ${workflowId}
description: ${workflow.description}
argument-hint: ${definition.argumentHint}
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

# ${definition.title}

This ${hostLabel} file is an adapter for the canonical Truthmark workflow package. It is not the workflow source of truth.

Canonical workflow files:
${canonicalFiles.map((file) => `- ${file}`).join("\n")}

Read the canonical SKILL.md first, then read support files only as that skill directs. Preserve this adapter as host invocation and discovery guidance only.
`,
    },
  ];
};

export const renderTruthmarkExpandedAdapterPackage = ({
  skillPath,
  workflowId,
  host,
  config = defaultAgentConfig(),
}: {
  skillPath: string;
  workflowId: TruthmarkWorkflowId;
  host: TruthmarkSkillPackageHost;
  config?: TruthmarkConfig;
}): TruthmarkSkillPackageFile[] => {
  const files = renderTruthmarkSkillPackage({
    skillPath,
    workflowId,
    host,
    config,
  });
  const canonicalRoot = canonicalWorkflowRoot(workflowId);
  const canonicalFiles = new Map(
    renderTruthmarkSkillPackage({
      skillPath: canonicalWorkflowSkillPath(workflowId),
      workflowId,
      host: "codex",
      config,
    }).map((file) => [file.path.replace(`${canonicalRoot}/`, ""), file]),
  );
  const adapterRoot = skillPath.replace(/\/SKILL\.md$/u, "");

  return files.map((file) => {
    const relativePath =
      file.path === skillPath ? "SKILL.md" : file.path.replace(`${adapterRoot}/`, "");
    const canonicalFile = canonicalFiles.get(relativePath);
    const canonicalPath =
      canonicalFile?.path ?? canonicalWorkflowSkillPath(workflowId);
    const canonicalContent = canonicalFile?.content ?? "";
    const generatedHash = sha256(`${file.path}\n${file.content}`);
    const canonicalHash = sha256(`${canonicalPath}\n${canonicalContent}`);

    return {
      path: file.path,
      content: `<!-- truthmark:adapter-mode=expanded-adapter -->
<!-- truthmark:canonical=${canonicalPath} -->
<!-- truthmark:canonical-sha256=${canonicalHash} -->
<!-- truthmark:generated-sha256=${generatedHash} -->
${file.content}`,
    };
  });
};

const normalizeOpenCodePermissionPath = (path: string): string => {
  const normalized = path
    .replace(/\\/gu, "/")
    .replace(/^\.\//u, "")
    .replace(/\/+$/u, "");

  return normalized === "" ? "." : normalized;
};

const appendOpenCodePermissionGlob = (root: string, glob: string): string => {
  return root === "." ? glob.replace(/^\//u, "") : `${root}${glob}`;
};

const renderOpenCodeWriterEditAllowRules = (
  config: TruthmarkConfig,
): string => {
  const truthDocRoots = Array.from(
    new Set([
      normalizeOpenCodePermissionPath(resolveProductTruthRoot(config)),
      normalizeOpenCodePermissionPath(resolveEngineeringTruthRoot(config)),
    ]),
  );
  const rootRouteIndex = normalizeOpenCodePermissionPath(
    config.truthmark.paths.routesIndex,
  );
  const areaFilesRoot = normalizeOpenCodePermissionPath(
    config.truthmark.paths.routeAreasRoot,
  );
  const allowedPatterns = [
    ...truthDocRoots.map((root) => appendOpenCodePermissionGlob(root, "/**")),
    rootRouteIndex,
    appendOpenCodePermissionGlob(areaFilesRoot, "/**/*.md"),
  ];

  return [...new Set(allowedPatterns)]
    .map((pattern) => `    ${JSON.stringify(pattern)}: allow`)
    .join("\n");
};

type TruthmarkSubagentProfile = {
  codexName: string;
  copilotName: string;
  description: string;
  nicknameCandidates: string[];
  instructions: string;
};

const READ_ONLY_SUBAGENT_CONTEXT_BOUNDARY = `Context boundary:
Do not preload AGENTS.md, CLAUDE.md, GEMINI.md, .github/copilot-instructions.md, or repo-wide policy docs unless the parent explicitly assigns them as evidence.
Use only the parent-assigned shard plus required checkout evidence files.
Return findings only; the parent workflow owns repository-policy interpretation, final decisions, and all writes.`;

const renderReadOnlySubagentInstructions = (instructions: string): string => {
  return `${instructions}
${READ_ONLY_SUBAGENT_CONTEXT_BOUNDARY}`;
};

const TRUTHMARK_SUBAGENT_PROFILES = {
  truth_route_auditor: {
    codexName: "truth_route_auditor",
    copilotName: "truth-route-auditor",
    description:
      "Read-only Truthmark route auditor for bounded routing and ownership verification.",
    nicknameCandidates: ["Route Audit", "Route Trace", "Route Check"],
    instructions: `Stay read-only.
Audit one bounded Truthmark route, area, or doc shard assigned by the parent.
Inspect .truthmark/config.yml and route files only when they exist; then inspect mapped truth docs and relevant implementation files directly.
Use a route-first bounded strategy: narrow audits inspect only the routed area and directly linked counterpart docs; root-wide health first builds a cheap route-map/index from route files, then inspects only mismatches and linked leaves.
Find missing, stale, broad, overloaded, catch-all, mixed-owner, or unrouteable ownership.
Validate route ownership against lane-specific roots and route kind:
- confirm mapped truth docs resolve to the correct lane root (product or engineering) for their kind
- flag mismatch between assigned route kind and resolved doc kind (for example, product-capability routed to engineering paths)
- verify route-doc linkage for lane pairings via realized_by and realizes before recommending edits
- inspect product counterparts for engineering docs only when route YAML claims a product relationship, or when the parent explicitly asks for user-visible product coverage
- treat missing product links for user-visible engineering docs as a second-pass diagnostic, not a default full-document read.
Do not edit files, stage changes, or propose broad rewrites.
Return JSON only with keys: scope, filesReviewed, findings, evidence, confidence, recommendedWorkflow, notes.
recommendedWorkflow must be one of: none, truthmark-document, truthmark-structure.`,
  },
  truth_claim_verifier: {
    codexName: "truth_claim_verifier",
    copilotName: "truth-claim-verifier",
    description:
      "Read-only Truthmark claim verifier for checking canonical truth against checkout evidence.",
    nicknameCandidates: ["Claim Audit", "Claim Trace", "Claim Check"],
    instructions: `Stay read-only.
Verify the behavior-bearing truth claims assigned by the parent against primary checkout evidence.
Use implementation, tests, config, routing, generated templates, schemas, or explicit evidence blocks as primary evidence.
Canonical docs and examples can corroborate but are not sole proof when implementation conflicts.
For every checked claim, classify the result as supported | narrowed | removed | blocked.
Do not edit files, stage changes, or invent missing behavior.
Return JSON only with keys: scope, filesReviewed, claimsChecked, evidence, unsupportedClaims, confidence, recommendedWorkflow, notes.`,
  },
  truth_doc_reviewer: {
    codexName: "truth_doc_reviewer",
    copilotName: "truth-doc-reviewer",
    description:
      "Read-only Truthmark doc reviewer for shape, decision, rationale, and evidence hygiene.",
    nicknameCandidates: ["Doc Audit", "Doc Shape", "Doc Check"],
    instructions: `Stay read-only.
Review assigned canonical truth docs for compact frontmatter, required template sections, final Source References entries, Evidence checked entries, and lane-appropriate decision sections (Product Decisions in product truth, Engineering Decisions in engineering truth).
Flag README.md files used as behavior truth targets, mixed-owner docs, and shape repairs that should move to Truth Structure.
Do not edit files, stage changes, or rewrite docs.
Return JSON only with keys: scope, filesReviewed, findings, evidence, confidence, recommendedWorkflow, notes.
recommendedWorkflow must be one of: none, truthmark-document, truthmark-structure.`,
  },
} satisfies Record<TruthmarkReadOnlySubagentId, TruthmarkSubagentProfile>;
type TruthmarkWriteSubagentProfile = {
  codexName: string;
  copilotName: string;
  description: string;
  nicknameCandidates: string[];
  instructions: string;
};
const TRUTHMARK_WRITE_SUBAGENT_PROFILES = {
  truth_doc_writer: {
    codexName: "truth_doc_writer",
    copilotName: "truth-doc-writer",
    description:
      "Write-capable Truthmark doc worker for one parent-leased truth-document shard.",
    nicknameCandidates: ["Doc Writer", "Truth Writer", "Doc Sync"],
    instructions: `Write one leased Truthmark truth-document shard assigned by the parent.
Require an explicit write lease before editing. The lease must name workflow, worker, shard, objective, requiredReads, allowedWrites, forbiddenWrites, evidenceRequired, verification, and reportFields.
Read every requiredReads entry directly before editing.
Edit only leased canonical truth docs or leased truth routing files. Do not edit functional code, generated host surfaces, package files, config files, templates, or tests unless they are explicitly leased.
Do not expand your own write scope. If the task needs an off-lease file, stop and report blocked.
Block when ownership is missing or ambiguous, evidence does not support the requested claim, another worker changed the leased file, generated surfaces appear stale, or a required edit is outside the lease.
Return YAML only with keys: ${TRUTHMARK_WRITE_WORKER_REPORT_FIELDS.join(", ")}.
status must be completed or blocked.
filesChanged must list only files you actually changed.
offLeaseChanges must be empty for completed reports.
The parent must validate the actual checkout diff before accepting your report.`,
  },
} satisfies Record<TruthmarkWriteSubagentId, TruthmarkWriteSubagentProfile>;

const renderCodexReadOnlyAgent = ({
  name,
  description,
  nicknameCandidates,
  developerInstructions,
}: {
  name: string;
  description: string;
  nicknameCandidates: string[];
  developerInstructions: string;
}): string => {
  return `# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.
name = ${renderTomlString(name)}
description = ${renderTomlString(description)}
sandbox_mode = "read-only"
nickname_candidates = ${renderTomlStringArray(nicknameCandidates)}
developer_instructions = """
${developerInstructions}
"""
`;
};
const renderCodexWriteAgent = ({
  name,
  description,
  nicknameCandidates,
  developerInstructions,
}: {
  name: string;
  description: string;
  nicknameCandidates: string[];
  developerInstructions: string;
}): string => {
  return `# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.
name = ${renderTomlString(name)}
description = ${renderTomlString(description)}
sandbox_mode = "workspace-write"
nickname_candidates = ${renderTomlStringArray(nicknameCandidates)}
developer_instructions = """
${developerInstructions}
"""
`;
};

const renderCopilotReadOnlyAgent = ({
  copilotName,
  description,
  instructions,
}: TruthmarkSubagentProfile): string => {
  const agentInstructions = renderReadOnlySubagentInstructions(instructions);

  return `---
name: ${copilotName}
description: ${description}
tools: [read, search]
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

${agentInstructions}
`;
};
const renderCopilotWriteAgent = ({
  copilotName,
  description,
  instructions,
}: TruthmarkWriteSubagentProfile): string => {
  return `---
name: ${copilotName}
description: ${description}
tools: [read, search, edit]
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

${instructions}
`;
};

const renderGeminiReadOnlyAgent = ({
  copilotName,
  description,
  instructions,
}: TruthmarkSubagentProfile): string => {
  const agentInstructions = renderReadOnlySubagentInstructions(instructions);

  return `---
name: ${copilotName}
description: ${description}
kind: local
tools: [read_file, grep_search]
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

Manual invocation: @${copilotName}

${agentInstructions}
`;
};
const renderGeminiWriteAgent = ({
  copilotName,
  description,
  instructions,
}: TruthmarkWriteSubagentProfile): string => {
  return `---
name: ${copilotName}
description: ${description}
kind: local
tools: [read_file, grep_search, write_file]
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

Manual invocation: @${copilotName} with an explicit parent write lease.

${instructions}
`;
};

const renderClaudeReadOnlyAgent = ({
  copilotName,
  description,
  instructions,
}: TruthmarkSubagentProfile): string => {
  const agentInstructions = renderReadOnlySubagentInstructions(instructions);

  return `---
name: ${copilotName}
description: ${description}
tools: Read, Grep, Glob, LS
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

Manual invocation: use the ${copilotName} subagent.

${agentInstructions}
`;
};
const renderClaudeWriteAgent = ({
  copilotName,
  description,
  instructions,
}: TruthmarkWriteSubagentProfile): string => {
  return `---
name: ${copilotName}
description: ${description}
tools: Read, Grep, Glob, LS, Edit, MultiEdit
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

Manual invocation: use the ${copilotName} subagent with an explicit parent write lease.

${instructions}
`;
};

export const renderTruthmarkRouteAuditorAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_route_auditor;

  return renderCodexReadOnlyAgent({
    name: profile.codexName,
    description: profile.description,
    nicknameCandidates: profile.nicknameCandidates,
    developerInstructions: renderReadOnlySubagentInstructions(
      profile.instructions,
    ),
  });
};

export const renderTruthmarkClaimVerifierAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_claim_verifier;

  return renderCodexReadOnlyAgent({
    name: profile.codexName,
    description: profile.description,
    nicknameCandidates: profile.nicknameCandidates,
    developerInstructions: renderReadOnlySubagentInstructions(
      profile.instructions,
    ),
  });
};

export const renderTruthmarkDocReviewerAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_doc_reviewer;

  return renderCodexReadOnlyAgent({
    name: profile.codexName,
    description: profile.description,
    nicknameCandidates: profile.nicknameCandidates,
    developerInstructions: renderReadOnlySubagentInstructions(
      profile.instructions,
    ),
  });
};
export const renderTruthmarkDocWriterAgent = (): string => {
  const profile = TRUTHMARK_WRITE_SUBAGENT_PROFILES.truth_doc_writer;

  return renderCodexWriteAgent({
    name: profile.codexName,
    description: profile.description,
    nicknameCandidates: profile.nicknameCandidates,
    developerInstructions: profile.instructions,
  });
};

export const renderTruthmarkCopilotRouteAuditorAgent = (): string => {
  return renderCopilotReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_route_auditor,
  );
};

export const renderTruthmarkCopilotClaimVerifierAgent = (): string => {
  return renderCopilotReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_claim_verifier,
  );
};

export const renderTruthmarkCopilotDocReviewerAgent = (): string => {
  return renderCopilotReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_doc_reviewer,
  );
};
export const renderTruthmarkCopilotDocWriterAgent = (): string => {
  return renderCopilotWriteAgent(
    TRUTHMARK_WRITE_SUBAGENT_PROFILES.truth_doc_writer,
  );
};

export const renderTruthmarkGeminiRouteAuditorAgent = (): string => {
  return renderGeminiReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_route_auditor,
  );
};

export const renderTruthmarkGeminiClaimVerifierAgent = (): string => {
  return renderGeminiReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_claim_verifier,
  );
};

export const renderTruthmarkGeminiDocReviewerAgent = (): string => {
  return renderGeminiReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_doc_reviewer,
  );
};
export const renderTruthmarkGeminiDocWriterAgent = (): string => {
  return renderGeminiWriteAgent(
    TRUTHMARK_WRITE_SUBAGENT_PROFILES.truth_doc_writer,
  );
};

export const renderTruthmarkClaudeRouteAuditorAgent = (): string => {
  return renderClaudeReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_route_auditor,
  );
};

export const renderTruthmarkClaudeClaimVerifierAgent = (): string => {
  return renderClaudeReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_claim_verifier,
  );
};

export const renderTruthmarkClaudeDocReviewerAgent = (): string => {
  return renderClaudeReadOnlyAgent(
    TRUTHMARK_SUBAGENT_PROFILES.truth_doc_reviewer,
  );
};
export const renderTruthmarkClaudeDocWriterAgent = (): string => {
  return renderClaudeWriteAgent(
    TRUTHMARK_WRITE_SUBAGENT_PROFILES.truth_doc_writer,
  );
};

const renderOpenCodeReadOnlyAgent = ({
  invocation,
  description,
  instructions,
}: {
  invocation: string;
  description: string;
  instructions: string;
}): string => {
  const agentInstructions = renderReadOnlySubagentInstructions(instructions);

  return `---
description: ${description}
mode: subagent
permission:
  edit: deny
  task: deny
  webfetch: deny
  websearch: deny
  external_directory: deny
  bash:
    "*": ask
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "rg *": allow
    "grep *": allow
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

Manual invocation: @${invocation}

${agentInstructions}
`;
};
const renderOpenCodeWriteAgent = ({
  invocation,
  description,
  instructions,
  config,
}: {
  invocation: string;
  description: string;
  instructions: string;
  config: TruthmarkConfig;
}): string => {
  const editAllowRules = renderOpenCodeWriterEditAllowRules(config);

  return `---
description: ${description}
mode: subagent
permission:
  read: allow
  list: allow
  grep: allow
  glob: allow
  edit:
    "*": deny
${editAllowRules}
  task: deny
  webfetch: deny
  websearch: deny
  external_directory: deny
  bash:
    "*": ask
    "git status*": allow
    "git diff*": allow
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

Manual invocation: @${invocation}

${instructions}
`;
};

export const renderTruthmarkOpenCodeRouteAuditorAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_route_auditor;

  return renderOpenCodeReadOnlyAgent({
    invocation: profile.copilotName,
    description: profile.description,
    instructions: profile.instructions,
  });
};

export const renderTruthmarkOpenCodeClaimVerifierAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_claim_verifier;

  return renderOpenCodeReadOnlyAgent({
    invocation: profile.copilotName,
    description: profile.description,
    instructions: profile.instructions,
  });
};

export const renderTruthmarkOpenCodeDocReviewerAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_doc_reviewer;

  return renderOpenCodeReadOnlyAgent({
    invocation: profile.copilotName,
    description: profile.description,
    instructions: profile.instructions,
  });
};
export const renderTruthmarkOpenCodeDocWriterAgent = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const profile = TRUTHMARK_WRITE_SUBAGENT_PROFILES.truth_doc_writer;

  return renderOpenCodeWriteAgent({
    invocation: profile.copilotName,
    description: profile.description,
    instructions: profile.instructions,
    config,
  });
};

export const renderTruthmarkStructureSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthStructureSkillBody(config);
};

export const renderTruthmarkStructureLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthStructureSkillBody(config);
};

export const renderTruthmarkStructureClaudeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthStructureSkillBody(config, {
    includeClaudeSubagentMode: true,
  });
};

export const renderTruthmarkStructureSkillMetadata = (): string => {
  const workflow = getTruthmarkWorkflow("truthmark-structure");

  return `interface:
  display_name: "${workflow.displayName}"
  short_description: "${workflow.shortDescription}"
  default_prompt: "${workflow.defaultPrompt}"

policy:
  allow_implicit_invocation: ${workflow.allowImplicitInvocation}

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkDocumentSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthDocumentSkillBody(config, {
    includeCodexSubagentMode: true,
  });
};

export const renderTruthmarkDocumentLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthDocumentSkillBody(config);
};

export const renderTruthmarkDocumentClaudeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthDocumentSkillBody(config, {
    includeClaudeSubagentMode: true,
  });
};

export const renderTruthmarkDocumentSkillMetadata = (): string => {
  const workflow = getTruthmarkWorkflow("truthmark-document");

  return `interface:
  display_name: "${workflow.displayName}"
  short_description: "${workflow.shortDescription}"
  default_prompt: "${workflow.defaultPrompt}"

policy:
  allow_implicit_invocation: ${workflow.allowImplicitInvocation}

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkSyncSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthSyncSkillBody(config, { includeCodexSubagentMode: true });
};

export const renderTruthmarkSyncLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthSyncSkillBody(config);
};

export const renderTruthmarkSyncClaudeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthSyncSkillBody(config, { includeClaudeSubagentMode: true });
};

export const renderTruthmarkSyncSkillMetadata = (): string => {
  const workflow = getTruthmarkWorkflow("truthmark-sync");

  return `interface:
  display_name: "${workflow.displayName}"
  short_description: "${workflow.shortDescription}"
  default_prompt: "${workflow.defaultPrompt}"

policy:
  allow_implicit_invocation: ${workflow.allowImplicitInvocation}

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

const renderTruthmarkRealizeProcedureBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `# Truthmark Realize

Use this skill only when the user explicitly asks to realize truth docs into code.

Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.

Truth Realize is doc-first:

- truth docs lead
- code follows
- Truth Realize never edits the truth docs it is realizing

Workflow:

1. Read the updated truth docs named by the user, or infer the relevant docs from configured route files when present.
2. Inspect .truthmark/config.yml and configured route files (${routeFilesHint(config)}) only when they exist; then read tests and the relevant functional code.
3. ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
${renderTruthDocOwnershipGateSection(
  "source truth docs before writing code",
  "if a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence, stop before writing code and recommend Truth Structure or Truth Document",
)}
4. Update functional code only so implementation matches bounded, current truth claims from the source docs.
5. Do not edit truth docs or truth routing while realizing those docs.
6. Run relevant tests for the changed code.
7. Report changed code files and verification steps.
${renderHierarchySummary(config)}

Read and write boundaries:

- may read truth docs, routing docs, and relevant functional code
- may write functional code only
- must not edit truth docs or truth routing while realizing those docs`;
};

const renderTruthmarkRealizeSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const productTruthRoot = resolveProductTruthRoot(config);
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);
  const workflow = getTruthmarkWorkflow("truthmark-realize");

  return `---
name: truthmark-realize
description: ${workflow.description}
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

${renderTruthmarkRealizeProcedureBody(config)}
Report completion in this shape:

\`\`\`md
Truth Realize: completed

Truth docs used:
- ${productTruthRoot}/capabilities/authentication-session.md
- ${engineeringTruthRoot}/behaviors/authentication-session.md

Code updated:
- src/auth/session.ts

Verification:
- npm test -- auth
\`\`\`
`;
};

export const renderTruthmarkRealizeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthmarkRealizeSkillBody(config);
};

export const renderTruthmarkRealizeSkillMetadata = (): string => {
  const workflow = getTruthmarkWorkflow("truthmark-realize");

  return `interface:
  display_name: "${workflow.displayName}"
  short_description: "${workflow.shortDescription}"
  default_prompt: "${workflow.defaultPrompt}"

policy:
  allow_implicit_invocation: ${workflow.allowImplicitInvocation}

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkPreviewSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthPreviewSkillBody(config);
};

export const renderTruthmarkPreviewLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthPreviewSkillBody(config);
};

export const renderTruthmarkPreviewSkillMetadata = (): string => {
  const workflow = getTruthmarkWorkflow("truthmark-preview");

  return `interface:
  display_name: "${workflow.displayName}"
  short_description: "${workflow.shortDescription}"
  default_prompt: "${workflow.defaultPrompt}"

policy:
  allow_implicit_invocation: ${workflow.allowImplicitInvocation}

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkCheckSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthCheckSkillBody(config, { includeCodexSubagentMode: true });
};

export const renderTruthmarkCheckLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthCheckSkillBody(config);
};

export const renderTruthmarkCheckClaudeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthCheckSkillBody(config, { includeClaudeSubagentMode: true });
};

export const renderTruthmarkCheckSkillMetadata = (): string => {
  const workflow = getTruthmarkWorkflow("truthmark-check");

  return `interface:
  display_name: "${workflow.displayName}"
  short_description: "${workflow.shortDescription}"
  default_prompt: "${workflow.defaultPrompt}"

policy:
  allow_implicit_invocation: ${workflow.allowImplicitInvocation}

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkPortalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthmarkPortalSkillBody(config);
};

export const renderTruthmarkPortalSkillMetadata = (): string => {
  const workflow = getTruthmarkWorkflow("truthmark-portal");

  return `interface:
  display_name: "${workflow.displayName}"
  short_description: "${workflow.shortDescription}"
  default_prompt: "${workflow.defaultPrompt}"

policy:
  allow_implicit_invocation: ${workflow.allowImplicitInvocation}

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

const renderGeminiWorkflowCommand = (
  workflowId: TruthmarkWorkflowId,
  root: string,
): string => {
  const workflow = getTruthmarkWorkflow(workflowId);

  return renderGeminiCommand(
    workflow.description,
    renderWorkflowCommandAdapterInstructions(
      workflowId,
      root,
      "Gemini CLI",
      "command",
    ),
  );
};

const renderCopilotWorkflowPrompt = (
  workflowId: TruthmarkWorkflowId,
  root: string,
): string => {
  const workflow = getTruthmarkWorkflow(workflowId);

  return renderCopilotPromptFile(
    workflow.description,
    renderWorkflowCommandAdapterInstructions(
      workflowId,
      root,
      "GitHub Copilot",
      "prompt",
    ),
  );
};

export const renderTruthmarkGeminiStructureCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderGeminiWorkflowCommand(
    "truthmark-structure",
    ".gemini/skills/truthmark-structure",
  );
};

export const renderTruthmarkGeminiDocumentCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderGeminiWorkflowCommand(
    "truthmark-document",
    ".gemini/skills/truthmark-document",
  );
};

export const renderTruthmarkGeminiSyncCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderGeminiWorkflowCommand(
    "truthmark-sync",
    ".gemini/skills/truthmark-sync",
  );
};

export const renderTruthmarkGeminiRealizeCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderGeminiWorkflowCommand(
    "truthmark-realize",
    ".gemini/skills/truthmark-realize",
  );
};

export const renderTruthmarkGeminiCheckCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderGeminiWorkflowCommand(
    "truthmark-check",
    ".gemini/skills/truthmark-check",
  );
};

export const renderTruthmarkGeminiPreviewCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderGeminiWorkflowCommand(
    "truthmark-preview",
    ".gemini/skills/truthmark-preview",
  );
};

export const renderTruthmarkGeminiPortalCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderGeminiWorkflowCommand(
    "truthmark-portal",
    ".gemini/skills/truthmark-portal",
  );
};

export const renderTruthmarkCopilotStructurePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderCopilotWorkflowPrompt(
    "truthmark-structure",
    ".github/skills/truthmark-structure",
  );
};

export const renderTruthmarkCopilotDocumentPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderCopilotWorkflowPrompt(
    "truthmark-document",
    ".github/skills/truthmark-document",
  );
};

export const renderTruthmarkCopilotSyncPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderCopilotWorkflowPrompt(
    "truthmark-sync",
    ".github/skills/truthmark-sync",
  );
};

export const renderTruthmarkCopilotRealizePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderCopilotWorkflowPrompt(
    "truthmark-realize",
    ".github/skills/truthmark-realize",
  );
};

export const renderTruthmarkCopilotCheckPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderCopilotWorkflowPrompt(
    "truthmark-check",
    ".github/skills/truthmark-check",
  );
};

export const renderTruthmarkCopilotPreviewPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderCopilotWorkflowPrompt(
    "truthmark-preview",
    ".github/skills/truthmark-preview",
  );
};

export const renderTruthmarkCopilotPortalPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  void config;
  return renderCopilotWorkflowPrompt(
    "truthmark-portal",
    ".github/skills/truthmark-portal",
  );
};
