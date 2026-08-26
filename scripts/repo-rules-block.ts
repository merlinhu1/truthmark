import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Renders the always-on subset of docs/repo/ai/repo-rules.md into the
 * repo-local managed region carried by AGENTS.md and CLAUDE.md.
 *
 * This is repo-local tooling, not part of the shipped product. The source doc
 * stays the authority; the region in each instruction file is generated output.
 */

export const REPO_RULES_SOURCE = "docs/repo/ai/repo-rules.md";
export const REPO_RULES_BLOCK_START = "<!-- repo-rules:start -->";
export const REPO_RULES_BLOCK_END = "<!-- repo-rules:end -->";
export const INSTRUCTION_FILES = ["AGENTS.md", "CLAUDE.md"];

const ALWAYS_ON_START = "<!-- always-on:start -->";
const ALWAYS_ON_END = "<!-- always-on:end -->";
const GENERATED_NOTICE = `<!-- Generated from ${REPO_RULES_SOURCE} by \`node --import tsx scripts/render-repo-rules.ts\`. Edit the source doc, not this block. -->`;

const sourceDir = path.posix.dirname(REPO_RULES_SOURCE);

const normalizeLineEndings = (content: string): string =>
  content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

const lineEndingFor = (content: string): "\n" | "\r\n" =>
  content.includes("\r\n") ? "\r\n" : "\n";

const withLineEnding = (content: string, lineEnding: "\n" | "\r\n"): string =>
  normalizeLineEndings(content).replace(/\n/g, lineEnding);

/**
 * Rewrites links that were relative to the source doc so they resolve from the
 * repository root, where the instruction files live.
 */
const rewriteRelativeLinks = (markdown: string): string => {
  return markdown.replace(
    /\[([^\]]*)\]\(([^)]+)\)/g,
    (match, label: string, target: string) => {
      const trimmed = target.trim();

      if (/^(https?:|mailto:|#)/.test(trimmed)) {
        return match;
      }

      return `[${label}](${path.posix.normalize(path.posix.join(sourceDir, trimmed))})`;
    },
  );
};

export const renderRepoRulesBlock = (rootDir: string): string => {
  const source = readFileSync(path.join(rootDir, REPO_RULES_SOURCE), "utf8");
  const start = source.indexOf(ALWAYS_ON_START);
  const end = source.indexOf(ALWAYS_ON_END);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `${REPO_RULES_SOURCE} must contain ${ALWAYS_ON_START} before ${ALWAYS_ON_END}.`,
    );
  }

  const alwaysOn = source.slice(start + ALWAYS_ON_START.length, end).trim();

  return [
    REPO_RULES_BLOCK_START,
    GENERATED_NOTICE,
    "",
    rewriteRelativeLinks(alwaysOn),
    "",
    REPO_RULES_BLOCK_END,
  ].join("\n");
};

const countOccurrences = (content: string, marker: string): number => {
  return content.split(marker).length - 1;
};

/**
 * Mirrors src/managed-block.ts: a duplicated marker means the region cannot be
 * replaced safely, so fail loudly instead of corrupting the file.
 */
export const extractRepoRulesBlock = (content: string): string | null => {
  const starts = countOccurrences(content, REPO_RULES_BLOCK_START);
  const ends = countOccurrences(content, REPO_RULES_BLOCK_END);

  if (starts === 0 && ends === 0) {
    return null;
  }

  if (starts !== 1 || ends !== 1) {
    throw new Error(
      `Repo-local rules markers are malformed: found ${starts} start and ${ends} end markers.`,
    );
  }

  const start = content.indexOf(REPO_RULES_BLOCK_START);
  const end = content.indexOf(REPO_RULES_BLOCK_END);

  if (end < start) {
    throw new Error("Repo-local rules end marker precedes its start marker.");
  }

  return content.slice(start, end + REPO_RULES_BLOCK_END.length);
};

export const upsertRepoRulesBlock = (
  existingContent: string,
  block: string,
): string => {
  const current = extractRepoRulesBlock(existingContent);

  if (current !== null) {
    if (normalizeLineEndings(current) === normalizeLineEndings(block)) {
      return existingContent;
    }

    // Function replacer: a string replacement would interpret $&, $1, and
    // friends, silently corrupting rules text that contains them.
    return existingContent.replace(current, () =>
      withLineEnding(block, lineEndingFor(existingContent)),
    );
  }

  const lineEnding = lineEndingFor(existingContent);
  const renderedBlock = withLineEnding(block, lineEnding);

  const truthmarkStart = existingContent.indexOf("<!-- truthmark:start -->");

  if (truthmarkStart === -1) {
    return `${existingContent.replace(/[\r\n]+$/u, "")}${lineEnding}${lineEnding}${renderedBlock}${lineEnding}`;
  }

  const before = existingContent
    .slice(0, truthmarkStart)
    .replace(/[\r\n]+$/u, "");
  const after = existingContent.slice(truthmarkStart);

  return `${before}${lineEnding}${lineEnding}${renderedBlock}${lineEnding}${lineEnding}${after}`;
};
