## Context

Pass 1 added an internal workflow-state core under `src/workflow-state/` with schema version `truthmark-workflow/v0`. It deliberately kept the CLI unchanged. The improvement roadmap identifies Pass 2 as the point where agents should be able to call Truthmark for current workflow status and instructions before reading, writing, validating, or reporting.

Current CLI commands already use a common `CommandResult` envelope with `command`, `summary`, `diagnostics`, and `data`, and JSON rendering already canonicalizes object keys. The new commands should reuse that envelope instead of inventing special output rendering.

## Goals / Non-Goals

**Goals:**

- Expose the existing `WorkflowState` through `truthmark workflow status` as stable JSON.
- Expose derived operational instructions through `truthmark workflow instructions` as stable JSON.
- Keep status and instructions grounded in the same workflow-state builder so they cannot drift.
- Make workflow identifiers explicit and validate invalid IDs fail closed.
- Provide enough source and built-artifact tests for generated agent surfaces in Pass 3 to rely on these commands.
- Update routed Truthmark truth docs after implementation because this pass changes functional CLI behavior and exposes the WorkflowState contract through agent-facing JSON.

**Non-Goals:**

- Do not implement generated agent surface updates; that belongs to Pass 3.
- Do not add OpenSpec-style proposal/spec/design/task lifecycle commands, archive/apply behavior, arbitrary workflow schemas, or `truthmark/changes/*` artifacts.
- Do not change the `truthmark-workflow/v0` state schema unless implementation proves a required field is missing; if it changes incompatibly, bump the schema deliberately.
- Do not make `workflow status` or `workflow instructions` mutate repository files.
- Do not add rich human rendering first; JSON is the primary Pass 2 contract.

## Decisions

### Decision 1: Add a nested `workflow` command group

Add `workflow` as a top-level Commander subcommand group with `status` and `instructions` children:

```bash
truthmark workflow status --workflow truthmark-sync --base <ref> --json
truthmark workflow instructions --workflow truthmark-sync --base <ref> --json
```

`--base <ref>` is caller-supplied request metadata for impact comparison. The new commands MUST NOT assume that `main` or any other branch is the target comparison ref; tests may use a fixture ref, but the contract is generic.

Rationale: the command spelling matches the roadmap, groups future workflow-context commands without crowding the top-level help, and avoids reusing the older `context --workflow truth-sync` alias shape.

Alternative considered: add flat commands such as `workflow-status`. Rejected because generated agent surfaces will be easier to teach and audit with a single command group.

### Decision 2: Use the normal `CommandResult` envelope

`workflow status` returns:

```ts
{
  command: "workflow status",
  summary: "Truthmark workflow status completed for truthmark-sync.",
  diagnostics,
  data: {
    request: { workflow: "truthmark-sync", base },
    workflowState
  }
}
```

`workflow instructions` returns:

```ts
{
  command: "workflow instructions",
  summary: "Truthmark workflow instructions generated for truthmark-sync.",
  diagnostics,
  data: {
    request: { workflow: "truthmark-sync", base },
    instructions,
    workflowState
  }
}
```

Rationale: the renderer already provides stable JSON ordering, and keeping the envelope consistent lets agents parse all Truthmark commands uniformly. `base` belongs in `data.request` unless a later implementation deliberately extends the `truthmark-workflow/v0` state schema; the Pass 2 design does not require adding request metadata to `WorkflowState`.

### Decision 3: Validate workflow IDs deliberately

The canonical accepted workflow IDs are the full manifest IDs such as `truthmark-sync`, `truthmark-document`, `truthmark-realize`, `truthmark-structure`, `truthmark-check`, `truthmark-preview`, and `truthmark-portal`. Pass 2 does not support short aliases such as `truth-sync`, `truth-document`, or `truth-realize`; those aliases must be rejected rather than silently mapped.

Rationale: Pass 1 rejected accidental fallback to short aliases in `WorkflowState`. Keeping Pass 2 full-ID-only avoids ambiguity between the older context-pack workflow names and manifest IDs. If a later compatibility pass needs aliases, it must add an explicit alias map, tests, and documentation.

Invalid workflow IDs and missing `--workflow` values are expected input errors, not crash paths. With `--json`, `workflow status` and `workflow instructions` MUST return a parseable `CommandResult` envelope with an error diagnostic, a non-zero exit via the normal error-diagnostic path, and no permissive workflow state, instructions, or write-boundary payload. This change deliberately adds a `workflow-state` diagnostic category for these errors, so implementation must update the central diagnostic category contract.

### Decision 4: Derive instructions from workflow state plus manifest metadata

Create an instruction builder such as `buildWorkflowInstructions(workflowState, manifestEntry)` in `src/workflow-state/instructions.ts`. It should emit this v0 public shape:

```ts
type WorkflowInstructions = {
  schemaVersion: "truthmark-workflow-instructions/v0";
  workflow: string;
  commandSequence: Array<{
    command: string;
    when: string;
    required: boolean;
  }>;
  requiredReads: Array<{
    path: string;
    reason: string;
  }>;
  actionContext: WorkflowState["actionContext"];
  stopConditions: string[];
  helperValidationCommands: WorkflowState["actionContext"]["helperValidationCommands"];
  reportTemplate: {
    sections: string[];
  };
  finalReportShape: string[];
  sourceStateSummary: {
    applicability: WorkflowState["applicability"];
    diagnosticCount: number;
    changedFileCount: number;
    targetTruthDocCount: number;
  };
};
```

Fields that duplicate applicability, diagnostics, action context, report sections, or helper commands MUST be derived from the same returned `workflowState`; implementations should not rebuild a second, divergent state for instructions. Helper validator commands remain structured (`id`, `runner`, `argv`, `optional`) so agents can execute and audit them safely.

Rationale: instructions are a projection of workflow state, not a separate policy source. Pass 3 generated surfaces can call this command instead of embedding stale operational policy.

### Decision 5: Keep writes impossible in the CLI commands

Both commands are read-only. They may run repository inspection, impact analysis, context-pack building, and checks through the workflow-state builder, but they must not edit truth docs, route files, generated surfaces, portal output, or source code.

Rationale: agents should call these commands before deciding whether a workflow is safe; the act of asking for status must itself be safe.

### Decision 6: Test built output, not only source runners

Add a black-box test that builds `dist` first, resolves the built entrypoint to an absolute path, and executes `node /absolute/path/to/dist/main.js workflow status --workflow truthmark-check --json` with `cwd` set to a temporary fixture repository. Use the same pattern for `workflow instructions`. The fixture must make its expected configuration state explicit so assertions do not depend on the source checkout.

Rationale: generated agents and installed users execute built package output, so source-only tests are insufficient for a new CLI contract. Using an absolute built entrypoint while changing `cwd` proves built-code behavior without relying on relative `dist/main.js` path resolution from the repo root.

### Decision 7: Expose full workflow state intentionally

`workflow status` returns the full Pass 1 `WorkflowState`. For workflows that include a `contextPack`, the JSON payload may include embedded truth document and source file content subject to the existing ContextPack truncation behavior. `workflow instructions` returns the same source `workflowState` for traceability.

Rationale: this preserves one canonical state contract for agents, but the public docs and tests must treat output size and local-content exposure as intentional behavior rather than accidental leakage.

## Risks / Trade-offs

- **Risk:** Instructions drift from status if they rebuild data independently.  
  **Mitigation:** Build instructions from the same `WorkflowState` returned in the command payload.
- **Risk:** Short aliases introduce ambiguity between old context-pack workflow names and manifest IDs.  
  **Mitigation:** Start with full IDs only unless implementation explicitly adds a tested alias map.
- **Risk:** Human output may look sparse for nested data.  
  **Mitigation:** Make JSON the contract for Pass 2; add human formatting later only if needed.
- **Risk:** Full workflow-state JSON can include ContextPack source/truth contents and become large or sensitive in logs.  
  **Mitigation:** Document that this is a local agent-facing contract, preserve existing ContextPack truncation behavior, and avoid sending status output to external systems without caller intent.
- **Risk:** Functional CLI changes can make truth docs stale.  
  **Mitigation:** Run the repository Truth Sync workflow after implementation and validate the sync report.

## Migration Plan

1. Add failing CLI tests for `workflow status` and `workflow instructions`.
2. Add handler functions that call `buildWorkflowState()` and instruction derivation.
3. Wire the nested Commander command group.
4. Add built-artifact black-box coverage.
5. Update the routed public CLI contract truth doc and the routed WorkflowState truth doc, then run Truthmark check/impact/sync validation.
6. Run focused tests, typecheck, OpenSpec validation, and `npm run check` when feasible.

Rollback is low-risk before Pass 3: remove the nested CLI command group, handlers, instruction builder, and tests while leaving the Pass 1 internal workflow-state core intact.

## Open Questions

None. Pass 2 uses full manifest workflow IDs only; short alias compatibility is deferred to a later explicit compatibility change if needed.

