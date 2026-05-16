import micromatch from "micromatch";

import type {
  TruthmarkWorkflowId,
  TruthmarkWriteSubagentId,
} from "./workflow-manifest.js";

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
