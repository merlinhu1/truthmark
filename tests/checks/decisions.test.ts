import { describe, expect, it } from "vitest";

import { checkDecisionSections } from "../../src/checks/decisions.js";
import { createDefaultConfig } from "../../src/config/defaults.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const decisionConfig = createDefaultConfig();

describe("checkDecisionSections", () => {
  it("emits review diagnostics for current feature docs missing decision truth sections", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/features/installed-workflows.md",
        `# Installed Workflows

## Current Behavior

Agents inspect the checkout directly.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/features/installed-workflows.md"],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/features/installed-workflows.md",
          message: expect.stringContaining("Product Decisions"),
        }),
      ]);
    } finally {
      await repo.cleanup();
    }
  });

  it("accepts canonical docs with active decisions and rationale", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/features/installed-workflows.md",
        `# Installed Workflows

## Current Behavior

Agents inspect the checkout directly.

## Product Decisions

- Installed skills and AGENTS blocks are the workflow runtime.

## Rationale

This keeps installed repositories usable when the Truthmark package is unavailable.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/features/installed-workflows.md"],
      );

      expect(diagnostics).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });

  it("does not require decision sections in non-canonical notes or index files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("docs/notes/future.md", "# Future\n");
      await repo.writeFile("docs/features/README.md", "# Current Feature Docs\n");

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/notes/future.md", "docs/features/README.md"],
      );

      expect(diagnostics).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });
});
