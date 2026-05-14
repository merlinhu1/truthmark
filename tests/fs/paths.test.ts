import fs from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ensureRepoFile, writeRepoFile } from "../../src/fs/paths.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("repo path writes", () => {
  it("rejects writeRepoFile when a parent directory is a symlink outside the repo", async () => {
    const repo = await createTempRepo();

    try {
      const outsideDir = path.resolve(repo.rootDir, "..", "truthmark-paths-write-outside");

      await fs.mkdir(outsideDir, { recursive: true });
      await fs.symlink(outsideDir, path.join(repo.rootDir, "docs"));

      await expect(writeRepoFile(repo.rootDir, "docs/escaped.md", "# Escaped\n")).rejects.toThrow(
        "must stay inside the repository root",
      );
    } finally {
      await fs.rm(path.resolve(repo.rootDir, "..", "truthmark-paths-write-outside"), {
        force: true,
        recursive: true,
      });
      await repo.cleanup();
    }
  });

  it("rejects ensureRepoFile when a parent directory is a symlink outside the repo", async () => {
    const repo = await createTempRepo();

    try {
      const outsideDir = path.resolve(repo.rootDir, "..", "truthmark-paths-ensure-outside");

      await fs.mkdir(outsideDir, { recursive: true });
      await fs.symlink(outsideDir, path.join(repo.rootDir, "docs"));

      await expect(ensureRepoFile(repo.rootDir, "docs/escaped.md", "# Escaped\n")).rejects.toThrow(
        "must stay inside the repository root",
      );
    } finally {
      await fs.rm(path.resolve(repo.rootDir, "..", "truthmark-paths-ensure-outside"), {
        force: true,
        recursive: true,
      });
      await repo.cleanup();
    }
  });

  it("rejects ensureRepoFile when the target is a broken symlink outside the repo", async () => {
    const repo = await createTempRepo();
    const outsidePath = path.resolve(repo.rootDir, "..", "truthmark-paths-broken-link.md");

    try {
      await repo.writeFile("docs/templates/.keep", "");
      await fs.symlink(outsidePath, path.join(repo.rootDir, "docs", "templates", "behavior-doc.md"));

      await expect(
        ensureRepoFile(repo.rootDir, "docs/templates/behavior-doc.md", "# Template\n"),
      ).rejects.toThrow("must stay inside the repository root");
      await expect(fs.stat(outsidePath)).rejects.toThrow();
    } finally {
      await fs.rm(outsidePath, { force: true });
      await repo.cleanup();
    }
  });
});
