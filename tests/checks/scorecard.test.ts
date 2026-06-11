import { describe, expect, it } from "vitest";

import {
  buildTruthHealthScorecard,
  TRUTH_HEALTH_DIMENSION_IDS,
  type TruthHealthScorecardDimension,
} from "../../src/checks/scorecard.js";
import type { Diagnostic } from "../../src/output/diagnostic.js";

const diagnostic = (partial: Partial<Diagnostic> & Pick<Diagnostic, "category">): Diagnostic => ({
  severity: "review",
  message: `${partial.category} diagnostic`,
  ...partial,
});

const dimension = (
  dimensions: TruthHealthScorecardDimension[],
  id: TruthHealthScorecardDimension["id"],
): TruthHealthScorecardDimension => {
  const match = dimensions.find((candidate) => candidate.id === id);
  expect(match).toBeDefined();
  return match!;
};

describe("buildTruthHealthScorecard", () => {
  it("returns the compact truthmark-scorecard/v0 shape with the seven dimensions", () => {
    const scorecard = buildTruthHealthScorecard([], { branchFreshnessRan: false });

    expect(scorecard.schemaVersion).toBe("truthmark-scorecard/v0");
    expect(scorecard.dimensions.map((item) => item.id)).toEqual([...TRUTH_HEALTH_DIMENSION_IDS]);
    for (const item of scorecard.dimensions) {
      expect(Object.keys(item).sort()).toEqual(["diagnosticIndexes", "evidence", "id", "status"].filter((key) => key in item).sort());
      expect(item.diagnosticIndexes).toEqual([]);
    }
    expect(dimension(scorecard.dimensions, "branch-freshness").status).toBe("not-run");
    expect(dimension(scorecard.dimensions, "branch-freshness").evidence).toEqual([
      "base not supplied",
    ]);
  });

  it("maps diagnostic severity to fail, warn, pass, and not-run statuses", () => {
    const diagnostics: Diagnostic[] = [
      diagnostic({ category: "coverage", severity: "review", file: "src/unmapped.ts" }),
      diagnostic({ category: "frontmatter", severity: "error", file: "docs/truth.md" }),
    ];

    const scorecard = buildTruthHealthScorecard(diagnostics, { branchFreshnessRan: false });

    expect(dimension(scorecard.dimensions, "routing-coverage").status).toBe("warn");
    expect(dimension(scorecard.dimensions, "truth-doc-structure").status).toBe("fail");
    expect(dimension(scorecard.dimensions, "generated-surface-freshness").status).toBe("pass");
    expect(dimension(scorecard.dimensions, "branch-freshness").status).toBe("not-run");
  });

  it("maps categories to the expected dimensions and caps compact evidence", () => {
    const diagnostics: Diagnostic[] = [
      diagnostic({ category: "area-index", file: "docs/truthmark/routes/areas.md" }),
      diagnostic({ category: "freshness", file: "src/api.ts" }),
      diagnostic({ category: "generated-surface", file: "AGENTS.md" }),
      diagnostic({ category: "doc-structure", message: "Missing Product Decisions section", file: "docs/architecture/overview.md" }),
      diagnostic({ category: "doc-structure", message: "Missing Rationale section", file: "docs/architecture/overview.md" }),
      diagnostic({ category: "doc-structure", message: "Missing Scope section", file: "docs/architecture/overview.md" }),
      diagnostic({ category: "doc-structure", message: "Missing Current Behavior section", file: "docs/truthmark/truth/check-diagnostics.md" }),
    ];

    const scorecard = buildTruthHealthScorecard(diagnostics, { branchFreshnessRan: true });

    expect(dimension(scorecard.dimensions, "routing-coverage").diagnosticIndexes).toEqual([0]);
    expect(dimension(scorecard.dimensions, "ownership-clarity").diagnosticIndexes).toEqual([0]);
    expect(dimension(scorecard.dimensions, "evidence-support").diagnosticIndexes).toEqual([1]);
    expect(dimension(scorecard.dimensions, "branch-freshness").diagnosticIndexes).toEqual([1]);
    expect(dimension(scorecard.dimensions, "generated-surface-freshness").diagnosticIndexes).toEqual([2]);
    expect(dimension(scorecard.dimensions, "truth-doc-structure").diagnosticIndexes).toEqual([
      3, 4, 5, 6,
    ]);
    expect(dimension(scorecard.dimensions, "truth-doc-structure").evidence).toHaveLength(3);
    expect(dimension(scorecard.dimensions, "decision-rationale-preservation").diagnosticIndexes).toEqual([
      3, 4,
    ]);
  });

  it("keeps diagnostic indexes tied to the raw diagnostics array when one diagnostic maps to multiple dimensions", () => {
    const diagnostics: Diagnostic[] = [
      diagnostic({ category: "generated-surface", file: "AGENTS.md" }),
      diagnostic({ category: "coverage", file: "src/unmapped.ts" }),
    ];

    const scorecard = buildTruthHealthScorecard(diagnostics, { branchFreshnessRan: false });

    expect(dimension(scorecard.dimensions, "routing-coverage").diagnosticIndexes).toEqual([1]);
    expect(dimension(scorecard.dimensions, "ownership-clarity").diagnosticIndexes).toEqual([1]);
    expect(dimension(scorecard.dimensions, "generated-surface-freshness").diagnosticIndexes).toEqual([0]);
  });
});
