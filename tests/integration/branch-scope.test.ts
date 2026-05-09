import { describe, expect, it } from "vitest";

import { runCheck } from "../../src/checks/check.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { createWorktreeRepo } from "../helpers/worktree-repo.js";

describe("branch-scoped truth integration", () => {
  it("reports branch name and head sha for a normal branch checkout", async () => {
    const repo = await createWorktreeRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "test: baseline"]);

      const result = await runCheck(repo.rootDir);
      const branchScope = result.data?.branchScope as
        | {
            branchName: string | null;
            headSha: string | null;
          }
        | undefined;

      expect(branchScope?.branchName).toBe("main");
      expect(branchScope?.headSha).toMatch(/^[0-9a-f]{40}$/);
    } finally {
      await repo.cleanup();
    }
  });

  it("reports detached checkout identity cleanly", async () => {
    const repo = await createWorktreeRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "test: baseline"]);
      const headSha = (await repo.runGit(["rev-parse", "HEAD"])).stdout.trim();
      await repo.runGit(["checkout", "--detach"]);

      const result = await runCheck(repo.rootDir);
      const branchScope = result.data?.branchScope as
        | {
            identity: string;
            branchName: string | null;
          }
        | undefined;

      expect(branchScope?.branchName).toBeNull();
      expect(branchScope?.identity).toBe(`detached:${headSha}`);
    } finally {
      await repo.cleanup();
    }
  });

  it("reports the active worktree path without leaking the primary checkout context", async () => {
    const repo = await createWorktreeRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "test: baseline"]);

      const secondary = await repo.addWorktree("feature/worktree");
      const result = await runCheck(secondary.rootDir);
      const branchScope = result.data?.branchScope as
        | {
            branchName: string | null;
            worktreePath: string;
          }
        | undefined;

      expect(branchScope?.branchName).toBe("feature/worktree");
      expect(branchScope?.worktreePath).toBe(secondary.rootDir);
      expect(branchScope?.worktreePath).not.toBe(repo.rootDir);
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps truth surface changes isolated to the checked out branch", async () => {
    const repo = await createWorktreeRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "test: baseline"]);

      const secondary = await repo.addWorktree("feature/docs");
      await secondary.writeFile(
        "TRUTHMARK.md",
        `${await secondary.readFile("TRUTHMARK.md")}\n## Feature Branch Notes\nOnly here.\n`,
      );

      const primaryResult = await runCheck(repo.rootDir);
      const secondaryResult = await runCheck(secondary.rootDir);
      const primaryHash = (primaryResult.data?.branchScope as { relevantFileHashes: Record<string, string> })
        .relevantFileHashes["TRUTHMARK.md"];
      const secondaryHash = (secondaryResult.data?.branchScope as { relevantFileHashes: Record<string, string> })
        .relevantFileHashes["TRUTHMARK.md"];

      expect(primaryHash).toBeTruthy();
      expect(secondaryHash).toBeTruthy();
      expect(primaryHash).not.toBe(secondaryHash);
      expect(await repo.readFile("TRUTHMARK.md")).not.toContain("Feature Branch Notes");
      expect(await secondary.readFile("TRUTHMARK.md")).toContain("Feature Branch Notes");
    } finally {
      await repo.cleanup();
    }
  });
});
