import fs from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";

import { parseFrontmatter } from "../markdown/frontmatter.js";

import type { EvidenceReference } from "./types.js";
import {
  normalizeSourceReferencePath,
  parseSourceReferences,
} from "../truth/source-references.js";

const yamlFencePattern = /```ya?ml\s*\n([\s\S]*?)```/giu;
const topLevelEvidenceMarkerPattern = /^evidence\s*:/imu;

const toEvidenceReference = (
  truthDocPath: string,
  raw: unknown,
): EvidenceReference | null => {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("path" in raw) ||
    typeof raw.path !== "string"
  ) {
    return null;
  }

  return {
    truthDocPath,
    path: normalizeSourceReferencePath(truthDocPath, raw.path),
    symbol:
      "symbol" in raw && typeof raw.symbol === "string"
        ? raw.symbol
        : undefined,
    startLine:
      "start_line" in raw && typeof raw.start_line === "number"
        ? raw.start_line
        : undefined,
    endLine:
      "end_line" in raw && typeof raw.end_line === "number"
        ? raw.end_line
        : undefined,
    contentHash:
      "content_hash" in raw && typeof raw.content_hash === "string"
        ? raw.content_hash
        : undefined,
    source: "evidence-block",
  };
};

export const parseEvidenceReferences = async (
  rootDir: string,
  truthDocPath: string,
): Promise<EvidenceReference[]> => {
  const source = await fs.readFile(path.join(rootDir, truthDocPath), "utf8");
  const parsed = parseFrontmatter(source);
  const references: EvidenceReference[] = [];

  for (const entry of parseSourceReferences(source, truthDocPath)) {
    references.push({
      truthDocPath,
      path: entry,
      source: "source-references",
    });
  }

  for (const match of parsed.content.matchAll(yamlFencePattern)) {
    const yamlBlock = match[1] ?? "";
    if (!topLevelEvidenceMarkerPattern.test(yamlBlock)) {
      continue;
    }

    const block = parse(yamlBlock) as unknown;
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
