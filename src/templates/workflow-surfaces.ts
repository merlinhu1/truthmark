import type { TruthmarkConfig } from "../config/schema.js";
import {
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  defaultAgentConfig,
  renderHierarchySummary,
  renderTruthDocOwnershipGateSection,
  resolveTruthDocsRoot,
} from "../agents/shared.js";
import { renderTruthCheckSkillBody } from "../agents/truth-check.js";
import { renderTruthDocumentSkillBody } from "../agents/truth-document.js";
import { renderTruthStructureSkillBody } from "../agents/truth-structure.js";
import { renderTruthSyncSkillBody } from "../agents/truth-sync.js";
import {
  getTruthmarkWorkflow,
  type TruthmarkSubagentId,
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

export const TRUTHMARK_SYNC_SKILL_PATH = ".codex/skills/truthmark-sync/SKILL.md";

export const TRUTHMARK_SYNC_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-sync/agents/openai.yaml";

export const TRUTHMARK_REALIZE_SKILL_PATH =
  ".codex/skills/truthmark-realize/SKILL.md";

export const TRUTHMARK_REALIZE_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-realize/agents/openai.yaml";

export const TRUTHMARK_CHECK_SKILL_PATH = ".codex/skills/truthmark-check/SKILL.md";

export const TRUTHMARK_CHECK_SKILL_METADATA_PATH =
  ".codex/skills/truthmark-check/agents/openai.yaml";

export const TRUTHMARK_ROUTE_AUDITOR_AGENT_PATH =
  ".codex/agents/truth-route-auditor.toml";

export const TRUTHMARK_CLAIM_VERIFIER_AGENT_PATH =
  ".codex/agents/truth-claim-verifier.toml";

export const TRUTHMARK_DOC_REVIEWER_AGENT_PATH =
  ".codex/agents/truth-doc-reviewer.toml";

export const TRUTHMARK_OPENCODE_ROUTE_AUDITOR_AGENT_PATH =
  ".opencode/agents/truth-route-auditor.md";

export const TRUTHMARK_OPENCODE_CLAIM_VERIFIER_AGENT_PATH =
  ".opencode/agents/truth-claim-verifier.md";

export const TRUTHMARK_OPENCODE_DOC_REVIEWER_AGENT_PATH =
  ".opencode/agents/truth-doc-reviewer.md";

export const TRUTHMARK_CLAUDE_ROUTE_AUDITOR_AGENT_PATH =
  ".claude/agents/truth-route-auditor.md";

export const TRUTHMARK_CLAUDE_CLAIM_VERIFIER_AGENT_PATH =
  ".claude/agents/truth-claim-verifier.md";

export const TRUTHMARK_CLAUDE_DOC_REVIEWER_AGENT_PATH =
  ".claude/agents/truth-doc-reviewer.md";

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

export const TRUTHMARK_COPILOT_ROUTE_AUDITOR_AGENT_PATH =
  ".github/agents/truth-route-auditor.agent.md";

export const TRUTHMARK_COPILOT_CLAIM_VERIFIER_AGENT_PATH =
  ".github/agents/truth-claim-verifier.agent.md";

export const TRUTHMARK_COPILOT_DOC_REVIEWER_AGENT_PATH =
  ".github/agents/truth-doc-reviewer.agent.md";

const renderGeminiCommand = (description: string, prompt: string): string => {
  return `description = "${description}"
prompt = '''
${prompt}
'''
`;
};

const renderCopilotPromptFile = (description: string, prompt: string): string => {
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

type TruthmarkSubagentProfile = {
  codexName: string;
  copilotName: string;
  description: string;
  nicknameCandidates: string[];
  instructions: string;
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
} satisfies Record<TruthmarkSubagentId, TruthmarkSubagentProfile>;

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

const renderCopilotReadOnlyAgent = ({
  copilotName,
  description,
  instructions,
}: TruthmarkSubagentProfile): string => {
  return `---
name: ${copilotName}
description: ${description}
tools: [read, search]
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
  return `---
name: ${copilotName}
description: ${description}
tools: Read, Grep, Glob, LS
---

# Generated by Truthmark ${TRUTHMARK_VERSION}. Rerun truthmark init after upgrades.

Manual invocation: use the ${copilotName} subagent.

${instructions}
`;
};

export const renderTruthmarkRouteAuditorAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_route_auditor;

  return renderCodexReadOnlyAgent({
    name: profile.codexName,
    description: profile.description,
    nicknameCandidates: profile.nicknameCandidates,
    developerInstructions: profile.instructions,
  });
};

export const renderTruthmarkClaimVerifierAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_claim_verifier;

  return renderCodexReadOnlyAgent({
    name: profile.codexName,
    description: profile.description,
    nicknameCandidates: profile.nicknameCandidates,
    developerInstructions: profile.instructions,
  });
};

export const renderTruthmarkDocReviewerAgent = (): string => {
  const profile = TRUTHMARK_SUBAGENT_PROFILES.truth_doc_reviewer;

  return renderCodexReadOnlyAgent({
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

const renderOpenCodeReadOnlyAgent = ({
  invocation,
  description,
  instructions,
}: {
  invocation: string;
  description: string;
  instructions: string;
}): string => {
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
  return renderTruthDocumentSkillBody(config, { includeCodexSubagentMode: true });
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
  return renderTruthSyncSkillBody(config, { includeOpenCodeSubagentMode: true });
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
  return renderTruthCheckSkillBody(config, { includeOpenCodeSubagentMode: true });
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

export const renderTruthmarkCopilotStructurePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-structure");

  return renderCopilotPromptFile(
    workflow.description,
    renderTruthStructureSkillBody(config, { includeCopilotCustomAgentMode: true }),
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
