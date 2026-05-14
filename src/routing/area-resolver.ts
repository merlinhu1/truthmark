import fs from "node:fs/promises";

import fg from "fast-glob";
import micromatch from "micromatch";

import { assertRepoContainment, resolveRepoPath } from "../fs/paths.js";
import type { Diagnostic } from "../output/diagnostic.js";
import {
  parseAreasMarkdown,
  type TruthArea,
  type TruthAreaReference,
} from "./areas.js";

export type AreaRoutingConfig = {
  rootIndex: string;
  areaFilesRoot: string;
  truthDocsRoot?: string;
};

export type ResolvedTruthArea = TruthArea & {
  sourcePath: string;
  parentName?: string;
};

export type ResolvedAreaRouting = {
  areas: ResolvedTruthArea[];
  truthDocumentReferences: TruthAreaReference[];
  truthDocumentPaths: string[];
  routeFiles: string[];
  diagnostics: Diagnostic[];
};

const unique = (values: string[]): string[] => {
  return [...new Set(values)];
};

const normalizeGlobPath = (value: string): string => {
  return value.replaceAll("\\", "/").replace(/^\.\/+/u, "");
};

const concretePrefix = (pattern: string): string => {
  const normalizedPattern = normalizeGlobPath(pattern);
  const wildcardIndex = normalizedPattern.search(/[*?[{(!+@]/u);
  const prefix = wildcardIndex === -1 ? normalizedPattern : normalizedPattern.slice(0, wildcardIndex);

  return prefix.replace(/[^/]*$/u, "");
};

const isCodeSurfaceWithinParent = (childPattern: string, parentPatterns: string[]): boolean => {
  const childPrefix = concretePrefix(childPattern);

  if (childPrefix.length === 0) {
    return false;
  }

  return parentPatterns.some((parentPattern) => {
    return micromatch.isMatch(childPrefix, parentPattern) || micromatch.isMatch(childPattern, parentPattern);
  });
};

const ensureChildPath = async (
  rootDir: string,
  areaFilesRoot: string,
  filePath: string,
): Promise<Diagnostic | null> => {
  try {
    const absoluteChild = resolveRepoPath(rootDir, filePath);
    const absoluteRoot = resolveRepoPath(rootDir, areaFilesRoot);
    await assertRepoContainment(rootDir, absoluteChild);
    await assertRepoContainment(rootDir, absoluteRoot);

    if (!absoluteChild.startsWith(`${absoluteRoot}/`)) {
      return {
        category: "area-index",
        severity: "error",
        message: `Area file ${filePath} must live under ${areaFilesRoot}.`,
        file: filePath,
      };
    }
  } catch {
    return {
      category: "area-index",
      severity: "error",
      message: `Area file ${filePath} must stay inside the repository root.`,
      file: filePath,
    };
  }

  return null;
};

const readRouteFile = async (
  rootDir: string,
  filePath: string,
): Promise<{ source: string | null; diagnostic: Diagnostic | null }> => {
  try {
    return {
      source: await fs.readFile(resolveRepoPath(rootDir, filePath), "utf8"),
      diagnostic: null,
    };
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {
        source: null,
        diagnostic: {
          category: "area-index",
          severity: "error",
          message: `Missing area file ${filePath}.`,
          file: filePath,
        },
      };
    }

    throw error;
  }
};

export const resolveAreaRouting = async (
  rootDir: string,
  config: AreaRoutingConfig,
): Promise<ResolvedAreaRouting> => {
  const diagnostics: Diagnostic[] = [];
  const routeFiles = [config.rootIndex];
  const areas: ResolvedTruthArea[] = [];
  const truthDocumentReferences: TruthAreaReference[] = [];
  const truthDocumentPaths: string[] = [];
  const rootRead = await readRouteFile(rootDir, config.rootIndex);

  if (rootRead.diagnostic) {
    return {
      areas,
      truthDocumentReferences,
      truthDocumentPaths,
      routeFiles,
      diagnostics: [rootRead.diagnostic],
    };
  }

  const rootParsed = parseAreasMarkdown(rootRead.source ?? "", {
    truthDocsRoot: config.truthDocsRoot,
  });
  diagnostics.push(
    ...rootParsed.diagnostics.map((diagnostic) => ({
      ...diagnostic,
      file: diagnostic.file ?? config.rootIndex,
    })),
  );
  truthDocumentReferences.push(...rootParsed.truthDocumentReferences);
  areas.push(...rootParsed.areas.map((area) => ({ ...area, sourcePath: config.rootIndex })));

  const referencedChildFiles = new Set<string>();

  for (const area of rootParsed.areaFileReferences) {
    for (const areaFile of area.areaFiles) {
      if (referencedChildFiles.has(areaFile)) {
        diagnostics.push({
          category: "area-index",
          severity: "error",
          message: `Area file ${areaFile} is referenced more than once.`,
          file: areaFile,
          area: area.name,
        });
      }

      referencedChildFiles.add(areaFile);
    }
  }

  for (const area of rootParsed.areaFileReferences) {
    for (const areaFile of area.areaFiles) {
      const childPathDiagnostic = await ensureChildPath(rootDir, config.areaFilesRoot, areaFile);

      if (childPathDiagnostic) {
        diagnostics.push(childPathDiagnostic);
        continue;
      }

      const childRead = await readRouteFile(rootDir, areaFile);

      if (childRead.diagnostic) {
        diagnostics.push(childRead.diagnostic);
        continue;
      }

      routeFiles.push(areaFile);
      const childParsed = parseAreasMarkdown(childRead.source ?? "", {
        truthDocsRoot: config.truthDocsRoot,
      });
      diagnostics.push(
        ...childParsed.diagnostics.map((diagnostic) => ({
          ...diagnostic,
          file: diagnostic.file ?? areaFile,
        })),
      );
      truthDocumentReferences.push(...childParsed.truthDocumentReferences);

      if (childParsed.areaFileReferences.length > 0) {
        diagnostics.push({
          category: "area-index",
          severity: "error",
          message: "Child area files must contain leaf areas only.",
          file: areaFile,
          area: area.name,
        });
        continue;
      }

      areas.push(
        ...childParsed.areas.map((childArea) => {
          for (const childCodeSurface of childArea.codeSurface) {
            if (!isCodeSurfaceWithinParent(childCodeSurface, area.codeSurface)) {
              diagnostics.push({
                category: "area-index",
                severity: "review",
                message: `Child code surface ${childCodeSurface} is outside parent area ${area.name} code surface.`,
                file: areaFile,
                area: childArea.name,
              });
            }
          }

          return {
            ...childArea,
            sourcePath: areaFile,
            parentName: area.name,
          };
        }),
      );
    }
  }

  const routeFilesUnderRoot = await fg([`${config.areaFilesRoot}/**/*.md`], {
    cwd: rootDir,
    onlyFiles: true,
    followSymbolicLinks: false,
  });

  for (const routeFile of routeFilesUnderRoot.sort()) {
    if (!referencedChildFiles.has(routeFile)) {
      diagnostics.push({
        category: "area-index",
        severity: "review",
        message: `Area file ${routeFile} is not referenced by the root route index.`,
        file: routeFile,
      });
    }
  }

  const areaKeys = new Map<string, ResolvedTruthArea>();

  for (const area of areas) {
    const existingArea = areaKeys.get(area.key);

    if (existingArea) {
      diagnostics.push({
        category: "area-index",
        severity: "error",
        message: `Duplicate area key ${area.key} appears in ${existingArea.name} and ${area.name}.`,
        area: area.name,
      });
      continue;
    }

    areaKeys.set(area.key, area);
  }

  for (const area of areas) {
    truthDocumentPaths.push(...area.truthDocuments);
  }

  return {
    areas,
    truthDocumentReferences,
    truthDocumentPaths: unique(truthDocumentPaths),
    routeFiles: unique(routeFiles),
    diagnostics,
  };
};
