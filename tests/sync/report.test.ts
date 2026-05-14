import { describe, expect, it } from "vitest";

import {
  parseTruthSyncReport,
  renderTruthSyncBlockedReport,
  renderTruthSyncCompletedReport,
  renderTruthSyncSkippedReport,
} from "../../src/sync/report.js";

describe("Truth Sync reporting", () => {
  it("renders completed handoff notes in the README shape", () => {
    const report = renderTruthSyncCompletedReport({
      changedCode: ["src/auth/session.ts"],
      truthDocsUpdated: ["docs/truth/authentication.md"],
      evidenceChecked: [
        {
          claim: "Session timeout behavior is documented in the authentication truth doc.",
          evidence: [
            "src/auth/session.ts:12",
            "docs/truthmark/areas/repository.md:18",
          ],
          result: "supported",
        },
      ],
      notes: ["Updated session timeout behavior."],
    });

    expect(report).toBe(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/truth/authentication.md

Evidence checked:
- Claim: Session timeout behavior is documented in the authentication truth doc.
  Evidence: src/auth/session.ts:12 / docs/truthmark/areas/repository.md:18
  Result: supported

Notes:
- Updated session timeout behavior.`);
    expect(parseTruthSyncReport(report)).toEqual({
      status: "completed",
      changedCode: ["src/auth/session.ts"],
      truthDocsUpdated: ["docs/truth/authentication.md"],
      evidenceChecked: [
        {
          claim: "Session timeout behavior is documented in the authentication truth doc.",
          evidence: [
            "src/auth/session.ts:12",
            "docs/truthmark/areas/repository.md:18",
          ],
          result: "supported",
        },
      ],
      notes: ["Updated session timeout behavior."],
    });
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
        manualReviewFiles: ["docs/truth/authentication.md"],
        nextAction: "fix the failing tests, then rerun Truth Sync",
      }),
    ).toBe(`Truth Sync: blocked

Reason:
- relevant tests failed before sync

Files requiring manual review:
- docs/truth/authentication.md

Next action:
- fix the failing tests, then rerun Truth Sync`);
  });

  it("rejects completed reports without structured evidence", () => {
    expect(() =>
      parseTruthSyncReport(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/truth/authentication.md

Evidence checked:
- Session timeout behavior was reviewed.

Notes:
- Updated session timeout behavior.`),
    ).toThrow("Evidence checked");
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
