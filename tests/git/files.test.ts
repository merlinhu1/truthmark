import fs from "node:fs/promises";
import { describe, it } from "node:test";

import { expect } from "expect";

import { discoverRepositoryFilePaths } from "../../src/git/files.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("discoverRepositoryFilePaths", () => {
  it("returns sorted current Git-visible regular files with NUL-safe names", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("tracked.ts", "x\n");
      await repo.writeFile("deleted.ts", "x\n");
      await repo.writeFile("space \t\nname.ts", "x\n");
      await repo.writeFile("ignored.ts", "x\n");
      await repo.writeFile("configured.ts", "x\n");
      await repo.writeFile(".gitignore", "ignored.ts\n");
      await repo.runGit(["add", ".gitignore", "tracked.ts", "deleted.ts"]);
      await fs.rm(`${repo.rootDir}/deleted.ts`);

      const files = await discoverRepositoryFilePaths(repo.rootDir, [
        "configured.ts",
      ]);

      expect(files).toEqual([".gitignore", "space \t\nname.ts", "tracked.ts"]);
    } finally {
      await repo.cleanup();
    }
  });
});
