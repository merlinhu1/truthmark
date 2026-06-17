import type {
  TruthmarkWorkflowHelper,
  TruthmarkWorkflowId,
} from "../agents/workflow-manifest.js";
import type { ImpactFile, ImpactRoute } from "../impact/types.js";
import type { Diagnostic } from "../output/diagnostic.js";
import type { RouteMapRoute } from "../repo-index/types.js";

export type WorkflowStateSchemaVersion = "truthmark-workflow/v0";

export type WorkflowApplicabilityState =
  | "ready"
  | "not_applicable"
  | "needs_manual_review"
  | "needs_routing_review";

export type WorkflowActionMode =
  | "read-only"
  | "truth-doc-write"
  | "route-write"
  | "code-write"
  | "portal-write";

export type WorkflowHelperValidationCommand = {
  id: string;
  runner: string;
  argv: string[];
  optional: boolean;
};

export type WorkflowActionContext = {
  mode: WorkflowActionMode;
  allowedWritePaths: string[];
  routeFiles: string[];
  primaryTruthDocs: string[];
  candidateStaleTruthDocs: string[];
  forbiddenWritePaths: string[];
  stopConditions: string[];
  evidencePrompts: string[];
  helperValidationCommands: WorkflowHelperValidationCommand[];
  writeLeaseRequired: boolean;
};

export type WorkflowApplicability = {
  state: WorkflowApplicabilityState;
  reasons: string[];
};

export type WorkflowStateChecks = {
  reviewChecklist: string[];
  recommended: string[];
  helpers: WorkflowHelperValidationCommand[];
  affectedTests: string[];
};

export type WorkflowSkippedHelperStatus = {
  helper: string;
  status: "skipped";
  reason: string;
};

export type WorkflowAdvisoryCard = {
  affectedFiles: string[];
  likelyRouteOwners: string[];
  suggestedTruthDocs: string[];
  openQuestions: string[];
  skippedHelperStatus: WorkflowSkippedHelperStatus[];
};

export type WorkflowState = {
  schemaVersion: WorkflowStateSchemaVersion;
  workflow: TruthmarkWorkflowId;
  applicability: WorkflowApplicability;
  actionContext: WorkflowActionContext;
  workflowCard: WorkflowAdvisoryCard;
  changedFiles: ImpactFile[];
  affectedRoutes: ImpactRoute[];
  targetTruthDocs: string[];
  diagnostics: Diagnostic[];
  checks: WorkflowStateChecks;
  nextSteps: string[];
  reportSections: string[];
};

export type BuildWorkflowStateOptions = {
  workflow: TruthmarkWorkflowId;
  base?: string;
};

export type WorkflowActionContextData = {
  routeIndexPath?: string;
  routeFiles?: string[];
  truthRoot?: string;
  truthDocs?: string[];
  primaryTruthDocs?: string[];
  candidateStaleTruthDocs?: string[];
  starterTruthDocs?: string[];
  codeWritePaths?: string[];
  portalEnabled?: boolean;
  portalOutputPath?: string;
  routes?: RouteMapRoute[];
};

export type WorkflowStateManifestHelper = TruthmarkWorkflowHelper;
