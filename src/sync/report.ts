import type { TruthSyncSkipReason } from "./policy.js";

export type TruthSyncCompletedReportInput = {
  changedCode: string[];
  truthDocsUpdated: string[];
  notes: string[];
};

export type TruthSyncSkippedReportInput = {
  reason: TruthSyncSkipReason;
};

export type TruthSyncBlockedReportInput = {
  reason: string;
  manualReviewFiles?: string[];
  nextAction: string;
};

const renderBulletSection = (title: string, items: string[]): string => {
  return `${title}:\n${items.map((item) => `- ${item}`).join("\n")}`;
};

export const renderTruthSyncCompletedReport = (
  input: TruthSyncCompletedReportInput,
): string => {
  return [
    "Truth Sync: completed",
    renderBulletSection("Changed code reviewed", input.changedCode),
    renderBulletSection("Truth docs updated", input.truthDocsUpdated),
    renderBulletSection("Notes", input.notes),
  ].join("\n\n");
};

export const renderTruthSyncSkippedReport = (
  input: TruthSyncSkippedReportInput,
): string => {
  return ["Truth Sync: skipped", renderBulletSection("Reason", [input.reason])].join("\n\n");
};

export const renderTruthSyncBlockedReport = (
  input: TruthSyncBlockedReportInput,
): string => {
  const sections = [
    "Truth Sync: blocked",
    renderBulletSection("Reason", [input.reason]),
  ];

  if ((input.manualReviewFiles?.length ?? 0) > 0) {
    sections.push(renderBulletSection("Files requiring manual review", input.manualReviewFiles!));
  }

  sections.push(renderBulletSection("Next action", [input.nextAction]));

  return [
    ...sections,
  ].join("\n\n");
};