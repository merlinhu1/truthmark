import { describe, expect, it } from "vitest";

import { renderTruthRealizeCompletedReport } from "../../src/realize/report.js";

describe("renderTruthRealizeCompletedReport", () => {
  it("matches the README handoff-note shape", () => {
    expect(
      renderTruthRealizeCompletedReport({
        truthDocsUsed: ["docs/features/authentication.md"],
        codeUpdated: ["src/auth/session.ts"],
        verification: ["npm test -- auth"],
      }),
    ).toBe(`Truth Realize: completed

Truth docs used:
- docs/features/authentication.md

Code updated:
- src/auth/session.ts

Verification:
- npm test -- auth`);
  });
});