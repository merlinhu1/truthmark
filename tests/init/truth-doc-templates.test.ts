import fs from "node:fs/promises";

import { describe, it } from "node:test";
import { expect } from "expect";

import { renderBehaviorDocTemplateFile } from "../../src/templates/init-files.js";

const behaviorTruthDocs = [
  "docs/truthmark/engineering/behaviors/check-diagnostics.md",
  "docs/truthmark/engineering/behaviors/init-and-scaffold.md",
  "docs/truthmark/engineering/repository/overview.md",
  "docs/truthmark/engineering/repository/repository-intelligence.md",
];

describe("truth doc templates", () => {
  it("guides engineering behavior docs toward current-state scenario blocks", () => {
    const template = renderBehaviorDocTemplateFile();

    expect(template).toContain("## Behavior Scenarios");
    expect(template).toContain(
      "Use compact scenario blocks only where they clarify normal, fallback, or compatibility-critical behavior.",
    );
    expect(template).toContain("#### Scenario: <implemented case>");
    expect(template).toContain("- **GIVEN** ...");
    expect(template).toContain("- **WHEN** ...");
    expect(template).toContain("- **THEN** ...");
    expect(template).toContain("- **AND** ...");
    expect(template).toContain("current truth, not desired requirements");
    expect(template).not.toContain("SHALL");
  });

  it("keeps existing engineering behavior docs aligned with the scenario section", async () => {
    for (const path of behaviorTruthDocs) {
      const doc = await fs.readFile(path, "utf8");

      expect(doc).toContain("truth_kind: engineering-behavior");
      expect(doc).toContain("## Behavior Scenarios");
      expect(doc).toContain("- **GIVEN**");
      expect(doc).toContain("- **WHEN**");
      expect(doc).toContain("- **THEN**");
    }
  });
});
