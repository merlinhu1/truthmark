import fs from "node:fs/promises";

import fg from "fast-glob";
import micromatch from "micromatch";

import type { TruthmarkConfig } from "../config/schema.js";
import { assertRepoContainment, resolveRepoPath } from "../fs/paths.js";
import { resolveAreaRouting } from "../routing/area-resolver.js";
import type { Diagnostic } from "../output/diagnostic.js";
import type { TruthDocumentEntry } from "../routing/areas.js";
import { classifyPath } from "../sync/classify.js";
import { resolveTruthDocsRoot } from "../truth/docs.js";

export type AreasCheckResult = {
  diagnostics: Diagnostic[];
  truthDocumentPaths: string[];
  truthDocumentEntries: TruthDocumentEntry[];
  routePrecision: {
    leafAreaCount: number;
    broadAreaCount: number;
  };
  topologyPressureCount: number;
};

const looksLikeGlob = (pattern: string): boolean => {
  return /[*?[\]{}()!+@]/u.test(pattern);
};

const pathExists = async (absolutePath: string): Promise<boolean> => {
  try {
    await fs.stat(absolutePath);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

const COVERAGE_SCAN_PATTERNS = [
  "app/**/*",
  "api/**/*",
  "apps/**/*",
  "bin/**/*",
  "client/**/*",
  "cmd/**/*",
  "frontend/**/*",
  "infra/**/*",
  "infrastructure/**/*",
  "internal/**/*",
  "k8s/**/*",
  "kubernetes/**/*",
  "lib/**/*",
  "packages/**/*",
  "pkg/**/*",
  "proto/**/*",
  "schema/**/*",
  "schemas/**/*",
  "scripts/**/*",
  "server/**/*",
  "services/**/*",
  "src/**/*",
  "terraform/**/*",
  "web/**/*",
  ".github/workflows/**/*",
] as const;

const BROAD_CODE_SURFACES = new Set([
  "app/**",
  "apps/**",
  "server/**",
  "services/**",
  "src/**",
  "packages/**",
]);

const isBroadCodeSurface = (pattern: string): boolean => {
  return BROAD_CODE_SURFACES.has(pattern.replace(/\/\*\*\/\*$/u, "/**"));
};

export const checkAreas = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<AreasCheckResult> => {
  const routing = await resolveAreaRouting(rootDir, {
    rootIndex: config.docs.routing.rootIndex,
    areaFilesRoot: config.docs.routing.areaFilesRoot,
    truthDocsRoot: resolveTruthDocsRoot(config),
  });

  const discoveredCodeFiles = await fg([...COVERAGE_SCAN_PATTERNS], {
    cwd: rootDir,
    onlyFiles: true,
    ignore: config.ignore,
    followSymbolicLinks: false,
    dot: true,
  });
  const rawCodeFiles = discoveredCodeFiles.filter(
    (filePath) => classifyPath(filePath, config.ignore) === "functional-code",
  );
  const diagnostics: Diagnostic[] = [...routing.diagnostics];
  const truthDocumentPaths: string[] = [];
  const seenTruthDocumentPaths = new Set<string>();
  const truthDocumentEntryMap = new Map<string, TruthDocumentEntry>();
  const areaCoverage = routing.areas.map((area) => ({
    area,
    valid: true,
    patterns: [] as string[],
  }));
  const codeFiles: string[] = [];

  for (const codeFile of rawCodeFiles.sort()) {
    try {
      await assertRepoContainment(rootDir, resolveRepoPath(rootDir, codeFile));
      codeFiles.push(codeFile);
    } catch {
      continue;
    }
  }

  const truthReferences = routing.truthDocumentReferences;

  for (const area of truthReferences) {
    let areaHasTruthDocumentErrors = false;
    const registerTruthDocumentEntry = (truthDocumentEntry: TruthDocumentEntry): boolean => {
      const existingEntry = truthDocumentEntryMap.get(truthDocumentEntry.path);

      if (existingEntry && existingEntry.kind !== truthDocumentEntry.kind) {
        diagnostics.push({
          category: "area-index",
          severity: "error",
          message: `Truth document ${truthDocumentEntry.path} is routed with conflicting kinds ${existingEntry.kind} and ${truthDocumentEntry.kind}.`,
          area: area.name,
          file: truthDocumentEntry.path,
        });
        return false;
      }

      if (!existingEntry) {
        truthDocumentEntryMap.set(truthDocumentEntry.path, truthDocumentEntry);
      }

      return true;
    };

    for (const truthDocument of area.truthDocuments) {
      if (looksLikeGlob(truthDocument)) {
        const routedGlobEntry = area.truthDocumentEntries.find(
          (entry) => entry.path === truthDocument,
        );
        const matches = (await fg([truthDocument], { cwd: rootDir, onlyFiles: true })).sort();

        if (matches.length === 0) {
          diagnostics.push({
            category: "area-index",
            severity: "error",
            message: `Truth document glob ${truthDocument} did not match any files.`,
            area: area.name,
            file: truthDocument,
          });
          areaHasTruthDocumentErrors = true;
          continue;
        }

        for (const match of matches) {
          try {
            const absoluteMatchPath = resolveRepoPath(rootDir, match);
            await assertRepoContainment(rootDir, absoluteMatchPath);
          } catch {
            diagnostics.push({
              category: "area-index",
              severity: "error",
              message: `Truth document ${match} must stay inside the repository root.`,
              area: area.name,
              file: match,
            });
            areaHasTruthDocumentErrors = true;
            continue;
          }

          if (!seenTruthDocumentPaths.has(match)) {
            seenTruthDocumentPaths.add(match);
            truthDocumentPaths.push(match);
          }
          if (
            routedGlobEntry &&
            !registerTruthDocumentEntry({
              ...routedGlobEntry,
              path: match,
            })
          ) {
            areaHasTruthDocumentErrors = true;
          }
        }

        continue;
      }

      let absoluteTruthDocumentPath: string;

      try {
        absoluteTruthDocumentPath = resolveRepoPath(rootDir, truthDocument);
        await assertRepoContainment(rootDir, absoluteTruthDocumentPath);
      } catch {
        diagnostics.push({
          category: "area-index",
          severity: "error",
          message: `Truth document ${truthDocument} must stay inside the repository root.`,
          area: area.name,
          file: truthDocument,
        });
        areaHasTruthDocumentErrors = true;
        continue;
      }

      if (!(await pathExists(absoluteTruthDocumentPath))) {
        diagnostics.push({
          category: "area-index",
          severity: "error",
          message: `Missing truth document ${truthDocument}.`,
          area: area.name,
          file: truthDocument,
        });
        areaHasTruthDocumentErrors = true;
        continue;
      }

      if (!seenTruthDocumentPaths.has(truthDocument)) {
        seenTruthDocumentPaths.add(truthDocument);
        truthDocumentPaths.push(truthDocument);
      }

      const routedEntry = area.truthDocumentEntries.find((entry) => entry.path === truthDocument);

      if (routedEntry && !registerTruthDocumentEntry(routedEntry)) {
        areaHasTruthDocumentErrors = true;
      }
    }

    if (areaHasTruthDocumentErrors) {
      const matchingArea = areaCoverage.find(
        (entry) =>
          entry.area.name === area.name &&
          entry.area.truthDocuments.length === area.truthDocuments.length &&
          entry.area.truthDocuments.every(
            (truthDocument, index) => truthDocument === area.truthDocuments[index],
          ),
      );
      if (matchingArea) {
        matchingArea.valid = false;
      }
    }
  }

  for (const entry of areaCoverage) {
    const { area } = entry;
    for (const codeSurfaceEntry of area.codeSurface) {
      if (looksLikeGlob(codeSurfaceEntry)) {
        try {
          resolveRepoPath(rootDir, codeSurfaceEntry);
        } catch {
          diagnostics.push({
            category: "area-index",
            severity: "error",
            message: `Code surface ${codeSurfaceEntry} must stay inside the repository root.`,
            area: area.name,
            file: codeSurfaceEntry,
          });
          entry.valid = false;
          continue;
        }

        const matches = await fg([codeSurfaceEntry], {
          cwd: rootDir,
          onlyFiles: true,
          followSymbolicLinks: false,
        });

        let containedMatches = 0;

        for (const match of matches) {
          try {
            await assertRepoContainment(rootDir, resolveRepoPath(rootDir, match));
            containedMatches += 1;
          } catch {
            diagnostics.push({
              category: "area-index",
              severity: "error",
              message: `Code surface ${match} must stay inside the repository root.`,
              area: area.name,
              file: match,
            });
          }
        }

        if (containedMatches === 0) {
          diagnostics.push({
            category: "area-index",
            severity: "review",
            message: `Code surface glob ${codeSurfaceEntry} did not match any files.`,
            area: area.name,
            file: codeSurfaceEntry,
          });
        } else {
          entry.patterns.push(codeSurfaceEntry);
        }

        continue;
      }

      let absoluteCodeSurfacePath: string;

      try {
        absoluteCodeSurfacePath = resolveRepoPath(rootDir, codeSurfaceEntry);
        await assertRepoContainment(rootDir, absoluteCodeSurfacePath);
      } catch {
        diagnostics.push({
          category: "area-index",
          severity: "error",
          message: `Code surface ${codeSurfaceEntry} must stay inside the repository root.`,
          area: area.name,
          file: codeSurfaceEntry,
        });
        entry.valid = false;
        continue;
      }

      if (!(await pathExists(absoluteCodeSurfacePath))) {
        diagnostics.push({
          category: "area-index",
          severity: "error",
          message: `Missing code surface file ${codeSurfaceEntry}.`,
          area: area.name,
          file: codeSurfaceEntry,
        });
        continue;
      }

      entry.patterns.push(codeSurfaceEntry);
    }
  }

  for (const codeFile of codeFiles.sort()) {
    const matched = areaCoverage.some(
      (entry) =>
        entry.valid && entry.patterns.some((pattern) => micromatch.isMatch(codeFile, pattern)),
    );

    if (!matched) {
      diagnostics.push({
        category: "coverage",
        severity: "review",
        message: `Code file ${codeFile} is not covered by any Truthmark area mapping.`,
        file: codeFile,
      });
    }
  }

  const broadAreaCount = routing.areas.filter((area) =>
    area.codeSurface.some((pattern) => isBroadCodeSurface(pattern)),
  ).length;
  const topologyPressureCount =
    broadAreaCount +
    diagnostics.filter(
      (diagnostic) => diagnostic.category === "area-index" && diagnostic.severity === "review",
    ).length;

  return {
    diagnostics,
    truthDocumentPaths,
    truthDocumentEntries: [...truthDocumentEntryMap.values()],
    routePrecision: {
      leafAreaCount: routing.areas.length,
      broadAreaCount,
    },
    topologyPressureCount,
  };
};
