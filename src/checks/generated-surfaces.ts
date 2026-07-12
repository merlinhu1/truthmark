import fs from "node:fs/promises";

import type { TruthmarkConfig } from "../config/schema.js";
import { resolveRepoPath } from "../fs/paths.js";
import type { Diagnostic } from "../output/diagnostic.js";
import {
  TRUTHMARK_BLOCK_END,
  TRUTHMARK_BLOCK_START,
} from "../templates/agents-block.js";
import { renderGeneratedSurfaces } from "../templates/generated-surfaces.js";
import { buildLifecyclePlan } from "../init/lifecycle.js";

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

const isRetiredGeminiSurfacePath = (filePath: string): boolean =>
  filePath === "GEMINI.md" || filePath.startsWith(".gemini/");

const obsoleteGeneratedSurfaceMessage = (surfacePath: string): string => {
  if (isRetiredGeminiSurfacePath(surfacePath)) {
    return `Generated surface ${surfacePath} is obsolete; remove stale Gemini instructions manually if they are no longer wanted.`;
  }

  return `Generated surface ${surfacePath} is obsolete; rerun truthmark init.`;
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

  const lifecyclePlan = await buildLifecyclePlan(
    rootDir,
    config,
    "dry-run",
    renderedSurfaces,
  );
  for (const entry of lifecyclePlan.entries) {
    diagnostics.push({
      category: "generated-surface",
      severity: entry.action === "manual-review" ? "error" : "review",
      message:
        entry.action === "preserve" &&
        (entry.path.includes("truthmark-preview") ||
          entry.path.endsWith("helper-manifest.yml") ||
          entry.path.endsWith("support/helper-policy.md") ||
          isRetiredGeminiSurfacePath(entry.path))
          ? obsoleteGeneratedSurfaceMessage(entry.path)
          : entry.action === "preserve"
            ? `Generated surface ${entry.path} is inactive but was preserved: ${entry.reason}`
            : `Generated surface ${entry.path} is inactive; rerun truthmark init to reconcile it.`,
      file: entry.path,
    });
  }

  return diagnostics;
};
