import { execa } from "execa";

import {
  TRUTHMARK_WORKFLOW_MANIFEST,
  type TruthmarkWorkflowManifestEntry,
  type TruthmarkWorkflowId,
} from "../agents/workflow-manifest.js";
import { loadConfig } from "../config/load.js";
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
  WorkflowAdvisoryCard,
  WorkflowHelperValidationCommand,
  WorkflowState,
} from "./types.js";

const helperCommandsFor = (
  workflow: TruthmarkWorkflowId,
): WorkflowHelperValidationCommand[] =>
  (
    (TRUTHMARK_WORKFLOW_MANIFEST[workflow] as TruthmarkWorkflowManifestEntry)
      .helpers ?? []
  ).map((helper) => ({
    id: helper.id,
    runner: helper.runner,
    argv: [...helper.command.argv],
    optional: helper.optional,
  }));

const uniqueSorted = (values: string[]): string[] =>
  [...new Set(values.filter((value) => value.length > 0))].sort();

const isWriteCapable = (workflow: TruthmarkWorkflowId): boolean =>
  workflow !== "truthmark-check";

const DEFAULT_BASE_CANDIDATES = [
  "@{upstream}",
  "origin/main",
  "main",
  "origin/master",
  "master",
];

const selectComparisonBase = async (
  rootDir: string,
  suppliedBase?: string,
): Promise<string | null> => {
  if (suppliedBase) {
    return suppliedBase;
  }

  for (const candidate of DEFAULT_BASE_CANDIDATES) {
    const result = await execa(
      "git",
      ["rev-parse", "--verify", `${candidate}^{commit}`],
      {
        cwd: rootDir,
        reject: false,
      },
    );
    if ((result.exitCode ?? 1) === 0) {
      return candidate;
    }
  }

  return null;
};

const routeFilesFor = (repoIndex: RepoIndex): string[] =>
  uniqueSorted(repoIndex.routeMap.routes.map((route) => route.sourcePath));

const candidateStaleTruthDocsFor = (
  indexedTruthDocs: string[],
  primaryTruthDocs: string[],
): string[] => {
  const primary = new Set(primaryTruthDocs);
  return indexedTruthDocs.filter((truthDoc) => !primary.has(truthDoc));
};

const hasUnmappedFunctionalChange = (impactSet: ImpactSet | null): boolean =>
  impactSet?.diagnostics.some(
    (diagnostic) =>
      diagnostic.category === "impact" &&
      /not mapped to a Truthmark route|no affected truth document/u.test(
        diagnostic.message,
      ),
  ) ?? false;

const applicabilityFor = (
  workflow: TruthmarkWorkflowId,
  diagnostics: Diagnostic[],
  impactSet: ImpactSet | null,
): WorkflowApplicability => {
  const reasons: string[] = [];

  if (
    diagnostics.some((diagnostic) =>
      diagnostic.message.includes("Missing .truthmark/config.yml"),
    )
  ) {
    reasons.push("Missing .truthmark/config.yml.");
    return {
      state: isWriteCapable(workflow)
        ? "needs_manual_review"
        : "not_applicable",
      reasons,
    };
  }

  if (workflow === "truthmark-sync" && !impactSet) {
    reasons.push(
      "Choose a comparison base with --base <ref> when workflow status cannot infer one automatically.",
    );
    return { state: "needs_manual_review", reasons };
  }

  if (workflow === "truthmark-realize" && !impactSet) {
    reasons.push(
      "Choose a comparison base with --base <ref> so the helper can suggest bounded code-write paths.",
    );
    return { state: "needs_manual_review", reasons };
  }

  if (hasUnmappedFunctionalChange(impactSet)) {
    reasons.push(
      "Changed functional files need route ownership review before truth-doc suggestions are reliable.",
    );
    return { state: "needs_routing_review", reasons };
  }

  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    reasons.push(
      "Existing diagnostics need manual review before using helper write suggestions.",
    );
    return { state: "needs_manual_review", reasons };
  }

  return { state: "ready", reasons };
};

const workflowCardFor = (
  workflow: TruthmarkWorkflowId,
  applicability: WorkflowApplicability,
  diagnostics: Diagnostic[],
  impactSet: ImpactSet | null,
): WorkflowAdvisoryCard => {
  const helpers = helperCommandsFor(workflow);
  const diagnosticQuestions = diagnostics
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => diagnostic.message);

  return {
    affectedFiles: uniqueSorted(
      impactSet?.changedFiles.map((file) => file.path) ?? [],
    ),
    likelyRouteOwners: uniqueSorted(
      impactSet?.affectedRoutes.map((route) => route.sourcePath) ?? [],
    ),
    suggestedTruthDocs:
      applicability.state === "needs_routing_review"
        ? []
        : uniqueSorted(impactSet?.affectedTruthDocs ?? []),
    openQuestions: uniqueSorted([
      ...applicability.reasons,
      ...diagnosticQuestions,
    ]),
    skippedHelperStatus: helpers.map((helper) => ({
      helper: helper.id,
      status: "skipped" as const,
      reason:
        "workflow status does not run optional helpers; inspect the checkout directly or run the helper manually when useful.",
    })),
  };
};

const contextDataFor = (
  workflow: TruthmarkWorkflowId,
  repoIndex: RepoIndex,
  config: Awaited<ReturnType<typeof loadConfig>>["config"],
  impactSet: ImpactSet | null,
): WorkflowActionContextData => {
  if (!config) {
    return {};
  }

  const routeFiles = routeFilesFor(repoIndex);
  const indexedTruthDocs = uniqueSorted(
    repoIndex.routeMap.routes.flatMap((route) => route.truthDocs),
  );
  const primaryTruthDocs = uniqueSorted(impactSet?.affectedTruthDocs ?? []);
  const candidateStaleTruthDocs =
    workflow === "truthmark-sync"
      ? candidateStaleTruthDocsFor(indexedTruthDocs, primaryTruthDocs)
      : [];
  const truthDocs =
    workflow === "truthmark-sync"
      ? uniqueSorted([...primaryTruthDocs, ...candidateStaleTruthDocs])
      : uniqueSorted(impactSet?.affectedTruthDocs ?? indexedTruthDocs);

  return {
    routeIndexPath: config.truthmark.paths.routesIndex,
    routeFiles,
    truthRoot: config.truthmark.paths.truthRoot,
    truthDocs,
    primaryTruthDocs:
      workflow === "truthmark-sync" ? primaryTruthDocs : truthDocs,
    candidateStaleTruthDocs,
    starterTruthDocs: workflow === "truthmark-structure" ? truthDocs : [],
    codeWritePaths:
      workflow === "truthmark-realize"
        ? uniqueSorted(
            impactSet?.affectedRoutes.flatMap((route) => route.codeSurface) ??
              [],
          )
        : [],
    portalEnabled: config.truthmark.generated.portal.enabled,
    portalOutputPath: config.truthmark.paths.portalOutput,
    routes: repoIndex.routeMap.routes,
  };
};

const nextStepsFor = (
  workflow: TruthmarkWorkflowId,
  applicability: WorkflowApplicability,
  comparisonBase: string | null,
): string[] => {
  if (applicability.state === "needs_routing_review") {
    return [
      "Run Truth Structure or repair route ownership before writing truth docs.",
    ];
  }

  if (
    (workflow === "truthmark-sync" || workflow === "truthmark-realize") &&
    applicability.state === "needs_manual_review" &&
    !comparisonBase
  ) {
    return [
      workflow === "truthmark-sync"
        ? "Rerun with --base <ref> so the helper can suggest changed-file impact."
        : "Rerun with --base <ref> so the helper can suggest bounded code-write paths.",
    ];
  }

  return [];
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
  const impactSet = comparisonBase
    ? await buildImpactSet(rootDir, { base: comparisonBase })
    : null;
  const checkResult = await runCheck(
    cwd,
    comparisonBase ? { base: comparisonBase } : {},
  );
  const diagnostics = [
    ...loadResult.diagnostics,
    ...repoIndex.diagnostics,
    ...(impactSet?.diagnostics ?? []),
    ...checkResult.diagnostics,
  ];
  const applicability = applicabilityFor(
    options.workflow,
    diagnostics,
    impactSet,
  );
  const actionData =
    applicability.state === "needs_manual_review" ||
    applicability.state === "needs_routing_review"
      ? {}
      : contextDataFor(
          options.workflow,
          repoIndex,
          loadResult.config,
          impactSet,
        );

  return {
    schemaVersion: "truthmark-workflow/v0",
    workflow: options.workflow,
    applicability,
    actionContext: buildWorkflowActionContext(manifestEntry, actionData),
    workflowCard: workflowCardFor(
      options.workflow,
      applicability,
      diagnostics,
      impactSet,
    ),
    changedFiles: impactSet?.changedFiles ?? [],
    affectedRoutes: impactSet?.affectedRoutes ?? [],
    targetTruthDocs:
      applicability.state === "needs_routing_review"
        ? []
        : (impactSet?.affectedTruthDocs ?? []),
    diagnostics,
    checks: {
      reviewChecklist: [...manifestEntry.reviewQuestions],
      recommended: [...manifestEntry.positiveTriggers],
      helpers: helperCommandsFor(options.workflow),
      affectedTests: impactSet?.affectedTests ?? [],
    },
    nextSteps: nextStepsFor(options.workflow, applicability, comparisonBase),
    reportSections: [...manifestEntry.reportSections],
  };
};
