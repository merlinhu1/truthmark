import type { TruthmarkConfig } from "../config/schema.js";
import { defaultAgentConfig } from "./shared.js";
import { TRUTH_CHECK_EXPLICIT_INVOCATIONS } from "./truth-check.js";
import { TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS } from "./truth-structure.js";
import { TRUTH_SYNC_EXPLICIT_INVOCATIONS } from "./truth-sync.js";
import { TRUTH_SYNC_SKIP_REASONS } from "../sync/policy.js";

export const renderTruthStructureInstructions = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `### Truth Structure
Use when area routing is missing, stale, broad, or explicitly requested.
Invocations: ${TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS}
Inspect repository layout, ${config.docs.routing.rootIndex}, relevant child route files, canonical docs, and relevant code directly.
Create or repair routing and starter canonical truth docs only when useful. Use only canonical current-truth destinations for starter truth docs.
Own topology pressure: split broad/catch-all routing by inferred product or behavior ownership.
If the skill is unavailable, perform the same direct checkout workflow from committed config, route files, docs, and implementation.`;
};

export const renderTruthCheckInstructions = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `### Truth Check
Use when the user asks to audit repository truth health.
Invocations: ${TRUTH_CHECK_EXPLICIT_INVOCATIONS}
Inspect truth docs, routing, implementation, and ${config.docs.routing.rootIndex} directly. The truthmark check command may be used when available. Report files reviewed, issues, suggested fixes, and validation.`;
};

export const renderTruthSyncInstructions = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  return `### Truth Sync
Automatic finish-time trigger: use the truthmark-sync skill before finishing if changed functional code exists; inspect staged, unstaged, and untracked functional code files.
Explicit invocation runs immediately: ${TRUTH_SYNC_EXPLICIT_INVOCATIONS}
Later functional-code changes reopen the finish-time requirement, and an earlier explicit run only satisfies the finish gate if no later functional-code changes occur.
Memory anchor: code changed -> relevant tests -> Truth Sync -> report.
Delegate to a subagent only when the host supports subagent dispatch; the acting agent and environment own that choice.
Inspect the current checkout directly. Do not invoke packet helpers or rely on cache files.
Run relevant tests before finishing when functional code changes occurred.
Truthmark is agent-native: installed skills and this managed block are the workflow runtime. Inspect the checkout directly; truthmark CLI commands are optional validation tools after installation.
Code first: code leads; truth docs follow; Truth Sync never rewrites code for alignment.
May write truth docs and docs/truthmark/areas.md only; must not rewrite functional code.
Read ${config.docs.routing.rootIndex} and only relevant child route files under ${config.docs.routing.areaFilesRoot}/ when routing resolution requires them.
If routing is broad, overloaded, or catch-all, run or recommend Truth Structure before syncing; do not create another generic feature doc.
If mapped truth is missing, extend mapped truth docs first, create an area-local truth doc second, and create a new area only as a last resort.
Skip only for: ${TRUTH_SYNC_SKIP_REASONS.join("; ")}.`;
};
