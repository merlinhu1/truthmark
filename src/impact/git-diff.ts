import { execa } from "execa";

import { getUncommittedChanges } from "../git/changes.js";
import { getGitRepository } from "../git/repository.js";
import type { Diagnostic } from "../output/diagnostic.js";
import type { ChangedFileStatus, ImpactFile } from "./types.js";

const normalizePath = (filePath: string): string => filePath.replaceAll("\\", "/").replace(/^\.\//u, "");

const statusForCode = (code: string): ChangedFileStatus => {
  if (code.startsWith("A")) return "added";
  if (code.startsWith("D")) return "deleted";
  if (code.startsWith("R")) return "renamed";
  if (code.startsWith("C")) return "copied";
  if (code.startsWith("T")) return "type-changed";
  return "modified";
};

const mergeFile = (files: Map<string, ImpactFile>, next: ImpactFile): void => {
  const existing = files.get(next.path);
  if (!existing) {
    files.set(next.path, next);
    return;
  }

  files.set(next.path, {
    ...existing,
    status:
      existing.status === "deleted" || existing.status === "renamed" ? existing.status : next.status,
    previousPath: existing.previousPath ?? next.previousPath,
    staged: existing.staged || next.staged,
    unstaged: existing.unstaged || next.unstaged,
    untracked: existing.untracked || next.untracked,
    deleted: existing.deleted || next.deleted,
  });
};

export type ChangedFilesResult = {
  files: ImpactFile[];
  diagnostics: Diagnostic[];
};
export const getChangedFiles = async (cwd: string, base: string): Promise<ChangedFilesResult> => {
  const repository = await getGitRepository(cwd);
  const files = new Map<string, ImpactFile>();
  const diagnostics: Diagnostic[] = [];
  let diff = await execa("git", ["diff", "--name-status", "--find-renames", `${base}...HEAD`], {
    cwd: repository.worktreePath,
    reject: false,
  });

  if ((diff.exitCode ?? 1) !== 0) {
    diff = await execa("git", ["diff", "--name-status", "--find-renames", base, "HEAD"], {
      cwd: repository.worktreePath,
      reject: false,
    });
  }

  if ((diff.exitCode ?? 1) === 0) {
    for (const line of diff.stdout.split("\n").filter(Boolean)) {
      const [rawStatus, rawPath, rawNewPath] = line.split("\t");
      const filePath = normalizePath(rawNewPath ?? rawPath);
      const previousPath = rawNewPath && rawStatus.startsWith("R") ? normalizePath(rawPath) : undefined;

      mergeFile(files, {
        path: filePath,
        previousPath,
        status: statusForCode(rawStatus),
        staged: false,
        unstaged: false,
        untracked: false,
        deleted: rawStatus.startsWith("D"),
      });
    }
  } else {
    diagnostics.push({
      category: "impact",
      severity: "error",
      message: `Unable to compare base ref ${base} to HEAD.`,
    });
  }

  for (const change of await getUncommittedChanges(repository.worktreePath)) {
    mergeFile(files, {
      path: change.path,
      status: change.untracked ? "added" : change.deleted ? "deleted" : "modified",
      staged: change.staged,
      unstaged: change.unstaged,
      untracked: change.untracked,
      deleted: change.deleted,
    });
  }

  return {
    files: [...files.values()].sort((left, right) => left.path.localeCompare(right.path)),
    diagnostics,
  };
};

export const readBaseFile = async (
  cwd: string,
  base: string,
  filePath: string,
): Promise<string | null> => {
  const repository = await getGitRepository(cwd);
  const result = await execa("git", ["show", `${base}:${filePath}`], {
    cwd: repository.worktreePath,
    reject: false,
  });

  return (result.exitCode ?? 1) === 0 ? result.stdout : null;
};
