import type { Diagnostic } from "../output/diagnostic.js";

export const TRUTH_HEALTH_SCORECARD_SCHEMA_VERSION = "truthmark-scorecard/v0" as const;

export const TRUTH_HEALTH_DIMENSION_IDS = [
  "routing-coverage",
  "ownership-clarity",
  "evidence-support",
  "branch-freshness",
  "generated-surface-freshness",
  "truth-doc-structure",
  "decision-rationale-preservation",
] as const;

export type TruthHealthDimensionId = (typeof TRUTH_HEALTH_DIMENSION_IDS)[number];

export type TruthHealthDimensionStatus = "pass" | "warn" | "fail" | "not-run";

export type TruthHealthScorecardDimension = {
  id: TruthHealthDimensionId;
  status: TruthHealthDimensionStatus;
  diagnosticIndexes: number[];
  evidence?: string[];
};

export type TruthHealthScorecard = {
  schemaVersion: typeof TRUTH_HEALTH_SCORECARD_SCHEMA_VERSION;
  dimensions: TruthHealthScorecardDimension[];
};

export type TruthHealthScorecardContext = {
  branchFreshnessRan: boolean;
  routingChecksRan?: boolean;
  ownershipChecksRan?: boolean;
  evidenceChecksRan?: boolean;
  generatedSurfaceChecksRan?: boolean;
  truthDocStructureChecksRan?: boolean;
  decisionRationaleChecksRan?: boolean;
};

const EVIDENCE_LIMIT = 3;

const textIncludesAny = (text: string, needles: string[]): boolean => {
  const normalized = text.toLowerCase();
  return needles.some((needle) => normalized.includes(needle));
};

const diagnosticText = (diagnostic: Diagnostic): string => {
  const dataText = diagnostic.data ? JSON.stringify(diagnostic.data) : "";
  return `${diagnostic.message} ${diagnostic.file ?? ""} ${diagnostic.area ?? ""} ${dataText}`;
};

const isRouteAmbiguityDiagnostic = (diagnostic: Diagnostic): boolean =>
  diagnostic.category === "context-pack" &&
  textIncludesAny(diagnosticText(diagnostic), [
    "route",
    "routing",
    "ownership",
    "write boundary",
    "allowed write",
  ]);

const isSourceEvidenceDiagnostic = (diagnostic: Diagnostic): boolean =>
  diagnostic.category === "links" &&
  textIncludesAny(diagnosticText(diagnostic), [
    "source_of_truth",
    "source of truth",
    "source evidence",
    "evidence",
  ]);

const isMarkdownShapeDiagnostic = (diagnostic: Diagnostic): boolean =>
  diagnostic.category === "authority" &&
  textIncludesAny(diagnosticText(diagnostic), ["markdown", "heading", "section"]);

const isDecisionRationaleDiagnostic = (diagnostic: Diagnostic): boolean =>
  diagnostic.category === "doc-structure" &&
  textIncludesAny(diagnosticText(diagnostic), ["decision", "rationale"]);

const mapsToDimension = (
  diagnostic: Diagnostic,
  dimensionId: TruthHealthDimensionId,
): boolean => {
  switch (dimensionId) {
    case "routing-coverage":
      return ["config", "authority", "area-index", "coverage", "repo-index"].includes(
        diagnostic.category,
      );
    case "ownership-clarity":
      return (
        ["config", "area-index", "coverage", "impact"].includes(diagnostic.category) ||
        isRouteAmbiguityDiagnostic(diagnostic)
      );
    case "evidence-support":
      return (
        diagnostic.category === "config" ||
        diagnostic.category === "freshness" ||
        isSourceEvidenceDiagnostic(diagnostic)
      );
    case "branch-freshness":
      return diagnostic.category === "freshness";
    case "generated-surface-freshness":
      return diagnostic.category === "config" || diagnostic.category === "generated-surface";
    case "truth-doc-structure":
      return (
        diagnostic.category === "config" ||
        diagnostic.category === "frontmatter" ||
        diagnostic.category === "links" ||
        diagnostic.category === "doc-structure" ||
        isMarkdownShapeDiagnostic(diagnostic)
      );
    case "decision-rationale-preservation":
      return isDecisionRationaleDiagnostic(diagnostic);
  }
};

const checkerRanForDimension = (
  dimensionId: TruthHealthDimensionId,
  context: TruthHealthScorecardContext,
): boolean => {
  switch (dimensionId) {
    case "routing-coverage":
      return context.routingChecksRan ?? true;
    case "ownership-clarity":
      return context.ownershipChecksRan ?? true;
    case "evidence-support":
      return context.evidenceChecksRan ?? true;
    case "branch-freshness":
      return context.branchFreshnessRan;
    case "generated-surface-freshness":
      return context.generatedSurfaceChecksRan ?? true;
    case "truth-doc-structure":
      return context.truthDocStructureChecksRan ?? true;
    case "decision-rationale-preservation":
      return context.decisionRationaleChecksRan ?? true;
  }
};

const statusForDiagnostics = (
  diagnostics: Diagnostic[],
  diagnosticIndexes: number[],
  checkerRan: boolean,
): TruthHealthDimensionStatus => {
  if (diagnosticIndexes.length > 0) {
    return diagnosticIndexes.some((index) => diagnostics[index]?.severity === "error")
      ? "fail"
      : "warn";
  }

  return checkerRan ? "pass" : "not-run";
};

const evidenceForDiagnostics = (
  diagnostics: Diagnostic[],
  diagnosticIndexes: number[],
  status: TruthHealthDimensionStatus,
  dimensionId: TruthHealthDimensionId,
): string[] | undefined => {
  if (status === "pass") {
    return undefined;
  }

  if (diagnosticIndexes.length === 0) {
    if (dimensionId === "branch-freshness") {
      return ["base not supplied"];
    }

    return ["checker not run"];
  }

  return diagnosticIndexes.slice(0, EVIDENCE_LIMIT).map((index) => {
    const diagnostic = diagnostics[index];
    const subject = diagnostic.file ?? diagnostic.area;
    return subject ? `${diagnostic.category}:${subject}` : diagnostic.category;
  });
};

export const buildTruthHealthScorecard = (
  diagnostics: Diagnostic[],
  context: TruthHealthScorecardContext,
): TruthHealthScorecard => ({
  schemaVersion: TRUTH_HEALTH_SCORECARD_SCHEMA_VERSION,
  dimensions: TRUTH_HEALTH_DIMENSION_IDS.map((dimensionId) => {
    const diagnosticIndexes = diagnostics.flatMap((diagnostic, index) =>
      mapsToDimension(diagnostic, dimensionId) ? [index] : [],
    );
    const status = statusForDiagnostics(
      diagnostics,
      diagnosticIndexes,
      checkerRanForDimension(dimensionId, context),
    );
    const evidence = evidenceForDiagnostics(
      diagnostics,
      diagnosticIndexes,
      status,
      dimensionId,
    );

    return {
      id: dimensionId,
      status,
      diagnosticIndexes,
      ...(evidence ? { evidence } : {}),
    };
  }),
});
