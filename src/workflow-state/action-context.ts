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
  manifestEntry.reviewQuestions.filter((question) =>
    /evidence|ownership|containment/iu.test(question),
  );

const baseContext = (
  manifestEntry: TruthmarkWorkflowManifestEntry,
  mode: WorkflowActionMode,
  allowedWritePaths: string[],
  routeFiles: string[],
  primaryTruthDocs: string[],
  candidateStaleTruthDocs: string[],
  forbiddenWritePaths: string[],
  writeLeaseRequired: boolean,
): WorkflowActionContext => ({
  mode,
  allowedWritePaths: uniqueSorted(allowedWritePaths),
  routeFiles: uniqueSorted(routeFiles),
  primaryTruthDocs: uniqueSorted(primaryTruthDocs),
  candidateStaleTruthDocs: uniqueSorted(candidateStaleTruthDocs),
  forbiddenWritePaths: uniqueSorted(forbiddenWritePaths),
  stopConditions: [
    ...manifestEntry.negativeTriggers,
    ...manifestEntry.forbiddenAdjacency,
  ],
  evidencePrompts: uniqueSorted([
    ...evidenceFor(manifestEntry),
    ...(candidateStaleTruthDocs.length > 0
      ? [
          "Record checkout evidence and the reason before touching a candidate stale truth doc outside primaryTruthDocs.",
        ]
      : []),
  ]),
  helperValidationCommands: helperCommandsFor(manifestEntry),
  writeLeaseRequired,
});

export const buildWorkflowActionContext = (
  manifestEntry: TruthmarkWorkflowManifestEntry,
  data: WorkflowActionContextData = {},
): WorkflowActionContext => {
  if (manifestEntry.id === "truthmark-check") {
    return baseContext(manifestEntry, "read-only", [], [], [], [], [], false);
  }

  if (
    manifestEntry.id === "truthmark-sync" ||
    manifestEntry.id === "truthmark-document"
  ) {
    const routeFiles = data.routeFiles ?? [];
    const primaryTruthDocs = data.primaryTruthDocs ?? data.truthDocs ?? [];
    const candidateStaleTruthDocs = data.candidateStaleTruthDocs ?? [];
    return baseContext(
      manifestEntry,
      "truth-doc-write",
      [
        ...(data.routeIndexPath ? [data.routeIndexPath] : []),
        ...routeFiles,
        ...primaryTruthDocs,
        ...candidateStaleTruthDocs,
      ],
      routeFiles,
      primaryTruthDocs,
      candidateStaleTruthDocs,
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
      data.routeFiles ?? [],
      data.starterTruthDocs ?? [],
      [],
      [],
      true,
    );
  }

  if (manifestEntry.id === "truthmark-realize") {
    return baseContext(
      manifestEntry,
      "code-write",
      data.codeWritePaths ?? [],
      data.routeFiles ?? [],
      data.truthDocs ?? [],
      [],
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
    data.portalEnabled && data.portalOutputPath
      ? [`${data.portalOutputPath}/**`]
      : [],
    [],
    [],
    [],
    [],
    false,
  );
};
