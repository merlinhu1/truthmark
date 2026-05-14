import { Ajv } from "ajv";

import { truthDocUpdateDraftSchema } from "./schemas/truth-doc-update.js";
import type { ContextPack, TruthDocUpdateDraft } from "./types.js";

const ajv = new Ajv({ allErrors: true });
const validateTruthDocUpdateDraft = ajv.compile(truthDocUpdateDraftSchema);

const parseJson = (rawOutput: string): unknown => {
  try {
    return JSON.parse(rawOutput);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown JSON parse failure";
    throw new Error(`Invalid JSON: ${message}`);
  }
};

const isSafeRelativeDocPath = (docPath: string): boolean => {
  return (
    !docPath.startsWith("/") &&
    !docPath.includes("\\") &&
    !docPath.split("/").includes("..") &&
    docPath.startsWith("docs/")
  );
};

const sortedUnique = (values: string[]): string[] => {
  return [...new Set(values)].sort();
};

const assertSemanticValidity = (draft: TruthDocUpdateDraft, context: ContextPack): void => {
  const evidenceIds = new Set(context.evidenceSnippets.map((snippet) => snippet.id));
  const relevantDocs = new Set(context.relevantDocs);

  if (
    draft.status === "blocked" &&
    (draft.claims.length > 0 || draft.targetDocs.length > 0 || draft.patches.length > 0)
  ) {
    throw new Error("blocked output cannot include claims, target docs, or patches");
  }

  if (draft.status === "blocked" && draft.openQuestions.length === 0) {
    throw new Error("blocked output requires at least one open question");
  }

  const targetDocs = sortedUnique(draft.targetDocs);
  const patchPaths = sortedUnique(draft.patches.map((patch) => patch.path));
  if (JSON.stringify(targetDocs) !== JSON.stringify(patchPaths)) {
    throw new Error("targetDocs must match patch paths");
  }

  if (draft.status === "drafted" && draft.claims.length === 0) {
    throw new Error("drafted output requires at least one claim");
  }

  if (draft.status === "drafted" && draft.patches.length === 0) {
    throw new Error("drafted output requires at least one patch");
  }

  for (const claim of draft.claims) {
    if (draft.status === "drafted" && claim.support === "unsupported") {
      throw new Error("drafted output cannot contain unsupported claims");
    }

    for (const evidenceId of claim.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) {
        throw new Error(`unknown evidence id: ${evidenceId}`);
      }
    }
  }

  for (const docPath of [...draft.targetDocs, ...draft.patches.map((patch) => patch.path)]) {
    if (!isSafeRelativeDocPath(docPath)) {
      throw new Error(`unsafe doc path: ${docPath}`);
    }
  }

  for (const patch of draft.patches) {
    if (!relevantDocs.has(patch.path)) {
      throw new Error(`patch path is not in relevant docs: ${patch.path}`);
    }
  }
};

export const parseTruthDocUpdateDraft = (
  rawOutput: string,
  context: ContextPack,
): TruthDocUpdateDraft => {
  const parsed = parseJson(rawOutput);

  if (!validateTruthDocUpdateDraft(parsed)) {
    throw new Error(
      `truth-doc-update-draft validation failed: ${ajv.errorsText(validateTruthDocUpdateDraft.errors, {
        dataVar: "truth-doc-update-draft",
        separator: "; ",
      })}`,
    );
  }

  assertSemanticValidity(parsed, context);
  return parsed;
};