export const TRUTH_SYNC_SKIP_REASONS = [
  "documentation-only change",
  "formatting-only change",
  "clearly behavior-preserving rename with no truth impact",
  "no Truthmark config exists yet",
  "no functional code changes",
] as const;

export type TruthSyncSkipReason = (typeof TRUTH_SYNC_SKIP_REASONS)[number];

export const TRUTH_SYNC_REPORT_TEMPLATE = {
  completed: ["Changed code reviewed", "Truth docs updated", "Notes"],
  skipped: ["Reason"],
  blocked: ["Reason", "Files requiring manual review", "Next action"],
} as const;

export type TruthSyncReportTemplate = typeof TRUTH_SYNC_REPORT_TEMPLATE;

export const TRUTH_SYNC_CONTEXT_NOTES = [
  "Code verification is parent-owned; optional validation commands do not select verification for the agent.",
] as const;

export const TRUTH_SYNC_BOUNDARIES = {
  read: [
    "changed functional code files",
    "nearby implementation context when needed to understand the changed surface",
    ".truthmark/config.yml",
    "docs/truthmark/areas.md",
    "mapped truth docs",
  ],
  write: [
    "truth docs only",
    "docs/truthmark/areas.md when creating or repairing truth routing",
  ],
  prohibit: ["must not rewrite functional code"],
} as const;
