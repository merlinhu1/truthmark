import fs from "node:fs/promises";

import type { CommandResult } from "../output/diagnostic.js";
import { ensureRepoFile, resolveRepoPath, writeRepoFile } from "../fs/paths.js";
import { getGitRepository } from "../git/repository.js";
import { renderConfigTemplate } from "../templates/init-files.js";

export type ConfigCommandOptions = {
  stdout?: boolean;
  force?: boolean;
};

const CONFIG_PATH = ".truthmark/config.yml";

const configExists = async (rootDir: string): Promise<boolean> => {
  try {
    await fs.stat(resolveRepoPath(rootDir, CONFIG_PATH));
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

export const runConfig = async (
  cwd: string,
  options: ConfigCommandOptions = {},
): Promise<CommandResult> => {
  const repository = await getGitRepository(cwd);
  const content = renderConfigTemplate();

  if (options.stdout) {
    return {
      command: "config",
      summary: "Rendered default Truthmark config.",
      diagnostics: [],
      data: {
        repositoryRoot: repository.repositoryRoot,
        worktreePath: repository.worktreePath,
        branchName: repository.branchName,
        isDetached: repository.isDetached,
        isUnborn: repository.isUnborn,
        path: CONFIG_PATH,
        content,
      },
    };
  }

  const exists = await configExists(repository.worktreePath);

  if (exists && !options.force) {
    return {
      command: "config",
      summary: "Truthmark config already exists. Use --force to overwrite it.",
      diagnostics: [
        {
          category: "config",
          severity: "review",
          message: "Existing .truthmark/config.yml was left unchanged.",
          file: CONFIG_PATH,
        },
      ],
      data: {
        repositoryRoot: repository.repositoryRoot,
        worktreePath: repository.worktreePath,
        branchName: repository.branchName,
        isDetached: repository.isDetached,
        isUnborn: repository.isUnborn,
      },
    };
  }

  const result = options.force
    ? await writeRepoFile(repository.worktreePath, CONFIG_PATH, content)
    : await ensureRepoFile(repository.worktreePath, CONFIG_PATH, content);

  return {
    command: "config",
    summary: `Wrote Truthmark config to ${CONFIG_PATH}. Review it before running truthmark init.`,
    diagnostics: [
      {
        category: "config",
        severity: "action",
        message: result.status === "updated" ? `Updated ${CONFIG_PATH}.` : `Created ${CONFIG_PATH}.`,
        file: CONFIG_PATH,
      },
    ],
    data: {
      repositoryRoot: repository.repositoryRoot,
      worktreePath: repository.worktreePath,
      branchName: repository.branchName,
      isDetached: repository.isDetached,
      isUnborn: repository.isUnborn,
    },
  };
};
