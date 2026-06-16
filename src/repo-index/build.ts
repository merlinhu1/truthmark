import { loadConfig } from "../config/load.js";
import { getGitRepository } from "../git/repository.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { discoverRepoFiles } from "./file-tree.js";
import { discoverPackageMetadata } from "./package-metadata.js";
import { buildRouteMap } from "./route-map.js";
import type { RepoIndex } from "./types.js";

export const buildRepoIndex = async (cwd: string): Promise<RepoIndex> => {
  const repository = await getGitRepository(cwd);
  const rootDir = repository.worktreePath;
  const loadResult = await loadConfig(rootDir);
  const ignore = loadResult.config?.ignore ?? [];
  const diagnostics: Diagnostic[] = [...loadResult.diagnostics];
  const [packages, fileTree, routeMap] = await Promise.all([
    discoverPackageMetadata(rootDir),
    discoverRepoFiles(rootDir, ignore),
    buildRouteMap(rootDir),
  ]);

  diagnostics.push(...routeMap.diagnostics);

  return {
    schemaVersion: "repo-index/v0",
    repository: {
      root: rootDir,
      branchName: repository.branchName,
      headSha: repository.headSha,
    },
    packages,
    files: fileTree.files,
    docs: fileTree.docs,
    tests: fileTree.tests,
    routeMap,
    diagnostics,
  };
};
