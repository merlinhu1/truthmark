import { existsSync } from "node:fs";
import { join } from "node:path";

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
      ownershipReviewed: ["docs/truthmark/routes/areas/repository.md"],
      truthDocsUpdated: ["docs/truthmark/engineering/behaviors/authentication.md"],
      evidenceChecked: [
        {
          claim: "Session timeout behavior is documented in the authentication truth doc.",
          evidence: [
            "src/auth/session.ts:12",
            "docs/truthmark/routes/areas/repository.md:18",
          ],
          result: "supported",
        },
      ],
      notes: ["Updated session timeout behavior."],
    });

    expect(report).toBe(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Ownership reviewed:
- docs/truthmark/routes/areas/repository.md

Truth docs updated:
- docs/truthmark/engineering/behaviors/authentication.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
- Claim: Session timeout behavior is documented in the authentication truth doc.
  Evidence: src/auth/session.ts:12 / docs/truthmark/routes/areas/repository.md:18
  Result: supported

Notes:
- Updated session timeout behavior.`);
    expect(parseTruthSyncReport(report)).toEqual({
      status: "completed",
      changedCode: ["src/auth/session.ts"],
      ownershipReviewed: ["docs/truthmark/routes/areas/repository.md"],
      truthDocsUpdated: ["docs/truthmark/engineering/behaviors/authentication.md"],
      decisionRationaleCaptured: ["none provided in task conversation"],
      evidenceChecked: [
        {
          claim: "Session timeout behavior is documented in the authentication truth doc.",
          evidence: [
            "src/auth/session.ts:12",
            "docs/truthmark/routes/areas/repository.md:18",
          ],
          result: "supported",
        },
      ],
      notes: ["Updated session timeout behavior."],
    });
  });

  it("round-trips optional Sync Intent with user decision context capture", () => {
    const syncIntent = {
      changedCodeReviewed: ["src/auth/session.ts"],
      affectedRouteOrTruthOwner: ["docs/truthmark/routes/areas/repository.md"],
      targetTruthDocs: ["docs/truthmark/engineering/behaviors/authentication.md"],
      intendedUpdate: ["Update documented session timeout behavior."],
      evidenceToVerify: ["src/auth/session.ts:12"],
      userProvidedDecisionRationale: [
        "User decision: preserve a 30 minute timeout because long-lived sessions are out of scope",
        "Lane: engineering contract",
      ],
      noUpdateNeededRationale: ["not applicable; mapped truth is stale"],
      blockers: ["none"],
    };
    const report = renderTruthSyncCompletedReport({
      changedCode: ["src/auth/session.ts"],
      syncIntent,
      ownershipReviewed: ["docs/truthmark/routes/areas/repository.md"],
      truthDocsUpdated: ["docs/truthmark/engineering/behaviors/authentication.md"],
      evidenceChecked: [
        {
          claim: "Session timeout behavior is documented in the authentication truth doc.",
          evidence: ["src/auth/session.ts:12"],
          result: "supported",
        },
      ],
      decisionRationaleCaptured: [
        "Placed user rationale in docs/truthmark/engineering/behaviors/authentication.md under Engineering Decisions and Rationale.",
      ],
      notes: ["Updated session timeout behavior."],
    });

    expect(report).toContain(`Sync Intent:
- Changed code reviewed: src/auth/session.ts
- Affected route/truth owner: docs/truthmark/routes/areas/repository.md
- Target truth docs: docs/truthmark/engineering/behaviors/authentication.md
- Intended update: Update documented session timeout behavior.
- Evidence to verify: src/auth/session.ts:12
- User-provided decisions/rationale: User decision: preserve a 30 minute timeout because long-lived sessions are out of scope / Lane: engineering contract
- No-update-needed rationale: not applicable; mapped truth is stale
- Blockers: none`);
    expect(report).toContain(`Decision/rationale captured:
- Placed user rationale in docs/truthmark/engineering/behaviors/authentication.md under Engineering Decisions and Rationale.`);
    expect(parseTruthSyncReport(report)).toMatchObject({
      syncIntent,
      decisionRationaleCaptured: [
        "Placed user rationale in docs/truthmark/engineering/behaviors/authentication.md under Engineering Decisions and Rationale.",
      ],
      changedCode: ["src/auth/session.ts"],
      truthDocsUpdated: ["docs/truthmark/engineering/behaviors/authentication.md"],
    });
  });

  it("requires completed reports to state how user decision rationale was captured", () => {
    expect(() =>
      parseTruthSyncReport(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Ownership reviewed:
- docs/truthmark/routes/areas/repository.md

Truth docs updated:
- docs/truthmark/engineering/behaviors/authentication.md

Evidence checked:
- Claim: Session timeout behavior is documented.
  Evidence: src/auth/session.ts:12
  Result: supported

Notes:
- Updated session timeout behavior.`),
    ).toThrow("Decision/rationale captured section is required");
  });

  it("does not introduce persistent Sync Plan or lifecycle artifacts", () => {
    expect(existsSync(join(process.cwd(), "src/sync/plan.ts"))).toBe(false);
    expect(existsSync(join(process.cwd(), "truthmark/changes"))).toBe(false);
  });

  it("round-trips optional helper script statuses", () => {
    const report = renderTruthSyncCompletedReport({
      changedCode: ["src/auth/session.ts"],
      ownershipReviewed: ["docs/truthmark/routes/areas/repository.md"],
      truthDocsUpdated: ["docs/truthmark/engineering/behaviors/authentication.md"],
      evidenceChecked: [
        {
          claim: "Session timeout behavior is documented in the authentication truth doc.",
          evidence: ["src/auth/session.ts:12"],
          result: "supported",
        },
      ],
      helperScripts: [
        "validate-sync-report: ran, passed",
        "validate-write-lease: skipped, no write lease used",
      ],
      notes: ["Updated session timeout behavior."],
    });

    expect(parseTruthSyncReport(report)).toMatchObject({
      helperScripts: [
        "validate-sync-report: ran, passed",
        "validate-write-lease: skipped, no write lease used",
      ],
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
        manualReviewFiles: ["docs/truthmark/engineering/behaviors/authentication.md"],
        nextAction: "fix the failing tests, then rerun Truth Sync",
      }),
    ).toBe(`Truth Sync: blocked

Reason:
- relevant tests failed before sync

Files requiring manual review:
- docs/truthmark/engineering/behaviors/authentication.md

Next action:
- fix the failing tests, then rerun Truth Sync`);
  });

  it("rejects completed reports without structured evidence", () => {
    expect(() =>
      parseTruthSyncReport(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/truthmark/engineering/behaviors/authentication.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
- Session timeout behavior was reviewed.

Notes:
- Updated session timeout behavior.`),
    ).toThrow("Evidence checked");
  });

  it("rejects completed reports with empty claim or evidence content", () => {
    expect(() =>
      parseTruthSyncReport(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/truthmark/engineering/behaviors/authentication.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
- Claim:${"   "}
  Evidence: src/auth/session.ts:12
  Result: supported

Notes:
- Updated session timeout behavior.`),
    ).toThrow("claim is required");

    expect(() =>
      parseTruthSyncReport(`Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/truthmark/engineering/behaviors/authentication.md

Decision/rationale captured:
- none provided in task conversation

Evidence checked:
- Claim: Session timeout behavior is documented.
  Evidence:${"   "}
  Result: supported

Notes:
- Updated session timeout behavior.`),
    ).toThrow("evidence is required");
  });

  it("rejects blocked reports without manual-review files", () => {
    expect(() =>
      renderTruthSyncBlockedReport({
        reason: "routing repair is not allowed",
        manualReviewFiles: [],
        nextAction: "update routing metadata and rerun Truth Sync",
      }),
    ).toThrow("Files requiring manual review must include at least one file");
  });
});
