import {
  renderClaimEvidenceCheckedSection,
  type ClaimEvidenceItem,
  type ClaimEvidenceResult,
} from "../truth/evidence.js";

import type { TruthSyncSkipReason } from "./policy.js";

export type TruthSyncCompletedReportInput = {
  changedCode: string[];
  truthDocsUpdated: string[];
  evidenceChecked: ClaimEvidenceItem[];
  notes: string[];
};

export type TruthSyncCompletedReport = TruthSyncCompletedReportInput & {
  status: "completed";
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

const parseBulletSection = (source: string, title: string): string[] => {
  const section = source
    .split("\n\n")
    .find((candidate) => candidate.startsWith(`${title}:\n`));

  if (!section) {
    return [];
  }

  return section
    .split("\n")
    .slice(1)
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
};

const isClaimEvidenceResult = (value: string): value is ClaimEvidenceResult => {
  return ["supported", "narrowed", "removed", "blocked"].includes(value);
};

const parseEvidenceCheckedSection = (source: string): ClaimEvidenceItem[] => {
  const section = source
    .split("\n\n")
    .find((candidate) => candidate.startsWith("Evidence checked:\n"));

  if (!section) {
    throw new Error("Evidence checked section is required.");
  }

  const lines = section.split("\n").slice(1);
  const items: ClaimEvidenceItem[] = [];

  for (let index = 0; index < lines.length; index += 3) {
    const claimLine = lines[index];
    const evidenceLine = lines[index + 1];
    const resultLine = lines[index + 2];

    if (
      !claimLine?.startsWith("- Claim: ") ||
      !evidenceLine?.startsWith("  Evidence: ") ||
      !resultLine?.startsWith("  Result: ")
    ) {
      throw new Error("Evidence checked entries must include Claim, Evidence, and Result fields.");
    }

    const result = resultLine.slice("  Result: ".length);

    if (!isClaimEvidenceResult(result)) {
      throw new Error("Evidence checked result is invalid.");
    }

    items.push({
      claim: claimLine.slice("- Claim: ".length),
      evidence: evidenceLine.slice("  Evidence: ".length).split(" / "),
      result,
    });
  }

  return items;
};

export const renderTruthSyncCompletedReport = (
  input: TruthSyncCompletedReportInput,
): string => {
  return [
    "Truth Sync: completed",
    renderBulletSection("Changed code reviewed", input.changedCode),
    renderBulletSection("Truth docs updated", input.truthDocsUpdated),
    renderClaimEvidenceCheckedSection(input.evidenceChecked),
    renderBulletSection("Notes", input.notes),
  ].join("\n\n");
};

export const parseTruthSyncReport = (source: string): TruthSyncCompletedReport => {
  if (!source.startsWith("Truth Sync: completed")) {
    throw new Error("Only completed Truth Sync reports can be parsed.");
  }

  return {
    status: "completed",
    changedCode: parseBulletSection(source, "Changed code reviewed"),
    truthDocsUpdated: parseBulletSection(source, "Truth docs updated"),
    evidenceChecked: parseEvidenceCheckedSection(source),
    notes: parseBulletSection(source, "Notes"),
  };
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
