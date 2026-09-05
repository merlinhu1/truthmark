import fs from "node:fs/promises";

import { describe, it } from "node:test";
import { expect } from "expect";

import { createTempRepo } from "./temp-repo.js";
import { createWorktreeRepo } from "./worktree-repo.js";

describe("createTempRepo", () => {
  it("hands back a canonical root so path assertions survive 8.3 short tmpdir names", async () => {
    const repo = await createTempRepo();

    try {
      expect(repo.rootDir).toBe(await fs.realpath(repo.rootDir));
    } finally {
      await repo.cleanup();
    }
  });

  it("initializes a git repository and cleans it up safely", async () => {
    const repo = await createTempRepo();

    const gitDir = await fs.stat(`${repo.rootDir}/.git`);

    expect(gitDir.isDirectory()).toBe(true);

    await repo.writeFile("README.md", "# Truthmark\n");
    expect(await repo.readFile("README.md")).toBe("# Truthmark\n");

    await repo.cleanup();

    await expect(fs.stat(repo.rootDir)).rejects.toThrow();
  });
});

describe("createWorktreeRepo", () => {
  it("hands back canonical roots for the primary checkout and its worktrees", async () => {
    const repo = await createWorktreeRepo();

    try {
      const secondary = await repo.addWorktree("feature/canonical-paths");

      expect(repo.rootDir).toBe(await fs.realpath(repo.rootDir));
      expect(secondary.rootDir).toBe(await fs.realpath(secondary.rootDir));
    } finally {
      await repo.cleanup();
    }
  });
});
