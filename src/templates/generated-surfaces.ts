import type { TruthmarkConfig, TruthmarkPlatform } from "../config/schema.js";
import { renderAgentsBlock } from "./agents-block.js";
import {
  renderTruthmarkCheckLocalSkill,
  renderTruthmarkGeminiCheckCommand,
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
  TRUTHMARK_GEMINI_CHECK_COMMAND_PATH,
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
      return [
        ...workflowSkillFiles("skills", config),
        ...workflowSkillFiles(".opencode/skills", config),
      ];
    case "claude-code":
      return instructionBlockFiles([...config.instructionTargets, "CLAUDE.md"], block);
    case "cursor":
      return instructionBlockFiles([".cursor/rules/truthmark.mdc"], block);
    case "github-copilot":
      return instructionBlockFiles([".github/copilot-instructions.md"], block);
    case "gemini-cli":
      return [
        ...instructionBlockFiles(["GEMINI.md"], block),
        {
          path: TRUTHMARK_GEMINI_STRUCTURE_COMMAND_PATH,
          content: renderTruthmarkGeminiStructureCommand(config),
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
  const files = config.platforms.flatMap((platform) => filesForPlatform(platform, config, block));

  return Array.from(new Map(files.map((file) => [file.path, file])).values()).sort((left, right) =>
    left.path.localeCompare(right.path),
  );
};
