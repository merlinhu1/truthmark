import { describe, expect, it } from "vitest";

import { runCheck } from "../../src/checks/check.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("runCheck truth kinds", () => {
  it("reports a frontmatter error when routed truth_kind disagrees with route metadata", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await runInit(repo.rootDir);
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await repo.writeFile(
        "docs/truthmark/routes/areas/repository.md",
        `# Repository Areas

## Repository

Truth documents:

${"```"}yaml
truth_documents:
  - path: docs/truthmark/engineering/repository/overview.md
    kind: engineering-contract
${"```"}

Code surface:
- src/**

Update truth when:
- repository behavior changes
`,
      );
      await repo.writeFile(
        "docs/truthmark/engineering/repository/overview.md",
        `---
status: active
doc_type: behavior
truth_kind: engineering-behavior
last_reviewed: 2026-05-14
source_of_truth:
  - docs/truthmark/routes/areas/repository.md
---

# Repository Overview

## Scope

Repository truth.

## Contract Surface

Current contract.

## Inputs

Inputs.

## Product Decisions

- Decision (2026-05-14): Keep repository truth bounded.

## Rationale

Bounded truth is easier to maintain.
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "frontmatter",
            severity: "error",
            file: "docs/truthmark/engineering/repository/overview.md",
            message: expect.stringContaining("truth_kind"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });
});
