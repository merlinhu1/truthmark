import fs from "node:fs/promises";

import micromatch from "micromatch";

import type { TruthmarkConfig } from "../config/schema.js";
import { resolveRepoPath } from "../fs/paths.js";
import type { Diagnostic } from "../output/diagnostic.js";

const REQUIRED_DECISION_HEADINGS = ["Product Decisions", "Rationale"];

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const hasHeading = (source: string, heading: string): boolean => {
  return new RegExp(`^#{2,3}\\s+${escapeRegExp(heading)}\\s*$`, "mu").test(source);
};

const decisionTruthGlobs = (config: TruthmarkConfig): string[] => {
  return [
    config.docs.roots.architecture,
    config.docs.roots.features ?? config.docs.roots.features_current,
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
): Promise<Diagnostic[]> => {
  const diagnostics: Diagnostic[] = [];
  const candidatePaths = [...new Set(markdownPaths)]
    .filter((filePath) => isDecisionTruthCandidate(config, filePath))
    .sort();

  for (const filePath of candidatePaths) {
    const source = await fs.readFile(resolveRepoPath(rootDir, filePath), "utf8");
    const missingHeadings = REQUIRED_DECISION_HEADINGS.filter((heading) => !hasHeading(source, heading));

    if (missingHeadings.length === 0) {
      continue;
    }

    diagnostics.push({
      category: "doc-structure",
      severity: "review",
      message: `Canonical truth doc ${filePath} should include active ${missingHeadings.join(" and ")} section(s). Decisions should live beside current behavior, not in timestamped planning logs.`,
      file: filePath,
    });
  }

  return diagnostics;
};
