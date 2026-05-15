import fs from "node:fs/promises";
import path from "node:path";

import { loadConfig } from "../config/load.js";
import { getGitRepository } from "../git/repository.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { discoverRepoFiles, isJavaScriptLikePath } from "./file-tree.js";
import { discoverPackageMetadata } from "./package-metadata.js";
import { buildRouteMap } from "./route-map.js";
import { analyzeTypeScriptSource } from "./typescript-symbols.js";
import type { ExportEntry, ImportEdge, PublicSymbolEntry, RepoIndex } from "./types.js";

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
  const imports: ImportEdge[] = [];
  const exports: ExportEntry[] = [];
  const publicSymbols: PublicSymbolEntry[] = [];

  diagnostics.push(...routeMap.diagnostics);

  for (const file of fileTree.files) {
    if (!isJavaScriptLikePath(file.path)) {
      continue;
    }

    const source = await fs.readFile(path.join(rootDir, file.path), "utf8");
    const analysis = analyzeTypeScriptSource(file.path, source);
    imports.push(...analysis.imports);
    exports.push(...analysis.exports);
    publicSymbols.push(...analysis.publicSymbols);
  }

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
    imports: imports.sort((left, right) => `${left.from}:${left.specifier}`.localeCompare(`${right.from}:${right.specifier}`)),
    exports: exports.sort((left, right) => `${left.path}:${left.name}`.localeCompare(`${right.path}:${right.name}`)),
    publicSymbols: publicSymbols.sort((left, right) =>
      `${left.path}:${left.name}`.localeCompare(`${right.path}:${right.name}`),
    ),
    routeMap,
    diagnostics,
  };
};
