import fs from "node:fs/promises";

import { loadConfig } from "../config/load.js";
import type { TruthmarkConfig } from "../config/schema.js";
import type { CommandResult, DiagnosticCategory } from "../output/diagnostic.js";
import { getGitRepository } from "../git/repository.js";
import { resolveRepoPath, type FileWriteResult, writeRepoFile } from "../fs/paths.js";
import { scaffoldHierarchy } from "./hierarchy.js";
import { findAutoRemovableRetiredGeneratedSurfaces } from "../checks/generated-surfaces.js";
import { renderAgentsBlock, TRUTHMARK_BLOCK_END, TRUTHMARK_BLOCK_START } from "../templates/agents-block.js";
import { renderGeneratedSurfaces, type GeneratedSurface } from "../templates/generated-surfaces.js";

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const MANAGED_WORKFLOW_HEADING = "## Truthmark Workflow";
const CANONICAL_MANAGED_LINES = new Set(
  renderAgentsBlock()
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        line !== TRUTHMARK_BLOCK_START &&
        line !== TRUTHMARK_BLOCK_END,
    ),
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

  const normalizedExistingContent = existingContent;
  const startMarkerPattern = new RegExp(escapeRegExp(TRUTHMARK_BLOCK_START), "g");
  const endMarkerPattern = new RegExp(escapeRegExp(TRUTHMARK_BLOCK_END), "g");
  const managedBlockPattern = new RegExp(
    `${escapeRegExp(TRUTHMARK_BLOCK_START)}[\\s\\S]*?${escapeRegExp(TRUTHMARK_BLOCK_END)}`,
    "g",
  );
  const completeBlocks = normalizedExistingContent.match(managedBlockPattern) ?? [];
  const startCount = normalizedExistingContent.match(startMarkerPattern)?.length ?? 0;
  const endCount = normalizedExistingContent.match(endMarkerPattern)?.length ?? 0;

  if (startCount === 1 && endCount === 1 && completeBlocks.length === 1) {
    return normalizedExistingContent.replace(managedBlockPattern, block);
  }

  const preservedLines: string[] = [];
  let insideManagedBlock = false;
  let managedLines: string[] = [];

  for (const line of normalizedExistingContent.split("\n")) {
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

const diagnosticCategoryForPath = (
  filePath: string,
  config: TruthmarkConfig,
): DiagnosticCategory => {
  if (filePath === "AGENTS.md") {
    return "truth-sync";
  }

  if (
    filePath === ".github/prompts/truthmark-realize.prompt.md" ||
    filePath.startsWith(".github/skills/truthmark-realize/") ||
    filePath.startsWith(".claude/skills/truthmark-realize/") ||
    filePath.startsWith(".opencode/skills/truthmark-realize/") ||
    filePath.startsWith(".agents/skills/truthmark-realize/") ||
    filePath.startsWith(".antigravity/rules/truthmark-realize") ||
    filePath.startsWith(".cursor/rules/truthmark-realize") ||
    filePath.startsWith(".cursor/skills/truthmark-realize/")
  ) {
    return "realization";
  }

  if (
    filePath === "CLAUDE.md" ||
    filePath === ".github/copilot-instructions.md" ||
    filePath.startsWith(".github/prompts/truthmark-") ||
    filePath.startsWith(".github/agents/truth-") ||
    filePath.startsWith(".github/skills/truthmark-") ||
    filePath.startsWith(".claude/agents/truth-") ||
    filePath.startsWith(".claude/skills/truthmark-") ||
    filePath.startsWith(".opencode/skills/truthmark-") ||
    filePath.startsWith(".opencode/agents/") ||
    filePath.startsWith(".codex/agents/") ||
    filePath.startsWith(".antigravity/rules/truthmark-") ||
    filePath.startsWith(".cursor/rules/truthmark-") ||
    filePath.startsWith(".cursor/skills/truthmark-")
  ) {
    return "truth-sync";
  }

  if (filePath.startsWith(".agents/skills/truthmark-")) {
    return "truth-sync";
  }


  if (filePath === config.truthmark.paths.routesIndex) {
    return "area-index";
  }

  return "config";
};

const writePlatformFile = async (
  rootDir: string,
  file: GeneratedSurface,
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

const writeDiagnostics = (
  results: FileWriteResult[],
  config: TruthmarkConfig,
): CommandResult["diagnostics"] => {
  return results.map((result) => ({
    category: diagnosticCategoryForPath(result.path, config),
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
        "Truthmark init requires .truthmark/config.yml. Run truthmark config first, review the workspace paths, then run truthmark init.",
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

  const results: FileWriteResult[] = [];

  const config = loadedConfig.config;
  results.push(...(await scaffoldHierarchy(rootDir, config)));
  const block = renderAgentsBlock(config);
  const platformFiles = renderGeneratedSurfaces(config, block);
  const expectedSurfacePaths = new Set(platformFiles.map((file) => file.path));

  for (const file of platformFiles) {
    results.push(await writePlatformFile(rootDir, file));
  }

  const obsoleteSurfacePaths = await findAutoRemovableRetiredGeneratedSurfaces(
    rootDir,
    expectedSurfacePaths,
  );

  for (const obsoletePath of obsoleteSurfacePaths) {
    await fs.rm(resolveRepoPath(rootDir, obsoletePath), { force: true });
  }

  const changedResults = results.filter((result) => result.status !== "unchanged");

  return {
    command: "init",
    summary:
      changedResults.length > 0
        ? "Initialized or updated the Truthmark repository scaffold."
        : "Truthmark repository scaffold is already up to date.",
    diagnostics: writeDiagnostics(results, config),
    data: {
      repositoryRoot: repository.repositoryRoot,
      worktreePath: repository.worktreePath,
      branchName: repository.branchName,
      isDetached: repository.isDetached,
      isUnborn: repository.isUnborn,
    },
  };
};
