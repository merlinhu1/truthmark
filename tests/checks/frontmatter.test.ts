import { describe, expect, it } from "vitest";

import { checkFrontmatter } from "../../src/checks/frontmatter.js";
import { createDefaultConfig } from "../../src/config/defaults.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const config = createDefaultConfig();

describe("checkFrontmatter", () => {
  it("does not require doc_type or truth_lane frontmatter on routed truth docs", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/engineering/contracts/api.md",
        `---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-05-14
source_of_truth:
  - docs/truthmark/routes/areas/repository.md
---

# API Contract

## Scope

Contract truth.
`,
      );

      const diagnostics = await checkFrontmatter(
        repo.rootDir,
        config,
        ["docs/truthmark/engineering/contracts/api.md"],
        [
          {
            path: "docs/truthmark/engineering/contracts/api.md",
            kind: "engineering-contract",
            kindSource: "explicit",
            lane: "engineering",
            laneSource: "inferred",
            realizedBy: [],
            realizes: [],
            dependsOn: [],
          },
        ],
      );

      expect(diagnostics).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "frontmatter",
            message: expect.stringContaining("doc_type"),
          }),
        ]),
      );
      expect(diagnostics).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "frontmatter",
            message: expect.stringContaining("truth_lane"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("emits an error when truth_kind disagrees with the routed kind", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/truth/contracts.md",
        `---
status: active
doc_type: contract
truth_kind: engineering-behavior
last_reviewed: 2026-05-14
source_of_truth:
  - docs/truthmark/routes/areas/repository.md
---

# Contracts

## Scope

Contract truth.

## Contract Surface

Current contract.
`,
      );

      const diagnostics = await checkFrontmatter(
        repo.rootDir,
        config,
        ["docs/truthmark/truth/contracts.md"],
        [
          {
            path: "docs/truthmark/truth/contracts.md",
            kind: "engineering-contract",
            kindSource: "explicit",
            lane: "engineering",
            laneSource: "explicit",
            realizedBy: [],
            realizes: [],
            dependsOn: [],
          },
        ],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "frontmatter",
          severity: "error",
          file: "docs/truthmark/truth/contracts.md",
          message: expect.stringContaining("truth_kind"),
        }),
      ]);
      expect(diagnostics[0]?.message).toContain("contract");
    } finally {
      await repo.cleanup();
    }
  });
});
