import { describe, expect, it } from "vitest";

import {
  renderTruthSyncBlockedReport,
  renderTruthSyncCompletedReport,
  renderTruthSyncSkippedReport,
} from "../../src/sync/report.js";

describe("Truth Sync reporting", () => {
  it("renders completed handoff notes in the README shape", () => {
    expect(
      renderTruthSyncCompletedReport({
        changedCode: ["src/auth/session.ts"],
        truthDocsUpdated: ["docs/features/authentication.md"],
        notes: ["Updated session timeout behavior."],
      }),
    ).toBe(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/features/authentication.md

Notes:
- Updated session timeout behavior.`);
  });

  it("renders skipped handoff notes in the README shape", () => {
    expect(
      renderTruthSyncSkippedReport({ reason: "documentation-only change" }),
    ).toBe(`Truth Sync: skipped

Reason:
- documentation-only change`);
  });

  it("renders blocked handoff notes in the README shape", () => {
    expect(
      renderTruthSyncBlockedReport({
        reason: "relevant tests failed before sync",
        manualReviewFiles: ["docs/features/authentication.md"],
        nextAction: "fix the failing tests, then rerun Truth Sync",
      }),
    ).toBe(`Truth Sync: blocked

Reason:
- relevant tests failed before sync

Files requiring manual review:
- docs/features/authentication.md

Next action:
- fix the failing tests, then rerun Truth Sync`);
  });

  it("omits the manual review section when the file list is empty", () => {
    expect(
      renderTruthSyncBlockedReport({
        reason: "routing repair is not allowed",
        manualReviewFiles: [],
        nextAction: "update routing metadata and rerun Truth Sync",
      }),
    ).toBe(`Truth Sync: blocked

Reason:
- routing repair is not allowed

Next action:
- update routing metadata and rerun Truth Sync`);
  });
});