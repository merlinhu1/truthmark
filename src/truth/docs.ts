import type { TruthmarkConfig } from "../config/schema.js";

export type TruthLane = "product" | "engineering";

export const resolveTruthDocsRoot = (config: Pick<TruthmarkConfig, "truthmark">): string => {
  return config.truthmark.paths.engineeringTruthRoot;
};

export const resolveProductTruthRoot = (config: Pick<TruthmarkConfig, "truthmark">): string => {
  return config.truthmark.paths.productTruthRoot;
};

export const resolveEngineeringTruthRoot = (
  config: Pick<TruthmarkConfig, "truthmark">,
): string => {
  return config.truthmark.paths.engineeringTruthRoot;
};
