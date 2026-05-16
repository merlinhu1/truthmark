import micromatch from "micromatch";
import { parse as parseYaml } from "yaml";

import type {
  TruthmarkWorkflowId,
  TruthmarkWriteSubagentId,
} from "./workflow-manifest.js";

export const TRUTHMARK_WRITE_WORKER_REPORT_FIELDS = [
  "status",
  "worker",
  "workflow",
  "shard",
  "filesChanged",
  "claimsChecked",
  "evidenceChecked",
  "offLeaseChanges",
  "blockers",
  "notes",
] as const;

export type TruthmarkWriteWorkerReportField =
  (typeof TRUTHMARK_WRITE_WORKER_REPORT_FIELDS)[number];

export type TruthmarkWriteLease = {
  workflow: TruthmarkWorkflowId;
  worker: TruthmarkWriteSubagentId;
  shard: string;
  objective: string;
  requiredReads: string[];
  allowedReads?: string[];
  allowedWrites: string[];
  forbiddenWrites: string[];
  evidenceRequired: string[];
  verification?: string[];
  reportFields: string[];
};

export type TruthmarkWriteLeaseChangeValidation = {
  allowedChanges: string[];
  forbiddenChanges: string[];
  offLeaseChanges: string[];
};

export type TruthmarkWriteWorkerReport = Record<string, unknown>;

export type TruthmarkWriteWorkerAcceptanceReasonCode =
  | "missing-report-field"
  | "invalid-report-field"
  | "invalid-report-status"
  | "identity-mismatch"
  | "forbidden-actual-diff"
  | "off-lease-actual-diff"
  | "reported-files-mismatch"
  | "completed-with-reported-off-lease-changes"
  | "completed-with-blockers"
  | "blocked-without-blockers";

export type TruthmarkWriteWorkerAcceptanceReason = {
  code: TruthmarkWriteWorkerAcceptanceReasonCode;
  message: string;
  field?: string;
  files?: string[];
  expected?: string;
  actual?: string;
};

export type TruthmarkWriteWorkerAcceptanceValidation = {
  status: "accepted" | "blocked" | "rejected";
  reasons: TruthmarkWriteWorkerAcceptanceReason[];
  changeValidation: TruthmarkWriteLeaseChangeValidation;
  actualChangedFiles: string[];
  reportedFilesChanged: string[];
};

const normalizePath = (filePath: string): string => {
  return filePath.replaceAll("\\", "/").replace(/^\.\/+/u, "");
};

const matchesAny = (filePath: string, patterns: string[]): boolean => {
  if (patterns.length === 0) {
    return false;
  }

  return micromatch.isMatch(normalizePath(filePath), patterns);
};

const uniqueSorted = (values: string[]): string[] => {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const hasOwn = (record: Record<string, unknown>, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(record, key);
};

const readStringArrayField = (
  report: TruthmarkWriteWorkerReport,
  field: string,
): string[] | undefined => {
  const value = report[field];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return undefined;
  }
  return uniqueSorted(value.map(normalizePath));
};

const equalStringArrays = (left: string[], right: string[]): boolean => {
  return left.length === right.length && left.every((value, index) => value === right[index]);
};

export const parseTruthmarkWriteWorkerReport = (
  source: string,
): TruthmarkWriteWorkerReport => {
  const parsed = parseYaml(source);
  if (!isRecord(parsed)) {
    throw new Error("Truthmark write worker report must be a YAML object.");
  }
  return parsed;
};

export const validateTruthmarkWriteLeaseChanges = (
  lease: TruthmarkWriteLease,
  changedFiles: string[],
): TruthmarkWriteLeaseChangeValidation => {
  const normalizedFiles = uniqueSorted(changedFiles.map(normalizePath));
  const forbiddenChanges = normalizedFiles.filter((filePath) =>
    matchesAny(filePath, lease.forbiddenWrites),
  );
  const outsideAllowedWrites = normalizedFiles.filter(
    (filePath) => !matchesAny(filePath, lease.allowedWrites),
  );
  const offLeaseChanges = uniqueSorted([
    ...forbiddenChanges,
    ...outsideAllowedWrites,
  ]);

  return {
    allowedChanges: normalizedFiles.filter(
      (filePath) => !offLeaseChanges.includes(filePath),
    ),
    forbiddenChanges,
    offLeaseChanges,
  };
};

export const validateTruthmarkWriteWorkerAcceptance = ({
  lease,
  workerReport,
  actualChangedFiles,
}: {
  lease: TruthmarkWriteLease;
  workerReport: TruthmarkWriteWorkerReport;
  actualChangedFiles: string[];
}): TruthmarkWriteWorkerAcceptanceValidation => {
  const reasons: TruthmarkWriteWorkerAcceptanceReason[] = [];
  const normalizedActualChangedFiles = uniqueSorted(actualChangedFiles.map(normalizePath));
  const requiredReportFields = uniqueSorted([
    ...lease.reportFields,
    ...(lease.worker === "truth_doc_writer" ? TRUTHMARK_WRITE_WORKER_REPORT_FIELDS : []),
  ]);

  for (const field of requiredReportFields) {
    if (!hasOwn(workerReport, field)) {
      reasons.push({
        code: "missing-report-field",
        field,
        message: `Worker report is missing required field ${field}.`,
      });
    }
  }

  const reportStatus = workerReport.status;
  if (
    hasOwn(workerReport, "status") &&
    reportStatus !== "completed" &&
    reportStatus !== "blocked"
  ) {
    reasons.push({
      code: "invalid-report-status",
      field: "status",
      message: "Worker report status must be completed or blocked.",
    });
  }

  for (const field of ["worker", "workflow", "shard"] as const) {
    const actual = workerReport[field];
    const expected = lease[field];
    if (hasOwn(workerReport, field) && typeof actual !== "string") {
      reasons.push({
        code: "invalid-report-field",
        field,
        message: `Worker report field ${field} must be a string.`,
      });
    } else if (typeof actual === "string" && actual !== expected) {
      reasons.push({
        code: "identity-mismatch",
        field,
        expected,
        actual,
        message: `Worker report ${field} does not match the lease.`,
      });
    }
  }

  for (const field of [
    "filesChanged",
    "claimsChecked",
    "evidenceChecked",
    "offLeaseChanges",
    "blockers",
    "notes",
  ]) {
    if (hasOwn(workerReport, field) && readStringArrayField(workerReport, field) === undefined) {
      reasons.push({
        code: "invalid-report-field",
        field,
        message: `Worker report field ${field} must be a string array.`,
      });
    }
  }

  const reportedFilesChanged = readStringArrayField(workerReport, "filesChanged") ?? [];
  const reportedOffLeaseChanges = readStringArrayField(workerReport, "offLeaseChanges") ?? [];
  const reportedBlockers = readStringArrayField(workerReport, "blockers") ?? [];
  const changeValidation = validateTruthmarkWriteLeaseChanges(
    lease,
    normalizedActualChangedFiles,
  );

  if (changeValidation.forbiddenChanges.length > 0) {
    reasons.push({
      code: "forbidden-actual-diff",
      files: changeValidation.forbiddenChanges,
      message: "Actual worker diff includes forbidden lease paths.",
    });
  }

  if (changeValidation.offLeaseChanges.length > 0) {
    reasons.push({
      code: "off-lease-actual-diff",
      files: changeValidation.offLeaseChanges,
      message: "Actual worker diff includes paths outside allowedWrites.",
    });
  }

  if (!equalStringArrays(reportedFilesChanged, normalizedActualChangedFiles)) {
    reasons.push({
      code: "reported-files-mismatch",
      files: reportedFilesChanged,
      message: "Worker report filesChanged does not match the actual worker diff.",
    });
  }

  if (reportStatus === "completed" && reportedOffLeaseChanges.length > 0) {
    reasons.push({
      code: "completed-with-reported-off-lease-changes",
      files: reportedOffLeaseChanges,
      message: "Completed worker reports must not include offLeaseChanges.",
    });
  }

  if (reportStatus === "completed" && reportedBlockers.length > 0) {
    reasons.push({
      code: "completed-with-blockers",
      message: "Completed worker reports must not include blockers.",
    });
  }

  if (reportStatus === "blocked" && reportedBlockers.length === 0) {
    reasons.push({
      code: "blocked-without-blockers",
      message: "Blocked worker reports must include at least one blocker.",
    });
  }

  if (reasons.length === 0 && reportStatus === "completed") {
    return {
      status: "accepted",
      reasons,
      changeValidation,
      actualChangedFiles: normalizedActualChangedFiles,
      reportedFilesChanged,
    };
  }

  if (reasons.length === 0 && reportStatus === "blocked") {
    return {
      status: "blocked",
      reasons,
      changeValidation,
      actualChangedFiles: normalizedActualChangedFiles,
      reportedFilesChanged,
    };
  }

  return {
    status: "rejected",
    reasons,
    changeValidation,
    actualChangedFiles: normalizedActualChangedFiles,
    reportedFilesChanged,
  };
};
