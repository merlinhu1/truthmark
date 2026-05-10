import fs from "node:fs/promises";

import fg from "fast-glob";
import matter from "gray-matter";

import { resolveRepoPath, toRepoRelativePath } from "../fs/paths.js";

export type DiscoveredMarkdownDocument = {
  path: string;
  title: string | null;
  hasFrontmatter: boolean;
};

const DISCOVERY_IGNORES = [
  "**/.git/**",
  "**/.github/instructions/**",
  "**/.github/prompts/**",
  "**/.claude/**",
  "**/.codex/**",
  "**/.gemini/**",
  "**/.opencode/**",
  "**/.truthmark/**",
  "**/node_modules/**",
  "**/vendor/**",
  "**/dist/**",
  "**/build/**",
  "commands/**",
  "skills/**",
  "AGENTS.md",
  "CLAUDE.md",
  "GEMINI.md",
  "TRUTHMARK.md",
  ".github/copilot-instructions.md",
  "docs/truthmark/**",
];

const extractTitle = (content: string): string | null => {
  const match = content.match(/^#\s+(.+)$/m);

  return match ? match[1].trim() : null;
};

export const discoverMarkdownDocuments = async (
  rootDir: string,
): Promise<DiscoveredMarkdownDocument[]> => {
  const markdownPaths = await fg(["**/*.md"], {
    cwd: rootDir,
    onlyFiles: true,
    ignore: DISCOVERY_IGNORES,
  });

  const documents = await Promise.all(
    markdownPaths.sort().map(async (relativePath) => {
      const absolutePath = resolveRepoPath(rootDir, relativePath);
      const source = await fs.readFile(absolutePath, "utf8");
      const parsed = matter(source);

      return {
        path: toRepoRelativePath(rootDir, absolutePath),
        title: extractTitle(parsed.content),
        hasFrontmatter: Object.keys(parsed.data).length > 0,
      } satisfies DiscoveredMarkdownDocument;
    }),
  );

  return documents;
};
