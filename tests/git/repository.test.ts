import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTempRepo } from "../helpers/temp-repo.js";
import { getGitRepository, resolveWorktreePath } from "../../src/git/repository.js";

describe("getGitRepository", () => {
  it("returns unborn branch state without inventing a head sha", async () => {
    const repo = await createTempRepo();

    try {
      const repository = await getGitRepository(repo.rootDir);

      expect(repository.repositoryRoot).toBe(repo.rootDir);
      expect(repository.worktreePath).toBe(repo.rootDir);
      expect(repository.branchName).toBe("main");
      expect(repository.headSha).toBeNull();
      expect(repository.isDetached).toBe(false);
      expect(repository.isUnborn).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns branch identity and head sha after the first commit", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("README.md", "# Truthmark\n");
      await repo.runGit(["add", "README.md"]);
      await repo.runGit(["commit", "-m", "test: initial commit"]);

      const repository = await getGitRepository(repo.rootDir);

      expect(repository.branchName).toBe("main");
      expect(repository.headSha).toMatch(/^[0-9a-f]{40}$/);
      expect(repository.isDetached).toBe(false);
      expect(repository.isUnborn).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("represents detached head state explicitly", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("README.md", "# Truthmark\n");
      await repo.runGit(["add", "README.md"]);
      await repo.runGit(["commit", "-m", "test: initial commit"]);
      await repo.runGit(["checkout", "--detach"]);

      const repository = await getGitRepository(repo.rootDir);

      expect(repository.branchName).toBeNull();
      expect(repository.headSha).toMatch(/^[0-9a-f]{40}$/);
      expect(repository.isDetached).toBe(true);
      expect(repository.isUnborn).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });
});

describe("resolveWorktreePath", () => {
  it("keeps resolved paths inside the active checkout", async () => {
    const repo = await createTempRepo();

    try {
      const repository = await getGitRepository(repo.rootDir);

      expect(resolveWorktreePath(repository, "docs/truthmark/areas.md")).toBe(
        path.join(repo.rootDir, "docs", "truthmark", "areas.md"),
      );
      expect(() => resolveWorktreePath(repository, "../outside.txt")).toThrow(
        "must stay inside the active worktree",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects symlinked paths that resolve outside the active checkout", async () => {
    const repo = await createTempRepo();

    try {
      const outsidePath = path.resolve(repo.rootDir, "..", "truthmark-worktree-outside.txt");

      await repo.writeFile("docs/placeholder.md", "# Placeholder\n");
      await fs.promises.writeFile(outsidePath, "outside\n", "utf8");
      await fs.promises.symlink(outsidePath, path.join(repo.rootDir, "docs", "outside-link.txt"));

      const repository = await getGitRepository(repo.rootDir);

      expect(() => resolveWorktreePath(repository, "docs/outside-link.txt")).toThrow(
        "must stay inside the active worktree",
      );
    } finally {
      await fs.promises.rm(path.resolve(repo.rootDir, "..", "truthmark-worktree-outside.txt"), {
        force: true,
      });
      await repo.cleanup();
    }
  });

  it("rejects missing leaves under parent symlinks that point outside the active checkout", async () => {
    const repo = await createTempRepo();

    try {
      const outsideDir = path.resolve(repo.rootDir, "..", "truthmark-worktree-outside-dir");

      await fs.promises.mkdir(outsideDir, { recursive: true });
      await repo.writeFile("docs/placeholder.md", "# Placeholder\n");
      await fs.promises.symlink(outsideDir, path.join(repo.rootDir, "docs", "outside-dir"));

      const repository = await getGitRepository(repo.rootDir);

      expect(() => resolveWorktreePath(repository, "docs/outside-dir/new.txt")).toThrow(
        "must stay inside the active worktree",
      );
    } finally {
      await fs.promises.rm(path.resolve(repo.rootDir, "..", "truthmark-worktree-outside-dir"), {
        force: true,
        recursive: true,
      });
      await repo.cleanup();
    }
  });
});