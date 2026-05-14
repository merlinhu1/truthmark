import { describe, expect, it } from "vitest";

import { checkFrontmatter } from "../../src/checks/frontmatter.js";
import { createDefaultConfig } from "../../src/config/defaults.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const config = createDefaultConfig();

describe("checkFrontmatter", () => {
  it("emits an error when truth_kind disagrees with the routed kind", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truth/contracts.md",
        `---
status: active
doc_type: contract
truth_kind: behavior
last_reviewed: 2026-05-14
source_of_truth:
  - docs/truthmark/areas/repository.md
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
        ["docs/truth/contracts.md"],
        [
          {
            path: "docs/truth/contracts.md",
            kind: "contract",
            kindSource: "explicit",
          },
        ],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "frontmatter",
          severity: "error",
          file: "docs/truth/contracts.md",
          message: expect.stringContaining("truth_kind"),
        }),
      ]);
      expect(diagnostics[0]?.message).toContain("contract");
    } finally {
      await repo.cleanup();
    }
  });
});