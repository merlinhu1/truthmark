import { execa } from "execa";

import {
  TRUTHMARK_WORKFLOW_MANIFEST,
  type TruthmarkWorkflowManifestEntry,
  type TruthmarkWorkflowId,
} from "../agents/workflow-manifest.js";
import { loadConfig } from "../config/load.js";
import { buildContextPack } from "../context-pack/build.js";
import type { ContextPack, ContextPackWorkflow } from "../context-pack/types.js";
import { runCheck } from "../checks/check.js";
import { buildImpactSet } from "../impact/build.js";
import type { ImpactSet } from "../impact/types.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { buildRepoIndex } from "../repo-index/build.js";
import type { RepoIndex } from "../repo-index/types.js";
import { buildWorkflowActionContext } from "./action-context.js";
import type {
  BuildWorkflowStateOptions,
  WorkflowApplicability,
  WorkflowActionContextData,
  WorkflowHelperValidationCommand,
  WorkflowState,
} from "./types.js";

const contextPackWorkflowFor = (
  workflow: TruthmarkWorkflowId,
): ContextPackWorkflow | null => {
  if (workflow === "truthmark-sync") {
    return "truth-sync";
  }
  if (workflow === "truthmark-document") {
    return "truth-document";
  }
  if (workflow === "truthmark-realize") {
    return "truth-realize";
  }
  return null;
};

const helperCommandsFor = (workflow: TruthmarkWorkflowId): WorkflowHelperValidationCommand[] =>
  ((TRUTHMARK_WORKFLOW_MANIFEST[workflow] as TruthmarkWorkflowManifestEntry).helpers ?? []).map((helper) => ({
    id: helper.id,
    runner: helper.runner,
    argv: [...helper.command.argv],
    optional: helper.optional,
  }));

const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values.filter((value) => value.length > 0))].sort();

const isWriteCapable = (workflow: TruthmarkWorkflowId): boolean =>
  !["truthmark-preview", "truthmark-check"].includes(workflow);

const DEFAULT_BASE_CANDIDATES = ["@{upstream}", "origin/main", "main", "origin/master", "master"];

const selectComparisonBase = async (rootDir: string, suppliedBase?: string): Promise<string | null> => {
  if (suppliedBase) {
    return suppliedBase;
  }

  for (const candidate of DEFAULT_BASE_CANDIDATES) {
    const result = await execa("git", ["rev-parse", "--verify", `${candidate}^{commit}`], {
      cwd: rootDir,
      reject: false,
    });
    if ((result.exitCode ?? 1) === 0) {
      return candidate;
    }
  }

  return null;
};

const routeFilesFor = (repoIndex: RepoIndex): string[] =>
  uniqueSorted(repoIndex.routeMap.routes.map((route) => route.sourcePath));

const hasUnmappedFunctionalChange = (impactSet: ImpactSet | null): boolean =>
  impactSet?.diagnostics.some(
    (diagnostic) =>
      diagnostic.category === "impact" &&
      /not mapped to a Truthmark route|no affected truth document/u.test(diagnostic.message),
  ) ?? false;

const applicabilityFor = (
  workflow: TruthmarkWorkflowId,
  diagnostics: Diagnostic[],
  impactSet: ImpactSet | null,
): WorkflowApplicability => {
  const reasons: string[] = [];

  if (diagnostics.some((diagnostic) => diagnostic.message.includes("Missing .truthmark/config.yml"))) {
    reasons.push("Missing .truthmark/config.yml.");
    return { state: isWriteCapable(workflow) ? "blocked" : "not_applicable", reasons };
  }

  if (hasUnmappedFunctionalChange(impactSet)) {
    reasons.push("Changed functional files have ambiguous or missing Truthmark route ownership.");
    return { state: "ambiguous", reasons };
  }

  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    reasons.push("Existing diagnostics contain errors that block safe workflow execution.");
    return { state: "blocked", reasons };
  }

  return { state: "applicable", reasons };
};

const contextDataFor = (
  workflow: TruthmarkWorkflowId,
  repoIndex: RepoIndex,
  config: Awaited<ReturnType<typeof loadConfig>>["config"],
  impactSet: ImpactSet | null,
  contextPack: ContextPack | null,
): WorkflowActionContextData => {
  if (!config) {
    return {};
  }

  const routeFiles = routeFilesFor(repoIndex);
  const truthDocs = uniqueSorted(
    impactSet?.affectedTruthDocs ??
      contextPack?.truthDocs.map((document) => document.path) ??
      repoIndex.routeMap.routes.flatMap((route) => route.truthDocs),
  );

  return {
    routeIndexPath: config.truthmark.paths.routesIndex,
    routeFiles,
    truthRoot: config.truthmark.paths.truthRoot,
    truthDocs,
    starterTruthDocs: workflow === "truthmark-structure" ? truthDocs : [],
    codeWritePaths:
      workflow === "truthmark-realize"
        ? uniqueSorted(
            impactSet?.affectedRoutes.flatMap((route) => route.codeSurface) ??
              contextPack?.allowedWritePaths ??
              [],
          )
        : [],
    portalEnabled: config.truthmark.generated.portal.enabled,
    portalOutputPath: config.truthmark.paths.portalOutput,
    routes: repoIndex.routeMap.routes,
  };
};

export const buildWorkflowState = async (
  cwd: string,
  options: BuildWorkflowStateOptions,
): Promise<WorkflowState> => {
  const manifestEntry = TRUTHMARK_WORKFLOW_MANIFEST[options.workflow];
  if (!manifestEntry) {
    throw new Error(`Unknown Truthmark workflow: ${String(options.workflow)}`);
  }

  const repoIndex = await buildRepoIndex(cwd);
  const rootDir = repoIndex.repository.root;
  const loadResult = await loadConfig(rootDir);
  const comparisonBase = options.base
    ? options.base
    : options.workflow === "truthmark-sync"
      ? await selectComparisonBase(rootDir)
      : null;
  const impactSet = comparisonBase ? await buildImpactSet(rootDir, { base: comparisonBase }) : null;
  const contextWorkflow = contextPackWorkflowFor(options.workflow);
  const contextPack =
    contextWorkflow && (comparisonBase || options.workflow !== "truthmark-sync")
      ? await buildContextPack(cwd, {
          workflow: contextWorkflow,
          ...(comparisonBase ? { base: comparisonBase } : {}),
        })
      : null;
  const checkResult = await runCheck(cwd, comparisonBase ? { base: comparisonBase } : {});
  const diagnostics = [
    ...loadResult.diagnostics,
    ...repoIndex.diagnostics,
    ...(impactSet?.diagnostics ?? []),
    ...(contextPack?.warnings ?? []),
    ...checkResult.diagnostics,
  ];
  const applicability = applicabilityFor(options.workflow, diagnostics, impactSet);
  const actionData =
    applicability.state === "blocked" || applicability.state === "ambiguous"
      ? {}
      : contextDataFor(options.workflow, repoIndex, loadResult.config, impactSet, contextPack);

  return {
    schemaVersion: "truthmark-workflow/v0",
    workflow: options.workflow,
    applicability,
    actionContext: buildWorkflowActionContext(manifestEntry, actionData),
    changedFiles: impactSet?.changedFiles ?? [],
    affectedRoutes: impactSet?.affectedRoutes ?? [],
    targetTruthDocs: applicability.state === "ambiguous" ? [] : impactSet?.affectedTruthDocs ?? [],
    diagnostics,
    checks: {
      required: [...manifestEntry.requiredGates],
      recommended: [...manifestEntry.positiveTriggers],
      helpers: helperCommandsFor(options.workflow),
    },
    nextSteps:
      applicability.state === "ambiguous"
        ? ["Run Truth Structure or repair route ownership before writing truth docs."]
        : [],
    reportSections: [...manifestEntry.reportSections],
    ...(contextPack ? { contextPack } : {}),
  };
};
