import fs from "node:fs/promises";
import path from "node:path";

import fg from "fast-glob";

import type { PackageMetadata } from "./types.js";

const packageManagerFor = async (
  rootDir: string,
  packageDir: string,
): Promise<PackageMetadata["manager"]> => {
  const lockfiles: Array<[string, PackageMetadata["manager"]]> = [
    ["package-lock.json", "npm"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
  ];

  for (const [lockfile, manager] of lockfiles) {
    try {
      await fs.access(path.join(rootDir, packageDir, lockfile));
      return manager;
    } catch {
      continue;
    }
  }

  return "npm";
};

export const discoverPackageMetadata = async (rootDir: string): Promise<PackageMetadata[]> => {
  const packageFiles = await fg(["package.json", "*/package.json", "packages/*/package.json"], {
    cwd: rootDir,
    onlyFiles: true,
    ignore: ["node_modules/**", "dist/**", "build/**"],
    followSymbolicLinks: false,
  });
  const packages: PackageMetadata[] = [];

  for (const packageFile of packageFiles.sort()) {
    const packageDir = path.posix.dirname(packageFile) === "." ? "" : path.posix.dirname(packageFile);
    const raw = JSON.parse(await fs.readFile(path.join(rootDir, packageFile), "utf8")) as {
      name?: unknown;
      version?: unknown;
      private?: unknown;
      scripts?: unknown;
    };
    const scripts =
      raw.scripts && typeof raw.scripts === "object" ? Object.keys(raw.scripts).sort() : [];

    packages.push({
      path: packageFile,
      manager: await packageManagerFor(rootDir, packageDir),
      name: typeof raw.name === "string" ? raw.name : null,
      version: typeof raw.version === "string" ? raw.version : null,
      private: typeof raw.private === "boolean" ? raw.private : null,
      scripts,
    });
  }

  return packages;
};
