import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { getUncommittedChanges } from "../../src/git/changes.js";
import { buildChangedSurfaces } from "../../src/sync/surfaces.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const buildNumberedSource = (lineCount: number): string => {
  return Array.from({ length: lineCount }, (_, index) => {
    return `export const line${index + 1} = ${index + 1};`;
  }).join("\n");
};

describe("buildChangedSurfaces", () => {
  it("prefers compact diff-aware excerpts for tracked files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/auth/session.ts", `${buildNumberedSource(12)}\n`);
      await repo.runGit(["add", "src/auth/session.ts"]);
      await repo.runGit(["commit", "-m", "test: baseline tracked source"]);

      await repo.writeFile(
        "src/auth/session.ts",
        `${buildNumberedSource(5)}\nexport const line6 = 'updated';\n${buildNumberedSource(12)
          .split("\n")
          .slice(6)
          .join("\n")}\n`,
      );

      const surfaces = await buildChangedSurfaces(repo.rootDir, await getUncommittedChanges(repo.rootDir), []);

      expect(surfaces).toHaveLength(1);
      expect(surfaces[0]).toMatchObject({
        path: "src/auth/session.ts",
        mode: "diff",
        segments: [
          {
            startLine: 4,
            endLine: 8,
          },
        ],
      });
      expect(surfaces[0]?.segments[0]?.content.includes("line6 = 'updated'"))?.toBe(true);
      expect(surfaces[0]?.segments[0]?.content.includes("line1 = 1"))?.toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("uses a bounded leading excerpt for untracked files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/new-file.ts", `${buildNumberedSource(80)}\n`);

      const surfaces = await buildChangedSurfaces(repo.rootDir, await getUncommittedChanges(repo.rootDir), []);

      expect(surfaces).toHaveLength(1);
      expect(surfaces[0]).toMatchObject({
        path: "src/new-file.ts",
        mode: "excerpt",
        segments: [
          {
            startLine: 1,
            endLine: 40,
          },
        ],
      });
      expect(surfaces[0]?.segments[0]?.content.includes("line40 = 40"))?.toBe(true);
      expect(surfaces[0]?.segments[0]?.content.includes("line41 = 41"))?.toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("can expand nearby implementation context conservatively", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/auth/session.ts", `${buildNumberedSource(12)}\n`);
      await repo.runGit(["add", "src/auth/session.ts"]);
      await repo.runGit(["commit", "-m", "test: baseline tracked source"]);

      await repo.writeFile(
        "src/auth/session.ts",
        `${buildNumberedSource(5)}\nexport const line6 = 'expanded';\n${buildNumberedSource(12)
          .split("\n")
          .slice(6)
          .join("\n")}\n`,
      );

      const surfaces = await buildChangedSurfaces(
        repo.rootDir,
        await getUncommittedChanges(repo.rootDir),
        [],
        { contextLines: 4 },
      );

      expect(surfaces[0]?.segments[0]).toMatchObject({
        startLine: 2,
        endLine: 10,
      });
      expect(surfaces[0]?.segments[0]?.content.includes("line2 = 2"))?.toBe(true);
      expect(surfaces[0]?.segments[0]?.content.includes("line11 = 11"))?.toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("stays constrained to changed functional code files in the current checkout", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/auth/session.ts", "export const session = true;\n");
      await repo.writeFile("docs/guides/authentication.md", "# Authentication\n");
      await repo.writeFile("package.json", '{"name":"truthmark"}\n');
      await repo.writeFile("dist/generated.js", "export const generated = true;\n");
      await repo.writeFile(".truthmark/cache/state.json", '{"cached":true}\n');

      const surfaces = await buildChangedSurfaces(
        repo.rootDir,
        await getUncommittedChanges(repo.rootDir),
        ["dist/**"],
      );

      expect(surfaces.map((surface) => surface.path)).toEqual(["src/auth/session.ts"]);
    } finally {
      await repo.cleanup();
    }
  });

  it("represents deleted functional code files without reading removed sources", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/auth/session.ts", "export const session = true;\n");
      await repo.runGit(["add", "src/auth/session.ts"]);
      await repo.runGit(["commit", "-m", "test: baseline tracked source"]);

      await fs.rm(`${repo.rootDir}/src/auth/session.ts`);

      const surfaces = await buildChangedSurfaces(
        repo.rootDir,
        await getUncommittedChanges(repo.rootDir),
        [],
      );

      expect(surfaces).toHaveLength(1);
      expect(surfaces[0]).toMatchObject({
        path: "src/auth/session.ts",
        mode: "deleted",
        staged: false,
        unstaged: true,
        untracked: false,
        segments: [],
      });
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps deleted non-functional files out of changed surfaces", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("docs/guides/authentication.md", "# Authentication\n");
      await repo.runGit(["add", "docs/guides/authentication.md"]);
      await repo.runGit(["commit", "-m", "test: baseline tracked guide"]);

      await fs.rm(`${repo.rootDir}/docs/guides/authentication.md`);

      const surfaces = await buildChangedSurfaces(
        repo.rootDir,
        await getUncommittedChanges(repo.rootDir),
        [],
      );

      expect(surfaces).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });
});