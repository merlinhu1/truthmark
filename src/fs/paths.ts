import path from "node:path";

import fs from "node:fs/promises";

export type FileWriteStatus = "created" | "updated" | "unchanged";

export type FileWriteResult = {
  path: string;
  status: FileWriteStatus;
};

const isPathInsideRoot = (rootDir: string, targetPath: string): boolean => {
  return targetPath === rootDir || targetPath.startsWith(`${rootDir}${path.sep}`);
};

const resolveThroughExistingAncestor = async (targetPath: string): Promise<string> => {
  let currentPath = path.resolve(targetPath);
  const missingSegments: string[] = [];

  while (true) {
    try {
      const resolvedExistingPath = await fs.realpath(currentPath);

      return missingSegments.reduce<string>((resolvedPath, segment) => {
        return path.join(resolvedPath, segment);
      }, resolvedExistingPath);
    } catch (error: unknown) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
        throw error;
      }

      const parentPath = path.dirname(currentPath);

      if (parentPath === currentPath) {
        return path.resolve(targetPath);
      }

      missingSegments.unshift(path.basename(currentPath));
      currentPath = parentPath;
    }
  }
};

export const resolveRepoPath = (rootDir: string, relativePath: string): string => {
  const resolvedPath = path.resolve(rootDir, relativePath);

  if (!isPathInsideRoot(rootDir, resolvedPath)) {
    throw new Error("resolved path must stay inside the repository root");
  }

  return resolvedPath;
};

export const assertRepoContainment = async (
  rootDir: string,
  targetPath: string,
): Promise<void> => {
  const [resolvedRootDir, resolvedTargetPath] = await Promise.all([
    resolveThroughExistingAncestor(rootDir),
    resolveThroughExistingAncestor(targetPath),
  ]);

  if (!isPathInsideRoot(resolvedRootDir, resolvedTargetPath)) {
    throw new Error("resolved path must stay inside the repository root");
  }
};

export const toRepoRelativePath = (rootDir: string, targetPath: string): string => {
  return path.relative(rootDir, targetPath).split(path.sep).join("/");
};

const normalizeContent = (content: string): string => {
  return content.endsWith("\n") ? content : `${content}\n`;
};

export const writeRepoFile = async (
  rootDir: string,
  relativePath: string,
  content: string,
): Promise<FileWriteResult> => {
  const absolutePath = resolveRepoPath(rootDir, relativePath);
  await assertRepoContainment(rootDir, absolutePath);
  const normalizedContent = normalizeContent(content);

  let existingContent: string | null = null;

  try {
    existingContent = await fs.readFile(absolutePath, "utf8");
  } catch (error: unknown) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }

  if (existingContent === normalizedContent) {
    return {
      path: relativePath,
      status: "unchanged",
    };
  }

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, normalizedContent, "utf8");

  return {
    path: relativePath,
    status: existingContent === null ? "created" : "updated",
  };
};

export const ensureRepoFile = async (
  rootDir: string,
  relativePath: string,
  content: string,
): Promise<FileWriteResult> => {
  const absolutePath = resolveRepoPath(rootDir, relativePath);
  await assertRepoContainment(rootDir, absolutePath);
  const normalizedContent = normalizeContent(content);

  let existingContent: string | null = null;

  try {
    existingContent = await fs.readFile(absolutePath, "utf8");
  } catch (error: unknown) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
  }

  if (existingContent === null) {
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, normalizedContent, "utf8");

    return {
      path: relativePath,
      status: "created",
    };
  }

  if (existingContent.trim().length === 0) {
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, normalizedContent, "utf8");

    return {
      path: relativePath,
      status: "updated",
    };
  }

  return {
    path: relativePath,
    status: "unchanged",
  };
};