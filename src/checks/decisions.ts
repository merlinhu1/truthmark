import fs from "node:fs/promises";

import micromatch from "micromatch";

import type { TruthmarkConfig } from "../config/schema.js";
import { resolveRepoPath } from "../fs/paths.js";
import { parseMarkdownDocument } from "../markdown/parse.js";
import type { Diagnostic } from "../output/diagnostic.js";
import {
  TRUTH_DOCUMENT_KINDS,
  inferTruthDocumentKindFromPath,
  laneForTruthDocumentKind,
  type TruthDocumentEntry,
  type TruthDocumentKind,
} from "../routing/areas.js";
import {
  resolveEngineeringTruthRoot,
  resolveProductTruthRoot,
} from "../truth/docs.js";

const PRODUCT_CAPABILITY_REQUIRED_HEADINGS = [
  "Capability Promise",
  "Users And Value",
  "Capability Scope",
  "Current Product Behavior",
  "Acceptance Criteria",
  "Product Decisions",
  "Engineering Realization Links",
  "Non-Goals",
];
const ENGINEERING_REQUIRED_HEADINGS = [
  "Purpose",
  "Scope",
  "Current Implementation Behavior",
  "Source References",
  "Product Truth Links",
  "Maintenance Notes",
];
const FORBIDDEN_PRODUCT_HEADINGS = [
  "Execution Flow",
  "Execution Model",
  "Generated File Inventory",
  "CLI Envelope Details",
  "Data And Control Flow",
];
const FORBIDDEN_ENGINEERING_HEADINGS = [
  "Product Promise",
  "User / Stakeholder Value",
  "Product Decisions",
  "Product Rationale",
  "Business Boundary",
];

const isTruthDocumentKind = (value: string): value is TruthDocumentKind => {
  return TRUTH_DOCUMENT_KINDS.includes(value as TruthDocumentKind);
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const hasHeading = (source: string, heading: string): boolean => {
  return new RegExp(`^#{2,3}\\s+${escapeRegExp(heading)}\\s*$`, "mu").test(
    source,
  );
};

const kindSpecificHeadingMessages = (
  source: string,
  kind: TruthDocumentKind | null,
): string[] => {
  if (kind === null) {
    return [];
  }

  if (kind === "engineering-behavior") {
    return hasHeading(source, "Current Implementation Behavior")
      ? []
      : ["Current Implementation Behavior"];
  }

  if (kind === "engineering-contract") {
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

  if (kind === "engineering-architecture") {
    return hasHeading(source, "Boundaries") || hasHeading(source, "Components")
      ? []
      : ["Boundaries or Components"];
  }

  if (kind === "engineering-workflow") {
    const missingMessages: string[] = [];

    if (!hasHeading(source, "Triggers")) {
      missingMessages.push("Triggers");
    }

    if (!hasHeading(source, "Execution Model")) {
      missingMessages.push("Execution Model");
    }

    return missingMessages;
  }

  if (kind === "engineering-operations") {
    return hasHeading(source, "Runtime Topology") ||
      hasHeading(source, "Configuration")
      ? []
      : ["Runtime Topology or Configuration"];
  }

  if (kind === "engineering-test-behavior") {
    const missingMessages: string[] = [];

    if (!hasHeading(source, "Execution Model")) {
      missingMessages.push("Execution Model");
    }

    if (
      !hasHeading(source, "Fixtures And Data Model") &&
      !hasHeading(source, "Assertions And Invariants")
    ) {
      missingMessages.push(
        "Fixtures And Data Model or Assertions And Invariants",
      );
    }

    return missingMessages;
  }

  return [];
};

const productRequiredHeadings = (kind: TruthDocumentKind | null): string[] => {
  if (kind === "product-capability") {
    return PRODUCT_CAPABILITY_REQUIRED_HEADINGS;
  }

  return PRODUCT_CAPABILITY_REQUIRED_HEADINGS;
};

const decisionTruthGlobs = (config: TruthmarkConfig): string[] => {
  return [
    `${resolveProductTruthRoot(config)}/**/*.md`,
    `${resolveEngineeringTruthRoot(config)}/**/*.md`,
  ];
};

const isDecisionTruthCandidate = (
  config: TruthmarkConfig,
  filePath: string,
): boolean => {
  return (
    !filePath.endsWith("/README.md") &&
    micromatch.isMatch(filePath, decisionTruthGlobs(config))
  );
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
        truthDocumentMap.has(filePath) ||
        isDecisionTruthCandidate(config, filePath),
    )
    .sort();

  for (const filePath of candidatePaths) {
    const source = await fs.readFile(
      resolveRepoPath(rootDir, filePath),
      "utf8",
    );
    const document = parseMarkdownDocument(source);
    const routedTruthDocument = truthDocumentMap.get(filePath);
    const frontmatterTruthKind =
      typeof document.frontmatter.truth_kind === "string"
        ? document.frontmatter.truth_kind
        : null;
    const routedTruthKind =
      routedTruthDocument?.kindSource === "defaulted"
        ? null
        : routedTruthDocument?.kind;
    const truthKind =
      routedTruthKind ??
      (frontmatterTruthKind && isTruthDocumentKind(frontmatterTruthKind)
        ? frontmatterTruthKind
        : inferTruthDocumentKindFromPath(filePath));
    const lane =
      routedTruthDocument?.lane ??
      (truthKind
        ? laneForTruthDocumentKind(truthKind)
        : filePath.startsWith(resolveProductTruthRoot(config))
          ? "product"
          : "engineering");
    const requiredHeadings =
      lane === "product"
        ? productRequiredHeadings(truthKind)
        : ENGINEERING_REQUIRED_HEADINGS;
    const missingHeadings = requiredHeadings.filter(
      (heading) => !hasHeading(source, heading),
    );
    if (lane === "engineering") {
      missingHeadings.push(...kindSpecificHeadingMessages(source, truthKind));
    }
    const forbiddenHeadings = (
      lane === "product"
        ? FORBIDDEN_PRODUCT_HEADINGS
        : FORBIDDEN_ENGINEERING_HEADINGS
    ).filter((heading) => hasHeading(source, heading));

    if (missingHeadings.length === 0 && forbiddenHeadings.length === 0) {
      continue;
    }

    if (missingHeadings.length > 0) {
      diagnostics.push({
        category: "doc-structure",
        severity: "review",
        message: `Canonical ${lane} truth doc ${filePath} should include ${missingHeadings.join(" and ")} section(s). Product truth says what must be true and why; engineering truth says how the repository currently realizes it.`,
        file: filePath,
      });
    }

    if (forbiddenHeadings.length > 0) {
      diagnostics.push({
        category: "lane-drift",
        severity: "error",
        message: `Canonical ${lane} truth doc ${filePath} contains wrong-lane section(s): ${forbiddenHeadings.join(", ")}.`,
        file: filePath,
      });
    }
  }

  return diagnostics;
};
