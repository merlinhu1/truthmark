import { describe, expect, it } from "vitest";

import {
  type TruthmarkWriteLease,
  validateTruthmarkWriteLeaseChanges,
} from "../../src/agents/write-lease.js";

const lease: TruthmarkWriteLease = {
  workflow: "truthmark-sync",
  worker: "truth_doc_writer",
  shard: "workflow-sync-doc",
  objective: "Update one routed workflow truth doc.",
  requiredReads: [
    ".truthmark/config.yml",
    "docs/truthmark/areas.md",
    "docs/truth/workflows/truth-sync.md",
  ],
  allowedWrites: [
    "docs/truth/workflows/truth-sync.md",
    "docs/truthmark/areas/**/*.md",
  ],
  forbiddenWrites: ["src/**", ".codex/**", ".opencode/**"],
  evidenceRequired: ["implemented source or generated surface for each claim"],
  reportFields: [
    "status",
    "worker",
    "workflow",
    "shard",
    "filesChanged",
    "claimsChecked",
    "evidenceChecked",
    "offLeaseChanges",
    "blockers",
  ],
};

describe("validateTruthmarkWriteLeaseChanges", () => {
  it("accepts only files covered by allowed writes", () => {
    expect(
      validateTruthmarkWriteLeaseChanges(lease, [
        "docs/truth/workflows/truth-sync.md",
        "./docs/truthmark/areas/workflows.md",
      ]),
    ).toEqual({
      allowedChanges: [
        "docs/truth/workflows/truth-sync.md",
        "docs/truthmark/areas/workflows.md",
      ],
      forbiddenChanges: [],
      offLeaseChanges: [],
    });
  });

  it("reports off-lease and explicitly forbidden changes", () => {
    expect(
      validateTruthmarkWriteLeaseChanges(lease, [
        "docs/truth/workflows/truth-sync.md",
        "src/agents/truth-sync.ts",
        ".opencode/agents/truth-doc-writer.md",
        "docs/truth/workflows/truth-document.md",
      ]),
    ).toEqual({
      allowedChanges: ["docs/truth/workflows/truth-sync.md"],
      forbiddenChanges: [
        ".opencode/agents/truth-doc-writer.md",
        "src/agents/truth-sync.ts",
      ],
      offLeaseChanges: [
        ".opencode/agents/truth-doc-writer.md",
        "docs/truth/workflows/truth-document.md",
        "src/agents/truth-sync.ts",
      ],
    });
  });
});
