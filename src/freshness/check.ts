import type { TruthmarkConfig } from "../config/schema.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { buildImpactSet } from "../impact/build.js";
import type { ImpactSet } from "../impact/types.js";
export type FreshnessCheckResult = {
  diagnostics: Diagnostic[];
  impactSet: ImpactSet;
};

export const checkFreshness = async (
  rootDir: string,
  _config: TruthmarkConfig,
  _truthDocumentPaths: string[],
  base: string,
): Promise<FreshnessCheckResult> => {
  const impactSet = await buildImpactSet(rootDir, { base });
  const diagnostics: Diagnostic[] = [];

  for (const diagnostic of impactSet.diagnostics) {
    if (diagnostic.category !== "impact") {
      continue;
    }

    diagnostics.push({
      ...diagnostic,
      category: "freshness",
      message: diagnostic.message.replace("not mapped to a Truthmark route", "not routed to truth ownership"),
    });
  }

  return {
    diagnostics,
    impactSet,
  };
};
