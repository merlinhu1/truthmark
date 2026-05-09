import fs from "node:fs/promises";

import fg from "fast-glob";

import { loadConfig } from "../config/load.js";
import { DEFAULT_DOCS_HIERARCHY } from "../config/defaults.js";
import { resolveWorktreePath, getGitRepository } from "../git/repository.js";
import { hashText } from "../markdown/hash.js";

export type BranchScopeData = {
  repositoryRoot: string;
  worktreePath: string;
  branchName: string | null;
  headSha: string | null;
  identity: string;
  relevantFileHashes: Record<string, string>;
};

export class BranchScopeFileError extends Error {
  file: string;

  constructor(file: string, message: string) {
    super(message);
    this.name = "BranchScopeFileError";
    this.file = file;
  }
}

const RELEVANT_BRANCH_SCOPE_FILES = [".truthmark/config.yml", "TRUTHMARK.md"] as const;

const toBranchIdentity = (branchName: string | null, headSha: string | null): string => {
  if (branchName && headSha) {
    return `${branchName}@${headSha}`;
  }

  if (branchName) {
    return `unborn:${branchName}`;
  }

  return headSha ? `detached:${headSha}` : "detached:unknown";
};

export const createBranchScopeData = (
  repository: {
    repositoryRoot: string;
    worktreePath: string;
    branchName: string | null;
    headSha: string | null;
  },
  relevantFileHashes: Record<string, string> = {},
): BranchScopeData => {
  return {
    repositoryRoot: repository.repositoryRoot,
    worktreePath: repository.worktreePath,
    branchName: repository.branchName,
    headSha: repository.headSha,
    identity: toBranchIdentity(repository.branchName, repository.headSha),
    relevantFileHashes,
  };
};

export const getBranchScopeData = async (cwd: string): Promise<BranchScopeData> => {
  const repository = await getGitRepository(cwd);
  const relevantFileHashes: Record<string, string> = {};
  const loadResult = await loadConfig(repository.worktreePath);
  const rootIndex =
    loadResult.config?.docs.routing.rootIndex ?? DEFAULT_DOCS_HIERARCHY.routing.root_index;
  const areaFilesRoot =
    loadResult.config?.docs.routing.areaFilesRoot ?? DEFAULT_DOCS_HIERARCHY.routing.area_files_root;
  const relevantFiles = new Set<string>([...RELEVANT_BRANCH_SCOPE_FILES, rootIndex]);
  const routeFiles = await fg([`${areaFilesRoot}/**/*.md`], {
    cwd: repository.worktreePath,
    onlyFiles: true,
    followSymbolicLinks: false,
  });

  for (const routeFile of routeFiles) {
    relevantFiles.add(routeFile);
  }

  for (const relativePath of [...relevantFiles].sort()) {
    try {
      const source = await fs.readFile(resolveWorktreePath(repository, relativePath), "utf8");

      relevantFileHashes[relativePath] = hashText(source);
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        continue;
      }

      const detail = error instanceof Error ? error.message : "unknown error";

      throw new BranchScopeFileError(
        relativePath,
        `Branch-scope file ${relativePath} could not be read safely: ${detail}`,
      );
    }
  }

  return createBranchScopeData(repository, relevantFileHashes);
};
