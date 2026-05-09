import { describe, expect, it } from "vitest";

import {
  TRUTH_SYNC_BOUNDARIES,
  TRUTH_SYNC_REPORT_TEMPLATE,
  TRUTH_SYNC_SKIP_REASONS,
} from "../../src/sync/policy.js";

describe("Truth Sync policy", () => {
  it("exposes the allowed skip reasons from the README as stable data", () => {
    expect(TRUTH_SYNC_SKIP_REASONS).toEqual([
      "documentation-only change",
      "formatting-only change",
      "clearly behavior-preserving rename with no truth impact",
      "no Truthmark config exists yet",
      "no functional code changes",
    ]);
  });

  it("captures the README read and write boundaries, including area routing repair", () => {
    expect(TRUTH_SYNC_BOUNDARIES).toEqual({
      read: [
        "changed functional code files",
        "nearby implementation context when needed to understand the changed surface",
        ".truthmark/config.yml",
        "TRUTHMARK.md",
        "docs/truthmark/areas.md",
        "mapped truth docs",
      ],
      write: [
        "truth docs only",
        "docs/truthmark/areas.md when creating or repairing truth routing",
      ],
      prohibit: ["must not rewrite functional code"],
    });
  });

  it("captures the Truth Sync report headings as stable data", () => {
    expect(TRUTH_SYNC_REPORT_TEMPLATE).toEqual({
      completed: ["Changed code reviewed", "Truth docs updated", "Notes"],
      skipped: ["Reason"],
      blocked: ["Reason", "Files requiring manual review", "Next action"],
    });
  });
});
