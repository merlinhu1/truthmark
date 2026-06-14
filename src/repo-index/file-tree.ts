import fs from "node:fs/promises";
import path from "node:path";

import { execa } from "execa";
import fg from "fast-glob";
import matter from "gray-matter";
import micromatch from "micromatch";

import { parseMarkdownDocument } from "../markdown/parse.js";
import {
  TRUTH_DOCUMENT_KINDS,
  docTypeForTruthDocumentKind,
  laneForTruthDocumentKind,
  type TruthDocumentKind,
} from "../routing/areas.js";
import { classifyPath } from "../sync/classify.js";
import type { RepoDocEntry, RepoFileEntry, RepoFileKind, RepoTestEntry } from "./types.js";

const languageByExtension = new Map<string, string>([
  [".ts", "typescript"],
  [".tsx", "typescript"],
  [".js", "javascript"],
  [".jsx", "javascript"],
  [".mjs", "javascript"],
  [".cjs", "javascript"],
  [".md", "markdown"],
  [".json", "json"],
  [".yml", "yaml"],
  [".yaml", "yaml"],
  [".toml", "toml"],
]);

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

export const isJavaScriptLikePath = (filePath: string): boolean => {
  return sourceExtensions.has(path.posix.extname(filePath));
};

const isTestPath = (filePath: string): boolean => {
  return (
    filePath.startsWith("tests/") ||
    filePath.includes("/__tests__/") ||
    /(?:^|[./-])(test|spec)\.[cm]?[jt]sx?$/u.test(path.posix.basename(filePath))
  );
};

const fileKind = (filePath: string, ignore: string[]): RepoFileKind => {
  const classification = classifyPath(filePath, ignore);
  if (classification === "derived") {
    return "generated";
  }
  if (isTestPath(filePath)) {
    return "test";
  }
  if (filePath.endsWith(".md")) {
    return "doc";
  }
  if (classification === "functional-code") {
    return "source";
  }
  if (classification === "markdown") {
    return "doc";
  }
  if (classification === "config") {
    return "config";
  }

  return "other";
};

const targetHintsForTest = (filePath: string): string[] => {
  const hints = new Set<string>();
  const basename = path.posix.basename(filePath).replace(/\.(test|spec)\.[cm]?[jt]sx?$/u, "");
  if (basename.length > 0) {
    hints.add(basename);
  }

  const segments = filePath.split("/");
  const testRootIndex = segments.findIndex((segment) => segment === "tests" || segment === "__tests__");
  if (testRootIndex >= 0) {
    for (const segment of segments.slice(testRootIndex + 1, -1)) {
      if (segment.length > 0) {
        hints.add(segment);
      }
    }
  }

  return [...hints].sort();
};

const defaultIgnore = [".git/**", "node_modules/**", "dist/**", "build/**"];

const normalizePath = (filePath: string): string => filePath.replaceAll("\\", "/").replace(/^\.\/+/u, "");

const isTruthDocumentKind = (value: unknown): value is TruthDocumentKind => {
  return (
    typeof value === "string" &&
    TRUTH_DOCUMENT_KINDS.includes(value as TruthDocumentKind)
  );
};

const gitDiscoverableFiles = async (rootDir: string): Promise<string[] | null> => {
  const result = await execa(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "--deduplicate"],
    {
      cwd: rootDir,
      reject: false,
    },
  );
  if ((result.exitCode ?? 1) !== 0) {
    return null;
  }
  return result.stdout
    .split("\n")
    .map((line) => normalizePath(line.trim()))
    .filter((line) => line.length > 0);
};

const isIgnoredPath = (filePath: string, ignore: string[]): boolean => {
  return micromatch.isMatch(filePath, [...defaultIgnore, ...ignore]);
};

export const discoverRepoFiles = async (
  rootDir: string,
  ignore: string[],
): Promise<{ files: RepoFileEntry[]; docs: RepoDocEntry[]; tests: RepoTestEntry[] }> => {
  const discoveredFiles =
    (await gitDiscoverableFiles(rootDir)) ??
    (await fg(["**/*"], {
      cwd: rootDir,
      onlyFiles: true,
      dot: true,
      ignore: [...defaultIgnore, ...ignore],
      followSymbolicLinks: false,
    }));
  const files: RepoFileEntry[] = [];
  const docs: RepoDocEntry[] = [];
  const tests: RepoTestEntry[] = [];

  for (const filePath of discoveredFiles.filter((entry) => !isIgnoredPath(entry, ignore)).sort()) {
    let stat: Awaited<ReturnType<typeof fs.stat>>;
    try {
      stat = await fs.stat(path.join(rootDir, filePath));
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    if (!stat.isFile()) {
      continue;
    }

    const extension = path.posix.extname(filePath);
    const kind = fileKind(filePath, ignore);

    files.push({
      path: filePath,
      kind,
      language: languageByExtension.get(extension) ?? null,
    });

    if (kind === "test") {
      tests.push({
        path: filePath,
        targetHints: targetHintsForTest(filePath),
      });
    }

    if (kind === "doc") {
      const source = await fs.readFile(path.join(rootDir, filePath), "utf8");
      const parsed = matter(source);
      const markdown = parseMarkdownDocument(parsed.content);
      const title = markdown.headings.find((heading) => heading.depth === 1)?.text ?? null;
      const sourceOfTruth = Array.isArray(parsed.data.source_of_truth)
        ? parsed.data.source_of_truth.filter((entry: unknown): entry is string => typeof entry === "string")
        : [];
      const realizedBy = Array.isArray(parsed.data.realized_by)
        ? parsed.data.realized_by.filter((entry: unknown): entry is string => typeof entry === "string")
        : [];
      const realizes = Array.isArray(parsed.data.realizes)
        ? parsed.data.realizes.filter((entry: unknown): entry is string => typeof entry === "string")
        : [];
      const dependsOn = Array.isArray(parsed.data.depends_on)
        ? parsed.data.depends_on.filter((entry: unknown): entry is string => typeof entry === "string")
        : [];
      const truthKind = typeof parsed.data.truth_kind === "string" ? parsed.data.truth_kind : null;
      const derivedTruthKind = isTruthDocumentKind(truthKind) ? truthKind : null;

      docs.push({
        path: filePath,
        title,
        docType:
          typeof parsed.data.doc_type === "string"
            ? parsed.data.doc_type
            : derivedTruthKind
              ? docTypeForTruthDocumentKind(derivedTruthKind)
              : null,
        truthKind,
        truthLane:
          typeof parsed.data.truth_lane === "string"
            ? parsed.data.truth_lane
            : derivedTruthKind
              ? laneForTruthDocumentKind(derivedTruthKind)
              : null,
        sourceOfTruth: sourceOfTruth.sort(),
        realizedBy: realizedBy.sort(),
        realizes: realizes.sort(),
        dependsOn: dependsOn.sort(),
      });
    }
  }

  return {
    files: files.sort((left, right) => left.path.localeCompare(right.path)),
    docs: docs.sort((left, right) => left.path.localeCompare(right.path)),
    tests: tests.sort((left, right) => left.path.localeCompare(right.path)),
  };
};
