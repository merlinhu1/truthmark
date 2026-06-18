import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Truthmark product boundary", () => {
  it("keeps spec/proposal lifecycle and workflow-engine drift out of scope", () => {
    const productBoundary = readFileSync(
      join(process.cwd(), "docs/architecture/product-boundary.md"),
      "utf8",
    );

    expect(productBoundary).toContain(
      "a requirements-management, PRD, proposal, or spec lifecycle platform",
    );
    expect(productBoundary).toContain("an arbitrary workflow DAG engine");
    expect(productBoundary).toContain(
      "missing packages, CLIs, daemons, services, or plugins must not block normal workflow execution",
    );
  });
});
