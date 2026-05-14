export type TruthmarkWorkflowId =
  | "truthmark-sync"
  | "truthmark-structure"
  | "truthmark-document"
  | "truthmark-realize"
  | "truthmark-check";

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
  requiredGates: string[];
  allowedWrites: string[];
  reportSections: string[];
};

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
    requiredGates: [
      "topology quality",
      "truth-doc ownership",
      "Product Decisions/Rationale preservation",
      "truth-doc shape repair when restructuring",
      "Evidence Gate",
    ],
    allowedWrites: ["canonical truth docs", "truth routing files"],
    reportSections: [
      "Changed code reviewed",
      "Ownership reviewed",
      "Structure required",
      "Truth docs updated",
      "Truth docs split",
      "Evidence checked",
      "Notes",
    ],
  },
  "truthmark-structure": {
    id: "truthmark-structure",
    displayName: "Truthmark Structure",
    description:
      "Use when routing or truth ownership is missing, stale, broad, overloaded, catch-all, unrouteable, mixed-owner, or needs split/repair. Not for documenting implemented behavior, syncing a code diff, or realizing docs into code.",
    shortDescription: "Design or repair Truthmark area routing",
    defaultPrompt:
      "Use $truthmark-structure to design or repair Truthmark area routing.",
    allowImplicitInvocation: false,
    positiveTriggers: [
      "split broad repository routing into bounded areas",
      "repair missing, stale, catch-all, unrouteable, or mixed-owner truth ownership",
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
    requiredGates: [
      "truth-doc ownership",
      "Product Decisions/Rationale preservation",
      "truth-doc shape repair when restructuring",
      "Evidence Gate",
    ],
    allowedWrites: ["truth routing files", "starter canonical truth docs"],
    reportSections: [
      "Topology reviewed",
      "Areas reviewed",
      "Routing updated",
      "Truth docs created",
      "Truth docs split",
      "Truth docs restructured",
      "Evidence checked",
      "Topology decisions",
      "Notes",
    ],
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
    requiredGates: [
      "truth-doc ownership",
      "Product Decisions/Rationale preservation",
      "Evidence Gate",
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
  },
  "truthmark-realize": {
    id: "truthmark-realize",
    displayName: "Truthmark Realize",
    description:
      "Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.",
    shortDescription: "Realize truth docs into code",
    defaultPrompt: "Use $truthmark-realize to realize the updated truth docs into code.",
    allowImplicitInvocation: false,
    positiveTriggers: ["explicitly realize truth docs into functional code"],
    negativeTriggers: [
      "sync docs after code changes",
      "document existing implemented behavior",
      "topology repair",
      "truth audit",
    ],
    forbiddenAdjacency: [
      "must not edit truth docs",
      "must not edit truth routing",
    ],
    requiredGates: ["truth-doc ownership"],
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
    requiredGates: ["audit Evidence Gate"],
    allowedWrites: ["none by default"],
    reportSections: [
      "Files reviewed",
      "Issues found",
      "Fixes suggested",
      "Evidence checked",
      "Validation",
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
