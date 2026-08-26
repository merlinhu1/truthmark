import { execFileSync } from "node:child_process";

/**
 * Lists tracked Markdown files so documentation checks cover exactly what the
 * repository ships or reviews, ignoring build output and untracked scratch.
 */
export const listRepoMarkdownFiles = (): string[] => {
  return execFileSync("git", ["ls-files", "*.md"], {
    cwd: process.cwd(),
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .sort();
};
