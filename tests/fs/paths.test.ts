import fs from "node:fs/promises";
import path from "node:path";

import { describe, it } from "node:test";
import { expect } from "expect";

import {
  ensureRepoFile,
  isSafeExactFile,
  resolveSafeExactFileTarget,
  writeRepoFile,
} from "../../src/fs/paths.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("repo path writes", () => {
  it("rejects writeRepoFile when a parent directory is a symlink outside the repo", async () => {
    const repo = await createTempRepo();

    try {
      const outsideDir = path.resolve(
        repo.rootDir,
        "..",
        "truthmark-paths-write-outside",
      );

      await fs.mkdir(outsideDir, { recursive: true });
      await fs.symlink(outsideDir, path.join(repo.rootDir, "docs"));

      await expect(
        writeRepoFile(repo.rootDir, "docs/escaped.md", "# Escaped\n"),
      ).rejects.toThrow("must stay inside the repository root");
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-paths-write-outside"),
        {
          force: true,
          recursive: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("rejects ensureRepoFile when a parent directory is a symlink outside the repo", async () => {
    const repo = await createTempRepo();

    try {
      const outsideDir = path.resolve(
        repo.rootDir,
        "..",
        "truthmark-paths-ensure-outside",
      );

      await fs.mkdir(outsideDir, { recursive: true });
      await fs.symlink(outsideDir, path.join(repo.rootDir, "docs"));

      await expect(
        ensureRepoFile(repo.rootDir, "docs/escaped.md", "# Escaped\n"),
      ).rejects.toThrow("must stay inside the repository root");
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-paths-ensure-outside"),
        {
          force: true,
          recursive: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("rejects ensureRepoFile when the target is a broken symlink outside the repo", async () => {
    const repo = await createTempRepo();
    const outsidePath = path.resolve(
      repo.rootDir,
      "..",
      "truthmark-paths-broken-link.md",
    );

    try {
      await repo.writeFile("docs/truthmark/templates/.keep", "");
      await fs.symlink(
        outsidePath,
        path.join(
          repo.rootDir,
          "docs",
          "truthmark",
          "templates",
          "engineering-behavior.md",
        ),
      );

      await expect(
        ensureRepoFile(
          repo.rootDir,
          "docs/truthmark/templates/engineering-behavior.md",
          "# Template\n",
        ),
      ).rejects.toThrow("must stay inside the repository root");
      await expect(fs.stat(outsidePath)).rejects.toThrow();
    } finally {
      await fs.rm(outsidePath, { force: true });
      await repo.cleanup();
    }
  });

  it("checks exact-file safety without allowing missing file parents", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/session.ts", "export const session = true;\n");

      await expect(isSafeExactFile(repo.rootDir, "src/session.ts", true)).resolves.toBe(
        true,
      );
      await expect(
        isSafeExactFile(repo.rootDir, "src/session.ts", false),
      ).resolves.toBe(true);
      await expect(
        isSafeExactFile(repo.rootDir, "src/missing.ts", true),
      ).resolves.toBe(true);
      await expect(
        isSafeExactFile(repo.rootDir, "src/missing.ts", false),
      ).resolves.toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("uses the same canonical path for direct and aliased existing targets", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("shared.md", "shared\n");
      await fs.symlink("shared.md", path.join(repo.rootDir, "AGENTS.md"));

      await expect(
        resolveSafeExactFileTarget(repo.rootDir, "./shared.md", false, true),
      ).resolves.toEqual({ path: "shared.md", aliased: false });
      await expect(
        resolveSafeExactFileTarget(repo.rootDir, "AGENTS.md", false, true),
      ).resolves.toEqual({ path: "shared.md", aliased: true });
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects hard-linked exact files as unsafe lifecycle targets", async () => {
    const repo = await createTempRepo();

    try {
      const sourcePath = path.join(repo.rootDir, "src", "session.ts");
      const linkPath = path.join(repo.rootDir, "src", "session-copy.ts");

      await repo.writeFile("src/session.ts", "export const session = true;\n");
      await fs.link(sourcePath, linkPath);

      await expect(
        isSafeExactFile(repo.rootDir, "src/session.ts", false),
      ).resolves.toBe(false);
      await expect(
        isSafeExactFile(repo.rootDir, "src/session-copy.ts", false),
      ).resolves.toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects hard-linked descendants during lifecycle preflight", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/engineering/overview.md",
        "# Overview\n",
      );
      await repo.writeFile(
        "src/session.ts",
        "export const session = true;\n",
      );
      await fs.link(
        path.join(repo.rootDir, "src", "session.ts"),
        path.join(repo.rootDir, "src", "session-link.ts"),
      );

      await expect(
        isSafeExactFile(repo.rootDir, "src/session.ts", false),
      ).resolves.toBe(false);
      await expect(
        isSafeExactFile(repo.rootDir, "docs/truthmark/engineering/overview.md", false),
      ).resolves.toBe(true);
    } finally {
      await repo.cleanup();
    }
  });
});
