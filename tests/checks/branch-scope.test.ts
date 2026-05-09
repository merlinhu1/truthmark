import { describe, expect, it } from "vitest";

import { runConfig } from "../../src/config/command.js";
import { getBranchScopeData } from "../../src/checks/branch-scope.js";
import { runCheck } from "../../src/checks/check.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("getBranchScopeData", () => {
  it("describes unborn branch identity and hashes relevant workflow files when present", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);

      const branchScope = await getBranchScopeData(repo.rootDir);

      expect(branchScope.repositoryRoot).toBe(repo.rootDir);
      expect(branchScope.worktreePath).toBe(repo.rootDir);
      expect(branchScope.branchName).toBe("main");
      expect(branchScope.headSha).toBeNull();
      expect(branchScope.identity).toBe("unborn:main");
      expect(branchScope.relevantFileHashes).toEqual(
        expect.objectContaining({
          ".truthmark/config.yml": expect.stringMatching(/^[0-9a-f]{64}$/),
          "TRUTHMARK.md": expect.stringMatching(/^[0-9a-f]{64}$/),
          "docs/truthmark/areas.md": expect.stringMatching(/^[0-9a-f]{64}$/),
        }),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("represents detached head identity explicitly", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "test: commit truthmark scaffold"]);
      const headSha = (await repo.runGit(["rev-parse", "HEAD"])).stdout.trim();
      await repo.runGit(["checkout", "--detach"]);

      const branchScope = await getBranchScopeData(repo.rootDir);

      expect(branchScope.branchName).toBeNull();
      expect(branchScope.headSha).toBe(headSha);
      expect(branchScope.identity).toBe(`detached:${headSha}`);
    } finally {
      await repo.cleanup();
    }
  });
});

describe("runCheck branch scope", () => {
  it("returns branch-scope data through check output data without a new diagnostic category", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);

      const result = await runCheck(repo.rootDir);
      const branchScope = result.data?.branchScope as
        | {
            identity: string;
            headSha: string | null;
          }
        | undefined;
      const categories = result.diagnostics.map((diagnostic) => diagnostic.category as string);

      expect(branchScope?.identity).toBe("unborn:main");
      expect(branchScope?.headSha).toBeNull();
      expect(categories).not.toContain("branch-scope");
    } finally {
      await repo.cleanup();
    }
  });
});
