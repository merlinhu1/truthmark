import fs from "node:fs/promises";

import type { TruthmarkConfig } from "../config/schema.js";
import { assertRepoContainment, resolveRepoPath } from "../fs/paths.js";
import { parseMarkdownDocument } from "../markdown/parse.js";
import type { Diagnostic } from "../output/diagnostic.js";

export const checkFrontmatter = async (
  rootDir: string,
  config: TruthmarkConfig,
  markdownPaths: string[],
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

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
  }

  return diagnostics;
};