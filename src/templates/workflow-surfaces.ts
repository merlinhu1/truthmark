import type { TruthmarkConfig } from "../config/schema.js";
import {
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderClaudeSubagentModeSection,
  renderCodexSubagentModeSection,
  renderHierarchySummary,
  renderOpenCodeSubagentModeSection,
  renderTruthDocOwnershipGateSection,
  resolveTruthDocsRoot,
} from "../agents/shared.js";
import {
  TRUTH_CHECK_EXPLICIT_INVOCATIONS,
  renderTruthCheckSkillBody,
} from "../agents/truth-check.js";
import {
  TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS,
  renderTruthDocumentSkillBody,
} from "../agents/truth-document.js";
import {
  TRUTH_PREVIEW_EXPLICIT_INVOCATIONS,
  renderTruthPreviewSkillBody,
} from "../agents/truth-preview.js";
import {
  TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS,
  renderTruthStructureSkillBody,
} from "../agents/truth-structure.js";
import {
  TRUTH_SYNC_EXPLICIT_INVOCATIONS,
  renderTruthSyncSkillBody,
} from "../agents/truth-sync.js";
import { TRUTHMARK_WRITE_WORKER_REPORT_FIELDS } from "../agents/write-lease.js";
import {
  getTruthmarkWorkflow,
  type TruthmarkWorkflowId,
  type TruthmarkReadOnlySubagentId,
  type TruthmarkWriteSubagentId,
} from "../agents/workflow-manifest.js";
import { TRUTHMARK_VERSION } from "../version.js";

export const TRUTHMARK_STRUCTURE_SKILL_PATH =
  ".codex/skills/truthmark-structure/SKILL.md";

export const TRUTHMARK_STRUCTURE_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-structure/agents/openai.yaml";

export const TRUTHMARK_DOCUMENT_SKILL_PATH =
  ".codex/skills/truthmark-document/SKILL.md";

export const TRUTHMARK_DOCUMENT_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-document/agents/openai.yaml";

export const TRUTHMARK_SYNC_SKILL_PATH =
  ".codex/skills/truthmark-sync/SKILL.md";

export const TRUTHMARK_SYNC_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-sync/agents/openai.yaml";

export const TRUTHMARK_REALIZE_SKILL_PATH =
  ".codex/skills/truthmark-realize/SKILL.md";

export const TRUTHMARK_REALIZE_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-realize/agents/openai.yaml";

export const TRUTHMARK_CHECK_SKILL_PATH =
  ".codex/skills/truthmark-check/SKILL.md";

export const TRUTHMARK_CHECK_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-check/agents/openai.yaml";

export const TRUTHMARK_PREVIEW_SKILL_PATH =
  ".codex/skills/truthmark-preview/SKILL.md";

export const TRUTHMARK_PREVIEW_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-preview/agents/openai.yaml";

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

export const TRUTHMARK_COPILOT_ROUTE_AUDITOR_AGENT_PATH =
  ".github/agents/truth-route-auditor.agent.md";

export const TRUTHMARK_COPILOT_CLAIM_VERIFIER_AGENT_PATH =
  ".github/agents/truth-claim-verifier.agent.md";

export const TRUTHMARK_COPILOT_DOC_REVIEWER_AGENT_PATH =
  ".github/agents/truth-doc-reviewer.agent.md";
export const TRUTHMARK_COPILOT_DOC_WRITER_AGENT_PATH =
  ".github/agents/truth-doc-writer.agent.md";

const renderGeminiCommand = (description: string, prompt: string): string => {
  return `description = "${description}"
prompt = '''
${prompt}
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

const renderTomlString = (value: string): string => {
  return `"${value.replace(/\\/gu, "\\\\").replace(/"/gu, '\\"')}"`;
};

const renderTomlStringArray = (values: string[]): string => {
  return `[${values.map(renderTomlString).join(", ")}]`;
};

type TruthmarkSkillPackageHost = "codex" | "opencode" | "claude-code";

type TruthmarkSkillPackageFile = {
  path: string;
  content: string;
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
      "Follow docs/ai/repo-rules.md as the repository instruction authority.",
      `Read .truthmark/config.yml, ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, current docs, and relevant code directly.`,
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
      "Follow docs/ai/repo-rules.md as the repository instruction authority.",
      `Read .truthmark/config.yml, ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, existing canonical docs, implementation code, and tests directly.`,
      "Document current implemented behavior; do not invent future behavior.",
      "May write canonical truth docs and truth routing files only; must not write functional code.",
      "Read support/procedure.md before editing truth docs.",
      "Read support/subagents-and-leases.md before dispatching or accepting worker output.",
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
      "Follow docs/ai/repo-rules.md as the repository instruction authority.",
      "Skip docs-only, formatting-only, behavior-preserving renames with no truth impact, missing config, and no-code changes.",
      `Read .truthmark/config.yml, the configured root route index at ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, and relevant canonical docs.`,
      "direct checkout inspection is the canonical path; do not require the truthmark binary.",
      "May write canonical truth docs and truth routing files only; must not rewrite functional code.",
      "Read support/procedure.md before editing truth docs.",
      "Read support/subagents-and-leases.md before dispatching or accepting worker output.",
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
      "Follow docs/ai/repo-rules.md as the repository instruction authority.",
      `Read .truthmark/config.yml, ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, and only the truth docs or implementation files needed to preview ownership.`,
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
      "Follow docs/ai/repo-rules.md as the repository instruction authority.",
      `Read the source truth docs, .truthmark/config.yml, ${config.docs.routing.rootIndex}, relevant child route files, tests, and relevant functional code directly.`,
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
      "Follow docs/ai/repo-rules.md as the repository instruction authority.",
      `Read .truthmark/config.yml, ${config.docs.routing.rootIndex}, relevant child route files under ${config.docs.routing.areaFilesRoot}/, canonical docs, and relevant implementation directly.`,
      "Report issues and suggested fixes; do not silently rewrite unrelated files.",
      "Direct checkout inspection is valid even when local tooling is unavailable.",
      "Read support/procedure.md before auditing details.",
      "Read support/subagents-and-leases.md before dispatching verifier subagents.",
      "Read support/report-template.md before the final report.",
    ],
    parentRule: "Parent agent owns the final Truth Check report",
  },
};

const stripWorkflowSkillFrontmatter = (body: string): string => {
  return body.replace(/^---\n[\s\S]*?\n---\n\n?/u, "").trim();
};

const splitWorkflowSupport = (
  body: string,
): { procedure: string; reportTemplate: string } => {
  const stripped = stripWorkflowSkillFrontmatter(body);
  const marker = "Report completion in this shape:";
  const markerIndex = stripped.indexOf(marker);

  if (markerIndex === -1) {
    return {
      procedure: stripped,
      reportTemplate: "Report completion in the workflow-specific shape.",
    };
  }

  return {
    procedure: stripped.slice(0, markerIndex).trim(),
    reportTemplate: stripped.slice(markerIndex).trim(),
  };
};

const renderSkillSupportFile = (title: string, body: string): string => {
  return `# ${title}

Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

${body}
`;
};

const renderStandaloneWorkflowSkillBody = (
  workflowId: TruthmarkWorkflowId,
  config: TruthmarkConfig,
): string => {
  switch (workflowId) {
    case "truthmark-structure":
      return renderTruthStructureSkillBody(config);
    case "truthmark-document":
      return renderTruthDocumentSkillBody(config);
    case "truthmark-sync":
      return renderTruthSyncSkillBody(config);
    case "truthmark-preview":
      return renderTruthPreviewSkillBody(config);
    case "truthmark-realize":
      return renderTruthmarkRealizeSkillBody(config);
    case "truthmark-check":
      return renderTruthCheckSkillBody(config);
  }
};

const renderWorkflowEntrypoint = (
  workflowId: TruthmarkWorkflowId,
  config: TruthmarkConfig,
  supportFiles: string[],
): string => {
  const workflow = getTruthmarkWorkflow(workflowId);
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const supportFileList = supportFiles
    .map((supportFile) => `- ${supportFile}`)
    .join("\n");

  return `---
name: ${workflowId}
description: ${workflow.description}
argument-hint: ${definition.argumentHint}
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

# ${definition.title}

${definition.use(config)}

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
  const { procedure, reportTemplate } = splitWorkflowSupport(
    renderStandaloneWorkflowSkillBody(workflowId, config),
  );
  const subagents = renderWorkflowSubagentSupport(workflowId, host);
  const supportFiles = [
    "support/procedure.md",
    "support/report-template.md",
    ...(subagents === undefined ? [] : ["support/subagents-and-leases.md"]),
  ];
  const definition = WORKFLOW_PACKAGE_DEFINITIONS[workflowId];
  const files: TruthmarkSkillPackageFile[] = [
    {
      path: skillPath,
      content: renderWorkflowEntrypoint(workflowId, config, supportFiles),
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

  return files;
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
  const truthDocsRoot = normalizeOpenCodePermissionPath(
    resolveTruthDocsRoot(config),
  );
  const rootRouteIndex = normalizeOpenCodePermissionPath(
    config.docs.routing.rootIndex,
  );
  const areaFilesRoot = normalizeOpenCodePermissionPath(
    config.docs.routing.areaFilesRoot,
  );
  const allowedPatterns = [
    appendOpenCodePermissionGlob(truthDocsRoot, "/**"),
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
Read .truthmark/config.yml, the root route index, relevant child route files, mapped truth docs, and relevant implementation files directly.
Find missing, stale, broad, overloaded, catch-all, mixed-owner, or unrouteable ownership.
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
Review assigned canonical truth docs for frontmatter, source_of_truth, required template sections, Evidence checked entries, Product Decisions, and Rationale.
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

export const renderTruthmarkDocumentOpenCodeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthDocumentSkillBody(config, {
    includeOpenCodeSubagentMode: true,
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

export const renderTruthmarkSyncOpenCodeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthSyncSkillBody(config, {
    includeOpenCodeSubagentMode: true,
  });
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

const renderTruthmarkRealizeSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const truthDocsRoot = resolveTruthDocsRoot(config);
  const workflow = getTruthmarkWorkflow("truthmark-realize");

  return `---
name: truthmark-realize
description: ${workflow.description}
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
truthmark-version: ${TRUTHMARK_VERSION}
---

# Truthmark Realize

Use this skill only when the user explicitly asks to realize truth docs into code.

Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.

Truth Realize is doc-first:

- truth docs lead
- code follows
- Truth Realize never edits the truth docs it is realizing

Workflow:

1. Read the updated truth docs named by the user, or infer the relevant docs from ${config.docs.routing.rootIndex}.
2. Read .truthmark/config.yml, ${config.docs.routing.rootIndex}, relevant child route files, tests, and the relevant functional code.
3. ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
${renderTruthDocOwnershipGateSection(
  "source truth docs before writing code",
  "if a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence, block before writing code and recommend Truth Structure or Truth Document",
)}
4. Update functional code only so implementation matches bounded, current truth claims from the source docs.
5. Do not edit truth docs or truth routing while realizing those docs.
6. Run relevant tests for the changed code.
7. Report changed code files and verification steps.
${renderHierarchySummary(config)}

Read and write boundaries:

- may read truth docs, routing docs, and relevant functional code
- may write functional code only
- must not edit truth docs or truth routing while realizing those docs

Report completion in this shape:

\`\`\`md
Truth Realize: completed

Truth docs used:
- ${truthDocsRoot}/authentication/session-timeout.md

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

export const renderTruthmarkRealizeLocalSkill = (
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

export const renderTruthmarkPreviewClaudeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthPreviewSkillBody(config);
};

export const renderTruthmarkPreviewOpenCodeSkill = (
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

export const renderTruthmarkCheckOpenCodeSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthCheckSkillBody(config, {
    includeOpenCodeSubagentMode: true,
  });
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

export const renderTruthmarkGeminiStructureCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-structure");

  return renderGeminiCommand(
    workflow.description,
    renderTruthStructureSkillBody(config),
  );
};

export const renderTruthmarkGeminiDocumentCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-document");

  return renderGeminiCommand(
    workflow.description,
    renderTruthDocumentSkillBody(config),
  );
};

export const renderTruthmarkGeminiSyncCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-sync");

  return renderGeminiCommand(
    workflow.description,
    renderTruthSyncSkillBody(config),
  );
};

export const renderTruthmarkGeminiRealizeCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-realize");

  return renderGeminiCommand(
    workflow.description,
    renderTruthmarkRealizeSkillBody(config),
  );
};

export const renderTruthmarkGeminiCheckCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-check");

  return renderGeminiCommand(
    workflow.description,
    renderTruthCheckSkillBody(config),
  );
};

export const renderTruthmarkGeminiPreviewCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-preview");

  return renderGeminiCommand(
    workflow.description,
    renderTruthPreviewSkillBody(config),
  );
};

export const renderTruthmarkCopilotStructurePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-structure");

  return renderCopilotPromptFile(
    workflow.description,
    renderTruthStructureSkillBody(config, {
      includeCopilotCustomAgentMode: true,
    }),
  );
};

export const renderTruthmarkCopilotDocumentPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-document");

  return renderCopilotPromptFile(
    workflow.description,
    renderTruthDocumentSkillBody(config, {
      includeCopilotCustomAgentMode: true,
    }),
  );
};

export const renderTruthmarkCopilotSyncPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-sync");

  return renderCopilotPromptFile(
    workflow.description,
    renderTruthSyncSkillBody(config, {
      includeCopilotCustomAgentMode: true,
    }),
  );
};

export const renderTruthmarkCopilotRealizePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-realize");

  return renderCopilotPromptFile(
    workflow.description,
    renderTruthmarkRealizeSkillBody(config),
  );
};

export const renderTruthmarkCopilotCheckPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-check");

  return renderCopilotPromptFile(
    workflow.description,
    renderTruthCheckSkillBody(config, {
      includeCopilotCustomAgentMode: true,
    }),
  );
};

export const renderTruthmarkCopilotPreviewPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-preview");

  return renderCopilotPromptFile(
    workflow.description,
    renderTruthPreviewSkillBody(config),
  );
};
