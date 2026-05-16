import type { TruthmarkWorkflowId } from "../../src/agents/workflow-manifest.js";

export type WorkflowRoutingEvalCase = {
  id: string;
  userPrompt: string;
  changedFiles?: string[];
  expectedWorkflow: TruthmarkWorkflowId | "none" | "block";
  expectedReason: string;
  expectedManifestSignals: string[];
  forbiddenWorkflows?: TruthmarkWorkflowId[];
  source:
    | "manifest-positive"
    | "manifest-negative"
    | "forbidden-adjacent"
    | "synthetic";
};

export const WORKFLOW_ROUTING_EVAL_CASES: WorkflowRoutingEvalCase[] = [
  {
    id: "sync-implicit-after-functional-code-change",
    userPrompt:
      "I changed src/auth/session.ts. Before finishing, sync the truth docs from that code change.",
    changedFiles: ["src/auth/session.ts"],
    expectedWorkflow: "truthmark-sync",
    expectedReason: "functional code changed since last successful Truth Sync",
    expectedManifestSignals: [
      "Use automatically at finish-time after functional code changes",
      "functional code changed since last successful Truth Sync",
    ],
    forbiddenWorkflows: ["truthmark-realize", "truthmark-structure"],
    source: "manifest-positive",
  },
  {
    id: "sync-explicit-invocation",
    userPrompt:
      "Use /truthmark-sync for the changed authentication code before we finish.",
    changedFiles: ["src/auth/session.ts"],
    expectedWorkflow: "truthmark-sync",
    expectedReason:
      "explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync",
    expectedManifestSignals: [
      "explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync",
    ],
    forbiddenWorkflows: ["truthmark-realize"],
    source: "manifest-positive",
  },
  {
    id: "sync-skip-docs-only",
    userPrompt:
      "I only edited documentation prose and no functional code changed; do not run finish-time Sync.",
    changedFiles: ["docs/truth/repository/overview.md"],
    expectedWorkflow: "none",
    expectedReason: "documentation-only change",
    expectedManifestSignals: [
      "documentation-only change",
      "no functional code changes",
    ],
    forbiddenWorkflows: ["truthmark-sync"],
    source: "manifest-negative",
  },
  {
    id: "structure-broad-routing-repair",
    userPrompt:
      "The repository route is a broad src/** catch-all and needs to be split into bounded Truthmark areas.",
    changedFiles: ["docs/truthmark/areas.md"],
    expectedWorkflow: "truthmark-structure",
    expectedReason: "split broad repository routing into bounded areas",
    expectedManifestSignals: [
      "routing or truth ownership is missing, stale, broad, overloaded, catch-all",
      "split broad repository routing into bounded areas",
    ],
    forbiddenWorkflows: ["truthmark-sync", "truthmark-document"],
    source: "manifest-positive",
  },
  {
    id: "structure-new-area-setup",
    userPrompt:
      "Onboard the new billing controller area into Truthmark with routing and starter truth docs.",
    changedFiles: ["src/billing/controllers/invoices.ts"],
    expectedWorkflow: "truthmark-structure",
    expectedReason: "onboard a new code area into Truthmark routing",
    expectedManifestSignals: [
      "onboard a new code area into Truthmark routing",
      "new package, controller, domain, or product area lacks bounded truth ownership",
    ],
    forbiddenWorkflows: ["truthmark-sync", "truthmark-document"],
    source: "manifest-positive",
  },
  {
    id: "document-existing-implemented-behavior",
    userPrompt:
      "Document the existing implemented session-timeout behavior from the code without changing functional code.",
    changedFiles: ["src/auth/session.ts"],
    expectedWorkflow: "truthmark-document",
    expectedReason: "document existing implemented behavior",
    expectedManifestSignals: [
      "document existing implemented behavior",
      "Not for functional-code changes",
    ],
    forbiddenWorkflows: ["truthmark-realize", "truthmark-structure"],
    source: "manifest-positive",
  },
  {
    id: "realize-explicit-doc-first",
    userPrompt:
      "Use $truthmark-realize to realize docs/truth/authentication/session-timeout.md into code.",
    changedFiles: ["docs/truth/authentication/session-timeout.md"],
    expectedWorkflow: "truthmark-realize",
    expectedReason: "explicitly realize truth docs into functional code",
    expectedManifestSignals: [
      "explicitly realize truth docs into functional code",
      "Not for syncing docs after code changes",
    ],
    forbiddenWorkflows: ["truthmark-sync", "truthmark-document"],
    source: "manifest-positive",
  },
  {
    id: "check-truth-health-audit",
    userPrompt:
      "Audit repository truth health and routing ownership, but do not rewrite docs.",
    expectedWorkflow: "truthmark-check",
    expectedReason: "audit repository truth health",
    expectedManifestSignals: [
      "audit repository truth health",
      "Not for normal lint/test/typecheck/code-review verification",
    ],
    forbiddenWorkflows: ["truthmark-sync", "truthmark-document"],
    source: "manifest-positive",
  },
  {
    id: "preview-routing-before-edits",
    userPrompt:
      "Before we edit anything, preview which Truthmark workflow and route owner would apply to src/auth/session.ts.",
    changedFiles: ["src/auth/session.ts"],
    expectedWorkflow: "truthmark-preview",
    expectedReason: "preview likely workflow routing before edits",
    expectedManifestSignals: [
      "preview likely workflow routing",
      "Not for validation",
    ],
    forbiddenWorkflows: ["truthmark-sync", "truthmark-check"],
    source: "manifest-positive",
  },
  {
    id: "adjacent-sync-not-realize",
    userPrompt:
      "I changed functional code and need the docs synced afterward, not a doc-first realization.",
    changedFiles: ["src/auth/session.ts"],
    expectedWorkflow: "truthmark-sync",
    expectedReason: "doc-first implementation belongs to Truth Realize",
    expectedManifestSignals: [
      "functional code changed since last successful Truth Sync",
      "doc-first implementation belongs to Truth Realize",
    ],
    forbiddenWorkflows: ["truthmark-realize"],
    source: "forbidden-adjacent",
  },
  {
    id: "mixed-owner-sync-block",
    userPrompt:
      "Sync this code diff, but the mapped truth doc is mixed-owner and the route cannot identify a bounded truth owner.",
    changedFiles: ["src/auth/session.ts"],
    expectedWorkflow: "block",
    expectedReason:
      "routing repair is required before Truth Sync can select a bounded owner",
    expectedManifestSignals: [
      "manual topology design belongs to Truth Structure",
    ],
    forbiddenWorkflows: ["truthmark-sync"],
    source: "synthetic",
  },
];
