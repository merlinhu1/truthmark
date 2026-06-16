import path from "node:path";

import { parseFrontmatter } from "../markdown/frontmatter.js";

const repoRootPrefixes = [
  ".codex/",
  ".github/",
  ".truthmark/",
  "docs/",
  "src/",
  "tests/",
];
const sourceReferencesHeadingPattern = /^##\s+Source References\s*$/imu;
const nextSecondLevelHeadingPattern = /^##\s+/imu;
const bulletReferencePattern = /^\s*[-*]\s+(.+?)\s*$/u;
const markdownLinkPattern = /^\s*\[[^\]]+\]\(([^)]+)\)\s*$/u;
const backtickPathPattern = /^\s*`([^`]+)`\s*$/u;

export const normalizeSourceReferencePath = (
  truthDocPath: string,
  referencePath: string,
): string => {
  const strippedPath = referencePath.split("#")[0]?.trim() ?? "";
  const isRepoRelative = repoRootPrefixes.some((prefix) =>
    strippedPath.startsWith(prefix),
  );

  if (
    !isRepoRelative &&
    (strippedPath.startsWith(".") || !strippedPath.includes("/"))
  ) {
    return path.posix.normalize(
      path.posix.join(path.posix.dirname(truthDocPath), strippedPath),
    );
  }

  return path.posix.normalize(strippedPath);
};

const normalizeReferenceText = (value: string): string => {
  const trimmed = value.trim();
  const markdownLinkMatch = markdownLinkPattern.exec(trimmed);
  if (markdownLinkMatch) {
    return markdownLinkMatch[1]?.trim() ?? "";
  }

  const backtickMatch = backtickPathPattern.exec(trimmed);
  if (backtickMatch) {
    return backtickMatch[1]?.trim() ?? "";
  }

  return trimmed;
};

const parseSourceReferencesSection = (content: string): string[] => {
  const headingMatch = sourceReferencesHeadingPattern.exec(content);
  if (!headingMatch || typeof headingMatch.index !== "number") {
    return [];
  }

  const sectionStart = headingMatch.index + headingMatch[0].length;
  const afterHeading = content.slice(sectionStart);
  const nextHeadingMatch = nextSecondLevelHeadingPattern.exec(afterHeading);
  const section = nextHeadingMatch
    ? afterHeading.slice(0, nextHeadingMatch.index)
    : afterHeading;
  const references: string[] = [];

  for (const line of section.split("\n")) {
    const bulletMatch = bulletReferencePattern.exec(line);
    if (!bulletMatch) {
      continue;
    }

    const reference = normalizeReferenceText(bulletMatch[1] ?? "");
    if (reference.length > 0 && !reference.startsWith("{{")) {
      references.push(reference);
    }
  }

  return references;
};

export const parseSourceReferences = (
  source: string,
  truthDocPath: string,
): string[] => {
  const parsed = parseFrontmatter(source);
  const references = new Set<string>();
  const frontmatterSourceOfTruth = Array.isArray(parsed.data.source_of_truth)
    ? parsed.data.source_of_truth
    : [];

  for (const entry of frontmatterSourceOfTruth) {
    if (typeof entry === "string") {
      references.add(normalizeSourceReferencePath(truthDocPath, entry));
    }
  }

  for (const entry of parseSourceReferencesSection(parsed.content)) {
    references.add(normalizeSourceReferencePath(truthDocPath, entry));
  }

  return [...references].sort();
};
