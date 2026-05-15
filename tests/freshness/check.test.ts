import { afterEach, describe, expect, it } from "vitest";

import { runCheck } from "../../src/checks/check.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

describe("freshness diagnostics", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("reports changed code with no routed truth document when a base ref is supplied", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("scripts/unmapped.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("scripts/unmapped.ts", "export const value = 2;\n");

    const result = await runCheck(repo.rootDir, { base: "main" });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        category: "freshness",
        severity: "review",
        file: "scripts/unmapped.ts",
      }),
    );
  });

  it("reports changed API when affected truth docs were not changed", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("src/index.ts", "export const changedValue = 2;\n");

    const result = await runCheck(repo.rootDir, { base: "main" });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        category: "freshness",
        severity: "review",
        file: "src/index.ts",
        message: expect.stringContaining("affected truth docs but none were changed"),
      }),
    );
  });
});
