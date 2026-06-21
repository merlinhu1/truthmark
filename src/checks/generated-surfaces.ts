import fs from "node:fs/promises";
import type { Dirent } from "node:fs";

import type { TruthmarkConfig } from "../config/schema.js";
import { resolveRepoPath } from "../fs/paths.js";
import type { Diagnostic } from "../output/diagnostic.js";
import {
  TRUTHMARK_BLOCK_END,
  TRUTHMARK_BLOCK_START,
} from "../templates/agents-block.js";
import { renderGeneratedSurfaces } from "../templates/generated-surfaces.js";

const readOptionalFile = async (
  rootDir: string,
  filePath: string,
): Promise<string | null> => {
  try {
    return await fs.readFile(resolveRepoPath(rootDir, filePath), "utf8");
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

const extractManagedBlock = (content: string): string | null => {
  const startIndex = content.indexOf(TRUTHMARK_BLOCK_START);
  const endIndex = content.indexOf(TRUTHMARK_BLOCK_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }

  return content.slice(startIndex, endIndex + TRUTHMARK_BLOCK_END.length);
};

const normalizeGeneratedSurfaceContent = (
  content: string | null,
): string | null => {
  if (content === null) {
    return null;
  }

  return content.replace(/\r\n/g, "\n").replace(/\n$/u, "");
};

const GENERATED_HOST_SKILL_ROOTS = [
  ".agents/skills",
  ".opencode/skills",
  ".claude/skills",
  ".github/skills",
  ".cursor/skills",
] as const;

const RETIRED_SKILL_HELPER_PATHS = [
  "helper-manifest.yml",
  "support/helper-policy.md",
] as const;

const RETIRED_PACKAGE_DIRECTORIES = ["truthmark-preview"] as const;

const RETIRED_GENERATED_SURFACE_PATHS = [
  "GEMINI.md",
  ".github/prompts/truthmark-preview.prompt.md",
  ".cursor/rules/truthmark-structure.mdc",
  ".cursor/rules/truthmark-document.mdc",
  ".cursor/rules/truthmark-sync.mdc",
  ".cursor/rules/truthmark-realize.mdc",
  ".cursor/rules/truthmark-check.mdc",
  ".cursor/rules/truthmark-portal.mdc",
] as const;

const RETIRED_GENERATED_SURFACE_ROOTS = [".gemini"] as const;

const isRetiredGeminiSurfacePath = (filePath: string): boolean =>
  filePath === "GEMINI.md" || filePath.startsWith(".gemini/");

const obsoleteGeneratedSurfaceMessage = (surfacePath: string): string => {
  if (isRetiredGeminiSurfacePath(surfacePath)) {
    return `Generated surface ${surfacePath} is obsolete; remove stale Gemini instructions manually if they are no longer wanted.`;
  }

  return `Generated surface ${surfacePath} is obsolete; rerun truthmark init.`;
};

type RetiredSurfaceCollectionOptions = {
  includeGeminiSurfaces?: boolean;
};

const pathExists = async (absolutePath: string): Promise<boolean> => {
  try {
    await fs.access(absolutePath);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
};

const listDirectoryFiles = async (
  rootDir: string,
  packageRoot: string,
): Promise<string[]> => {
  const stack = [packageRoot];
  const files: string[] = [];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined) {
      continue;
    }

    const absoluteCurrent = resolveRepoPath(rootDir, current);
    const entries = await fs.readdir(absoluteCurrent, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const next = `${current}/${entry.name}`;

      if (entry.isDirectory()) {
        stack.push(next);
      } else {
        files.push(next);
      }
    }
  }

  return files;
};

const collectRetiredGeneratedSurfaces = async (
  rootDir: string,
  expectedSurfacePaths: Set<string>,
  options: RetiredSurfaceCollectionOptions = {},
): Promise<string[]> => {
  const legacyCandidates = new Set<string>();
  const includeGeminiSurfaces = options.includeGeminiSurfaces ?? true;

  for (const retiredPath of RETIRED_GENERATED_SURFACE_PATHS) {
    if (!includeGeminiSurfaces && isRetiredGeminiSurfacePath(retiredPath)) {
      continue;
    }

    const absoluteRetiredPath = resolveRepoPath(rootDir, retiredPath);

    if (
      (await pathExists(absoluteRetiredPath)) &&
      !expectedSurfacePaths.has(retiredPath)
    ) {
      legacyCandidates.add(retiredPath);
    }
  }

  for (const retiredRoot of RETIRED_GENERATED_SURFACE_ROOTS) {
    if (!includeGeminiSurfaces && isRetiredGeminiSurfacePath(`${retiredRoot}/`)) {
      continue;
    }

    const absoluteRetiredRoot = resolveRepoPath(rootDir, retiredRoot);

    if (!(await pathExists(absoluteRetiredRoot))) {
      continue;
    }

    const retiredFiles = await listDirectoryFiles(rootDir, retiredRoot);

    for (const filePath of retiredFiles) {
      if (!expectedSurfacePaths.has(filePath)) {
        legacyCandidates.add(filePath);
      }
    }
  }

  for (const skillRoot of GENERATED_HOST_SKILL_ROOTS) {
    const absoluteSkillRoot = resolveRepoPath(rootDir, skillRoot);

    let skillPackages: Dirent[] = [];

    try {
      skillPackages = await fs.readdir(absoluteSkillRoot, {
        withFileTypes: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        continue;
      }

      throw error;
    }

    const packageNames = skillPackages
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("truthmark-"))
      .map((entry) => entry.name);

    for (const packageName of RETIRED_PACKAGE_DIRECTORIES) {
      if (!packageNames.includes(packageName)) {
        continue;
      }

      const packageRoot = `${skillRoot}/${packageName}`;
      const packageFiles = await listDirectoryFiles(rootDir, packageRoot);

      for (const filePath of packageFiles) {
        if (!expectedSurfacePaths.has(filePath)) {
          legacyCandidates.add(filePath);
        }
      }
    }

    for (const packageName of packageNames) {
      for (const retiredName of RETIRED_SKILL_HELPER_PATHS) {
        const retiredPath = `${packageName}/${retiredName}`;
        const relativeRetiredPath = `${skillRoot}/${retiredPath}`;
        const absoluteRetiredPath = resolveRepoPath(rootDir, relativeRetiredPath);

        if (
          (await pathExists(absoluteRetiredPath)) &&
          !expectedSurfacePaths.has(relativeRetiredPath)
        ) {
          legacyCandidates.add(relativeRetiredPath);
        }
      }
    }
  }

  return Array.from(legacyCandidates);
};

export const checkGeneratedSurfaces = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];
  const renderedSurfaces = renderGeneratedSurfaces(config);

  for (const surface of renderedSurfaces) {
    const content = await readOptionalFile(rootDir, surface.path);

    if (content === null) {
      diagnostics.push({
        category: "generated-surface",
        severity: "review",
        message: `Generated surface ${surface.path} is missing; rerun truthmark init.`,
        file: surface.path,
      });
      continue;
    }

    const comparableContent = normalizeGeneratedSurfaceContent(
      surface.managedBlock ? extractManagedBlock(content) : content,
    );
    const expectedContent = normalizeGeneratedSurfaceContent(surface.content);

    if (comparableContent !== expectedContent) {
      diagnostics.push({
        category: "generated-surface",
        severity: "review",
        message: `Generated surface ${surface.path} is stale; rerun truthmark init.`,
        file: surface.path,
      });
    }
  }

  const staleSurfaces = await collectRetiredGeneratedSurfaces(
    rootDir,
    new Set(renderedSurfaces.map((surface) => surface.path)),
  );

  for (const surfacePath of staleSurfaces) {
    diagnostics.push({
      category: "generated-surface",
      severity: "review",
      message: obsoleteGeneratedSurfaceMessage(surfacePath),
      file: surfacePath,
    });
  }

  return diagnostics;
};

export const findRetiredGeneratedSurfaces = async (
  rootDir: string,
  expectedSurfacePaths: Set<string>,
): Promise<string[]> => {
  return collectRetiredGeneratedSurfaces(rootDir, expectedSurfacePaths);
};

export const findAutoRemovableRetiredGeneratedSurfaces = async (
  rootDir: string,
  expectedSurfacePaths: Set<string>,
): Promise<string[]> => {
  return collectRetiredGeneratedSurfaces(rootDir, expectedSurfacePaths, {
    includeGeminiSurfaces: false,
  });
};
