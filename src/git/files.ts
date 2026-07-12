import fs from "node:fs/promises";

import { execa } from "execa";
import fg from "fast-glob";
import micromatch from "micromatch";

import { assertRepoContainment, resolveRepoPath } from "../fs/paths.js";

const defaultIgnore = [".git/**", "node_modules/**", "dist/**", "build/**"];

const normalizePath = (filePath: string): string =>
  filePath.replaceAll("\\", "/").replace(/^\.\/+/u, "");

const isIgnoredPath = (filePath: string, ignorePatterns: string[]): boolean =>
  micromatch.isMatch(filePath, [...defaultIgnore, ...ignorePatterns]);

const gitDiscoverableFiles = async (
  rootDir: string,
): Promise<string[] | null> => {
  try {
    const result = await execa(
      "git",
      [
        "ls-files",
        "-z",
        "--cached",
        "--others",
        "--exclude-standard",
        "--deduplicate",
      ],
      {
        cwd: rootDir,
        reject: false,
        stripFinalNewline: false,
      },
    );

    if ((result.exitCode ?? 1) !== 0) {
      return null;
    }

    return result.stdout
      .split("\0")
      .filter((filePath) => filePath.length > 0)
      .map(normalizePath);
  } catch {
    return null;
  }
};

const isCurrentContainedFile = async (
  rootDir: string,
  relativePath: string,
): Promise<boolean> => {
  try {
    const absolutePath = resolveRepoPath(rootDir, relativePath);
    await assertRepoContainment(rootDir, absolutePath);
    return (await fs.stat(absolutePath)).isFile();
  } catch {
    return false;
  }
};

/**
 * Enumerates current Git-visible regular files, with a local full-tree fallback
 * when Git enumeration is unavailable. Returned paths are normalized,
 * repository-relative, sorted, and deduplicated.
 */
export const discoverRepositoryFilePaths = async (
  rootDir: string,
  ignorePatterns: string[],
): Promise<string[]> => {
  const discoveredPaths =
    (await gitDiscoverableFiles(rootDir)) ??
    (await fg(["**/*"], {
      cwd: rootDir,
      onlyFiles: true,
      dot: true,
      ignore: [...defaultIgnore, ...ignorePatterns],
      followSymbolicLinks: false,
    }));
  const paths = [...new Set(discoveredPaths.map(normalizePath))]
    .filter((filePath) => !isIgnoredPath(filePath, ignorePatterns))
    .sort();
  const currentPaths = await Promise.all(
    paths.map(async (filePath) => {
      return (await isCurrentContainedFile(rootDir, filePath))
        ? filePath
        : null;
    }),
  );

  return currentPaths.filter(
    (filePath): filePath is string => filePath !== null,
  );
};
