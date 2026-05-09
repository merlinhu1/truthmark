import fs from "node:fs/promises";
import path from "node:path";

import { assertRepoContainment, resolveRepoPath, toRepoRelativePath } from "../fs/paths.js";
import { parseMarkdownDocument } from "../markdown/parse.js";
import type { Diagnostic } from "../output/diagnostic.js";

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

export const checkLinks = async (
  rootDir: string,
  markdownPaths: string[],
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

  for (const markdownPath of markdownPaths) {
    if (!markdownPath.endsWith(".md")) {
      continue;
    }

    const absolutePath = resolveRepoPath(rootDir, markdownPath);
    const source = await fs.readFile(absolutePath, "utf8");
    let document;

    try {
      document = parseMarkdownDocument(source);
    } catch {
      continue;
    }

    for (const link of document.internalLinks) {
      if (link.startsWith("#")) {
        continue;
      }

      const targetPath = link.split("#")[0] ?? "";

      if (targetPath.length === 0) {
        continue;
      }

      const absoluteTarget = path.resolve(path.dirname(absolutePath), targetPath);
      const relativeTarget = toRepoRelativePath(rootDir, absoluteTarget);

      try {
        await assertRepoContainment(rootDir, absoluteTarget);
      } catch {
        diagnostics.push({
          category: "links",
          severity: "error",
          message: `Internal link to ${relativeTarget} must stay inside the repository root.`,
          file: markdownPath,
        });
        continue;
      }

      if (!(await pathExists(absoluteTarget))) {
        diagnostics.push({
          category: "links",
          severity: "error",
          message: `Broken internal link to ${relativeTarget}.`,
          file: markdownPath,
        });
      }
    }
  }

  return diagnostics;
};