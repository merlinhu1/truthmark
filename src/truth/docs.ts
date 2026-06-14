import type { TruthmarkConfig } from "../config/schema.js";

export type TruthLane = "product" | "engineering";

export const PRODUCT_TRUTH_KINDS = ["product-capability"] as const;
export const ENGINEERING_TRUTH_KINDS = [
  "engineering-behavior",
  "engineering-contract",
  "engineering-workflow",
  "engineering-architecture",
  "engineering-operations",
  "engineering-test-behavior",
] as const;

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

export const truthLaneRoots = (config: Pick<TruthmarkConfig, "truthmark">) => ({
  product: resolveProductTruthRoot(config),
  engineering: resolveEngineeringTruthRoot(config),
});
