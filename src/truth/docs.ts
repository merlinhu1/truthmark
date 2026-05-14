import { DEFAULT_DOCS_HIERARCHY } from "../config/defaults.js";
import type { TruthmarkConfig } from "../config/schema.js";

export const DEFAULT_TRUTH_DOCS_ROOT = DEFAULT_DOCS_HIERARCHY.roots.truth;

export const resolveTruthDocsRoot = (config: Pick<TruthmarkConfig, "docs">): string => {
  return config.docs.roots.truth ?? DEFAULT_TRUTH_DOCS_ROOT;
};
