import fs from "node:fs/promises";
import { realpathSync } from "node:fs";
import path from "node:path";

import { execa } from "execa";

export type GitRepository = {
  repositoryRoot: string;
  worktreePath: string;
  branchName: string | null;
  headSha: string | null;
  isDetached: boolean;
  isUnborn: boolean;
};

const realpathOrResolved = async (targetPath: string): Promise<string> => {
  try {
    return await fs.realpath(targetPath);
  } catch {
    return path.resolve(targetPath);
  }
};

const runGit = async (
  cwd: string,
  args: string[],
  reject = true,
): Promise<{ stdout: string; exitCode: number }> => {
  const result = await execa("git", args, { cwd, reject });

  return {
    stdout: result.stdout,
    exitCode: result.exitCode ?? 1,
  };
};

export const getGitRepository = async (cwd: string): Promise<GitRepository> => {
  const worktreePath = await realpathOrResolved(
    (await runGit(cwd, ["rev-parse", "--show-toplevel"])).stdout.trim(),
  );
  const commonDirOutput = (await runGit(cwd, ["rev-parse", "--git-common-dir"])).stdout.trim();
  const commonDir = await realpathOrResolved(path.resolve(worktreePath, commonDirOutput));
  const repositoryRoot = path.basename(commonDir) === ".git" ? path.dirname(commonDir) : worktreePath;

  const branchResult = await runGit(cwd, ["symbolic-ref", "--quiet", "--short", "HEAD"], false);
  const headResult = await runGit(cwd, ["rev-parse", "--verify", "HEAD"], false);

  const branchName = branchResult.exitCode === 0 ? branchResult.stdout.trim() : null;
  const headSha = headResult.exitCode === 0 ? headResult.stdout.trim() : null;
  const isDetached = branchName === null;
  const isUnborn = !isDetached && headSha === null;

  return {
    repositoryRoot,
    worktreePath,
    branchName,
    headSha,
    isDetached,
    isUnborn,
  };
};

export const resolveWorktreePath = (
  repository: Pick<GitRepository, "worktreePath">,
  relativePath: string,
): string => {
  const resolvedPath = path.resolve(repository.worktreePath, relativePath);

  let currentPath = resolvedPath;
  const missingSegments: string[] = [];
  let containedPath = resolvedPath;

  while (true) {
    try {
      containedPath = missingSegments.reduceRight<string>((resolvedExistingPath, segment) => {
        return path.join(resolvedExistingPath, segment);
      }, realpathSync(currentPath));
      break;
    } catch (error: unknown) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
        throw error;
      }

      const parentPath = path.dirname(currentPath);

      if (parentPath === currentPath) {
        containedPath = resolvedPath;
        break;
      }

      missingSegments.unshift(path.basename(currentPath));
      currentPath = parentPath;
    }
  }

  if (
    containedPath !== repository.worktreePath &&
    !containedPath.startsWith(`${repository.worktreePath}${path.sep}`)
  ) {
    throw new Error("resolved path must stay inside the active worktree");
  }

  return resolvedPath;
};