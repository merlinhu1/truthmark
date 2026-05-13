import type { TruthmarkConfig } from "../config/schema.js";
import { EVIDENCE_AUTHORITY_INSTRUCTIONS, defaultAgentConfig } from "../agents/shared.js";
import { renderTruthCheckSkillBody } from "../agents/truth-check.js";
import { renderTruthDocumentSkillBody } from "../agents/truth-document.js";
import { renderTruthStructureSkillBody } from "../agents/truth-structure.js";
import { renderTruthSyncSkillBody } from "../agents/truth-sync.js";
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

export const renderTruthmarkStructureSkillMetadata = (): string => {
  return `interface:
  display_name: "Truthmark Structure"
  short_description: "Design or repair Truthmark area routing"
  default_prompt: "Use $truthmark-structure to design or repair Truthmark area routing."

policy:
  allow_implicit_invocation: false

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkDocumentSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthDocumentSkillBody(config);
};

export const renderTruthmarkDocumentLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthDocumentSkillBody(config);
};

export const renderTruthmarkDocumentSkillMetadata = (): string => {
  return `interface:
  display_name: "Truthmark Document"
  short_description: "Document existing implemented behavior"
  default_prompt: "Use $truthmark-document to document existing implemented behavior."

policy:
  allow_implicit_invocation: false

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkSyncSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthSyncSkillBody(config);
};

export const renderTruthmarkSyncLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthSyncSkillBody(config);
};

export const renderTruthmarkSyncSkillMetadata = (): string => {
  return `interface:
  display_name: "Truthmark Sync"
  short_description: "Sync truth docs from functional code changes; skip docs-only/no-code changes"
  default_prompt: "Use $truthmark-sync after functional code changes; skip docs-only/no-code changes."

policy:
  allow_implicit_invocation: true

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

const renderTruthmarkRealizeSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `---
name: truthmark-realize
description: Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Reads truth docs and routing first, updates functional code only, and reports verification.
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
2. Read .truthmark/config.yml, ${config.docs.routing.rootIndex}, and the relevant functional code.
3. ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
4. Update functional code only so implementation matches the truth docs.
5. Do not edit truth docs or truth routing while realizing those docs.
6. Run relevant tests for the changed code.
7. Report changed code files and verification steps.

Read and write boundaries:

- may read truth docs, routing docs, and relevant functional code
- may write functional code only
- must not edit truth docs or truth routing while realizing those docs

Report completion in this shape:

\`\`\`md
Truth Realize: completed

Truth docs used:
- docs/features/authentication.md

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
  return `interface:
  display_name: "Truthmark Realize"
  short_description: "Realize truth docs into code"
  default_prompt: "Use $truthmark-realize to realize the updated truth docs into code."

policy:
  allow_implicit_invocation: false

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkCheckSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthCheckSkillBody(config);
};

export const renderTruthmarkCheckLocalSkill = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderTruthCheckSkillBody(config);
};

export const renderTruthmarkCheckSkillMetadata = (): string => {
  return `interface:
  display_name: "Truthmark Check"
  short_description: "Audit repository truth health"
  default_prompt: "Use $truthmark-check to audit repository truth health."

policy:
  allow_implicit_invocation: false

truthmark:
  version: "${TRUTHMARK_VERSION}"
  refresh_command: "truthmark init"
`;
};

export const renderTruthmarkGeminiStructureCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderGeminiCommand(
    "Design or repair Truthmark area routing.",
    renderTruthStructureSkillBody(config),
  );
};

export const renderTruthmarkGeminiDocumentCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderGeminiCommand(
    "Document existing implemented behavior.",
    renderTruthDocumentSkillBody(config),
  );
};

export const renderTruthmarkGeminiSyncCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderGeminiCommand(
    "Sync repository truth docs from functional code changes; skip docs-only/no-code changes.",
    renderTruthSyncSkillBody(config),
  );
};

export const renderTruthmarkGeminiRealizeCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderGeminiCommand(
    "Realize repository truth docs into code.",
    renderTruthmarkRealizeSkillBody(config),
  );
};

export const renderTruthmarkGeminiCheckCommand = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderGeminiCommand(
    "Audit repository truth health.",
    renderTruthCheckSkillBody(config),
  );
};

export const renderTruthmarkCopilotStructurePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderCopilotPromptFile(
    "Design or repair Truthmark area routing.",
    renderTruthStructureSkillBody(config),
  );
};

export const renderTruthmarkCopilotDocumentPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderCopilotPromptFile(
    "Document existing implemented behavior.",
    renderTruthDocumentSkillBody(config),
  );
};

export const renderTruthmarkCopilotSyncPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderCopilotPromptFile(
    "Sync repository truth docs from functional code changes; skip docs-only/no-code changes.",
    renderTruthSyncSkillBody(config),
  );
};

export const renderTruthmarkCopilotRealizePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderCopilotPromptFile(
    "Realize repository truth docs into code.",
    renderTruthmarkRealizeSkillBody(config),
  );
};

export const renderTruthmarkCopilotCheckPrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return renderCopilotPromptFile(
    "Audit repository truth health.",
    renderTruthCheckSkillBody(config),
  );
};
