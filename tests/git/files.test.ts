import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, it } from "node:test";
import { posixOnlyIt } from "../helpers/platform.js";
import { expect } from "expect";

import { discoverRepositoryFilePaths } from "../../src/git/files.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("discoverRepositoryFilePaths", () => {
  posixOnlyIt("returns sorted current Git-visible regular files with NUL-safe names", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("tracked.ts", "x\n");
      await repo.writeFile("deleted.ts", "x\n");
      await repo.writeFile("space \t\nname.ts", "x\n");
      await repo.writeFile("ignored.ts", "x\n");
      await repo.writeFile("configured.ts", "x\n");
      await repo.writeFile("nested/file.ts", "x\n");
      await repo.writeFile("nested/deeper.ts", "x\n");
      await repo.writeFile(".gitignore", "ignored.ts\n");
      await repo.runGit(["add", ".gitignore", "tracked.ts", "deleted.ts"]);
      await fs.rm(`${repo.rootDir}/deleted.ts`);

      const files = await discoverRepositoryFilePaths(repo.rootDir, [
        "configured.ts",
      ]);

      expect(files).toContain("tracked.ts");
      expect(files).toEqual([
        ".gitignore",
        "nested/deeper.ts",
        "nested/file.ts",
        "space \t\nname.ts",
        "tracked.ts",
      ]);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns untracked visible files and excludes deleted tracked files and ignored files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("tracked.ts", "x\n");
      await repo.writeFile("stale.ts", "x\n");
      await repo.writeFile("ignored.ts", "x\n");
      await repo.writeFile("nested/visible.ts", "x\n");
      await repo.writeFile(".gitignore", "ignored.ts\n");
      await repo.runGit(["add", "tracked.ts", "stale.ts"]);
      await fs.rm(`${repo.rootDir}/stale.ts`);

      const files = await discoverRepositoryFilePaths(repo.rootDir, []);

      expect(files).toEqual([
        ".gitignore",
        "nested/visible.ts",
        "tracked.ts",
      ]);
    } finally {
      await repo.cleanup();
    }
  });

  it("normalizes, sorts, and deduplicates discovered paths", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("b/second.ts", "x\n");
      await repo.writeFile("a/first.ts", "x\n");
      await repo.writeFile("./a/repeat.ts", "x\n");
      await repo.runGit(["add", "."]);

      const files = await discoverRepositoryFilePaths(repo.rootDir, []);

      expect(files).toEqual(["a/first.ts", "a/repeat.ts", "b/second.ts"]);
    } finally {
      await repo.cleanup();
    }
  });

  posixOnlyIt("normalizes awkward file names including tabs, newlines, and edge spaces", async () => {
    const repo = await createTempRepo();

    try {
      const awkward = "\todd name\nwith newline.md";
      const leading = "  leading-space.ts";
      const trailing = "trailing-space.ts  ";

      await repo.writeFile(`docs/${awkward}`, "x\n");
      await repo.writeFile(`docs/${leading}`, "x\n");
      await repo.writeFile(`docs/${trailing}`, "x\n");
      await repo.writeFile("docs/normal.md", "x\n");

      const files = await discoverRepositoryFilePaths(repo.rootDir, []);

      expect(files).toContain(`docs/${awkward}`);
      expect(files).toContain(`docs/${leading}`);
      expect(files).toContain(`docs/${trailing}`);
      expect(files).toEqual([...files].sort());
    } finally {
      await repo.cleanup();
    }
  });

  it("ignores configured patterns and omitted tracked files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("staged.ts", "x\n");
      await repo.writeFile("keep.ts", "x\n");
      await repo.runGit(["add", "staged.ts", "keep.ts"]);

      const files = await discoverRepositoryFilePaths(repo.rootDir, ["staged.ts"]);

      expect(files).toEqual(["keep.ts"]);
    } finally {
      await repo.cleanup();
    }
  });

  it("falls back to full-tree discovery when git is unavailable", async () => {
    const fallbackRoot = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-no-git-"));

    try {
      await fs.writeFile(
        path.join(fallbackRoot, "visible.md"),
        "visible\n",
        "utf8",
      );
      await fs.writeFile(
        path.join(fallbackRoot, "ignored.md"),
        "ignored\n",
        "utf8",
      );
      await fs.writeFile(
        path.join(fallbackRoot, ".gitignore"),
        "ignored.md\n",
        "utf8",
      );

      const files = await discoverRepositoryFilePaths(fallbackRoot, []);

      expect(files).toEqual([".gitignore", "ignored.md", "visible.md"]);
    } finally {
      await fs.rm(fallbackRoot, { force: true, recursive: true });
    }
  });

  posixOnlyIt("surfaces filenames with tabs/newlines while preserving discovery stability", async () => {
    const repo = await createTempRepo();

    try {
      const awkward = "\todd name\nwith newline.md";
      const nested = path.join("docs", awkward);

      await repo.writeFile(nested, "x\n");
      await repo.runGit(["add", nested]);

      const files = await discoverRepositoryFilePaths(repo.rootDir, []);

      expect(files).toContain(`docs/${awkward}`);
    } finally {
      await repo.cleanup();
    }
  });
});
