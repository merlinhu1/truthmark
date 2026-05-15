import fs from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";

import { buildImpactSet } from "../impact/build.js";
import type { ImpactSet } from "../impact/types.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { buildRepoIndex } from "../repo-index/build.js";
import type { RepoDocEntry, RouteMap } from "../repo-index/types.js";
import type {
  ContextDocument,
  ContextPack,
  ContextPackOptions,
  ContextSourceFile,
} from "./types.js";

const uniqueSorted = (values: string[]): string[] => [...new Set(values)].sort();

type ContextRoute = {
  codeSurface: string[];
};

const repoRootPrefixes = [".codex/", ".github/", ".truthmark/", "docs/", "src/", "tests/"];

const isGlobReference = (referencePath: string): boolean => /[*?[\]{}()]/u.test(referencePath);

const normalizeDocReferencePath = (docPath: string, referencePath: string): string | null => {
  const strippedPath = referencePath.split("#")[0]?.trim() ?? "";
  if (strippedPath.length === 0 || strippedPath.startsWith("/")) {
    return null;
  }

  const isRepoRelative = repoRootPrefixes.some((prefix) => strippedPath.startsWith(prefix));
  const normalized = isRepoRelative
    ? path.posix.normalize(strippedPath)
    : path.posix.normalize(path.posix.join(path.posix.dirname(docPath), strippedPath));

  return normalized === ".." || normalized.startsWith("../") ? null : normalized;
};

const readIfExists = async (rootDir: string, filePath: string): Promise<string | null> => {
  try {
    return await fs.readFile(path.join(rootDir, filePath), "utf8");
  } catch {
    return null;
  }
};

const boundedContent = (
  filePath: string,
  content: string,
  warnings: Diagnostic[],
): ContextSourceFile => {
  const lines = content.split("\n");

  if (lines.length <= 200) {
    return { path: filePath, content, truncated: false };
  }

  warnings.push({
    category: "context-pack",
    severity: "review",
    message: `Context source file ${filePath} was truncated to fit ContextPack v0 bounds.`,
    file: filePath,
  });

  return {
    path: filePath,
    content: [...lines.slice(0, 80), "...", ...lines.slice(-40)].join("\n"),
    truncated: true,
  };
};

const documentsFor = async (
  rootDir: string,
  paths: string[],
): Promise<ContextDocument[]> => {
  const documents: ContextDocument[] = [];

  for (const filePath of uniqueSorted(paths)) {
    const content = await readIfExists(rootDir, filePath);
    if (content !== null) {
      documents.push({ path: filePath, content });
    }
  }

  return documents;
};

const sourceFilesFor = async (
  rootDir: string,
  paths: string[],
  warnings: Diagnostic[],
): Promise<ContextSourceFile[]> => {
  const sourceFiles: ContextSourceFile[] = [];

  for (const filePath of uniqueSorted(paths)) {
    const content = await readIfExists(rootDir, filePath);
    if (content !== null) {
      sourceFiles.push(boundedContent(filePath, content, warnings));
    }
  }

  return sourceFiles;
};

const sourceOfTruthPathsFor = async (
  rootDir: string,
  docs: RepoDocEntry[],
  truthDocPaths: string[],
): Promise<string[]> => {
  const selectedTruthDocs = new Set(truthDocPaths);
  const sourcePaths: string[] = [];

  for (const doc of docs) {
    if (!selectedTruthDocs.has(doc.path)) {
      continue;
    }

    for (const referencePath of doc.sourceOfTruth) {
      const normalizedPath = normalizeDocReferencePath(doc.path, referencePath);
      if (!normalizedPath) {
        continue;
      }
      if (isGlobReference(normalizedPath)) {
        sourcePaths.push(
          ...(await fg(normalizedPath, {
            cwd: rootDir,
            dot: true,
            onlyFiles: true,
            followSymbolicLinks: false,
          })),
        );
      } else {
        sourcePaths.push(normalizedPath);
      }
    }
  }

  return uniqueSorted(sourcePaths);
};

const writePathsFor = (
  workflow: ContextPackOptions["workflow"],
  truthDocs: string[],
  routes: ContextRoute[],
): string[] => {
  if (workflow === "truth-sync") {
    return uniqueSorted(["docs/truthmark/areas.md", ...truthDocs]);
  }

  if (workflow === "truth-document") {
    return uniqueSorted(["docs/truthmark/areas.md", ...truthDocs]);
  }

  return uniqueSorted(routes.flatMap((route) => route.codeSurface));
};

const testCommandsFor = (affectedTests: string[]): string[] => {
  return affectedTests.length === 0
    ? ["npm test"]
    : [`npm test -- ${affectedTests.join(" ")}`];
};

export const buildContextPack = async (
  cwd: string,
  options: ContextPackOptions,
): Promise<ContextPack> => {
  const repoIndex = await buildRepoIndex(cwd);
  const rootDir = repoIndex.repository.root;
  const impactSet: ImpactSet | null = options.base
    ? await buildImpactSet(rootDir, { base: options.base })
    : null;
  const routeMap: RouteMap = impactSet ? repoIndex.routeMap : repoIndex.routeMap;
  const warnings: Diagnostic[] = [];
  const truthDocPaths =
    impactSet?.affectedTruthDocs ??
    (options.workflow === "truth-realize" ? [] : routeMap.routes.flatMap((route) => route.truthDocs));
  const contextRoutes: ContextRoute[] =
    impactSet?.affectedRoutes ?? (options.workflow === "truth-realize" ? [] : routeMap.routes);
  if (options.workflow === "truth-realize" && !impactSet) {
    warnings.push({
      category: "context-pack",
      severity: "review",
      message: "truth-realize requires --base to derive bounded allowed write paths.",
    });
  }
  const sourceOfTruthPaths = await sourceOfTruthPathsFor(rootDir, repoIndex.docs, truthDocPaths);
  const sourceFilePaths = uniqueSorted([
    ...(impactSet?.changedFiles.filter((file) => !file.deleted).map((file) => file.path) ?? []),
    ...sourceOfTruthPaths,
  ]);

  return {
    schemaVersion: "context-pack/v0",
    workflow: options.workflow,
    base: options.base ?? null,
    impactSet,
    routeMap,
    allowedWritePaths: writePathsFor(options.workflow, truthDocPaths, contextRoutes),
    truthDocs: await documentsFor(rootDir, truthDocPaths),
    sourceFiles: await sourceFilesFor(rootDir, sourceFilePaths, warnings),
    testCommands: testCommandsFor(impactSet?.affectedTests ?? []),
    warnings,
  };
};
