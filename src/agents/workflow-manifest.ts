export type TruthmarkWorkflowId =
  | "truthmark-sync"
  | "truthmark-structure"
  | "truthmark-document"
  | "truthmark-realize"
  | "truthmark-check"
  | "truthmark-portal";

export type TruthmarkReadOnlySubagentId =
  | "truth_route_auditor"
  | "truth_claim_verifier"
  | "truth_doc_reviewer";
export type TruthmarkWriteSubagentId = "truth_doc_writer";
type TruthmarkWorkflowHelperCommand = {
  argv: string[];
};

export type TruthmarkWorkflowHelper = {
  id: string;
  optional: boolean;
  runner: string;
  command: TruthmarkWorkflowHelperCommand;
  inputs: string[];
  output: "json";
  writes: boolean;
  allowedWrites?: string[];
  fallback: string;
};

export type TruthmarkWorkflowManifestEntry = {
  id: TruthmarkWorkflowId;
  displayName: string;
  description: string;
  shortDescription: string;
  defaultPrompt: string;
  allowImplicitInvocation: boolean;
  positiveTriggers: string[];
  negativeTriggers: string[];
  forbiddenAdjacency: string[];
  reviewQuestions: string[];
  allowedWrites: string[];
  reportSections: string[];
  subagents?: TruthmarkReadOnlySubagentId[];
  writeSubagents?: TruthmarkWriteSubagentId[];
  helpers?: TruthmarkWorkflowHelper[];
};

const TRUTHMARK_CLI_RUNNER = "truthmark";

const VALIDATE_SYNC_REPORT_HELPER = {
  id: "validate-sync-report",
  optional: true,
  runner: TRUTHMARK_CLI_RUNNER,
  command: {
    argv: ["truthmark", "validate", "sync-report", "<report-file>", "--json"],
  },
  inputs: ["sync report file"],
  output: "json",
  writes: false,
  fallback:
    "manually validate support/report-template.md and check Evidence checked entries match Claim, indented Evidence, and Result: supported | narrowed | removed | blocked",
} satisfies TruthmarkWorkflowHelper;

const VALIDATE_DOCUMENT_REPORT_HELPER = {
  id: "validate-document-report",
  optional: true,
  runner: TRUTHMARK_CLI_RUNNER,
  command: {
    argv: [
      "truthmark",
      "validate",
      "document-report",
      "<report-file>",
      "--json",
    ],
  },
  inputs: ["document report file"],
  output: "json",
  writes: false,
  fallback:
    "manually validate support/report-template.md required sections and structured Evidence checked entries",
} satisfies TruthmarkWorkflowHelper;

const VALIDATE_WRITE_LEASE_HELPER = {
  id: "validate-write-lease",
  optional: true,
  runner: TRUTHMARK_CLI_RUNNER,
  command: {
    argv: [
      "truthmark",
      "validate",
      "write-lease",
      "<lease-or-report-file>",
      "<changed-files-file>",
      "--json",
    ],
  },
  inputs: ["lease or worker report yaml", "changed file list"],
  output: "json",
  writes: false,
  fallback:
    "manually compare declared allowedWrites and forbiddenWrites with the actual changed files",
} satisfies TruthmarkWorkflowHelper;

export const TRUTHMARK_WORKFLOW_MANIFEST = {
  "truthmark-sync": {
    id: "truthmark-sync",
    displayName: "Truthmark Sync",
    description:
      "Use automatically at finish-time after functional code changes, or explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or manual topology design.",
    shortDescription:
      "Sync truth docs from functional code changes; skip docs-only/no-code changes",
    defaultPrompt:
      "Use $truthmark-sync after functional code changes; skip docs-only/no-code changes.",
    allowImplicitInvocation: true,
    positiveTriggers: [
      "functional code changed since last successful Truth Sync",
      "explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync",
    ],
    negativeTriggers: [
      "documentation-only change",
      "formatting-only change",
      "behavior-preserving rename",
      "missing Truthmark config",
      "no functional code changes",
    ],
    forbiddenAdjacency: [
      "doc-first implementation belongs to Truth Realize",
      "manual topology design belongs to Truth Structure",
    ],
    reviewQuestions: [
      "topology review",
      "truth-doc ownership",
      "lane classification",
      "Decision/Rationale preservation",
      "truth-doc shape repair when restructuring",
      "Evidence checklist",
    ],
    allowedWrites: ["canonical truth docs", "truth routing files"],
    reportSections: [
      "Changed code reviewed",
      "Sync Intent",
      "Ownership reviewed",
      "Structure required",
      "Truth docs updated",
      "Truth docs split",
      "Evidence checked",
      "Notes",
    ],
    subagents: ["truth_route_auditor", "truth_claim_verifier"],
    writeSubagents: ["truth_doc_writer"],
    helpers: [VALIDATE_SYNC_REPORT_HELPER, VALIDATE_WRITE_LEASE_HELPER],
  },
  "truthmark-structure": {
    id: "truthmark-structure",
    displayName: "Truthmark Structure",
    description:
      "Use when routing or truth ownership is missing, stale, broad, overloaded, catch-all, unrouteable, mixed-owner, needs split/repair, or needs new area setup. Not for documenting implemented behavior, syncing a code diff, or realizing docs into code.",
    shortDescription: "Design, repair, or set up Truthmark area routing",
    defaultPrompt:
      "Use $truthmark-structure to design, repair, or set up Truthmark area routing.",
    allowImplicitInvocation: false,
    positiveTriggers: [
      "split broad repository routing into bounded areas",
      "repair missing, stale, catch-all, unrouteable, or mixed-owner truth ownership",
      "onboard a new code area into Truthmark routing",
      "new package, controller, domain, or product area lacks bounded truth ownership",
    ],
    negativeTriggers: [
      "document existing implemented behavior",
      "sync truth after a functional code diff",
      "realize truth docs into code",
    ],
    forbiddenAdjacency: [
      "must not implement functional code",
      "must not patch mixed-owner docs as shape repair",
    ],
    reviewQuestions: [
      "truth-doc ownership",
      "lane classification",
      "Decision/Rationale preservation",
      "lane split and relationship repair",
      "truth-doc shape repair when restructuring",
      "Evidence checklist",
    ],
    allowedWrites: ["truth routing files", "starter canonical truth docs"],
    reportSections: [
      "Topology reviewed",
      "Areas reviewed",
      "Routing updated",
      "Initial truth boundary",
      "Truth docs created",
      "Truth docs split",
      "Truth docs restructured",
      "Evidence checked",
      "Topology decisions",
      "Notes",
    ],
    subagents: ["truth_route_auditor"],
  },
  "truthmark-document": {
    id: "truthmark-document",
    displayName: "Truthmark Document",
    description:
      "Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.",
    shortDescription: "Document existing implemented behavior",
    defaultPrompt:
      "Use $truthmark-document to document existing implemented behavior.",
    allowImplicitInvocation: false,
    positiveTriggers: [
      "document existing implemented behavior",
      "handoff finds implemented behavior missing canonical truth",
    ],
    negativeTriggers: [
      "functional-code change that requires Truth Sync",
      "doc-first implementation",
      "topology repair that needs Truth Structure",
    ],
    forbiddenAdjacency: [
      "must not edit functional code",
      "must not repair mixed-owner docs in place",
    ],
    reviewQuestions: [
      "truth-doc ownership",
      "lane classification",
      "Decision/Rationale preservation",
      "Evidence checklist",
      "truth-doc shape repair when restructuring",
    ],
    allowedWrites: ["canonical truth docs", "truth routing files"],
    reportSections: [
      "Implementation reviewed",
      "Ownership reviewed",
      "Structure required",
      "Truth docs created",
      "Truth docs updated",
      "Truth docs restructured",
      "Routing updated",
      "Evidence checked",
      "Notes",
    ],
    subagents: ["truth_route_auditor", "truth_claim_verifier"],
    writeSubagents: ["truth_doc_writer"],
    helpers: [VALIDATE_DOCUMENT_REPORT_HELPER, VALIDATE_WRITE_LEASE_HELPER],
  },
  "truthmark-realize": {
    id: "truthmark-realize",
    displayName: "Truthmark Realize",
    description:
      "Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.",
    shortDescription: "Realize truth docs into code",
    defaultPrompt:
      "Use $truthmark-realize to realize the updated truth docs into code.",
    allowImplicitInvocation: false,
    positiveTriggers: ["explicitly realize truth docs into functional code"],
    negativeTriggers: [
      "sync docs after code changes",
      "document existing implemented behavior",
      "topology repair",
      "truth audit",
    ],
    forbiddenAdjacency: [
      "must not edit truth docs except through follow-up Truth Sync",
      "must not edit truth routing except through follow-up Truth Sync",
    ],
    reviewQuestions: ["lane classification", "truth-doc ownership"],
    allowedWrites: ["functional code"],
    reportSections: ["Truth docs used", "Code updated", "Verification"],
  },
  "truthmark-check": {
    id: "truthmark-check",
    displayName: "Truthmark Check",
    description:
      "Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.",
    shortDescription: "Audit repository truth health",
    defaultPrompt: "Use $truthmark-check to audit repository truth health.",
    allowImplicitInvocation: false,
    positiveTriggers: [
      "audit repository truth health",
      "audit routing, ownership, or canonical docs",
    ],
    negativeTriggers: [
      "normal lint/test/typecheck verification",
      "code review",
      "finish-time Truth Sync",
    ],
    forbiddenAdjacency: [
      "must not replace ordinary verification",
      "must not silently rewrite docs",
    ],
    reviewQuestions: ["audit evidence checklist"],
    allowedWrites: ["none by default"],
    reportSections: [
      "Files reviewed",
      "Issues found",
      "Fixes suggested",
      "Evidence checked",
      "Validation",
    ],
    subagents: [
      "truth_route_auditor",
      "truth_claim_verifier",
      "truth_doc_reviewer",
    ],
  },
  "truthmark-portal": {
    id: "truthmark-portal",
    displayName: "Truthmark Portal",
    description:
      "Use when the user explicitly asks to generate, refresh, or update the Truthmark Portal static HTML site. Not for code change sync, route repair, truth validation/checking, documenting behavior, realizing docs into code, or machine-readable agent context.",
    shortDescription: "Generate a committed static HTML Truthmark Portal",
    defaultPrompt:
      "Use $truthmark-portal only when explicitly asked to generate or refresh the committed static HTML Portal.",
    allowImplicitInvocation: false,
    positiveTriggers: [
      "generate the Truthmark Portal",
      "refresh the committed HTML docs site",
      "create a browsable project map from Truthmark docs",
      "update the Truthmark Portal output",
      "make a human-readable static site from the truth docs",
    ],
    negativeTriggers: [
      "code change sync",
      "route ownership repair",
      "truth validation or checking",
      "document implemented behavior",
      "realize docs into code",
      "machine-readable agent context",
    ],
    forbiddenAdjacency: [
      "must not run automatically at completion",
      "must not replace Truth Sync, Truth Check, Truth Document, Truth Realize, or Truth Structure",
      "must not write outside the fixed Portal output directory",
    ],
    reviewQuestions: [
      "manual-only invocation",
      "Portal output containment",
      "Markdown canonical statement",
      "source provenance",
    ],
    allowedWrites: ["fixed Portal output directory only"],
    reportSections: [
      "Output path",
      "Page count",
      "Diagrams/assets",
      "Source docs reviewed",
      "Skipped/ambiguous docs",
      "Validation",
      "Markdown canonical statement",
    ],
  },
} satisfies Record<TruthmarkWorkflowId, TruthmarkWorkflowManifestEntry>;

export const TRUTHMARK_WORKFLOW_IDS = Object.keys(
  TRUTHMARK_WORKFLOW_MANIFEST,
) as TruthmarkWorkflowId[];

export const getTruthmarkWorkflow = (
  id: TruthmarkWorkflowId,
): TruthmarkWorkflowManifestEntry => {
  return TRUTHMARK_WORKFLOW_MANIFEST[id];
};
