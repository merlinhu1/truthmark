import fs from "node:fs/promises";

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

export const checkGeneratedSurfaces = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];

  for (const surface of renderGeneratedSurfaces(config)) {
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

  return diagnostics;
};
