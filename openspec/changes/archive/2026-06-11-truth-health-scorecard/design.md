## Context

Passes 1-3 made workflow state and generated playbooks queryable through local Truthmark CLI contracts. Pass 4 should improve verification triage without increasing the main agent instruction payload.

Current implementation evidence:

- `src/checks/check.ts` collects diagnostics from config, authority, frontmatter, links, areas, decisions, generated surfaces, and optional branch freshness.
- `runCheck()` already returns raw diagnostics plus `data.branchScope`, optional `data.impactSet`, and a small `data.truthVisibility` count summary.
- `workflow instructions` currently embeds full `workflowState`, so adding fields to workflow state directly increases tokens consumed by agents.

The scorecard should be a thin `check --json` composition layer over existing diagnostics, not a second checker, not a new workflow engine, and not a new field added to every workflow instruction payload.

## Goals / Non-Goals

**Goals:**

- Add a compact `TruthHealthScorecard` contract with schema version `truthmark-scorecard/v0`.
- Map existing diagnostics into stable governance dimensions that humans and agents can use for quick triage.
- Keep raw diagnostics authoritative and preserve existing JSON fields for compatibility.
- Make branch-freshness behavior explicit: freshness is `not-run` when no branch base was supplied, not silently `pass`.
- Keep scorecard output small enough to include in routine `check --json` responses.
- Update the routed check/validation truth doc after implementation because public JSON output changes.

**Non-Goals:**

- Do not add `data.workflowState.scorecard` in Pass 4.
- Do not update generated playbooks or generated platform surfaces in Pass 4.
- Do not add a new `truthmark scorecard` command.
- Do not remove, rename, reorder, or hide raw diagnostics.
- Do not make `data.scorecard` the only source of diagnostic truth.
- Do not introduce numeric health percentages, grades, or arbitrary scoring weights.
- Do not add OpenSpec-style proposal/spec/task lifecycle validation, archive/apply semantics, artifact completion scoring, or `truthmark/changes/*` runtime behavior.
- Do not make the scorecard perform LLM judgment, filesystem writes, Git commands, or external calls.

## Decisions

### Decision 1: Use minimal categorical dimensions

The scorecard uses stable dimension IDs with `pass`, `warn`, `fail`, and `not-run` statuses. Avoid percentage scores and labels/remediation text in normal output because those add token cost and imply calibration Truthmark does not own.

Initial dimensions:

1. `routing-coverage`
2. `ownership-clarity`
3. `evidence-support`
4. `branch-freshness`
5. `generated-surface-freshness`
6. `truth-doc-structure`
7. `decision-rationale-preservation`

Each dimension should normally contain only:

```ts
{
  id: TruthHealthDimensionId;
  status: "pass" | "warn" | "fail" | "not-run";
  diagnosticIndexes: number[];
  evidence?: string[]; // only for warn/fail/not-run, capped to short snippets
}
```

Labels and detailed remediation belong in docs/constants, not repeated in every JSON response.

### Decision 2: Derive statuses from diagnostics and explicit run context

Status derivation is deterministic:

- `fail` if any mapped diagnostic for the dimension has severity `error`.
- `warn` if mapped diagnostics exist but none are `error`.
- `pass` if the dimension's relevant checker ran and produced no mapped diagnostics.
- `not-run` if required context was unavailable or the relevant check was intentionally skipped. In Pass 4, `branch-freshness` is `not-run` when `runCheck()` has no `base` option.

`diagnosticIndexes` must point into the raw `diagnostics` array returned in the same command result. Optional `evidence` must be short, derived from diagnostic file/category/run context, and capped; it must not copy full diagnostic messages or source/doc excerpts.

### Decision 3: Keep `check --json` additive and backward-compatible

`runCheck()` should return:

```ts
{
  command: "check",
  summary,
  diagnostics,
  data: {
    branchScope,
    truthVisibility, // preserved during this pass
    scorecard,
    impactSet?      // when --base is supplied
  }
}
```

The scorecard should be built after the final diagnostics array is assembled so indexes match the exact returned array. If config loading fails before downstream checks run, the scorecard should still exist with affected dimensions failing or not-run as appropriate rather than disappearing.

### Decision 4: Workflow-state scorecard is deferred

Pass 4 deliberately does **not** add scorecard data to `WorkflowState`. The reason is token control: `workflow instructions` embeds full workflow state, and any new workflow-state field is paid for by every agent consuming instructions.

A future pass may add workflow-state scorecard exposure only after one of these is true:

- generated playbooks demonstrably need it inside workflow status/instructions; or
- the CLI can expose a compact workflow-state summary without duplicating the full check scorecard.

### Decision 5: Keep `truthVisibility` as compatibility

The existing `data.truthVisibility` counts are useful but too narrow and unversioned. Do not delete them in Pass 4. Add `data.scorecard` as the schema-versioned check triage contract and leave `truthVisibility` available for at least this pass. Any cleanup should be a separate compatibility change.

## Diagnostic Mapping Plan

Initial category-to-dimension mapping should be explicit and tested, but kept small:

- `authority`, `area-index`, `coverage`, `repo-index` -> `routing-coverage`
- `area-index`, `coverage`, `impact`, route ambiguity diagnostics -> `ownership-clarity`
- `freshness`, broken links to source evidence, and missing source evidence diagnostics -> `evidence-support`
- `freshness` plus base-run context -> `branch-freshness`
- `generated-surface` -> `generated-surface-freshness`
- `frontmatter`, `links`, `doc-structure`, markdown-shape diagnostics -> `truth-doc-structure`
- `doc-structure` decision/rationale diagnostics -> `decision-rationale-preservation`

A diagnostic may contribute to multiple dimensions when genuinely useful, but the scorecard must remain an index over raw diagnostics rather than a duplicate diagnostic report.

## Risks / Trade-offs

- **Risk:** The scorecard hides important details.
  **Mitigation:** Keep raw diagnostics unchanged and point dimensions back to diagnostic indexes.
- **Risk:** JSON output grows too much.
  **Mitigation:** Use only `id`, `status`, `diagnosticIndexes`, and capped optional evidence for non-pass dimensions.
- **Risk:** Branch freshness looks healthy when no base was provided.
  **Mitigation:** Model not-run explicitly for branch freshness without base.
- **Risk:** Workflow instruction payloads grow.
  **Mitigation:** Do not add scorecard to workflow state in Pass 4.
- **Risk:** Category mapping becomes too broad.
  **Mitigation:** Put mappings in one module with focused unit tests and avoid broad message predicates unless a category is too coarse.

## Migration Plan

1. Add failing mapper tests for compact `TruthHealthScorecard` shape and status derivation.
2. Implement `src/checks/scorecard.ts` with a pure deterministic mapper.
3. Wire `runCheck()` to include `data.scorecard` while preserving existing fields.
4. Add focused `check --json` assertions for source/built behavior only where existing tests already cover those surfaces.
5. Update routed truth docs for the check JSON contract only.
6. Validate with focused tests, `npm run check`, source and built Truthmark check/index gates, OpenSpec validation, and diff hygiene.

Rollback is straightforward before release: remove `data.scorecard`, keep raw diagnostics and `truthVisibility` unchanged, and revert routed docs/tests for the scorecard contract.

## Open Questions

None for Pass 4. Workflow-state exposure, numeric scoring, a separate human-rendered scorecard command, and deprecation/removal of `truthVisibility` are deliberately deferred.
