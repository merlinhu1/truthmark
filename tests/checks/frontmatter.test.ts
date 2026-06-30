import { describe, it } from "node:test";
import { expect } from "expect";

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

  it("allows truth_lane frontmatter when it matches truth_kind", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/product/capabilities/search.md",
        `---
status: active
truth_kind: product-capability
truth_lane: product
last_reviewed: 2026-05-14
source_of_truth:
  - docs/truthmark/routes/areas/repository.md
---

# Search

## Capability

Product truth.
`,
      );

      const diagnostics = await checkFrontmatter(
        repo.rootDir,
        config,
        ["docs/truthmark/product/capabilities/search.md"],
        [
          {
            path: "docs/truthmark/product/capabilities/search.md",
            kind: "product-capability",
            kindSource: "explicit",
            lane: "product",
            laneSource: "inferred",
            realizedBy: [],
            realizes: [],
            dependsOn: [],
          },
        ],
      );

      expect(diagnostics).toEqual([]);
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

  it("emits errors when relationship metadata appears in truth doc frontmatter", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/engineering/behaviors/search.md",
        `---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-05-14
realized_by:
  - docs/truthmark/engineering/behaviors/search.md
realizes:
  - docs/truthmark/product/capabilities/search.md
depends_on:
  - docs/truthmark/engineering/contracts/api.md
source_of_truth:
  - docs/truthmark/routes/areas/repository.md
---

# Search Behavior

## Scope

Engineering truth.
`,
      );

      const diagnostics = await checkFrontmatter(
        repo.rootDir,
        config,
        ["docs/truthmark/engineering/behaviors/search.md"],
        [
          {
            path: "docs/truthmark/engineering/behaviors/search.md",
            kind: "engineering-behavior",
            kindSource: "explicit",
            lane: "engineering",
            laneSource: "inferred",
            realizedBy: [],
            realizes: [],
            dependsOn: [],
          },
        ],
      );

      expect(diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "frontmatter",
            severity: "error",
            file: "docs/truthmark/engineering/behaviors/search.md",
            message: expect.stringContaining("realized_by"),
          }),
          expect.objectContaining({
            category: "frontmatter",
            severity: "error",
            file: "docs/truthmark/engineering/behaviors/search.md",
            message: expect.stringContaining("realizes"),
          }),
          expect.objectContaining({
            category: "frontmatter",
            severity: "error",
            file: "docs/truthmark/engineering/behaviors/search.md",
            message: expect.stringContaining("depends_on"),
          }),
        ]),
      );
      expect(diagnostics).toHaveLength(3);
      for (const diagnostic of diagnostics) {
        expect(diagnostic.message).toContain("fenced route YAML");
      }
    } finally {
      await repo.cleanup();
    }
  });
});
