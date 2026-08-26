import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, it } from "node:test";
import { expect } from "expect";

import { listRepoMarkdownFiles } from "./helpers/markdown-files.js";

/**
 * Root-level files whose bare filename in a link label always means the
 * repository-root copy, never a same-named file deeper in the tree.
 */
const ROOT_SCOPED_LABELS = new Set(["README.md", "AGENTS.md", "CLAUDE.md"]);

const LINK_PATTERN = /\[([^\]]*)\]\(([^)]+)\)/g;
const PATH_LIKE_LABEL = /^[A-Za-z0-9._/-]+\.[A-Za-z0-9]+$/u;

type DocumentLink = {
  file: string;
  label: string;
  target: string;
  resolved: string;
};

const documentLinks = (relativePath: string): DocumentLink[] => {
  const source = readFileSync(path.join(process.cwd(), relativePath), "utf8");
  const dir = path.posix.dirname(relativePath.replaceAll("\\", "/"));
  const links: DocumentLink[] = [];

  for (const match of source.matchAll(LINK_PATTERN)) {
    const label = match[1].trim();
    const rawTarget = match[2].trim();

    if (/^(?:https?:|mailto:|#)/u.test(rawTarget)) {
      continue;
    }

    const target = rawTarget.split("#")[0];

    if (target.length === 0) {
      continue;
    }

    links.push({
      file: relativePath,
      label,
      target: rawTarget,
      resolved: path.posix.normalize(path.posix.join(dir, target)),
    });
  }

  return links;
};

const allLinks = (): DocumentLink[] =>
  listRepoMarkdownFiles().flatMap(documentLinks);

describe("documentation links", () => {
  it("resolves every relative link to a file in the checkout", () => {
    const broken = allLinks()
      .filter((link) => !existsSync(path.join(process.cwd(), link.resolved)))
      .map((link) => `${link.file}: ${link.target}`);

    expect(broken).toEqual([]);
  });

  it("keeps path-shaped link labels pointing at the file they name", () => {
    const mismatched = allLinks()
      .filter((link) => {
        // Bare filenames like `change-notes.md` are shorthand for a sibling
        // document, so only labels that spell out a repository path are
        // unambiguous enough to compare.
        if (!PATH_LIKE_LABEL.test(link.label)) {
          return false;
        }

        const expected = ROOT_SCOPED_LABELS.has(link.label)
          ? link.label
          : link.label.includes("/")
            ? link.label
            : null;

        return expected !== null && expected !== link.resolved;
      })
      .map((link) => `${link.file}: [${link.label}] -> ${link.resolved}`);

    expect(mismatched).toEqual([]);
  });
});
