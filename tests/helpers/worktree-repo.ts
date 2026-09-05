import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { execa } from "execa";

import { createCheckout, initializeGitRepository, type Checkout } from "./checkout.js";

export type WorktreeRepo = Checkout & {
  addWorktree: (branchName: string) => Promise<Checkout>;
  cleanup: () => Promise<void>;
};

export const createWorktreeRepo = async (): Promise<WorktreeRepo> => {
  const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-worktree-"));
  const rootDir = path.join(baseDir, "repo");
  const worktreeDirs: string[] = [];

  await fs.mkdir(rootDir, { recursive: true });
  await initializeGitRepository(rootDir);

  return {
    ...createCheckout(rootDir),
    async addWorktree(branchName: string) {
      const worktreeDir = path.join(baseDir, `worktree-${worktreeDirs.length + 1}`);

      await execa("git", ["worktree", "add", "-b", branchName, worktreeDir], {
        cwd: rootDir,
      });
      worktreeDirs.push(worktreeDir);

      return createCheckout(worktreeDir);
    },
    async cleanup() {
      for (const worktreeDir of worktreeDirs.reverse()) {
        await execa("git", ["worktree", "remove", "--force", worktreeDir], {
          cwd: rootDir,
          reject: false,
        });
      }

      await fs.rm(baseDir, { recursive: true, force: true });
    },
  };
};
