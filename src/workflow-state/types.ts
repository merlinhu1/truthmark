import type {
  TruthmarkWorkflowHelper,
  TruthmarkWorkflowId,
} from "../agents/workflow-manifest.js";
import type { ImpactFile, ImpactRoute } from "../impact/types.js";
import type { Diagnostic } from "../output/diagnostic.js";
import type { RouteMapRoute } from "../repo-index/types.js";

export type WorkflowStateSchemaVersion = "truthmark-workflow/v0";

export type WorkflowApplicabilityState =
  | "applicable"
  | "not_applicable"
  | "blocked"
  | "ambiguous";

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
  forbiddenWritePaths: string[];
  stopConditions: string[];
  requiredEvidence: string[];
  helperValidationCommands: WorkflowHelperValidationCommand[];
  writeLeaseRequired: boolean;
};

export type WorkflowApplicability = {
  state: WorkflowApplicabilityState;
  reasons: string[];
};

export type WorkflowStateChecks = {
  required: string[];
  recommended: string[];
  helpers: WorkflowHelperValidationCommand[];
  affectedTests: string[];
};

export type WorkflowState = {
  schemaVersion: WorkflowStateSchemaVersion;
  workflow: TruthmarkWorkflowId;
  applicability: WorkflowApplicability;
  actionContext: WorkflowActionContext;
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
  starterTruthDocs?: string[];
  codeWritePaths?: string[];
  portalEnabled?: boolean;
  portalOutputPath?: string;
  routes?: RouteMapRoute[];
};

export type WorkflowStateManifestHelper = TruthmarkWorkflowHelper;
