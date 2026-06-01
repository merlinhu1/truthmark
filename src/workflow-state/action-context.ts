import type { TruthmarkWorkflowManifestEntry } from "../agents/workflow-manifest.js";
import type {
  WorkflowActionContext,
  WorkflowActionContextData,
  WorkflowActionMode,
  WorkflowHelperValidationCommand,
} from "./types.js";

const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values.filter((value) => value.length > 0))].sort();

const helperCommandsFor = (
  manifestEntry: TruthmarkWorkflowManifestEntry,
): WorkflowHelperValidationCommand[] =>
  (manifestEntry.helpers ?? []).map((helper) => ({
    id: helper.id,
    runner: helper.runner,
    argv: [...helper.command.argv],
    optional: helper.optional,
  }));

const evidenceFor = (manifestEntry: TruthmarkWorkflowManifestEntry): string[] =>
  manifestEntry.requiredGates.filter((gate) => /evidence|ownership|containment/iu.test(gate));

const baseContext = (
  manifestEntry: TruthmarkWorkflowManifestEntry,
  mode: WorkflowActionMode,
  allowedWritePaths: string[],
  forbiddenWritePaths: string[],
  writeLeaseRequired: boolean,
): WorkflowActionContext => ({
  mode,
  allowedWritePaths: uniqueSorted(allowedWritePaths),
  forbiddenWritePaths: uniqueSorted(forbiddenWritePaths),
  stopConditions: [...manifestEntry.negativeTriggers, ...manifestEntry.forbiddenAdjacency],
  requiredEvidence: evidenceFor(manifestEntry),
  helperValidationCommands: helperCommandsFor(manifestEntry),
  writeLeaseRequired,
});

export const buildWorkflowActionContext = (
  manifestEntry: TruthmarkWorkflowManifestEntry,
  data: WorkflowActionContextData = {},
): WorkflowActionContext => {
  if (manifestEntry.id === "truthmark-preview" || manifestEntry.id === "truthmark-check") {
    return baseContext(manifestEntry, "read-only", [], [], false);
  }

  if (manifestEntry.id === "truthmark-sync" || manifestEntry.id === "truthmark-document") {
    return baseContext(
      manifestEntry,
      "truth-doc-write",
      [...(data.routeIndexPath ? [data.routeIndexPath] : []), ...(data.routeFiles ?? []), ...(data.truthDocs ?? [])],
      [],
      true,
    );
  }

  if (manifestEntry.id === "truthmark-structure") {
    return baseContext(
      manifestEntry,
      "route-write",
      [
        ...(data.routeIndexPath ? [data.routeIndexPath] : []),
        ...(data.routeFiles ?? []),
        ...(data.starterTruthDocs ?? []),
      ],
      [],
      true,
    );
  }

  if (manifestEntry.id === "truthmark-realize") {
    return baseContext(
      manifestEntry,
      "code-write",
      data.codeWritePaths ?? [],
      [
        ...(data.routeIndexPath ? [data.routeIndexPath] : []),
        ...(data.routeFiles ?? []),
        ...(data.truthRoot ? [`${data.truthRoot}/**/*.md`] : []),
        ...(data.truthDocs ?? []),
      ],
      false,
    );
  }

  return baseContext(
    manifestEntry,
    "portal-write",
    data.portalEnabled && data.portalOutputPath ? [`${data.portalOutputPath}/**`] : [],
    [],
    false,
  );
};
