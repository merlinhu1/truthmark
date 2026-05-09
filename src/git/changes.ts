import fs from "node:fs/promises";
import path from "node:path";

import { execa } from "execa";

import { getGitRepository } from "./repository.js";

export type UncommittedChange = {
  path: string;
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
  deleted: boolean;
};

const normalizePath = (filePath: string): string => {
  return filePath.replaceAll("\\", "/").replace(/^\.\//u, "");
};

const listChangedPaths = async (cwd: string, args: string[]): Promise<string[]> => {
  const result = await execa("git", args, { cwd });

  return result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => normalizePath(line));
};

const pathExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const getOrCreateChange = (
  changesByPath: Map<string, UncommittedChange>,
  filePath: string,
): UncommittedChange => {
  const existingChange = changesByPath.get(filePath);

  if (existingChange) {
    return existingChange;
  }

  const nextChange: UncommittedChange = {
    path: filePath,
    staged: false,
    unstaged: false,
    untracked: false,
    deleted: false,
  };

  changesByPath.set(filePath, nextChange);

  return nextChange;
};

export const getUncommittedChanges = async (cwd: string): Promise<UncommittedChange[]> => {
  const repository = await getGitRepository(cwd);
  const rootDir = repository.worktreePath;
  const [stagedPaths, unstagedPaths, untrackedPaths, stagedDeletedPaths, unstagedDeletedPaths] =
    await Promise.all([
      listChangedPaths(rootDir, ["diff", "--name-only", "--cached", "--diff-filter=ACDMRTUXB"]),
      listChangedPaths(rootDir, ["diff", "--name-only", "--diff-filter=ACDMRTUXB"]),
      listChangedPaths(rootDir, ["ls-files", "--others", "--exclude-standard"]),
      listChangedPaths(rootDir, ["diff", "--name-only", "--cached", "--diff-filter=D"]),
      listChangedPaths(rootDir, ["diff", "--name-only", "--diff-filter=D"]),
    ]);
  const changesByPath = new Map<string, UncommittedChange>();

  for (const stagedPath of stagedPaths) {
    getOrCreateChange(changesByPath, stagedPath).staged = true;
  }

  for (const unstagedPath of unstagedPaths) {
    getOrCreateChange(changesByPath, unstagedPath).unstaged = true;
  }

  for (const untrackedPath of untrackedPaths) {
    getOrCreateChange(changesByPath, untrackedPath).untracked = true;
  }

  const deletedPathCandidates = new Set([...stagedDeletedPaths, ...unstagedDeletedPaths]);

  for (const deletedPath of deletedPathCandidates) {
    const change = getOrCreateChange(changesByPath, deletedPath);
    change.deleted = !(await pathExists(path.join(rootDir, deletedPath)));
  }

  return Array.from(changesByPath.values()).sort((left, right) => {
    return left.path.localeCompare(right.path);
  });
};