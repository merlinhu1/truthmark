import {
  renderClaimEvidenceCheckedSection,
  type ClaimEvidenceItem,
  type ClaimEvidenceResult,
} from "../truth/evidence.js";

import type { TruthSyncSkipReason } from "./policy.js";

export type TruthSyncIntent = {
  changedCodeReviewed: string[];
  affectedRouteOrTruthOwner: string[];
  targetTruthDocs: string[];
  intendedUpdate: string[];
  evidenceToVerify: string[];
  noUpdateNeededRationale: string[];
  blockers: string[];
};

export type TruthSyncCompletedReportInput = {
  changedCode: string[];
  syncIntent?: TruthSyncIntent;
  ownershipReviewed: string[];
  truthDocsUpdated: string[];
  evidenceChecked: ClaimEvidenceItem[];
  helperScripts?: string[];
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
  manualReviewFiles: string[];
  nextAction: string;
};

const renderBulletSection = (title: string, items: string[]): string => {
  return `${title}:\n${items.map((item) => `- ${item}`).join("\n")}`;
};

const findSection = (source: string, title: string): string | undefined => {
  return source
    .split("\n\n")
    .find((candidate) => candidate.startsWith(`${title}:\n`));
};

const parseBulletLines = (section: string): string[] => {
  return section
    .split("\n")
    .slice(1)
    .map((line) => {
      const match = line.match(/^-\s+(.*)$/);

      return match?.[1];
    })
    .filter((line): line is string => line !== undefined);
};

const parseBulletSection = (source: string, title: string): string[] => {
  const section = findSection(source, title);

  if (!section) {
    return [];
  }

  return parseBulletLines(section);
};

const parseOptionalBulletSection = (source: string, title: string): string[] | undefined => {
  const section = findSection(source, title);

  if (!section) {
    return undefined;
  }

  return parseBulletLines(section);
};

const formatIntentValues = (values: string[]): string => values.join(" / ");

const renderSyncIntentSection = (intent: TruthSyncIntent): string => {
  return [
    "Sync Intent:",
    `- Changed code reviewed: ${formatIntentValues(intent.changedCodeReviewed)}`,
    `- Affected route/truth owner: ${formatIntentValues(intent.affectedRouteOrTruthOwner)}`,
    `- Target truth docs: ${formatIntentValues(intent.targetTruthDocs)}`,
    `- Intended update: ${formatIntentValues(intent.intendedUpdate)}`,
    `- Evidence to verify: ${formatIntentValues(intent.evidenceToVerify)}`,
    `- No-update-needed rationale: ${formatIntentValues(intent.noUpdateNeededRationale)}`,
    `- Blockers: ${formatIntentValues(intent.blockers)}`,
  ].join("\n");
};

const parseIntentValues = (value: string): string[] => {
  return value
    .split(" / ")
    .map((item) => item.trim())
    .filter(hasContent);
};

const parseSyncIntentSection = (source: string): TruthSyncIntent | undefined => {
  const entries = parseOptionalBulletSection(source, "Sync Intent");

  if (entries === undefined) {
    return undefined;
  }

  const values = new Map<string, string>();
  for (const entry of entries) {
    const separator = entry.indexOf(":");
    if (separator === -1) {
      continue;
    }
    values.set(entry.slice(0, separator), entry.slice(separator + 1).trim());
  }

  return {
    changedCodeReviewed: parseIntentValues(values.get("Changed code reviewed") ?? ""),
    affectedRouteOrTruthOwner: parseIntentValues(values.get("Affected route/truth owner") ?? ""),
    targetTruthDocs: parseIntentValues(values.get("Target truth docs") ?? ""),
    intendedUpdate: parseIntentValues(values.get("Intended update") ?? ""),
    evidenceToVerify: parseIntentValues(values.get("Evidence to verify") ?? ""),
    noUpdateNeededRationale: parseIntentValues(values.get("No-update-needed rationale") ?? ""),
    blockers: parseIntentValues(values.get("Blockers") ?? ""),
  };
};

const isClaimEvidenceResult = (value: string): value is ClaimEvidenceResult => {
  return ["supported", "narrowed", "removed", "blocked"].includes(value);
};

const hasContent = (value: string): boolean => value.trim().length > 0;

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
    const claim = claimLine.slice("- Claim: ".length).trim();
    const evidence = evidenceLine
      .slice("  Evidence: ".length)
      .split(" / ")
      .map((value) => value.trim());

    if (!hasContent(claim)) {
      throw new Error("Evidence checked claim is required.");
    }

    if (evidence.length === 0 || evidence.some((value) => !hasContent(value))) {
      throw new Error("Evidence checked evidence is required.");
    }

    if (!isClaimEvidenceResult(result)) {
      throw new Error("Evidence checked result is invalid.");
    }

    items.push({
      claim,
      evidence,
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
    ...(input.syncIntent === undefined ? [] : [renderSyncIntentSection(input.syncIntent)]),
    renderBulletSection("Ownership reviewed", input.ownershipReviewed),
    renderBulletSection("Truth docs updated", input.truthDocsUpdated),
    renderClaimEvidenceCheckedSection(input.evidenceChecked),
    ...(input.helperScripts === undefined
      ? []
      : [renderBulletSection("Helper scripts", input.helperScripts)]),
    renderBulletSection("Notes", input.notes),
  ].join("\n\n");
};

export const parseTruthSyncReport = (source: string): TruthSyncCompletedReport => {
  if (!source.startsWith("Truth Sync: completed")) {
    throw new Error("Only completed Truth Sync reports can be parsed.");
  }

  const helperScripts = parseOptionalBulletSection(source, "Helper scripts");
  const syncIntent = parseSyncIntentSection(source);

  return {
    status: "completed",
    changedCode: parseBulletSection(source, "Changed code reviewed"),
    ...(syncIntent === undefined ? {} : { syncIntent }),
    ownershipReviewed: parseBulletSection(source, "Ownership reviewed"),
    truthDocsUpdated: parseBulletSection(source, "Truth docs updated"),
    evidenceChecked: parseEvidenceCheckedSection(source),
    ...(helperScripts === undefined ? {} : { helperScripts }),
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
  const manualReviewFiles = input.manualReviewFiles.filter((file) => file.trim().length > 0);

  if (manualReviewFiles.length === 0) {
    throw new Error("Files requiring manual review must include at least one file.");
  }

  const sections = [
    "Truth Sync: blocked",
    renderBulletSection("Reason", [input.reason]),
    renderBulletSection("Files requiring manual review", manualReviewFiles),
    renderBulletSection("Next action", [input.nextAction]),
  ];

  return [
    ...sections,
  ].join("\n\n");
};
