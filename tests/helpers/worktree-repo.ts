import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { execa } from "execa";

type GitCommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type WorktreeCheckout = {
  rootDir: string;
  runGit: (args: string[]) => Promise<GitCommandResult>;
  writeFile: (relativePath: string, content: string) => Promise<void>;
  readFile: (relativePath: string) => Promise<string>;
};

export type WorktreeRepo = WorktreeCheckout & {
  addWorktree: (branchName: string) => Promise<WorktreeCheckout>;
  cleanup: () => Promise<void>;
};

const resolveRepoPath = (rootDir: string, relativePath: string): string => {
  const absolutePath = path.resolve(rootDir, relativePath);

  if (absolutePath !== rootDir && !absolutePath.startsWith(`${rootDir}${path.sep}`)) {
    throw new Error("worktree repo paths must stay inside the checkout root");
  }

  return absolutePath;
};

const initializeRepository = async (rootDir: string): Promise<void> => {
  try {
    await execa("git", ["init", "--initial-branch=main"], { cwd: rootDir });
  } catch {
    await execa("git", ["init"], { cwd: rootDir });
    await execa("git", ["symbolic-ref", "HEAD", "refs/heads/main"], {
      cwd: rootDir,
    });
  }
};

const createCheckout = (rootDir: string): WorktreeCheckout => {
  return {
    rootDir,
    async runGit(args: string[]) {
      const result = await execa("git", args, { cwd: rootDir, reject: false });

      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode ?? 1,
      };
    },
    async writeFile(relativePath: string, content: string) {
      const absolutePath = resolveRepoPath(rootDir, relativePath);

      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, "utf8");
    },
    async readFile(relativePath: string) {
      return fs.readFile(resolveRepoPath(rootDir, relativePath), "utf8");
    },
  };
};

export const createWorktreeRepo = async (): Promise<WorktreeRepo> => {
  const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-worktree-"));
  const rootDir = path.join(baseDir, "repo");
  const worktreeDirs: string[] = [];

  await fs.mkdir(rootDir, { recursive: true });
  await initializeRepository(rootDir);
  await execa("git", ["config", "user.name", "Truthmark Test"], { cwd: rootDir });
  await execa("git", ["config", "user.email", "truthmark@example.com"], {
    cwd: rootDir,
  });

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