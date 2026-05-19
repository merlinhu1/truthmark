export type WorkflowHelperValidationResult =
  | {
      ok: true;
      helper: string;
      checks: string[];
    }
  | {
      ok: false;
      helper: string;
      errors: string[];
    };

const escapeRegex = (value: string): string =>
  value
    .split("")
    .map((char) => (".+*?^$()[]{}|\\".includes(char) ? `\\${char}` : char))
    .join("");

const hasLabel = (text: string, label: string): boolean => {
  const escaped = escapeRegex(label);
  return new RegExp(String.raw`(^|\n)\s*(?:#{1,6}\s*)?${escaped}\s*:?\s*(\n|$)`, "iu").test(
    text,
  );
};

const getSection = (text: string, label: string): string | null => {
  const lines = text.split(/\r?\n/u);
  const labelPattern = new RegExp(String.raw`^(?:#{1,6}\s*)?${escapeRegex(label)}\s*:?\s*$`, "iu");
  const sectionHeaderPattern = /^(?:#{1,6}\s*)?[A-Z][A-Za-z0-9 ]+:\s*$/u;
  const startIndex = lines.findIndex((line) => labelPattern.test(line));

  if (startIndex === -1) {
    return null;
  }

  const nextSectionOffset = lines
    .slice(startIndex + 1)
    .findIndex((line) => sectionHeaderPattern.test(line));
  const endIndex = nextSectionOffset === -1 ? lines.length : startIndex + 1 + nextSectionOffset;

  return lines.slice(startIndex + 1, endIndex).join("\n").trim();
};

const requireBulletSection = (
  text: string,
  label: string,
  errors: string[],
  checks: string[],
): void => {
  const section = getSection(text, label);

  if (section === null) {
    errors.push(`missing required section: ${label}`);
    return;
  }

  if (!/^-\s+\S/mu.test(section)) {
    errors.push(`${label} must include at least one bullet`);
    return;
  }

  checks.push(label);
};

const validateEvidenceChecked = (text: string, errors: string[], checks: string[]): void => {
  const section = getSection(text, "Evidence checked");

  if (section === null || section === "") {
    errors.push("Evidence checked must include at least one structured entry");
    return;
  }

  const entries = section
    .split(/\n(?=-\s+)/u)
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (entries.length === 0) {
    errors.push("Evidence checked must include at least one structured entry");
    return;
  }

  const entryPattern =
    /^- Claim:\s*\S[^\n]*\n {2,}Evidence:\s*\S[^\n]*\n {2,}Result:\s*(supported|narrowed|removed|blocked)\s*$/iu;
  for (const [index, entry] of entries.entries()) {
    if (!entryPattern.test(entry)) {
      errors.push(
        `Evidence checked entry ${
          index + 1
        } must match '- Claim: ...' followed by indented 'Evidence: ...' and 'Result: supported | narrowed | removed | blocked'`,
      );
    }
  }

  if (errors.length === 0) {
    checks.push(
      "Evidence checked entries include Claim:, Evidence:, and Result: supported | narrowed | removed | blocked",
    );
  }
};

const validateHelperScripts = (
  text: string,
  requiredHelpers: string[],
  errors: string[],
  checks: string[],
): void => {
  const section = getSection(text, "Helper scripts");

  if (section === null || section === "") {
    errors.push("Helper scripts must include status for optional helpers");
    return;
  }

  const entries = section
    .split(/\n/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const statusPattern = /^-\s*([a-z0-9-]+):\s*(?:ran,\s*passed|skipped,\s*\S.*)$/iu;

  const validHelperIds = new Set<string>();

  for (const entry of entries) {
    const match = entry.match(statusPattern);
    if (match === null) {
      errors.push(
        "Helper scripts entries must match '- helper-id: ran, passed' or '- helper-id: skipped, reason'; ran, failed is not valid for completed reports",
      );
      continue;
    }

    validHelperIds.add(match[1].toLowerCase());
  }

  for (const helperId of requiredHelpers) {
    if (!validHelperIds.has(helperId.toLowerCase())) {
      errors.push(`missing Helper scripts status: ${helperId}`);
    }
  }

  if (errors.length === 0) {
    checks.push(`Helper scripts statuses include ${requiredHelpers.join(", ")}`);
  }
};

export const validateTruthSyncReportText = (text: string): WorkflowHelperValidationResult => {
  const helper = "validate-sync-report";
  const statusMatch = text.match(/^\s*Truth Sync:\s*(completed|blocked|skipped)\b/imu);
  if (statusMatch === null) {
    return {
      ok: false,
      helper,
      errors: ["missing Truth Sync status: expected completed, blocked, or skipped"],
    };
  }

  const status = statusMatch[1].toLowerCase();
  const checks = [`status: ${status}`];
  const errors: string[] = [];

  if (status === "completed") {
    for (const label of [
      "Changed code reviewed",
      "Ownership reviewed",
      "Truth docs updated",
      "Notes",
    ]) {
      requireBulletSection(text, label, errors, checks);
    }

    if (hasLabel(text, "Evidence checked")) {
      checks.push("Evidence checked");
    } else {
      errors.push("missing required section: Evidence checked");
    }

    if (hasLabel(text, "Helper scripts")) {
      checks.push("Helper scripts");
    } else {
      errors.push("missing required section: Helper scripts");
    }

    validateEvidenceChecked(text, errors, checks);
    validateHelperScripts(text, ["validate-sync-report", "validate-write-lease"], errors, checks);
  } else if (status === "skipped") {
    requireBulletSection(text, "Reason", errors, checks);
  } else if (status === "blocked") {
    requireBulletSection(text, "Reason", errors, checks);
    requireBulletSection(text, "Next action", errors, checks);
  }

  return errors.length > 0 ? { ok: false, helper, errors } : { ok: true, helper, checks };
};

export const validateTruthDocumentReportText = (text: string): WorkflowHelperValidationResult => {
  const helper = "validate-document-report";
  const statusMatch = text.match(/^\s*Truth Document:\s*(completed|blocked)\b/imu);
  if (statusMatch === null) {
    return {
      ok: false,
      helper,
      errors: ["missing Truth Document status: expected completed or blocked"],
    };
  }

  const status = statusMatch[1].toLowerCase();
  const checks = [`status: ${status}`];
  const errors: string[] = [];

  if (status === "completed") {
    for (const label of ["Implementation reviewed", "Ownership reviewed", "Notes"]) {
      requireBulletSection(text, label, errors, checks);
    }

    if (hasLabel(text, "Evidence checked")) {
      checks.push("Evidence checked");
    } else {
      errors.push("missing required section: Evidence checked");
    }

    if (hasLabel(text, "Helper scripts")) {
      checks.push("Helper scripts");
    } else {
      errors.push("missing required section: Helper scripts");
    }

    const truthDocsUpdated = getSection(text, "Truth docs updated");
    const truthDocsCreated = getSection(text, "Truth docs created");
    if (truthDocsUpdated === null && truthDocsCreated === null) {
      errors.push("missing required section: Truth docs updated or Truth docs created");
    } else if (
      ![truthDocsUpdated, truthDocsCreated].some(
        (section) => section !== null && /^-\s+\S/mu.test(section),
      )
    ) {
      errors.push("Truth docs updated or Truth docs created must include at least one bullet");
    } else {
      checks.push("Truth docs updated or created");
    }

    validateEvidenceChecked(text, errors, checks);
    validateHelperScripts(text, ["validate-document-report", "validate-write-lease"], errors, checks);
  } else if (status === "blocked") {
    requireBulletSection(text, "Reason", errors, checks);
  }

  return errors.length > 0 ? { ok: false, helper, errors } : { ok: true, helper, checks };
};

const cleanPathValue = (value: string): string => value.trim().replace(/^["']|["']$/gu, "");
const normalizePath = (value: string): string => cleanPathValue(value).replace(/^\.\//u, "");
const windowsDriveAbsolutePattern = /^[A-Za-z]:[\\/]/u;
const uncPathPattern = /^[/\\]{2}[^/\\]+[/\\]+[^/\\]+/u;

const isUnsafePathValue = (value: string): boolean => {
  const cleanValue = cleanPathValue(value);
  const pathValue = cleanValue.endsWith("/**") ? cleanValue.slice(0, -3) : cleanValue;
  return (
    pathValue.startsWith("/") ||
    pathValue.startsWith("\\") ||
    windowsDriveAbsolutePattern.test(pathValue) ||
    uncPathPattern.test(pathValue) ||
    pathValue.split(/[\\/]+/u).includes("..")
  );
};

const parseListFields = (text: string): { allowedWrites: string[]; forbiddenWrites: string[] } => {
  const lists = { allowedWrites: [] as string[], forbiddenWrites: [] as string[] };
  let current: keyof typeof lists | null = null;

  for (const rawLine of text.split(/\r?\n/u)) {
    const sectionMatch = rawLine.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/u);
    if (sectionMatch !== null) {
      current = Object.prototype.hasOwnProperty.call(lists, sectionMatch[1])
        ? (sectionMatch[1] as keyof typeof lists)
        : null;

      const inlineValue = sectionMatch[2].trim();
      if (current !== null && inlineValue !== "" && inlineValue !== "[]") {
        lists[current].push(inlineValue);
      }
      continue;
    }

    const itemMatch = rawLine.match(/^\s*-\s+(.+)\s*$/u);
    if (current !== null && itemMatch !== null) {
      lists[current].push(itemMatch[1].trim());
      continue;
    }

    if (rawLine.trim() !== "" && !rawLine.startsWith(" ") && !rawLine.startsWith("\t")) {
      current = null;
    }
  }

  return lists;
};

const isSupportedPattern = (pattern: string): boolean => {
  const withoutTrailingGlob = pattern.endsWith("/**") ? pattern.slice(0, -3) : pattern;
  return !/[?*[\]{}]/u.test(withoutTrailingGlob);
};

const matchesPattern = (filePath: string, pattern: string): boolean => {
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -3).replace(/\/+$/u, "");
    return filePath === prefix || filePath.startsWith(`${prefix}/`);
  }

  return filePath === pattern;
};

export const validateWriteLeaseText = (
  leaseText: string,
  changedText: string,
): WorkflowHelperValidationResult => {
  const helper = "validate-write-lease";
  const parsed = parseListFields(leaseText);
  const rawAllowedWrites = parsed.allowedWrites.map(cleanPathValue).filter(Boolean);
  const rawForbiddenWrites = parsed.forbiddenWrites.map(cleanPathValue).filter(Boolean);
  const rawChangedFiles = changedText
    .split(/\r?\n/u)
    .map(cleanPathValue)
    .filter(Boolean);
  const allowedWrites = rawAllowedWrites.map(normalizePath).filter(Boolean);
  const forbiddenWrites = rawForbiddenWrites.map(normalizePath).filter(Boolean);
  const changedFiles = rawChangedFiles.map(normalizePath).filter(Boolean);
  const checks: string[] = [];
  const errors: string[] = [];

  for (const pattern of rawAllowedWrites) {
    if (isUnsafePathValue(pattern)) {
      errors.push(`invalid allowedWrites path: ${pattern}`);
    }
  }

  for (const pattern of rawForbiddenWrites) {
    if (isUnsafePathValue(pattern)) {
      errors.push(`invalid forbiddenWrites path: ${pattern}`);
    }
  }

  for (const filePath of rawChangedFiles) {
    if (isUnsafePathValue(filePath)) {
      errors.push(`invalid changed file path: ${filePath}`);
    }
  }

  for (const pattern of [...allowedWrites, ...forbiddenWrites]) {
    if (!isSupportedPattern(pattern)) {
      errors.push(`manual-validation required: unsupported write pattern ${pattern}`);
    }
  }

  if (allowedWrites.length === 0) {
    errors.push("manual-validation required: no allowedWrites entries found");
  }

  if (errors.length === 0) {
    for (const filePath of changedFiles) {
      if (!allowedWrites.some((pattern) => matchesPattern(filePath, pattern))) {
        errors.push(`${filePath} is outside allowedWrites`);
        continue;
      }

      const forbiddenPattern = forbiddenWrites.find((pattern) => matchesPattern(filePath, pattern));
      if (forbiddenPattern !== undefined) {
        errors.push(`${filePath} matches forbiddenWrites pattern ${forbiddenPattern}`);
        continue;
      }

      checks.push(filePath);
    }
  }

  return errors.length > 0 ? { ok: false, helper, errors } : { ok: true, helper, checks };
};
