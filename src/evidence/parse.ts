import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { parse } from "yaml";

import type { EvidenceReference } from "./types.js";

const evidenceBlockPattern = /```ya?ml\s*\n([\s\S]*?)```/giu;

const repoRootPrefixes = [".codex/", ".github/", ".truthmark/", "docs/", "src/", "tests/"];

const normalizeReferencePath = (truthDocPath: string, referencePath: string): string => {
  const strippedPath = referencePath.split("#")[0]?.trim() ?? "";
  const isRepoRelative = repoRootPrefixes.some((prefix) => strippedPath.startsWith(prefix));

  if (!isRepoRelative && (strippedPath.startsWith(".") || !strippedPath.includes("/"))) {
    return path.posix.normalize(path.posix.join(path.posix.dirname(truthDocPath), strippedPath));
  }

  return path.posix.normalize(strippedPath);
};

const toEvidenceReference = (
  truthDocPath: string,
  raw: unknown,
): EvidenceReference | null => {
  if (!raw || typeof raw !== "object" || !("path" in raw) || typeof raw.path !== "string") {
    return null;
  }

  return {
    truthDocPath,
    path: normalizeReferencePath(truthDocPath, raw.path),
    symbol: "symbol" in raw && typeof raw.symbol === "string" ? raw.symbol : undefined,
    startLine: "start_line" in raw && typeof raw.start_line === "number" ? raw.start_line : undefined,
    endLine: "end_line" in raw && typeof raw.end_line === "number" ? raw.end_line : undefined,
    contentHash:
      "content_hash" in raw && typeof raw.content_hash === "string" ? raw.content_hash : undefined,
    source: "evidence-block",
  };
};

export const parseEvidenceReferences = async (
  rootDir: string,
  truthDocPath: string,
): Promise<EvidenceReference[]> => {
  const source = await fs.readFile(path.join(rootDir, truthDocPath), "utf8");
  const parsed = matter(source);
  const references: EvidenceReference[] = [];
  const sourceOfTruth = Array.isArray(parsed.data.source_of_truth) ? parsed.data.source_of_truth : [];

  for (const entry of sourceOfTruth) {
    if (typeof entry !== "string") {
      continue;
    }

    references.push({
      truthDocPath,
      path: normalizeReferencePath(truthDocPath, entry),
      source: "frontmatter",
    });
  }

  for (const match of parsed.content.matchAll(evidenceBlockPattern)) {
    const block = parse(match[1] ?? "") as unknown;
    const rawEvidence =
      block && typeof block === "object" && "evidence" in block
        ? (block as { evidence?: unknown }).evidence
        : null;

    if (!Array.isArray(rawEvidence)) {
      continue;
    }

    for (const rawReference of rawEvidence) {
      const reference = toEvidenceReference(truthDocPath, rawReference);
      if (reference) {
        references.push(reference);
      }
    }
  }

  return references;
};
