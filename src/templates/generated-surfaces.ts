import type { TruthmarkConfig, TruthmarkPlatform } from "../config/schema.js";
import { renderAgentsBlock } from "./agents-block.js";
import {
  renderTruthmarkCopilotCheckPrompt,
  renderTruthmarkCopilotDocumentPrompt,
  renderTruthmarkCopilotRealizePrompt,
  renderTruthmarkCopilotStructurePrompt,
  renderTruthmarkCopilotSyncPrompt,
  renderTruthmarkCheckLocalSkill,
  renderTruthmarkDocumentLocalSkill,
  renderTruthmarkDocumentSkill,
  renderTruthmarkDocumentSkillMetadata,
  renderTruthmarkGeminiCheckCommand,
  renderTruthmarkGeminiDocumentCommand,
  renderTruthmarkGeminiRealizeCommand,
  renderTruthmarkGeminiStructureCommand,
  renderTruthmarkGeminiSyncCommand,
  renderTruthmarkCheckSkill,
  renderTruthmarkCheckSkillMetadata,
  renderTruthmarkRealizeLocalSkill,
  renderTruthmarkRealizeSkill,
  renderTruthmarkRealizeSkillMetadata,
  renderTruthmarkStructureLocalSkill,
  renderTruthmarkStructureSkill,
  renderTruthmarkStructureSkillMetadata,
  renderTruthmarkSyncLocalSkill,
  renderTruthmarkSyncSkill,
  renderTruthmarkSyncSkillMetadata,
  TRUTHMARK_CHECK_SKILL_METADATA_PATH,
  TRUTHMARK_CHECK_SKILL_PATH,
  TRUTHMARK_COPILOT_CHECK_PROMPT_PATH,
  TRUTHMARK_COPILOT_DOCUMENT_PROMPT_PATH,
  TRUTHMARK_COPILOT_REALIZE_PROMPT_PATH,
  TRUTHMARK_COPILOT_STRUCTURE_PROMPT_PATH,
  TRUTHMARK_COPILOT_SYNC_PROMPT_PATH,
  TRUTHMARK_DOCUMENT_SKILL_METADATA_PATH,
  TRUTHMARK_DOCUMENT_SKILL_PATH,
  TRUTHMARK_GEMINI_CHECK_COMMAND_PATH,
  TRUTHMARK_GEMINI_DOCUMENT_COMMAND_PATH,
  TRUTHMARK_GEMINI_REALIZE_COMMAND_PATH,
  TRUTHMARK_GEMINI_STRUCTURE_COMMAND_PATH,
  TRUTHMARK_GEMINI_SYNC_COMMAND_PATH,
  TRUTHMARK_REALIZE_SKILL_METADATA_PATH,
  TRUTHMARK_REALIZE_SKILL_PATH,
  TRUTHMARK_STRUCTURE_SKILL_METADATA_PATH,
  TRUTHMARK_STRUCTURE_SKILL_PATH,
  TRUTHMARK_SYNC_SKILL_METADATA_PATH,
  TRUTHMARK_SYNC_SKILL_PATH,
} from "./codex-skills.js";

export type GeneratedSurface = {
  path: string;
  content: string;
  managedBlock?: boolean;
};

const workflowSkillFiles = (
  basePath: string,
  config: TruthmarkConfig,
): GeneratedSurface[] => {
  const files: GeneratedSurface[] = [
    {
      path: `${basePath}/truthmark-structure/SKILL.md`,
      content: renderTruthmarkStructureLocalSkill(config),
    },
    {
      path: `${basePath}/truthmark-document/SKILL.md`,
      content: renderTruthmarkDocumentLocalSkill(config),
    },
    {
      path: `${basePath}/truthmark-sync/SKILL.md`,
      content: renderTruthmarkSyncLocalSkill(config),
    },
    {
      path: `${basePath}/truthmark-check/SKILL.md`,
      content: renderTruthmarkCheckLocalSkill(config),
    },
  ];

  if (config.realization.enabled) {
    files.push({
      path: `${basePath}/truthmark-realize/SKILL.md`,
      content: renderTruthmarkRealizeLocalSkill(),
    });
  }

  return files;
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
  ];

  if (config.realization.enabled) {
    files.push(
      {
        path: TRUTHMARK_REALIZE_SKILL_PATH,
        content: renderTruthmarkRealizeSkill(),
      },
      {
        path: TRUTHMARK_REALIZE_SKILL_METADATA_PATH,
        content: renderTruthmarkRealizeSkillMetadata(),
      },
    );
  }

  return files;
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
  ];

  if (config.realization.enabled) {
    files.push({
      path: TRUTHMARK_COPILOT_REALIZE_PROMPT_PATH,
      content: renderTruthmarkCopilotRealizePrompt(),
    });
  }

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
      return workflowSkillFiles(".opencode/skills", config);
    case "claude-code":
      return [
        ...instructionBlockFiles(["CLAUDE.md"], block),
        ...workflowSkillFiles(".claude/skills", config),
      ];
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
        ...(config.realization.enabled
          ? [
              {
                path: TRUTHMARK_GEMINI_REALIZE_COMMAND_PATH,
                content: renderTruthmarkGeminiRealizeCommand(),
              },
            ]
          : []),
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
