import fs from "node:fs/promises";

import { loadConfig } from "../config/load.js";
import { createDefaultConfig } from "../config/defaults.js";
import { renderConfig, updateConfigPlatforms } from "../config/render.js";
import { upsertManagedBlock as upsertManagedInstructionBlock } from "../managed-block.js";
import {
  SUPPORTED_PLATFORMS,
  type TruthmarkConfig,
  type TruthmarkPlatform,
} from "../config/schema.js";
import type {
  CommandResult,
  DiagnosticCategory,
} from "../output/diagnostic.js";
import { getGitRepository } from "../git/repository.js";
import {
  resolveRepoPath,
  type FileWriteResult,
  writeRepoFile,
} from "../fs/paths.js";
import { scaffoldHierarchy } from "./hierarchy.js";
import { renderAgentsBlock } from "../templates/agents-block.js";
import {
  renderGeneratedSurfaces,
  type GeneratedSurface,
} from "../templates/generated-surfaces.js";
import { applyLifecyclePlan, buildLifecyclePlan } from "./lifecycle.js";

const writeManagedAgentsFile = async (
  rootDir: string,
  path = "AGENTS.md",
  block: string,
): Promise<FileWriteResult> => {
  let existingContent: string | null = null;

  try {
    existingContent = await fs.readFile(resolveRepoPath(rootDir, path), "utf8");
  } catch (error: unknown) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
  }

  return writeRepoFile(
    rootDir,
    path,
    upsertManagedInstructionBlock(existingContent, block),
  );
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

export type PlatformSelector = (
  defaults: readonly TruthmarkPlatform[],
) => Promise<readonly TruthmarkPlatform[] | null>;

export type InitOptions = {
  platforms?: readonly string[];
  selectPlatforms?: PlatformSelector;
};

const normalizeRequestedPlatforms = (
  values: readonly string[],
): { platforms: TruthmarkPlatform[]; unsupported: string[] } => {
  const unsupported = values.filter(
    (value) => !SUPPORTED_PLATFORMS.includes(value as TruthmarkPlatform),
  );
  const selected = new Set(values as readonly TruthmarkPlatform[]);
  return {
    platforms: SUPPORTED_PLATFORMS.filter((platform) => selected.has(platform)),
    unsupported: [...new Set(unsupported)],
  };
};

export const runInit = async (
  cwd: string,
  options: InitOptions = {},
): Promise<CommandResult> => {
  const repository = await getGitRepository(cwd);
  const rootDir = repository.worktreePath;
  const loadedConfig = await loadConfig(rootDir);
  const repositoryData = {
    repositoryRoot: repository.repositoryRoot,
    worktreePath: repository.worktreePath,
    branchName: repository.branchName,
    isDetached: repository.isDetached,
    isUnborn: repository.isUnborn,
  };

  if (loadedConfig.status === "invalid") {
    return {
      command: "init",
      summary: "Truthmark init made no changes because config is invalid.",
      diagnostics: loadedConfig.diagnostics,
      data: repositoryData,
    };
  }

  const savedPlatforms = loadedConfig.config?.platforms ?? [];
  let requestedPlatforms: readonly string[];
  if (options.platforms !== undefined) requestedPlatforms = options.platforms;
  else if (options.selectPlatforms) {
    const selected = await options.selectPlatforms(savedPlatforms);
    if (selected === null)
      return {
        command: "init",
        summary: "Truthmark init cancelled; no repository files were changed.",
        diagnostics: [],
        data: { ...repositoryData, cancelled: true },
      };
    requestedPlatforms = selected;
  } else requestedPlatforms = savedPlatforms;

  const normalized = normalizeRequestedPlatforms(requestedPlatforms);
  if (normalized.unsupported.length > 0)
    return {
      command: "init",
      summary: "Truthmark init requires supported platform values.",
      diagnostics: normalized.unsupported.map((platform) => ({
        category: "config" as const,
        severity: "error" as const,
        message: `Unsupported Truthmark platform: ${platform}.`,
        file: ".truthmark/config.yml",
      })),
      data: repositoryData,
    };

  const config: TruthmarkConfig = {
    ...(loadedConfig.config ?? createDefaultConfig()),
    platforms: normalized.platforms,
  };
  const existingConfigSource = loadedConfig.config
    ? await fs.readFile(resolveRepoPath(rootDir, loadedConfig.configPath), "utf8")
    : null;
  const configSource = existingConfigSource
    ? updateConfigPlatforms(existingConfigSource, normalized.platforms)
    : renderConfig(normalized.platforms);
  const configDiagnostics =
    loadedConfig.status === "loaded" ? loadedConfig.diagnostics : [];
  const results: FileWriteResult[] = [];
  const block = renderAgentsBlock(config);
  const platformFiles = renderGeneratedSurfaces(config, block);
  const lifecyclePlan = await buildLifecyclePlan(
    rootDir,
    config,
    "apply",
    platformFiles,
  );
  if (!lifecyclePlan.applicable) {
    return {
      command: "init",
      summary:
        "Truthmark init made no changes because generated-surface preflight failed.",
      diagnostics: [...configDiagnostics, ...lifecyclePlan.diagnostics],
      data: { ...repositoryData, lifecyclePlan },
    };
  }
  const appliedLifecyclePlan = await applyLifecyclePlan(rootDir, lifecyclePlan);
  if (!appliedLifecyclePlan.applicable) {
    return {
      command: "init",
      summary:
        "Truthmark init made no changes because generated-surface preflight failed.",
      diagnostics: [
        ...configDiagnostics,
        ...appliedLifecyclePlan.diagnostics,
      ],
      data: { ...repositoryData, lifecyclePlan: appliedLifecyclePlan },
    };
  }

  results.push(
    await writeRepoFile(rootDir, loadedConfig.configPath, configSource),
  );
  results.push(...(await scaffoldHierarchy(rootDir, config)));
  for (const file of platformFiles) {
    results.push(await writePlatformFile(rootDir, file));
  }

  const changedResults = results.filter(
    (result) => result.status !== "unchanged",
  );
  const lifecycleChanged = appliedLifecyclePlan.entries.some(
    ({ action }) =>
      action === "remove-file" || action === "remove-managed-block",
  );

  return {
    command: "init",
    summary:
      changedResults.length > 0 || lifecycleChanged
        ? "Initialized or updated the Truthmark repository scaffold."
        : "Truthmark repository scaffold is already up to date.",
    diagnostics: [
      ...configDiagnostics,
      ...appliedLifecyclePlan.diagnostics,
      ...appliedLifecyclePlan.entries.map((entry) => ({
        category: "generated-surface" as const,
        severity:
          entry.action === "remove-file" ||
          entry.action === "remove-managed-block"
            ? ("action" as const)
            : ("review" as const),
        message: `${entry.action}: ${entry.reason}`,
        file: entry.path,
      })),
      ...writeDiagnostics(results, config),
    ],
    data: {
      ...repositoryData,
      lifecyclePlan: appliedLifecyclePlan,
    },
  };
};
