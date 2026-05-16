import type { TruthmarkConfig, TruthmarkPlatform } from "../config/schema.js";
import { renderAgentsBlock } from "./agents-block.js";
import {
  renderTruthmarkCopilotCheckPrompt,
  renderTruthmarkCopilotClaimVerifierAgent,
  renderTruthmarkCopilotDocumentPrompt,
  renderTruthmarkCopilotDocReviewerAgent,
  renderTruthmarkCopilotDocWriterAgent,
  renderTruthmarkCopilotRealizePrompt,
  renderTruthmarkCopilotRouteAuditorAgent,
  renderTruthmarkCopilotStructurePrompt,
  renderTruthmarkCopilotSyncPrompt,
  renderTruthmarkClaudeClaimVerifierAgent,
  renderTruthmarkClaudeDocReviewerAgent,
  renderTruthmarkClaudeDocWriterAgent,
  renderTruthmarkClaudeRouteAuditorAgent,
  renderTruthmarkClaimVerifierAgent,
  renderTruthmarkCheckClaudeSkill,
  renderTruthmarkCheckOpenCodeSkill,
  renderTruthmarkDocumentClaudeSkill,
  renderTruthmarkDocumentOpenCodeSkill,
  renderTruthmarkDocumentSkill,
  renderTruthmarkDocumentSkillMetadata,
  renderTruthmarkDocReviewerAgent,
  renderTruthmarkDocWriterAgent,
  renderTruthmarkGeminiCheckCommand,
  renderTruthmarkGeminiDocumentCommand,
  renderTruthmarkGeminiRealizeCommand,
  renderTruthmarkGeminiStructureCommand,
  renderTruthmarkGeminiSyncCommand,
  renderTruthmarkCheckSkill,
  renderTruthmarkCheckSkillMetadata,
  renderTruthmarkOpenCodeClaimVerifierAgent,
  renderTruthmarkOpenCodeDocReviewerAgent,
  renderTruthmarkOpenCodeDocWriterAgent,
  renderTruthmarkOpenCodeRouteAuditorAgent,
  renderTruthmarkRealizeLocalSkill,
  renderTruthmarkRealizeSkill,
  renderTruthmarkRealizeSkillMetadata,
  renderTruthmarkRouteAuditorAgent,
  renderTruthmarkStructureClaudeSkill,
  renderTruthmarkStructureLocalSkill,
  renderTruthmarkStructureSkill,
  renderTruthmarkStructureSkillMetadata,
  renderTruthmarkSyncClaudeSkill,
  renderTruthmarkSyncOpenCodeSkill,
  renderTruthmarkSyncSkill,
  renderTruthmarkSyncSkillMetadata,
  TRUTHMARK_CHECK_SKILL_METADATA_PATH,
  TRUTHMARK_CHECK_SKILL_PATH,
  TRUTHMARK_CLAUDE_CLAIM_VERIFIER_AGENT_PATH,
  TRUTHMARK_CLAUDE_DOC_REVIEWER_AGENT_PATH,
  TRUTHMARK_CLAUDE_DOC_WRITER_AGENT_PATH,
  TRUTHMARK_CLAUDE_ROUTE_AUDITOR_AGENT_PATH,
  TRUTHMARK_CLAIM_VERIFIER_AGENT_PATH,
  TRUTHMARK_COPILOT_CLAIM_VERIFIER_AGENT_PATH,
  TRUTHMARK_COPILOT_CHECK_PROMPT_PATH,
  TRUTHMARK_COPILOT_DOCUMENT_PROMPT_PATH,
  TRUTHMARK_COPILOT_DOC_REVIEWER_AGENT_PATH,
  TRUTHMARK_COPILOT_DOC_WRITER_AGENT_PATH,
  TRUTHMARK_COPILOT_REALIZE_PROMPT_PATH,
  TRUTHMARK_COPILOT_ROUTE_AUDITOR_AGENT_PATH,
  TRUTHMARK_COPILOT_STRUCTURE_PROMPT_PATH,
  TRUTHMARK_COPILOT_SYNC_PROMPT_PATH,
  TRUTHMARK_DOCUMENT_SKILL_METADATA_PATH,
  TRUTHMARK_DOCUMENT_SKILL_PATH,
  TRUTHMARK_DOC_REVIEWER_AGENT_PATH,
  TRUTHMARK_DOC_WRITER_AGENT_PATH,
  TRUTHMARK_GEMINI_CHECK_COMMAND_PATH,
  TRUTHMARK_GEMINI_DOCUMENT_COMMAND_PATH,
  TRUTHMARK_GEMINI_REALIZE_COMMAND_PATH,
  TRUTHMARK_GEMINI_STRUCTURE_COMMAND_PATH,
  TRUTHMARK_GEMINI_SYNC_COMMAND_PATH,
  TRUTHMARK_OPENCODE_CLAIM_VERIFIER_AGENT_PATH,
  TRUTHMARK_OPENCODE_DOC_REVIEWER_AGENT_PATH,
  TRUTHMARK_OPENCODE_DOC_WRITER_AGENT_PATH,
  TRUTHMARK_OPENCODE_ROUTE_AUDITOR_AGENT_PATH,
  TRUTHMARK_REALIZE_SKILL_METADATA_PATH,
  TRUTHMARK_REALIZE_SKILL_PATH,
  TRUTHMARK_ROUTE_AUDITOR_AGENT_PATH,
  TRUTHMARK_STRUCTURE_SKILL_METADATA_PATH,
  TRUTHMARK_STRUCTURE_SKILL_PATH,
  TRUTHMARK_SYNC_SKILL_METADATA_PATH,
  TRUTHMARK_SYNC_SKILL_PATH,
} from "./workflow-surfaces.js";

export type GeneratedSurface = {
  path: string;
  content: string;
  managedBlock?: boolean;
};

const codexFiles = (config: TruthmarkConfig): GeneratedSurface[] => {
  const files: GeneratedSurface[] = [
    {
      path: TRUTHMARK_STRUCTURE_SKILL_PATH,
      content: renderTruthmarkStructureSkill(config),
    },
    {
      path: TRUTHMARK_STRUCTURE_SKILL_METADATA_PATH,
      content: renderTruthmarkStructureSkillMetadata(),
    },
    {
      path: TRUTHMARK_DOCUMENT_SKILL_PATH,
      content: renderTruthmarkDocumentSkill(config),
    },
    {
      path: TRUTHMARK_DOCUMENT_SKILL_METADATA_PATH,
      content: renderTruthmarkDocumentSkillMetadata(),
    },
    {
      path: TRUTHMARK_SYNC_SKILL_PATH,
      content: renderTruthmarkSyncSkill(config),
    },
    {
      path: TRUTHMARK_SYNC_SKILL_METADATA_PATH,
      content: renderTruthmarkSyncSkillMetadata(),
    },
    {
      path: TRUTHMARK_CHECK_SKILL_PATH,
      content: renderTruthmarkCheckSkill(config),
    },
    {
      path: TRUTHMARK_CHECK_SKILL_METADATA_PATH,
      content: renderTruthmarkCheckSkillMetadata(),
    },
    {
      path: TRUTHMARK_REALIZE_SKILL_PATH,
      content: renderTruthmarkRealizeSkill(config),
    },
    {
      path: TRUTHMARK_REALIZE_SKILL_METADATA_PATH,
      content: renderTruthmarkRealizeSkillMetadata(),
    },
    {
      path: TRUTHMARK_ROUTE_AUDITOR_AGENT_PATH,
      content: renderTruthmarkRouteAuditorAgent(),
    },
    {
      path: TRUTHMARK_CLAIM_VERIFIER_AGENT_PATH,
      content: renderTruthmarkClaimVerifierAgent(),
    },
    {
      path: TRUTHMARK_DOC_REVIEWER_AGENT_PATH,
      content: renderTruthmarkDocReviewerAgent(),
    },
    {
      path: TRUTHMARK_DOC_WRITER_AGENT_PATH,
      content: renderTruthmarkDocWriterAgent(),
    },
  ];

  return files;
};

const opencodeFiles = (config: TruthmarkConfig): GeneratedSurface[] => {
  return [
    {
      path: ".opencode/skills/truthmark-structure/SKILL.md",
      content: renderTruthmarkStructureLocalSkill(config),
    },
    {
      path: ".opencode/skills/truthmark-document/SKILL.md",
      content: renderTruthmarkDocumentOpenCodeSkill(config),
    },
    {
      path: ".opencode/skills/truthmark-sync/SKILL.md",
      content: renderTruthmarkSyncOpenCodeSkill(config),
    },
    {
      path: ".opencode/skills/truthmark-check/SKILL.md",
      content: renderTruthmarkCheckOpenCodeSkill(config),
    },
    {
      path: ".opencode/skills/truthmark-realize/SKILL.md",
      content: renderTruthmarkRealizeLocalSkill(config),
    },
    {
      path: TRUTHMARK_OPENCODE_ROUTE_AUDITOR_AGENT_PATH,
      content: renderTruthmarkOpenCodeRouteAuditorAgent(),
    },
    {
      path: TRUTHMARK_OPENCODE_CLAIM_VERIFIER_AGENT_PATH,
      content: renderTruthmarkOpenCodeClaimVerifierAgent(),
    },
    {
      path: TRUTHMARK_OPENCODE_DOC_REVIEWER_AGENT_PATH,
      content: renderTruthmarkOpenCodeDocReviewerAgent(),
    },
    {
      path: TRUTHMARK_OPENCODE_DOC_WRITER_AGENT_PATH,
      content: renderTruthmarkOpenCodeDocWriterAgent(config),
    },
  ];
};

const claudeFiles = (config: TruthmarkConfig, block: string): GeneratedSurface[] => {
  return [
    ...instructionBlockFiles(["CLAUDE.md"], block),
    {
      path: ".claude/skills/truthmark-structure/SKILL.md",
      content: renderTruthmarkStructureClaudeSkill(config),
    },
    {
      path: ".claude/skills/truthmark-document/SKILL.md",
      content: renderTruthmarkDocumentClaudeSkill(config),
    },
    {
      path: ".claude/skills/truthmark-sync/SKILL.md",
      content: renderTruthmarkSyncClaudeSkill(config),
    },
    {
      path: ".claude/skills/truthmark-check/SKILL.md",
      content: renderTruthmarkCheckClaudeSkill(config),
    },
    {
      path: ".claude/skills/truthmark-realize/SKILL.md",
      content: renderTruthmarkRealizeLocalSkill(config),
    },
    {
      path: TRUTHMARK_CLAUDE_ROUTE_AUDITOR_AGENT_PATH,
      content: renderTruthmarkClaudeRouteAuditorAgent(),
    },
    {
      path: TRUTHMARK_CLAUDE_CLAIM_VERIFIER_AGENT_PATH,
      content: renderTruthmarkClaudeClaimVerifierAgent(),
    },
    {
      path: TRUTHMARK_CLAUDE_DOC_REVIEWER_AGENT_PATH,
      content: renderTruthmarkClaudeDocReviewerAgent(),
    },
    {
      path: TRUTHMARK_CLAUDE_DOC_WRITER_AGENT_PATH,
      content: renderTruthmarkClaudeDocWriterAgent(),
    },
  ];
};

const copilotFiles = (config: TruthmarkConfig, block: string): GeneratedSurface[] => {
  const files: GeneratedSurface[] = [
    ...instructionBlockFiles([".github/copilot-instructions.md"], block),
    {
      path: TRUTHMARK_COPILOT_STRUCTURE_PROMPT_PATH,
      content: renderTruthmarkCopilotStructurePrompt(config),
    },
    {
      path: TRUTHMARK_COPILOT_DOCUMENT_PROMPT_PATH,
      content: renderTruthmarkCopilotDocumentPrompt(config),
    },
    {
      path: TRUTHMARK_COPILOT_SYNC_PROMPT_PATH,
      content: renderTruthmarkCopilotSyncPrompt(config),
    },
    {
      path: TRUTHMARK_COPILOT_CHECK_PROMPT_PATH,
      content: renderTruthmarkCopilotCheckPrompt(config),
    },
    {
      path: TRUTHMARK_COPILOT_REALIZE_PROMPT_PATH,
      content: renderTruthmarkCopilotRealizePrompt(config),
    },
    {
      path: TRUTHMARK_COPILOT_ROUTE_AUDITOR_AGENT_PATH,
      content: renderTruthmarkCopilotRouteAuditorAgent(),
    },
    {
      path: TRUTHMARK_COPILOT_CLAIM_VERIFIER_AGENT_PATH,
      content: renderTruthmarkCopilotClaimVerifierAgent(),
    },
    {
      path: TRUTHMARK_COPILOT_DOC_REVIEWER_AGENT_PATH,
      content: renderTruthmarkCopilotDocReviewerAgent(),
    },
    {
      path: TRUTHMARK_COPILOT_DOC_WRITER_AGENT_PATH,
      content: renderTruthmarkCopilotDocWriterAgent(),
    },
  ];

  return files;
};

const instructionBlockFiles = (paths: string[], block: string): GeneratedSurface[] => {
  return paths.map((path) => ({
    path,
    content: block,
    managedBlock: true,
  }));
};

const filesForPlatform = (
  platform: TruthmarkPlatform,
  config: TruthmarkConfig,
  block: string,
): GeneratedSurface[] => {
  switch (platform) {
    case "codex":
      return codexFiles(config);
    case "opencode":
      return opencodeFiles(config);
    case "claude-code":
      return claudeFiles(config, block);
    case "github-copilot":
      return copilotFiles(config, block);
    case "gemini-cli":
      return [
        ...instructionBlockFiles(["GEMINI.md"], block),
        {
          path: TRUTHMARK_GEMINI_STRUCTURE_COMMAND_PATH,
          content: renderTruthmarkGeminiStructureCommand(config),
        },
        {
          path: TRUTHMARK_GEMINI_DOCUMENT_COMMAND_PATH,
          content: renderTruthmarkGeminiDocumentCommand(config),
        },
        {
          path: TRUTHMARK_GEMINI_SYNC_COMMAND_PATH,
          content: renderTruthmarkGeminiSyncCommand(config),
        },
        {
          path: TRUTHMARK_GEMINI_CHECK_COMMAND_PATH,
          content: renderTruthmarkGeminiCheckCommand(config),
        },
        {
          path: TRUTHMARK_GEMINI_REALIZE_COMMAND_PATH,
          content: renderTruthmarkGeminiRealizeCommand(config),
        },
      ];
  }
};

export const renderGeneratedSurfaces = (
  config: TruthmarkConfig,
  block = renderAgentsBlock(config),
): GeneratedSurface[] => {
  const files = [
    ...instructionBlockFiles(config.instructionTargets, block),
    ...config.platforms.flatMap((platform) => filesForPlatform(platform, config, block)),
  ];

  return Array.from(new Map(files.map((file) => [file.path, file])).values()).sort((left, right) =>
    left.path.localeCompare(right.path),
  );
};
