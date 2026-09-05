import fs from "node:fs/promises";
import path from "node:path";

import { execa } from "execa";

type GitCommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export type Checkout = {
  rootDir: string;
  runGit: (args: string[]) => Promise<GitCommandResult>;
  writeFile: (relativePath: string, content: string) => Promise<void>;
  readFile: (relativePath: string) => Promise<string>;
};

const resolveCheckoutPath = (rootDir: string, relativePath: string): string => {
  const absolutePath = path.resolve(rootDir, relativePath);

  if (absolutePath !== rootDir && !absolutePath.startsWith(`${rootDir}${path.sep}`)) {
    throw new Error("test checkout paths must stay inside the checkout root");
  }

  return absolutePath;
};

export const initializeGitRepository = async (rootDir: string): Promise<void> => {
  try {
    await execa("git", ["init", "--initial-branch=main"], { cwd: rootDir });
  } catch {
    await execa("git", ["init"], { cwd: rootDir });
    await execa("git", ["symbolic-ref", "HEAD", "refs/heads/main"], {
      cwd: rootDir,
    });
  }

  await execa("git", ["config", "user.name", "Truthmark Test"], { cwd: rootDir });
  await execa("git", ["config", "user.email", "truthmark@example.com"], {
    cwd: rootDir,
  });
};

export const createCheckout = (rootDir: string): Checkout => {
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
      const absolutePath = resolveCheckoutPath(rootDir, relativePath);

      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, "utf8");
    },
    async readFile(relativePath: string) {
      return fs.readFile(resolveCheckoutPath(rootDir, relativePath), "utf8");
    },
  };
};
