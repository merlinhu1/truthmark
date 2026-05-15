import path from "node:path";

import micromatch from "micromatch";

import { loadConfig } from "../config/load.js";
import { getGitRepository } from "../git/repository.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { buildRepoIndex } from "../repo-index/build.js";
import { isJavaScriptLikePath } from "../repo-index/file-tree.js";
import { analyzeTypeScriptSource } from "../repo-index/typescript-symbols.js";
import type { ExportEntry, ImportEdge, RouteMapRoute } from "../repo-index/types.js";
import { classifyPath } from "../sync/classify.js";
import { getChangedFiles, readBaseFile } from "./git-diff.js";
import type { ImpactOptions, ImpactRoute, ImpactSet, PublicSymbolChange } from "./types.js";

const uniqueSorted = (values: string[]): string[] => [...new Set(values)].sort();

const routeMatchesFile = (route: RouteMapRoute, filePath: string): boolean => {
  return route.codeSurface.some((pattern) => micromatch.isMatch(filePath, pattern));
};

const routeOwnsTruthDoc = (route: RouteMapRoute, filePath: string): boolean => {
  return route.truthDocs.includes(filePath);
};

const toImpactRoute = (route: RouteMapRoute): ImpactRoute => ({
  id: route.id,
  name: route.name,
  key: route.key,
  sourcePath: route.sourcePath,
  truthDocs: [...route.truthDocs].sort(),
  codeSurface: [...route.codeSurface].sort(),
});
const changedPathSet = (changedFiles: { path: string; previousPath?: string }[]): Set<string> => {
  return new Set(
    changedFiles.flatMap((file) => [file.path, ...(file.previousPath ? [file.previousPath] : [])]),
  );
};

const changedFilePaths = (changedFile: { path: string; previousPath?: string }): string[] => {
  return [changedFile.path, ...(changedFile.previousPath ? [changedFile.previousPath] : [])];
};

const resolveImportPath = (importEdge: ImportEdge): string | null => {
  if (!importEdge.specifier.startsWith(".")) {
    return null;
  }

  const basePath = path.posix.normalize(path.posix.join(path.posix.dirname(importEdge.from), importEdge.specifier));
  const withoutExtension = basePath.replace(/\.[cm]?[jt]sx?$/u, "");

  return withoutExtension;
};

const importTargetsChangedFile = (importEdge: ImportEdge, changedPath: string): boolean => {
  const resolved = resolveImportPath(importEdge);
  if (!resolved) {
    return false;
  }

  return changedPath.replace(/\.[cm]?[jt]sx?$/u, "") === resolved;
};

const pathSegments = (filePath: string): string[] => filePath.split("/").filter(Boolean);

const testHintMatchesChangedFile = (hints: string[], changedPath: string): boolean => {
  const changedBaseName = path.posix.basename(changedPath);
  const changedSegments = pathSegments(changedPath);

  return hints.some((hint) => changedBaseName.startsWith(hint) || changedSegments.includes(hint));
};

const changedSymbolsFor = async (
  cwd: string,
  base: string,
  basePath: string,
  currentPath: string,
  currentExports: ExportEntry[],
): Promise<PublicSymbolChange[]> => {
  if (!isJavaScriptLikePath(basePath) && !isJavaScriptLikePath(currentPath)) {
    return [];
  }

  const baseSource = await readBaseFile(cwd, base, basePath);
  const baseExports = baseSource ? analyzeTypeScriptSource(basePath, baseSource).exports : [];
  const currentByName = new Map(currentExports.map((entry) => [entry.name, entry]));
  const baseByName = new Map(baseExports.map((entry) => [entry.name, entry]));
  const changes: PublicSymbolChange[] = [];

  if (basePath !== currentPath) {
    for (const entry of currentExports) {
      changes.push({ path: currentPath, name: entry.name, kind: entry.kind, change: "added" });
    }
    for (const entry of baseExports) {
      changes.push({ path: basePath, name: entry.name, kind: entry.kind, change: "removed" });
    }
    return changes;
  }

  for (const [name, entry] of currentByName) {
    if (!baseByName.has(name)) {
      changes.push({ path: currentPath, name, kind: entry.kind, change: "added" });
    }
  }

  for (const [name, entry] of baseByName) {
    if (!currentByName.has(name)) {
      changes.push({ path: basePath, name, kind: entry.kind, change: "removed" });
    }
  }

  return changes;
};

export const buildImpactSet = async (
  cwd: string,
  options: ImpactOptions,
): Promise<ImpactSet> => {
  const repository = await getGitRepository(cwd);
  const rootDir = repository.worktreePath;
  const [loadResult, repoIndex, changedFilesResult] = await Promise.all([
    loadConfig(rootDir),
    buildRepoIndex(rootDir),
    getChangedFiles(rootDir, options.base),
  ]);
  const changedFiles = changedFilesResult.files;
  const ignore = loadResult.config?.ignore ?? [];
  const diagnostics: Diagnostic[] = [...repoIndex.diagnostics, ...changedFilesResult.diagnostics];
  const affectedRoutes = new Map<string, ImpactRoute>();
  const affectedTruthDocs: string[] = [];
  const affectedTests: string[] = [];
  const changedPublicSymbols: PublicSymbolChange[] = [];
  const knownTestPaths = new Set(repoIndex.tests.map((test) => test.path));

  for (const changedFile of changedFiles) {
    const routeCandidatePaths = changedFilePaths(changedFile);
    if (routeCandidatePaths.some((filePath) => knownTestPaths.has(filePath))) {
      affectedTests.push(changedFile.path);
    }
    const matchingRoutes = repoIndex.routeMap.routes.filter(
      (route) =>
        routeCandidatePaths.some(
          (filePath) => routeMatchesFile(route, filePath) || routeOwnsTruthDoc(route, filePath),
        ),
    );

    for (const route of matchingRoutes) {
      affectedRoutes.set(route.key, toImpactRoute(route));
      affectedTruthDocs.push(...route.truthDocs);
      if (route.truthDocs.length === 0) {
        diagnostics.push({
          category: "impact",
          severity: "review",
          message: `Changed file ${changedFile.path} maps to route ${route.name} but the route has no truth document.`,
          file: changedFile.path,
          area: route.name,
        });
      }
    }

    if (
      matchingRoutes.length === 0 &&
      !routeCandidatePaths.some((filePath) => knownTestPaths.has(filePath)) &&
      routeCandidatePaths.some((filePath) => classifyPath(filePath, ignore) === "functional-code")
    ) {
      diagnostics.push({
        category: "impact",
        severity: "review",
        message: `Changed file ${changedFile.path} is not mapped to a Truthmark route.`,
        file: changedFile.path,
      });
    }

    const currentExports = repoIndex.exports.filter((entry) => entry.path === changedFile.path);
    changedPublicSymbols.push(
      ...(await changedSymbolsFor(
        rootDir,
        options.base,
        changedFile.previousPath ?? changedFile.path,
        changedFile.path,
        currentExports,
      )),
    );
  }
  const uniqueAffectedTruthDocs = uniqueSorted(affectedTruthDocs);
  const changedPaths = changedPathSet(changedFiles);
  for (const symbol of changedPublicSymbols) {
    if (uniqueAffectedTruthDocs.length === 0) {
      diagnostics.push({
        category: "impact",
        severity: "review",
        message: `Changed public symbol ${symbol.name} in ${symbol.path} has no affected truth document.`,
        file: symbol.path,
        data: {
          symbol: symbol.name,
          change: symbol.change,
        },
      });
      continue;
    }
    if (!uniqueAffectedTruthDocs.some((truthDoc) => changedPaths.has(truthDoc))) {
      diagnostics.push({
        category: "impact",
        severity: "review",
        message: `Changed public symbol ${symbol.name} in ${symbol.path} has affected truth docs but none were changed in this impact set.`,
        file: symbol.path,
        data: {
          symbol: symbol.name,
          change: symbol.change,
          affectedTruthDocs: uniqueAffectedTruthDocs,
        },
      });
    }
  }

  for (const test of repoIndex.tests) {
    const testImports = repoIndex.imports.filter((edge) => edge.from === test.path);
    const importsChangedFile = changedFiles.some((changedFile) =>
      changedFilePaths(changedFile).some((filePath) =>
        testImports.some((importEdge) => importTargetsChangedFile(importEdge, filePath)),
      ),
    );
    const hintMatchesChangedFile = changedFiles.some((changedFile) =>
      changedFilePaths(changedFile).some((filePath) =>
        testHintMatchesChangedFile(test.targetHints, filePath),
      ),
    );

    if (importsChangedFile || hintMatchesChangedFile) {
      affectedTests.push(test.path);
    }
  }

  return {
    schemaVersion: "impact-set/v0",
    base: options.base,
    headSha: repository.headSha,
    changedFiles,
    affectedRoutes: [...affectedRoutes.values()].sort((left, right) =>
      left.key.localeCompare(right.key),
    ),
    affectedTruthDocs: uniqueAffectedTruthDocs,
    affectedTests: uniqueSorted(affectedTests),
    changedPublicSymbols: changedPublicSymbols.sort((left, right) =>
      `${left.path}:${left.name}:${left.change}`.localeCompare(`${right.path}:${right.name}:${right.change}`),
    ),
    diagnostics,
  };
};
