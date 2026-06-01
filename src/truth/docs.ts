import type { TruthmarkConfig } from "../config/schema.js";

export const resolveTruthDocsRoot = (config: Pick<TruthmarkConfig, "truthmark">): string => {
  return config.truthmark.paths.truthRoot;
};
