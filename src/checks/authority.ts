import fs from "node:fs/promises";

import fg from "fast-glob";

import type { TruthmarkConfig } from "../config/schema.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { assertRepoContainment, resolveRepoPath } from "../fs/paths.js";

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

export type AuthorityCheckResult = {
  paths: string[];
  diagnostics: Diagnostic[];
};

export const checkAuthority = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<AuthorityCheckResult> => {
  const diagnostics: Diagnostic[] = [];
  const orderedPaths: string[] = [];
  const seenPaths = new Set<string>();

  for (const entry of config.authority) {
    if (looksLikeGlob(entry)) {
      try {
        resolveRepoPath(rootDir, entry);
      } catch {
        diagnostics.push({
          category: "authority",
          severity: "error",
          message: `Authority entry ${entry} must stay inside the repository root.`,
          file: entry,
        });
        continue;
      }

      const matches = (await fg([entry], { cwd: rootDir, onlyFiles: true })).sort();

      if (matches.length === 0) {
        diagnostics.push({
          category: "authority",
          severity: "review",
          message: `Authority glob ${entry} did not match any files.`,
          file: entry,
        });
      }

      for (const match of matches) {
        try {
          const absoluteMatchPath = resolveRepoPath(rootDir, match);
          await assertRepoContainment(rootDir, absoluteMatchPath);
        } catch {
          diagnostics.push({
            category: "authority",
            severity: "error",
            message: `Authority path ${match} must stay inside the repository root.`,
            file: match,
          });
          continue;
        }

        if (!seenPaths.has(match)) {
          seenPaths.add(match);
          orderedPaths.push(match);
        }
      }

      continue;
    }

    let absoluteEntryPath: string;

    try {
      absoluteEntryPath = resolveRepoPath(rootDir, entry);
      await assertRepoContainment(rootDir, absoluteEntryPath);
    } catch {
      diagnostics.push({
        category: "authority",
        severity: "error",
        message: `Authority entry ${entry} must stay inside the repository root.`,
        file: entry,
      });
      continue;
    }

    if (!(await pathExists(absoluteEntryPath))) {
      diagnostics.push({
        category: "authority",
        severity: "error",
        message: `Missing authority file ${entry}.`,
        file: entry,
      });
      continue;
    }

    if (!seenPaths.has(entry)) {
      seenPaths.add(entry);
      orderedPaths.push(entry);
    }
  }

  return {
    paths: orderedPaths,
    diagnostics,
  };
};