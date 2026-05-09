import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { createTempRepo } from "./temp-repo.js";

describe("createTempRepo", () => {
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