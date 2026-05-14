import fs from "node:fs/promises";

import micromatch from "micromatch";

import type { TruthmarkConfig } from "../config/schema.js";
import { resolveRepoPath } from "../fs/paths.js";
import { parseMarkdownDocument } from "../markdown/parse.js";
import type { Diagnostic } from "../output/diagnostic.js";
import {
  TRUTH_DOCUMENT_KINDS,
  inferTruthDocumentKindFromPath,
  type TruthDocumentEntry,
  type TruthDocumentKind,
} from "../routing/areas.js";
import { resolveTruthDocsRoot } from "../truth/docs.js";

const REQUIRED_DECISION_HEADINGS = ["Scope", "Product Decisions", "Rationale"];

const isTruthDocumentKind = (value: string): value is TruthDocumentKind => {
  return TRUTH_DOCUMENT_KINDS.includes(value as TruthDocumentKind);
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const hasHeading = (source: string, heading: string): boolean => {
  return new RegExp(`^#{2,3}\\s+${escapeRegExp(heading)}\\s*$`, "mu").test(source);
};

const kindSpecificHeadingMessages = (
  source: string,
  kind: TruthDocumentKind | null,
): string[] => {
  if (kind === null) {
    return [];
  }

  if (kind === "behavior") {
    return hasHeading(source, "Current Behavior") ? [] : ["Current Behavior"];
  }

  if (kind === "contract") {
    const missingMessages: string[] = [];

    if (!hasHeading(source, "Contract Surface")) {
      missingMessages.push("Contract Surface");
    }

    if (
      !hasHeading(source, "Inputs") &&
      !hasHeading(source, "Outputs") &&
      !hasHeading(source, "Compatibility Rules")
    ) {
      missingMessages.push("one of Inputs, Outputs, or Compatibility Rules");
    }

    return missingMessages;
  }

  if (kind === "architecture") {
    return hasHeading(source, "Boundaries") || hasHeading(source, "Components")
      ? []
      : ["Boundaries or Components"];
  }

  if (kind === "workflow") {
    const missingMessages: string[] = [];

    if (!hasHeading(source, "Triggers")) {
      missingMessages.push("Triggers");
    }

    if (!hasHeading(source, "Execution Model")) {
      missingMessages.push("Execution Model");
    }

    return missingMessages;
  }

  if (kind === "operations") {
    return hasHeading(source, "Runtime Topology") || hasHeading(source, "Configuration")
      ? []
      : ["Runtime Topology or Configuration"];
  }

  if (kind === "test-behavior") {
    const missingMessages: string[] = [];

    if (!hasHeading(source, "Execution Model")) {
      missingMessages.push("Execution Model");
    }

    if (
      !hasHeading(source, "Fixtures And Data Model") &&
      !hasHeading(source, "Assertions And Invariants")
    ) {
      missingMessages.push("Fixtures And Data Model or Assertions And Invariants");
    }

    return missingMessages;
  }

  return [];
};

const decisionTruthGlobs = (config: TruthmarkConfig): string[] => {
  return [
    config.docs.roots.architecture,
    resolveTruthDocsRoot(config),
    config.docs.roots.api,
  ]
    .filter((root): root is string => Boolean(root))
    .map((root) => `${root}/**/*.md`);
};

const isDecisionTruthCandidate = (config: TruthmarkConfig, filePath: string): boolean => {
  return !filePath.endsWith("/README.md") && micromatch.isMatch(filePath, decisionTruthGlobs(config));
};

export const checkDecisionSections = async (
  rootDir: string,
  config: TruthmarkConfig,
  markdownPaths: string[],
  truthDocumentEntries: TruthDocumentEntry[] = [],
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];
  const truthDocumentMap = new Map(
    truthDocumentEntries.map((entry) => [entry.path, entry]),
  );
  const candidatePaths = [...new Set(markdownPaths)]
    .filter(
      (filePath) =>
        truthDocumentMap.has(filePath) || isDecisionTruthCandidate(config, filePath),
    )
    .sort();

  for (const filePath of candidatePaths) {
    const source = await fs.readFile(resolveRepoPath(rootDir, filePath), "utf8");
    const document = parseMarkdownDocument(source);
    const routedTruthDocument = truthDocumentMap.get(filePath);
    const frontmatterTruthKind =
      typeof document.frontmatter.truth_kind === "string"
        ? document.frontmatter.truth_kind
        : null;
    const routedTruthKind =
      routedTruthDocument?.kindSource === "defaulted" ? null : routedTruthDocument?.kind;
    const truthKind =
      routedTruthKind ??
      (frontmatterTruthKind && isTruthDocumentKind(frontmatterTruthKind)
        ? frontmatterTruthKind
        : inferTruthDocumentKindFromPath(filePath));
    const missingHeadings = REQUIRED_DECISION_HEADINGS.filter(
      (heading) => !hasHeading(source, heading),
    );
    missingHeadings.push(...kindSpecificHeadingMessages(source, truthKind));

    if (missingHeadings.length === 0) {
      continue;
    }

    diagnostics.push({
      category: "doc-structure",
      severity: "review",
      message: `Canonical truth doc ${filePath} should include ${missingHeadings.join(" and ")} section(s). Decisions should live beside current behavior, not in timestamped planning logs.`,
      file: filePath,
    });
  }

  return diagnostics;
};
