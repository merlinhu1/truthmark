import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, it } from "node:test";
import { expect } from "expect";

const REPO_LOCAL_ROOT = "docs/repo";
const REPO_LOCAL_SCOPE = "scope: repo-local";

const markdownFilesUnder = (relativeDir: string): string[] => {
  return readdirSync(join(process.cwd(), relativeDir), { recursive: true })
    .map((entry) => String(entry).replaceAll("\\", "/"))
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => `${relativeDir}/${entry}`)
    .sort();
};

const frontmatterOf = (relativePath: string): string => {
  const source = readFileSync(join(process.cwd(), relativePath), "utf8");
  const match = /^---\n([\s\S]*?)\n---/u.exec(source);

  return match?.[1] ?? "";
};

describe("repo-local documentation scope", () => {
  it("declares repo-local scope on every doc under docs/repo", () => {
    const missingScope = markdownFilesUnder(REPO_LOCAL_ROOT).filter(
      (relativePath) => !frontmatterOf(relativePath).includes(REPO_LOCAL_SCOPE),
    );

    expect(missingScope).toEqual([]);
  });

  it("keeps repo-local scope out of published product documentation", () => {
    const publishedRoots = ["docs/truthmark", "docs/readmes"];
    const leaked = publishedRoots
      .flatMap((root) => markdownFilesUnder(root))
      .filter((relativePath) =>
        frontmatterOf(relativePath).includes(REPO_LOCAL_SCOPE),
      );

    expect(leaked).toEqual([]);
  });

  it("keeps product truth-doc vocabulary out of repo-local policy docs", () => {
    const usingTruthKind = markdownFilesUnder(REPO_LOCAL_ROOT).filter(
      (relativePath) => /^truth_kind:/mu.test(frontmatterOf(relativePath)),
    );

    expect(usingTruthKind).toEqual([]);
  });

  it("keeps repo-local documentation out of the shipped product source", () => {
    const sourceFiles = readdirSync(join(process.cwd(), "src"), {
      recursive: true,
    })
      .map((entry) => String(entry).replaceAll("\\", "/"))
      .filter((entry) => entry.endsWith(".ts"))
      .map((entry) => `src/${entry}`)
      .sort();
    const referencingRepoLocalDocs = sourceFiles.filter((relativePath) =>
      readFileSync(join(process.cwd(), relativePath), "utf8").includes(
        REPO_LOCAL_ROOT,
      ),
    );

    expect(referencingRepoLocalDocs).toEqual([]);
  });
});
