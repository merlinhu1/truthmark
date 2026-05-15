import { runConfig as runRepositoryConfig, type ConfigCommandOptions } from "../config/command.js";
import { runInit as runRepositoryInit } from "../init/init.js";
import { runCheck as runRepositoryCheck } from "../checks/check.js";
import type { CommandResult } from "../output/diagnostic.js";
import { buildImpactSet } from "../impact/build.js";
import { buildContextPack } from "../context-pack/build.js";
import { renderContextPackMarkdown } from "../context-pack/render.js";
import type { ContextPackWorkflow } from "../context-pack/types.js";
import { buildRepoIndex } from "../repo-index/build.js";

export const runConfig = async (options: ConfigCommandOptions): Promise<CommandResult> => {
  return runRepositoryConfig(process.cwd(), options);
};

export const runInit = async (): Promise<CommandResult> => {
  return runRepositoryInit(process.cwd());
};

export const runCheck = async (options: { base?: string } = {}): Promise<CommandResult> => {
  return runRepositoryCheck(process.cwd(), options);
};

export const runIndex = async (): Promise<CommandResult> => {
  const repoIndex = await buildRepoIndex(process.cwd());
  const errorCount = repoIndex.diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  const reviewCount = repoIndex.diagnostics.filter((diagnostic) => diagnostic.severity === "review").length;

  return {
    command: "index",
    summary: `Truthmark index completed with ${errorCount} error diagnostics and ${reviewCount} review diagnostics.`,
    diagnostics: repoIndex.diagnostics,
    data: {
      repoIndex,
      routeMap: repoIndex.routeMap,
    },
  };
};

export const runImpact = async (options: { base?: string }): Promise<CommandResult> => {
  if (!options.base) {
    return {
      command: "impact",
      summary: "Truthmark impact requires --base.",
      diagnostics: [
        {
          category: "impact",
          severity: "error",
          message: "truthmark impact requires --base <ref>.",
        },
      ],
    };
  }

  const impactSet = await buildImpactSet(process.cwd(), { base: options.base });
  const errorCount = impactSet.diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  const reviewCount = impactSet.diagnostics.filter((diagnostic) => diagnostic.severity === "review").length;

  return {
    command: "impact",
    summary: `Truthmark impact completed with ${errorCount} error diagnostics and ${reviewCount} review diagnostics.`,
    diagnostics: impactSet.diagnostics,
    data: {
      impactSet,
    },
  };
};

const isContextPackWorkflow = (value: unknown): value is ContextPackWorkflow => {
  return value === "truth-sync" || value === "truth-document" || value === "truth-realize";
};

const isContextPackFormat = (value: unknown): value is "json" | "markdown" | undefined => {
  return value === undefined || value === "json" || value === "markdown";
};

export const runContext = async (options: {
  workflow?: string;
  base?: string;
  format?: string;
}): Promise<CommandResult> => {
  if (!isContextPackWorkflow(options.workflow)) {
    return {
      command: "context",
      summary: "Truthmark context requires a supported --workflow value.",
      diagnostics: [
        {
          category: "context-pack",
          severity: "error",
          message: "truthmark context requires --workflow truth-sync, truth-document, or truth-realize.",
        },
      ],
    };
  }

  if (!isContextPackFormat(options.format)) {
    return {
      command: "context",
      summary: "Truthmark context requires a supported --format value.",
      diagnostics: [
        {
          category: "context-pack",
          severity: "error",
          message: "truthmark context requires --format json or markdown.",
        },
      ],
    };
  }

  const contextPack = await buildContextPack(process.cwd(), {
    workflow: options.workflow,
    base: options.base,
  });
  const diagnostics = contextPack.warnings;

  return {
    command: "context",
    summary: `Truthmark context generated ${contextPack.workflow} ContextPack with ${diagnostics.length} warnings.`,
    diagnostics,
    data: {
      contextPack,
      ...(options.format === "markdown" ? { markdown: renderContextPackMarkdown(contextPack) } : {}),
    },
  };
};
