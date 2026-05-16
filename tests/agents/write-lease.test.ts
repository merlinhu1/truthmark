import { describe, expect, it } from "vitest";

import {
  TRUTHMARK_WRITE_WORKER_REPORT_FIELDS,
  parseTruthmarkWriteWorkerReport,
  type TruthmarkWriteLease,
  validateTruthmarkWriteWorkerAcceptance,
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
  reportFields: [...TRUTHMARK_WRITE_WORKER_REPORT_FIELDS],
};

const completedReport = `
status: completed
worker: truth_doc_writer
workflow: truthmark-sync
shard: workflow-sync-doc
filesChanged:
  - docs/truth/workflows/truth-sync.md
claimsChecked:
  - Sync parent validation claim
evidenceChecked:
  - src/agents/write-lease.ts
offLeaseChanges: []
blockers: []
notes:
  - Updated leased doc only.
`;

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

describe("validateTruthmarkWriteWorkerAcceptance", () => {
  it("accepts a completed worker report only when the actual diff matches the lease", () => {
    expect(
      validateTruthmarkWriteWorkerAcceptance({
        lease,
        workerReport: parseTruthmarkWriteWorkerReport(completedReport),
        actualChangedFiles: ["docs/truth/workflows/truth-sync.md"],
      }),
    ).toMatchObject({
      status: "accepted",
      reasons: [],
      changeValidation: {
        allowedChanges: ["docs/truth/workflows/truth-sync.md"],
        forbiddenChanges: [],
        offLeaseChanges: [],
      },
    });
  });

  it("rejects worker success when the actual diff includes off-lease changes", () => {
    expect(
      validateTruthmarkWriteWorkerAcceptance({
        lease,
        workerReport: parseTruthmarkWriteWorkerReport(completedReport),
        actualChangedFiles: [
          "docs/truth/workflows/truth-sync.md",
          "docs/truth/workflows/truth-document.md",
        ],
      }).reasons.map((reason) => reason.code),
    ).toEqual(["off-lease-actual-diff", "reported-files-mismatch"]);
  });

  it("rejects worker success when the actual diff includes forbidden changes", () => {
    expect(
      validateTruthmarkWriteWorkerAcceptance({
        lease,
        workerReport: parseTruthmarkWriteWorkerReport(completedReport),
        actualChangedFiles: [
          "docs/truth/workflows/truth-sync.md",
          "src/agents/truth-sync.ts",
        ],
      }).reasons.map((reason) => reason.code),
    ).toEqual([
      "forbidden-actual-diff",
      "off-lease-actual-diff",
      "reported-files-mismatch",
    ]);
  });

  it("rejects reports that omit required fields", () => {
    const report = parseTruthmarkWriteWorkerReport(`
status: completed
worker: truth_doc_writer
workflow: truthmark-sync
shard: workflow-sync-doc
filesChanged:
  - docs/truth/workflows/truth-sync.md
claimsChecked: []
evidenceChecked: []
offLeaseChanges: []
blockers: []
`);

    expect(
      validateTruthmarkWriteWorkerAcceptance({
        lease,
        workerReport: report,
        actualChangedFiles: ["docs/truth/workflows/truth-sync.md"],
      }).reasons.map((reason) => reason.code),
    ).toEqual(["missing-report-field"]);
  });

  it("rejects reports with invalid identity field types", () => {
    const report = parseTruthmarkWriteWorkerReport(`
status: completed
worker: 7
workflow: truthmark-sync
shard: workflow-sync-doc
filesChanged:
  - docs/truth/workflows/truth-sync.md
claimsChecked: []
evidenceChecked: []
offLeaseChanges: []
blockers: []
notes: []
`);

    expect(
      validateTruthmarkWriteWorkerAcceptance({
        lease,
        workerReport: report,
        actualChangedFiles: ["docs/truth/workflows/truth-sync.md"],
      }).reasons.map((reason) => reason.code),
    ).toEqual(["invalid-report-field"]);
  });

  it("rejects completed reports that self-report off-lease changes or blockers", () => {
    const report = parseTruthmarkWriteWorkerReport(`
status: completed
worker: truth_doc_writer
workflow: truthmark-sync
shard: workflow-sync-doc
filesChanged:
  - docs/truth/workflows/truth-sync.md
claimsChecked:
  - Sync parent validation claim
evidenceChecked:
  - src/agents/write-lease.ts
offLeaseChanges:
  - docs/truth/workflows/truth-document.md
blockers:
  - ownership ambiguous
notes:
  - Parent review required.
`);

    expect(
      validateTruthmarkWriteWorkerAcceptance({
        lease,
        workerReport: report,
        actualChangedFiles: ["docs/truth/workflows/truth-sync.md"],
      }).reasons.map((reason) => reason.code),
    ).toEqual([
      "completed-with-reported-off-lease-changes",
      "completed-with-blockers",
    ]);
  });

  it("blocks, rather than accepts, blocked worker reports with blockers", () => {
    const report = parseTruthmarkWriteWorkerReport(`
status: blocked
worker: truth_doc_writer
workflow: truthmark-sync
shard: workflow-sync-doc
filesChanged: []
claimsChecked:
  - Sync parent validation claim
evidenceChecked:
  - src/agents/write-lease.ts
offLeaseChanges: []
blockers:
  - ownership ambiguous
notes:
  - Parent review required.
`);

    expect(
      validateTruthmarkWriteWorkerAcceptance({
        lease,
        workerReport: report,
        actualChangedFiles: [],
      }).status,
    ).toBe("blocked");
  });
});
