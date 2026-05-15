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
Use when area routing is missing, stale, broad, overloaded, catch-all, unrouteable, or explicitly requested.
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
Inspect truth docs, routing, implementation, and ${config.docs.routing.rootIndex} directly. Support findings with checkout evidence, include confidence, run the truthmark check command only when available for additional validation, and inspect the checkout directly when the command is unavailable. Report files reviewed, issues, suggested fixes, evidence checked, and validation.`;
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
Inspect the current checkout directly. ImpactSet and ContextPack are optional derived context; they do not override checkout evidence or write boundaries.
Run relevant tests before finishing when functional code changes occurred.
Support new or changed behavior-bearing truth claims with checkout evidence and report the evidence reviewed.
Truthmark is agent-native: installed skills and this managed block are the workflow runtime. Inspect the checkout directly; truthmark CLI commands are optional validation tools after installation.
Code first: code leads; truth docs follow; Truth Sync never rewrites code for alignment.
May write truth docs and ${config.docs.routing.rootIndex} only; must not rewrite functional code.
Read ${config.docs.routing.rootIndex} and only relevant child route files under ${config.docs.routing.areaFilesRoot}/ when routing resolution requires them.
If routing is missing, stale, broad, overloaded, catch-all, or cannot map changed code to a bounded truth owner, run Truth Structure before syncing when repair is safe and in scope; otherwise block and recommend Truth Structure.
If mapped truth is missing, extend mapped truth docs first, create an area-local truth doc second, and create a new area only as a last resort.
Skip only for: ${TRUTH_SYNC_SKIP_REASONS.join("; ")}.`;
};
