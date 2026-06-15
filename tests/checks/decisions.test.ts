import { describe, expect, it } from "vitest";

import { checkDecisionSections } from "../../src/checks/decisions.js";
import { createDefaultConfig } from "../../src/config/defaults.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const decisionConfig = createDefaultConfig();

describe("checkDecisionSections", () => {
  it("emits review diagnostics for current workflow docs missing engineering structure sections", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/engineering/installed-workflows.md",
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
        ["docs/truthmark/engineering/installed-workflows.md"],
        [
          {
            path: "docs/truthmark/engineering/installed-workflows.md",
            kind: "engineering-workflow",
            kindSource: "explicit",
            lane: "engineering",
            laneSource: "inferred",
            realizedBy: [],
            realizes: [],
            dependsOn: [],
          },
        ],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/truthmark/engineering/installed-workflows.md",
          message: expect.stringContaining("Purpose"),
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
        "docs/truthmark/engineering/installed-workflows.md",
        `# Installed Workflows

## Scope

Installed workflow truth.

## Purpose

Defines installed workflow runtime behavior.

## Triggers

Explicit workflow invocations.

## Execution Model

Agents inspect the checkout directly.

## Current Implementation Behavior

Installed workflow surfaces provide the current runtime.

## Source References

- AGENTS.md

## Product Truth Links

None.

## Engineering Decisions

- Installed skills and AGENTS blocks are the workflow runtime.

## Rationale

This keeps installed repositories usable when the Truthmark package is unavailable.

## Maintenance Notes

Update when installed workflow surfaces change.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/truthmark/engineering/installed-workflows.md"],
        [
          {
            path: "docs/truthmark/engineering/installed-workflows.md",
            kind: "engineering-workflow",
            kindSource: "explicit",
            lane: "engineering",
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

  it("does not require decision sections in non-canonical notes or index files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("docs/notes/future.md", "# Future\n");
      await repo.writeFile(
        "docs/truthmark/engineering/README.md",
        "# Current Feature Docs\n",
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/notes/future.md", "docs/truthmark/engineering/README.md"],
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
        "docs/truthmark/engineering/repository/overview.md",
        `# Repository Overview

## Engineering Decisions

- Decision (2026-05-14): Keep routed truth bounded.

## Rationale

Bounded truth docs are easier to maintain.
`,
      );

      const diagnostics = await checkDecisionSections(
        repo.rootDir,
        decisionConfig,
        ["docs/truthmark/engineering/repository/overview.md"],
        [
          {
            path: "docs/truthmark/engineering/repository/overview.md",
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

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/truthmark/engineering/repository/overview.md",
          message: expect.stringContaining("Scope"),
        }),
      ]);
      expect(diagnostics[0]?.message).toContain(
        "Current Implementation Behavior",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("uses a valid frontmatter truth_kind when the doc is not routed", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/engineering/contract-surface.md",
        `---
truth_kind: engineering-contract
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
        ["docs/truthmark/engineering/contract-surface.md"],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/truthmark/engineering/contract-surface.md",
          message: expect.stringContaining("Purpose"),
        }),
      ]);
      expect(diagnostics[0]?.message).toContain(
        "Current Implementation Behavior",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("applies common engineering structure checks to defaulted routed docs", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/README.md",
        `# Docs Index

## Scope

Indexes the canonical docs tree.

## Engineering Decisions

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
            kind: "engineering-behavior",
            kindSource: "defaulted",
            lane: "engineering",
            laneSource: "defaulted",
            realizedBy: [],
            realizes: [],
            dependsOn: [],
          },
        ],
      );

      expect(diagnostics).toEqual([
        expect.objectContaining({
          category: "doc-structure",
          severity: "review",
          file: "docs/README.md",
          message: expect.stringContaining("Source References"),
        }),
      ]);
    } finally {
      await repo.cleanup();
    }
  });
});
