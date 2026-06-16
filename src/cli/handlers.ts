import { runConfig as runRepositoryConfig, type ConfigCommandOptions } from "../config/command.js";
import { runInit as runRepositoryInit } from "../init/init.js";
import { runCheck as runRepositoryCheck } from "../checks/check.js";
import type { CommandResult } from "../output/diagnostic.js";
import { buildImpactSet } from "../impact/build.js";
import {
  TRUTHMARK_WORKFLOW_IDS,
  type TruthmarkWorkflowId,
} from "../agents/workflow-manifest.js";
import { buildWorkflowState } from "../workflow-state/build.js";
import fs from "node:fs/promises";

import {
  validateTruthDocumentReportText,
  validateTruthSyncReportText,
  validateWriteLeaseText,
  type WorkflowHelperValidationResult,
} from "../agents/workflow-helper-validation.js";
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

const isTruthmarkWorkflowId = (value: unknown): value is TruthmarkWorkflowId => {
  return typeof value === "string" && TRUTHMARK_WORKFLOW_IDS.includes(value as TruthmarkWorkflowId);
};

const invalidWorkflowResult = (
  command: "workflow status",
  workflow: string | undefined,
): CommandResult => ({
  command,
  summary: workflow
    ? `Truthmark workflow requires a supported full workflow ID; received ${workflow}.`
    : "Truthmark workflow requires --workflow.",
  diagnostics: [
    {
      category: "workflow-state",
      severity: "error",
      message: workflow
        ? `Unknown Truthmark workflow: ${workflow}. Use a canonical full manifest ID such as truthmark-sync or truthmark-check.`
        : `truthmark ${command} requires --workflow <workflow>.`,
    },
  ],
  data: {
    request: workflow ? { workflow } : {},
  },
});

const readHelperFile = async (filePath: string, helper: string): Promise<string | WorkflowHelperValidationResult> => {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, helper, errors: [`could not read file: ${message}`] };
  }
};

export const runValidateSyncReport = async (
  reportFile: string,
): Promise<WorkflowHelperValidationResult> => {
  const text = await readHelperFile(reportFile, "validate-sync-report");
  return typeof text === "string" ? validateTruthSyncReportText(text) : text;
};

export const runValidateDocumentReport = async (
  reportFile: string,
): Promise<WorkflowHelperValidationResult> => {
  const text = await readHelperFile(reportFile, "validate-document-report");
  return typeof text === "string" ? validateTruthDocumentReportText(text) : text;
};

export const runValidateWriteLease = async (
  leaseFile: string,
  changedFilesFile: string,
): Promise<WorkflowHelperValidationResult> => {
  const leaseText = await readHelperFile(leaseFile, "validate-write-lease");
  if (typeof leaseText !== "string") {
    return leaseText;
  }

  const changedText = await readHelperFile(changedFilesFile, "validate-write-lease");
  if (typeof changedText !== "string") {
    return changedText;
  }

  return validateWriteLeaseText(leaseText, changedText);
};

export const runWorkflowStatus = async (options: {
  workflow?: string;
  base?: string;
}): Promise<CommandResult> => {
  if (!isTruthmarkWorkflowId(options.workflow)) {
    return invalidWorkflowResult("workflow status", options.workflow);
  }

  const workflowState = await buildWorkflowState(process.cwd(), {
    workflow: options.workflow,
    ...(options.base ? { base: options.base } : {}),
  });

  return {
    command: "workflow status",
    summary: `Truthmark workflow status completed for ${options.workflow}.`,
    diagnostics: workflowState.diagnostics,
    data: {
      request: {
        workflow: options.workflow,
        ...(options.base ? { base: options.base } : {}),
      },
      workflowState,
    },
  };
};
