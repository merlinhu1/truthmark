import fs from "node:fs/promises";

import { loadConfig } from "../config/load.js";
import type { TruthmarkConfig, TruthmarkPlatform } from "../config/schema.js";
import type { CommandResult, DiagnosticCategory } from "../output/diagnostic.js";
import { getGitRepository } from "../git/repository.js";
import { ensureRepoFile, resolveRepoPath, type FileWriteResult, writeRepoFile } from "../fs/paths.js";
import { detectHierarchyMigrationDiagnostics, scaffoldHierarchy } from "./hierarchy.js";
import { renderAgentsBlock, TRUTHMARK_BLOCK_END, TRUTHMARK_BLOCK_START } from "../templates/agents-block.js";
import {
  renderTruthmarkCopilotCheckPrompt,
  renderTruthmarkCopilotRealizePrompt,
  renderTruthmarkCopilotStructurePrompt,
  renderTruthmarkCopilotSyncPrompt,
  renderTruthmarkCheckLocalSkill,
  renderTruthmarkGeminiCheckCommand,
  renderTruthmarkGeminiRealizeCommand,
  renderTruthmarkGeminiStructureCommand,
  renderTruthmarkGeminiSyncCommand,
  renderTruthmarkCheckSkill,
  renderTruthmarkCheckSkillMetadata,
  renderTruthmarkStructureLocalSkill,
  renderTruthmarkStructureSkill,
  renderTruthmarkStructureSkillMetadata,
  renderTruthmarkSyncLocalSkill,
  renderTruthmarkSyncSkill,
  renderTruthmarkSyncSkillMetadata,
  TRUTHMARK_CHECK_SKILL_METADATA_PATH,
  TRUTHMARK_CHECK_SKILL_PATH,
  TRUTHMARK_COPILOT_CHECK_PROMPT_PATH,
  TRUTHMARK_COPILOT_REALIZE_PROMPT_PATH,
  TRUTHMARK_COPILOT_STRUCTURE_PROMPT_PATH,
  TRUTHMARK_COPILOT_SYNC_PROMPT_PATH,
  TRUTHMARK_SYNC_SKILL_METADATA_PATH,
  TRUTHMARK_SYNC_SKILL_PATH,
  TRUTHMARK_STRUCTURE_SKILL_METADATA_PATH,
  TRUTHMARK_STRUCTURE_SKILL_PATH,
  renderTruthmarkRealizeLocalSkill,
  renderTruthmarkRealizeSkill,
  renderTruthmarkRealizeSkillMetadata,
  TRUTHMARK_GEMINI_CHECK_COMMAND_PATH,
  TRUTHMARK_GEMINI_REALIZE_COMMAND_PATH,
  TRUTHMARK_GEMINI_STRUCTURE_COMMAND_PATH,
  TRUTHMARK_GEMINI_SYNC_COMMAND_PATH,
  TRUTHMARK_REALIZE_SKILL_METADATA_PATH,
  TRUTHMARK_REALIZE_SKILL_PATH,
} from "../templates/codex-skills.js";
import { renderDefaultStandards } from "../templates/default-standards.js";
import { renderTruthmarkTemplate } from "../templates/init-files.js";

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const MANAGED_WORKFLOW_HEADING = "## Truthmark Workflow";
const LEGACY_MANAGED_LINES = [
  "### Truth Sync",
  "- may read changed functional code files",
  "- may write truth docs only",
  "- must not rewrite functional code",
];
const CANONICAL_MANAGED_LINES = new Set(
  [
    ...renderAgentsBlock()
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          line !== TRUTHMARK_BLOCK_START &&
          line !== TRUTHMARK_BLOCK_END,
      ),
    ...LEGACY_MANAGED_LINES,
  ],
);

const countCanonicalManagedLineMatches = (lines: string[]): number => {
  return lines.reduce((matchCount, line) => {
    return CANONICAL_MANAGED_LINES.has(line.trim()) ? matchCount + 1 : matchCount;
  }, 0);
};

const isManagedChunk = (lines: string[], minimumMatches: number): boolean => {
  return countCanonicalManagedLineMatches(lines) >= minimumMatches;
};

const removeTrailingManagedChunk = (preservedLines: string[]): void => {
  let startIndex = -1;

  for (let index = preservedLines.length - 1; index >= 0; index -= 1) {
    if (preservedLines[index].trim() === MANAGED_WORKFLOW_HEADING) {
      startIndex = index;
      break;
    }
  }

  if (startIndex === -1) {
    return;
  }

  const candidateChunk = preservedLines.slice(startIndex);
  const looksManaged = isManagedChunk(candidateChunk, 4);

  if (looksManaged) {
    preservedLines.splice(startIndex);
  }
};

const upsertManagedBlock = (existingContent: string | null, block: string): string => {
  if (!existingContent || existingContent.trim().length === 0) {
    return block;
  }

  const startMarkerPattern = new RegExp(escapeRegExp(TRUTHMARK_BLOCK_START), "g");
  const endMarkerPattern = new RegExp(escapeRegExp(TRUTHMARK_BLOCK_END), "g");
  const managedBlockPattern = new RegExp(
    `${escapeRegExp(TRUTHMARK_BLOCK_START)}[\\s\\S]*?${escapeRegExp(TRUTHMARK_BLOCK_END)}`,
    "g",
  );
  const completeBlocks = existingContent.match(managedBlockPattern) ?? [];
  const startCount = existingContent.match(startMarkerPattern)?.length ?? 0;
  const endCount = existingContent.match(endMarkerPattern)?.length ?? 0;

  if (startCount === 1 && endCount === 1 && completeBlocks.length === 1) {
    return existingContent.replace(managedBlockPattern, block);
  }

  const preservedLines: string[] = [];
  let insideManagedBlock = false;
  let managedLines: string[] = [];

  for (const line of existingContent.split("\n")) {
    const trimmedLine = line.trim();

    if (trimmedLine === TRUTHMARK_BLOCK_START) {
      if (insideManagedBlock && !isManagedChunk(managedLines, 2)) {
        preservedLines.push(...managedLines);
      }

      insideManagedBlock = true;
      managedLines = [];
      continue;
    }

    if (trimmedLine === TRUTHMARK_BLOCK_END) {
      if (insideManagedBlock) {
        insideManagedBlock = false;
        managedLines = [];
        continue;
      }

      if (!insideManagedBlock) {
        removeTrailingManagedChunk(preservedLines);
      }

      continue;
    }

    if (insideManagedBlock) {
      managedLines.push(line);
      continue;
    }

    preservedLines.push(line);
  }

  if (insideManagedBlock && !isManagedChunk(managedLines, 2)) {
    preservedLines.push(...managedLines);
  }

  const preservedContent = preservedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  if (preservedContent.length === 0) {
    return block;
  }

  return `${preservedContent}\n\n${block}`;
};

const writeManagedAgentsFile = async (
  rootDir: string,
  path = "AGENTS.md",
  block: string,
): Promise<FileWriteResult> => {
  let existingContent: string | null = null;

  try {
    existingContent = await fs.readFile(resolveRepoPath(rootDir, path), "utf8");
  } catch (error: unknown) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }

  return writeRepoFile(rootDir, path, upsertManagedBlock(existingContent, block));
};

const diagnosticCategoryForPath = (filePath: string): DiagnosticCategory => {
  if (filePath === "AGENTS.md") {
    return "truth-sync";
  }

  if (
    filePath === "CLAUDE.md" ||
    filePath === "GEMINI.md" ||
    filePath === ".github/copilot-instructions.md" ||
    filePath.startsWith(".github/prompts/truthmark-") ||
    filePath.startsWith(".claude/skills/truthmark-") ||
    filePath.startsWith(".opencode/skills/truthmark-")
  ) {
    return "truth-sync";
  }

  if (filePath.startsWith(".codex/skills/truthmark-structure/")) {
    return "truth-sync";
  }

  if (filePath.startsWith(".codex/skills/truthmark-sync/")) {
    return "truth-sync";
  }

  if (filePath.startsWith(".codex/skills/truthmark-realize/")) {
    return "realization";
  }

  if (filePath.startsWith(".gemini/commands/truthmark/realize")) {
    return "realization";
  }

  if (filePath.startsWith(".gemini/commands/truthmark/")) {
    return "truth-sync";
  }

  if (filePath.startsWith(".codex/skills/truthmark-check/")) {
    return "truth-sync";
  }

  if (filePath === "TRUTHMARK.md" || filePath === "docs/truthmark/areas.md") {
    return "authority";
  }

  return "config";
};

type PlatformFile = {
  path: string;
  content: string;
  managedBlock?: boolean;
};

const workflowSkillFiles = (
  basePath: string,
  config: TruthmarkConfig,
): PlatformFile[] => {
  const files: PlatformFile[] = [
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

const codexFiles = (config: TruthmarkConfig): PlatformFile[] => {
  const files: PlatformFile[] = [
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

const copilotFiles = (config: TruthmarkConfig, block: string): PlatformFile[] => {
  const files: PlatformFile[] = [
    ...instructionBlockFiles([".github/copilot-instructions.md"], block),
    {
      path: TRUTHMARK_COPILOT_STRUCTURE_PROMPT_PATH,
      content: renderTruthmarkCopilotStructurePrompt(config),
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

const instructionBlockFiles = (paths: string[], block: string): PlatformFile[] => {
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
): PlatformFile[] => {
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

const writePlatformFile = async (
  rootDir: string,
  file: PlatformFile,
): Promise<FileWriteResult> => {
  if (file.managedBlock) {
    return writeManagedAgentsFile(rootDir, file.path, file.content);
  }

  return writeRepoFile(rootDir, file.path, file.content);
};

const messageForWriteResult = (result: FileWriteResult): string => {
  switch (result.status) {
    case "created":
      return `Created ${result.path}.`;
    case "updated":
      return `Updated ${result.path}.`;
    case "unchanged":
      return `Unchanged ${result.path}.`;
  }
};

const writeDiagnostics = (results: FileWriteResult[]): CommandResult["diagnostics"] => {
  return results.map((result) => ({
    category: diagnosticCategoryForPath(result.path),
    severity: "action",
    message: messageForWriteResult(result),
    file: result.path,
  }));
};

export const runInit = async (cwd: string): Promise<CommandResult> => {
  const repository = await getGitRepository(cwd);
  const rootDir = repository.worktreePath;
  const loadedConfig = await loadConfig(rootDir);

  if (!loadedConfig.config) {
    return {
      command: "init",
      summary:
        "Truthmark init requires .truthmark/config.yml. Run truthmark config first, review the hierarchy, then run truthmark init.",
      diagnostics: loadedConfig.diagnostics,
      data: {
        repositoryRoot: repository.repositoryRoot,
        worktreePath: repository.worktreePath,
        branchName: repository.branchName,
        isDetached: repository.isDetached,
        isUnborn: repository.isUnborn,
      },
    };
  }

  const defaultStandards = renderDefaultStandards([]);

  const results: FileWriteResult[] = [];

  for (const template of defaultStandards) {
    results.push(await ensureRepoFile(rootDir, template.path, template.content));
  }

  results.push(await ensureRepoFile(rootDir, "TRUTHMARK.md", renderTruthmarkTemplate()));
  const config = loadedConfig.config;
  results.push(...(await scaffoldHierarchy(rootDir, config)));
  const migrationDiagnostics = await detectHierarchyMigrationDiagnostics(rootDir, config);
  const block = renderAgentsBlock(config);
  const platformFiles = [
    ...instructionBlockFiles(config.instructionTargets, block),
    ...config.platforms.flatMap((platform) => filesForPlatform(platform, config, block)),
  ];
  const uniquePlatformFiles = Array.from(
    new Map(platformFiles.map((file) => [file.path, file])).values(),
  ).sort((left, right) => left.path.localeCompare(right.path));

  for (const file of uniquePlatformFiles) {
    results.push(await writePlatformFile(rootDir, file));
  }

  const changedResults = results.filter((result) => result.status !== "unchanged");

  return {
    command: "init",
    summary:
      changedResults.length > 0
        ? "Initialized or updated the Truthmark repository scaffold."
        : "Truthmark repository scaffold is already up to date.",
    diagnostics: [...writeDiagnostics(results), ...migrationDiagnostics],
    data: {
      repositoryRoot: repository.repositoryRoot,
      worktreePath: repository.worktreePath,
      branchName: repository.branchName,
      isDetached: repository.isDetached,
      isUnborn: repository.isUnborn,
    },
  };
};
