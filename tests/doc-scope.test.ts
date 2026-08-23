import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import fg from "fast-glob";
import { describe, it } from "node:test";
import { expect } from "expect";

import { parseFrontmatter } from "../src/markdown/frontmatter.js";
import { resolveRepoPath } from "../src/fs/paths.js";
import { normalizeSourceReferencePath } from "../src/truth/source-references.js";

const REPO_LOCAL_ROOT = "docs/repo";

const markdownFilesUnder = (relativeDir: string): string[] => {
  return readdirSync(join(process.cwd(), relativeDir), { recursive: true })
    .map((entry) => String(entry).replaceAll("\\", "/"))
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => `${relativeDir}/${entry}`)
    .sort();
};

const frontmatterOf = (relativePath: string) => {
  const source = readFileSync(join(process.cwd(), relativePath), "utf8");
  return parseFrontmatter(source).data;
};

const publishedMarkdownFiles = (): string[] =>
  markdownFilesUnder("docs").filter(
    (relativePath) =>
      relativePath !== REPO_LOCAL_ROOT &&
      !relativePath.startsWith(`${REPO_LOCAL_ROOT}/`),
  );

describe("repo-local documentation scope", () => {
  it("declares repo-local scope on every doc under docs/repo", () => {
    const missingScope = markdownFilesUnder(REPO_LOCAL_ROOT).filter(
      (relativePath) => frontmatterOf(relativePath).scope !== "repo-local",
    );

    expect(missingScope).toEqual([]);
  });

  it("keeps repo-local scope out of published product documentation", () => {
    const leaked = publishedMarkdownFiles().filter(
      (relativePath) => frontmatterOf(relativePath).scope === "repo-local",
    );

    expect(leaked).toEqual([]);
  });

  it("keeps repo-local source_of_truth references valid", async () => {
    const missing: string[] = [];

    for (const relativePath of markdownFilesUnder(REPO_LOCAL_ROOT)) {
      const entries = parseFrontmatter(
        readFileSync(join(process.cwd(), relativePath), "utf8"),
      ).data.source_of_truth;

      if (!Array.isArray(entries)) {
        continue;
      }

      for (const entry of entries) {
        if (typeof entry !== "string") {
          continue;
        }

        if (/^(?:https?|mailto):/u.test(entry)) {
          continue;
        }

        const reference = normalizeSourceReferencePath(relativePath, entry);
        const hasGlobSyntax = ["*", "?", "[", "]", "{", "}", "(", ")"].some(
          (character) => reference.includes(character),
        );
        const matches = hasGlobSyntax
          ? await fg(reference, {
              cwd: process.cwd(),
              dot: true,
              onlyFiles: true,
              followSymbolicLinks: false,
            })
          : existsSync(resolveRepoPath(process.cwd(), reference))
            ? [reference]
            : [];

        if (matches.length === 0) {
          missing.push(`${relativePath}: ${entry}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("keeps product truth-doc vocabulary out of repo-local policy docs", () => {
    const usingTruthKind = markdownFilesUnder(REPO_LOCAL_ROOT).filter(
      (relativePath) => typeof frontmatterOf(relativePath).truth_kind === "string",
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
