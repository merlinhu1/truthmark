import fs from "node:fs/promises";

import type { TruthmarkConfig } from "../config/schema.js";
import { assertRepoContainment, resolveRepoPath } from "../fs/paths.js";
import { parseMarkdownDocument } from "../markdown/parse.js";
import type { Diagnostic } from "../output/diagnostic.js";
import {
  TRUTH_DOCUMENT_KINDS,
  type TruthDocumentEntry,
  type TruthDocumentKind,
} from "../routing/areas.js";

const isTruthDocumentKind = (
  value: string,
): value is TruthDocumentKind =>
  TRUTH_DOCUMENT_KINDS.includes(value as TruthDocumentKind);

export const checkFrontmatter = async (
  rootDir: string,
  config: TruthmarkConfig,
  markdownPaths: string[],
  truthDocumentEntries: TruthDocumentEntry[] = [],
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];
  const truthDocumentMap = new Map(
    truthDocumentEntries.map((entry) => [entry.path, entry]),
  );

  for (const markdownPath of markdownPaths) {
    if (!markdownPath.endsWith(".md")) {
      continue;
    }

    const absolutePath = resolveRepoPath(rootDir, markdownPath);

    await assertRepoContainment(rootDir, absolutePath);

    const source = await fs.readFile(absolutePath, "utf8");
    let document;

    try {
      document = parseMarkdownDocument(source);
    } catch (error: unknown) {
      diagnostics.push({
        category: "frontmatter",
        severity: "error",
        message: `Invalid frontmatter: ${error instanceof Error ? error.message : String(error)}`,
        file: markdownPath,
      });
      continue;
    }

    for (const field of config.frontmatter.required) {
      if (!(field in document.frontmatter)) {
        diagnostics.push({
          category: "frontmatter",
          severity: "error",
          message: `Missing required frontmatter field ${field}.`,
          file: markdownPath,
        });
      }
    }

    for (const field of config.frontmatter.recommended) {
      if (!(field in document.frontmatter)) {
        diagnostics.push({
          category: "frontmatter",
          severity: "review",
          message: `Missing recommended frontmatter field ${field}.`,
          file: markdownPath,
        });
      }
    }

    const routedTruthDocument = truthDocumentMap.get(markdownPath);
    const truthKind = document.frontmatter.truth_kind;

    if (truthKind !== undefined) {
      if (typeof truthKind !== "string" || !isTruthDocumentKind(truthKind)) {
        diagnostics.push({
          category: "frontmatter",
          severity: "error",
          message: `Frontmatter truth_kind must be one of ${TRUTH_DOCUMENT_KINDS.join(", ")}.`,
          file: markdownPath,
        });
        continue;
      }

      if (
        routedTruthDocument &&
        routedTruthDocument.kindSource !== "defaulted" &&
        truthKind !== routedTruthDocument.kind
      ) {
        diagnostics.push({
          category: "frontmatter",
          severity: "error",
          message: `Frontmatter truth_kind ${truthKind} must match routed truth kind ${routedTruthDocument.kind}.`,
          file: markdownPath,
        });
      }
    }
  }

  return diagnostics;
};