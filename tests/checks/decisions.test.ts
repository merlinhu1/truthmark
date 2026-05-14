import { describe, expect, it } from "vitest";

import { checkDecisionSections } from "../../src/checks/decisions.js";
import { createDefaultConfig } from "../../src/config/defaults.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const decisionConfig = createDefaultConfig();

describe("checkDecisionSections", () => {
  it("emits review diagnostics for current workflow docs missing decision truth sections", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truth/installed-workflows.md",
        `# Installed Workflows

## Scope

Installed workflow truth.

## Triggers

Explicit workflow invocations.

## Execution Model

Agents inspect the checkout directly.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/truth/installed-workflows.md"],
        [
          {
            path: "docs/truth/installed-workflows.md",
            kind: "workflow",
            kindSource: "explicit",
          },
        ],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/truth/installed-workflows.md",
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
        "docs/truth/installed-workflows.md",
        `# Installed Workflows

## Scope

Installed workflow truth.

## Triggers

Explicit workflow invocations.

## Execution Model

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
        ["docs/truth/installed-workflows.md"],
        [
          {
            path: "docs/truth/installed-workflows.md",
            kind: "workflow",
            kindSource: "explicit",
          },
        ],
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
      await repo.writeFile("docs/truth/README.md", "# Current Feature Docs\n");

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/notes/future.md", "docs/truth/README.md"],
      );

      expect(diagnostics).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });

  it("emits review diagnostics when a routed behavior doc is missing scope and current behavior", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truth/repository/overview.md",
        `# Repository Overview

## Product Decisions

- Decision (2026-05-14): Keep routed truth bounded.

## Rationale

Bounded truth docs are easier to maintain.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/truth/repository/overview.md"],
        [
          {
            path: "docs/truth/repository/overview.md",
            kind: "behavior",
            kindSource: "explicit",
          },
        ],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/truth/repository/overview.md",
          message: expect.stringContaining("Scope"),
        }),
      ]);
      expect(diagnostics[0]?.message).toContain("Current Behavior");
    } finally {
      await repo.cleanup();
    }
  });

  it("uses a valid frontmatter truth_kind when the doc is not routed", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truth/contract-surface.md",
        `---
truth_kind: contract
---

# Contract Surface

## Scope

Owns the CLI contract.

## Contract Surface

The CLI returns structured diagnostics.

## Inputs

Command arguments.

## Outputs

Structured JSON output.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/truth/contract-surface.md"],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/truth/contract-surface.md",
          message: expect.stringContaining("Product Decisions"),
        }),
      ]);
      expect(diagnostics[0]?.message).not.toContain("Current Behavior");
    } finally {
      await repo.cleanup();
    }
  });

  it("does not apply behavior-specific checks to defaulted routed docs", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/README.md",
        `# Docs Index

## Scope

Indexes the canonical docs tree.

## Product Decisions

- Keep the docs tree split by role.

## Rationale

This keeps onboarding and current truth separate.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/README.md"],
        [
          {
            path: "docs/README.md",
            kind: "behavior",
            kindSource: "defaulted",
          },
        ],
      );

      expect(diagnostics).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });
});
