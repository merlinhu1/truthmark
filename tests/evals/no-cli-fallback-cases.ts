export type NoCliFallbackOutcomeAxis =
  | "same target docs"
  | "same block/apply decision"
  | "same write boundary"
  | "same evidence status";

export type NoCliFallbackEvalCase = {
  id: string;
  scenario: string;
  changedSurface: readonly string[];
  expectedCliOutcome: {
    targetDocs: readonly string[] | "none" | "structure-repair";
    decision: "apply" | "block" | "structure";
    writeBoundary: "truth-doc-write" | "route-write" | "none";
    evidenceStatus: "current" | "missing-or-stale" | "requires-preservation-check";
  };
  equivalenceAxes: readonly NoCliFallbackOutcomeAxis[];
};

const ALL_EQUIVALENCE_AXES: readonly NoCliFallbackOutcomeAxis[] = [
  "same target docs",
  "same block/apply decision",
  "same write boundary",
  "same evidence status",
];

export const NO_CLI_FALLBACK_EVAL_CASES: NoCliFallbackEvalCase[] = [
  {
    id: "single-file-one-truth-doc",
    scenario: "Single-file code change mapped to one truth doc.",
    changedSurface: ["src/auth/session.ts"],
    expectedCliOutcome: {
      targetDocs: ["docs/truthmark/truth/authentication/session-timeout.md"],
      decision: "apply",
      writeBoundary: "truth-doc-write",
      evidenceStatus: "current",
    },
    equivalenceAxes: ALL_EQUIVALENCE_AXES,
  },
  {
    id: "multi-file-one-truth-doc",
    scenario: "Multi-file change mapped to one truth doc.",
    changedSurface: ["src/auth/session.ts", "src/auth/session-policy.ts"],
    expectedCliOutcome: {
      targetDocs: ["docs/truthmark/truth/authentication/session-timeout.md"],
      decision: "apply",
      writeBoundary: "truth-doc-write",
      evidenceStatus: "current",
    },
    equivalenceAxes: ALL_EQUIVALENCE_AXES,
  },
  {
    id: "multi-route-multiple-truth-docs",
    scenario: "Multi-route change that legitimately needs multiple truth docs.",
    changedSurface: ["src/auth/session.ts", "src/billing/invoices.ts"],
    expectedCliOutcome: {
      targetDocs: [
        "docs/truthmark/truth/authentication/session-timeout.md",
        "docs/truthmark/truth/billing/invoices.md",
      ],
      decision: "apply",
      writeBoundary: "truth-doc-write",
      evidenceStatus: "current",
    },
    equivalenceAxes: ALL_EQUIVALENCE_AXES,
  },
  {
    id: "ambiguous-unmapped-code-blocks",
    scenario: "Ambiguous/unmapped code change that should block.",
    changedSurface: ["src/unmapped/feature.ts"],
    expectedCliOutcome: {
      targetDocs: "none",
      decision: "block",
      writeBoundary: "none",
      evidenceStatus: "current",
    },
    equivalenceAxes: ALL_EQUIVALENCE_AXES,
  },
  {
    id: "broad-index-truth-doc-triggers-structure",
    scenario: "Broad/index-like truth doc that should trigger Structure.",
    changedSurface: ["docs/truthmark/truth/repository/overview.md"],
    expectedCliOutcome: {
      targetDocs: "structure-repair",
      decision: "structure",
      writeBoundary: "route-write",
      evidenceStatus: "requires-preservation-check",
    },
    equivalenceAxes: ALL_EQUIVALENCE_AXES,
  },
  {
    id: "evidence-reference-stale-or-missing",
    scenario: "Evidence reference stale/missing.",
    changedSurface: ["src/auth/session.ts", "docs/truthmark/truth/authentication/session-timeout.md"],
    expectedCliOutcome: {
      targetDocs: ["docs/truthmark/truth/authentication/session-timeout.md"],
      decision: "block",
      writeBoundary: "truth-doc-write",
      evidenceStatus: "missing-or-stale",
    },
    equivalenceAxes: ALL_EQUIVALENCE_AXES,
  },
  {
    id: "preserve-product-decisions-rationale",
    scenario: "Product Decisions/Rationale preservation during split or update.",
    changedSurface: ["docs/truthmark/routes/areas.md", "docs/truthmark/truth/authentication/session-timeout.md"],
    expectedCliOutcome: {
      targetDocs: "structure-repair",
      decision: "structure",
      writeBoundary: "route-write",
      evidenceStatus: "requires-preservation-check",
    },
    equivalenceAxes: ALL_EQUIVALENCE_AXES,
  },
];
