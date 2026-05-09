import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { execa } from "execa";

type GitCommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type TempRepo = {
  rootDir: string;
  runGit: (args: string[]) => Promise<GitCommandResult>;
  writeFile: (relativePath: string, content: string) => Promise<void>;
  readFile: (relativePath: string) => Promise<string>;
  cleanup: () => Promise<void>;
};

const resolveRepoPath = (rootDir: string, relativePath: string): string => {
  const absolutePath = path.resolve(rootDir, relativePath);

  if (absolutePath !== rootDir && !absolutePath.startsWith(`${rootDir}${path.sep}`)) {
    throw new Error("temp repo paths must stay inside the repository root");
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

export const createTempRepo = async (): Promise<TempRepo> => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-"));

  await initializeRepository(rootDir);
  await execa("git", ["config", "user.name", "Truthmark Test"], { cwd: rootDir });
  await execa("git", ["config", "user.email", "truthmark@example.com"], {
    cwd: rootDir,
  });

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
    async cleanup() {
      await fs.rm(rootDir, { recursive: true, force: true });
    },
  };
};