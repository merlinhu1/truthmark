import fs from "node:fs/promises";

import { loadConfig } from "../config/load.js";
import type { TruthmarkConfig } from "../config/schema.js";
import type { CommandResult, DiagnosticCategory } from "../output/diagnostic.js";
import { getGitRepository } from "../git/repository.js";
import { ensureRepoFile, resolveRepoPath, type FileWriteResult, writeRepoFile } from "../fs/paths.js";
import { detectHierarchyMigrationDiagnostics, scaffoldHierarchy } from "./hierarchy.js";
import { renderAgentsBlock, TRUTHMARK_BLOCK_END, TRUTHMARK_BLOCK_START } from "../templates/agents-block.js";
import { renderDefaultStandards } from "../templates/default-standards.js";
import { renderGeneratedSurfaces, type GeneratedSurface } from "../templates/generated-surfaces.js";

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

const normalizeLegacyInstructionPreamble = (content: string): string => {
  return content
    .replaceAll(
      "Use that file as the primary repository instruction source for Codex.",
      "Use that file as the primary repository instruction source for this agent.",
    )
    .replaceAll("Codex-specific:", "Agent-specific:")
    .replaceAll(
      "- Read `docs/README.md` for the canonical docs map.",
      "- Read `docs/README.md` only when choosing or updating canonical docs.",
    )
    .replaceAll(
      "- Use `docs/ai/agent-onboarding.md` for quick task routing.",
      "- Use `docs/ai/agent-onboarding.md` only when task routing is unclear or cross-area.",
    );
};

const upsertManagedBlock = (existingContent: string | null, block: string): string => {
  if (!existingContent || existingContent.trim().length === 0) {
    return block;
  }

  const normalizedExistingContent = normalizeLegacyInstructionPreamble(existingContent);
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

  if (filePath.startsWith(".codex/skills/truthmark-document/")) {
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

  if (filePath === config.docs.routing.rootIndex) {
    return "authority";
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

  const config = loadedConfig.config;
  results.push(...(await scaffoldHierarchy(rootDir, config)));
  const migrationDiagnostics = await detectHierarchyMigrationDiagnostics(rootDir, config);
  const block = renderAgentsBlock(config);
  const platformFiles = renderGeneratedSurfaces(config, block);

  for (const file of platformFiles) {
    results.push(await writePlatformFile(rootDir, file));
  }

  const changedResults = results.filter((result) => result.status !== "unchanged");

  return {
    command: "init",
    summary:
      changedResults.length > 0
        ? "Initialized or updated the Truthmark repository scaffold."
        : "Truthmark repository scaffold is already up to date.",
    diagnostics: [...writeDiagnostics(results, config), ...migrationDiagnostics],
    data: {
      repositoryRoot: repository.repositoryRoot,
      worktreePath: repository.worktreePath,
      branchName: repository.branchName,
      isDetached: repository.isDetached,
      isUnborn: repository.isUnborn,
    },
  };
};
