import path from "node:path";

import micromatch from "micromatch";

import { loadConfig } from "../config/load.js";
import { getGitRepository } from "../git/repository.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { buildRepoIndex } from "../repo-index/build.js";
import type { RouteMapRoute } from "../repo-index/types.js";
import { classifyPath } from "../sync/classify.js";
import { getChangedFiles } from "./git-diff.js";
import type { ImpactOptions, ImpactRoute, ImpactSet } from "./types.js";

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

const changedFilePaths = (changedFile: { path: string; previousPath?: string }): string[] => {
  return [changedFile.path, ...(changedFile.previousPath ? [changedFile.previousPath] : [])];
};

const pathSegments = (filePath: string): string[] => filePath.split("/").filter(Boolean);

const testHintMatchesChangedFile = (hints: string[], changedPath: string): boolean => {
  const changedBaseName = path.posix.basename(changedPath);
  const changedSegments = pathSegments(changedPath);

  return hints.some((hint) => changedBaseName.startsWith(hint) || changedSegments.includes(hint));
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
  }

  const uniqueAffectedTruthDocs = uniqueSorted(affectedTruthDocs);
  for (const test of repoIndex.tests) {
    const hintMatchesChangedFile = changedFiles.some((changedFile) =>
      changedFilePaths(changedFile).some((filePath) =>
        testHintMatchesChangedFile(test.targetHints, filePath),
      ),
    );

    if (hintMatchesChangedFile) {
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
    diagnostics,
  };
};
