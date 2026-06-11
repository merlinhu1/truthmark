import type { TruthmarkWorkflowManifestEntry } from "../agents/workflow-manifest.js";
import type { WorkflowActionContext, WorkflowState } from "./types.js";

export type WorkflowInstructionsSchemaVersion = "truthmark-workflow-instructions/v0";

export type WorkflowInstructions = {
  schemaVersion: WorkflowInstructionsSchemaVersion;
  workflow: WorkflowState["workflow"];
  commandSequence: Array<{
    command: string;
    when: string;
    required: boolean;
  }>;
  requiredReads: Array<{
    path: string;
    reason: string;
  }>;
  actionContext: WorkflowActionContext;
  stopConditions: string[];
  helperValidationCommands: WorkflowActionContext["helperValidationCommands"];
  reportTemplate: {
    sections: string[];
  };
  finalReportShape: string[];
  sourceStateSummary: {
    applicability: WorkflowState["applicability"];
    diagnosticCount: number;
    changedFileCount: number;
    targetTruthDocCount: number;
  };
};

const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values.filter((value) => value.length > 0))].sort();

const renderWorkflowCommand = (
  workflowState: WorkflowState,
  command: "status" | "instructions",
): string =>
  [
    "truthmark workflow",
    command,
    "--workflow",
    workflowState.workflow,
    ...(workflowState.base ? ["--base", workflowState.base] : []),
    "--json",
  ].join(" ");

export const buildWorkflowInstructions = (
  workflowState: WorkflowState,
  manifestEntry: TruthmarkWorkflowManifestEntry,
): WorkflowInstructions => {
  const requiredReads = uniqueSorted([
    ...workflowState.targetTruthDocs,
    ...(workflowState.contextPack?.truthDocs.map((document) => document.path) ?? []),
    ...(workflowState.contextPack?.sourceFiles.map((sourceFile) => sourceFile.path) ?? []),
  ]).map((path) => ({
    path,
    reason: "Review checkout evidence before acting on this workflow.",
  }));

  return {
    schemaVersion: "truthmark-workflow-instructions/v0",
    workflow: workflowState.workflow,
    commandSequence: [
      {
        command: renderWorkflowCommand(workflowState, "status"),
        when: "Before deciding whether to run the workflow.",
        required: true,
      },
      {
        command: renderWorkflowCommand(workflowState, "instructions"),
        when: "Before reading, writing, validating, or reporting.",
        required: true,
      },
      ...workflowState.checks.helpers.map((helper) => ({
        command: helper.argv.join(" "),
        when: "After workflow work produces the helper input.",
        required: !helper.optional,
      })),
    ],
    requiredReads:
      requiredReads.length > 0
        ? requiredReads
        : [
            {
              path: ".truthmark/config.yml",
              reason: "Confirm repository workflow configuration before acting.",
            },
          ],
    actionContext: workflowState.actionContext,
    stopConditions: workflowState.actionContext.stopConditions,
    helperValidationCommands: workflowState.actionContext.helperValidationCommands,
    reportTemplate: {
      sections: [...workflowState.reportSections],
    },
    finalReportShape: [...manifestEntry.reportSections],
    sourceStateSummary: {
      applicability: workflowState.applicability,
      diagnosticCount: workflowState.diagnostics.length,
      changedFileCount: workflowState.changedFiles.length,
      targetTruthDocCount: workflowState.targetTruthDocs.length,
    },
  };
};
