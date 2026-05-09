import fs from "node:fs/promises";

import { execa } from "execa";

import type { UncommittedChange } from "../git/changes.js";
import { getGitRepository, resolveWorktreePath } from "../git/repository.js";
import { classifyPath } from "./classify.js";

export type ChangedSurfaceSegment = {
  startLine: number;
  endLine: number;
  content: string;
};

export type ChangedSurface = {
  path: string;
  mode: "diff" | "excerpt" | "deleted";
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
  deleted: boolean;
  segments: ChangedSurfaceSegment[];
};

export type BuildChangedSurfacesOptions = {
  contextLines?: number;
  maxUntrackedLines?: number;
};

type LineRange = {
  startLine: number;
  endLine: number;
};

const DEFAULT_CONTEXT_LINES = 2;
const DEFAULT_MAX_UNTRACKED_LINES = 40;

const parseDiffRanges = (diff: string): LineRange[] => {
  const ranges: LineRange[] = [];

  for (const line of diff.split("\n")) {
    const match = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/u);

    if (!match) {
      continue;
    }

    const startLine = Number.parseInt(match[1] ?? "1", 10);
    const changedLineCount = Number.parseInt(match[2] ?? "1", 10);
    const endLine = changedLineCount === 0 ? startLine : startLine + changedLineCount - 1;

    ranges.push({ startLine, endLine });
  }

  return ranges;
};

const mergeRanges = (ranges: LineRange[]): LineRange[] => {
  if (ranges.length === 0) {
    return [];
  }

  const sortedRanges = [...ranges].sort((left, right) => {
    return left.startLine - right.startLine;
  });
  const mergedRanges: LineRange[] = [sortedRanges[0]!];

  for (const range of sortedRanges.slice(1)) {
    const previousRange = mergedRanges.at(-1)!;

    if (range.startLine <= previousRange.endLine + 1) {
      previousRange.endLine = Math.max(previousRange.endLine, range.endLine);
      continue;
    }

    mergedRanges.push({ ...range });
  }

  return mergedRanges;
};

const buildSegments = (
  source: string,
  ranges: LineRange[],
  contextLines: number,
): ChangedSurfaceSegment[] => {
  const fileLines = source.split("\n");
  const expandedRanges = ranges.map((range) => {
    return {
      startLine: Math.max(1, range.startLine - contextLines),
      endLine: Math.min(fileLines.length, range.endLine + contextLines),
    };
  });

  return mergeRanges(expandedRanges).map((range) => {
    return {
      startLine: range.startLine,
      endLine: range.endLine,
      content: fileLines.slice(range.startLine - 1, range.endLine).join("\n"),
    };
  });
};

const readSurfaceSource = async (rootDir: string, relativePath: string): Promise<string> => {
  return fs.readFile(resolveWorktreePath({ worktreePath: rootDir }, relativePath), "utf8");
};

const getTrackedDiff = async (rootDir: string, change: UncommittedChange): Promise<string> => {
  const headDiff = await execa(
    "git",
    ["diff", "--no-color", "--no-ext-diff", "-U0", "HEAD", "--", change.path],
    { cwd: rootDir, reject: false },
  );

  if ((headDiff.exitCode ?? 0) !== 128) {
    return headDiff.stdout;
  }

  const diffParts: string[] = [];

  if (change.staged) {
    diffParts.push(
      (
        await execa(
          "git",
          ["diff", "--no-color", "--no-ext-diff", "--cached", "-U0", "--", change.path],
          { cwd: rootDir, reject: false },
        )
      ).stdout,
    );
  }

  if (change.unstaged) {
    diffParts.push(
      (
        await execa("git", ["diff", "--no-color", "--no-ext-diff", "-U0", "--", change.path], {
          cwd: rootDir,
          reject: false,
        })
      ).stdout,
    );
  }

  return diffParts.filter((part) => part.length > 0).join("\n");
};

const buildExcerptSurface = async (
  rootDir: string,
  change: UncommittedChange,
  maxUntrackedLines: number,
): Promise<ChangedSurface> => {
  const source = await readSurfaceSource(rootDir, change.path);
  const fileLines = source.split("\n").slice(0, maxUntrackedLines);

  return {
    path: change.path,
    mode: "excerpt",
    staged: change.staged,
    unstaged: change.unstaged,
    untracked: change.untracked,
    deleted: false,
    segments: [
      {
        startLine: 1,
        endLine: fileLines.length,
        content: fileLines.join("\n"),
      },
    ],
  };
};

const buildDiffSurface = async (
  rootDir: string,
  change: UncommittedChange,
  contextLines: number,
  maxUntrackedLines: number,
): Promise<ChangedSurface> => {
  const diff = await getTrackedDiff(rootDir, change);
  const ranges = parseDiffRanges(diff);

  if (ranges.length === 0) {
    return buildExcerptSurface(rootDir, change, maxUntrackedLines);
  }

  const source = await readSurfaceSource(rootDir, change.path);

  return {
    path: change.path,
    mode: "diff",
    staged: change.staged,
    unstaged: change.unstaged,
    untracked: change.untracked,
    deleted: false,
    segments: buildSegments(source, ranges, contextLines),
  };
};

const buildDeletedSurface = (change: UncommittedChange): ChangedSurface => {
  return {
    path: change.path,
    mode: "deleted",
    staged: change.staged,
    unstaged: change.unstaged,
    untracked: change.untracked,
    deleted: true,
    segments: [],
  };
};

export const buildChangedSurfaces = async (
  cwd: string,
  changes: UncommittedChange[],
  ignorePatterns: string[],
  options: BuildChangedSurfacesOptions = {},
): Promise<ChangedSurface[]> => {
  const repository = await getGitRepository(cwd);
  const rootDir = repository.worktreePath;
  const contextLines = options.contextLines ?? DEFAULT_CONTEXT_LINES;
  const maxUntrackedLines = options.maxUntrackedLines ?? DEFAULT_MAX_UNTRACKED_LINES;
  const functionalChanges = changes.filter((change) => {
    return classifyPath(change.path, ignorePatterns) === "functional-code";
  });
  const surfaces: ChangedSurface[] = [];

  for (const change of functionalChanges) {
    if (change.deleted) {
      surfaces.push(buildDeletedSurface(change));
      continue;
    }

    if (change.untracked && !change.staged && !change.unstaged) {
      surfaces.push(await buildExcerptSurface(rootDir, change, maxUntrackedLines));
      continue;
    }

    surfaces.push(await buildDiffSurface(rootDir, change, contextLines, maxUntrackedLines));
  }

  return surfaces;
};