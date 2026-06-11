## Why

Pass 4 should make Truthmark's existing truth-governance diagnostics easier to triage without adding another workflow layer or bloating agent prompts. Today `check --json` exposes raw diagnostics plus `data.branchScope`, optional `data.impactSet`, and `data.truthVisibility`; callers still have to infer which governance area is unhealthy.

This change adds a **compact**, schema-versioned Truth Health Scorecard to `check --json` only. Raw diagnostics stay authoritative. The scorecard is an index and triage aid, not a replacement for diagnostics, not a score gate, and not a workflow-state expansion in this pass.

## What Changes

- Add a small pure mapper under `src/checks/scorecard.ts` that converts existing diagnostics and checker run context into `truthmark-scorecard/v0` dimensions.
- Include `data.scorecard` in `truthmark check --json` without removing or reshaping `diagnostics`, `data.branchScope`, `data.impactSet`, or `data.truthVisibility`.
- Keep each dimension minimal: `id`, categorical `status`, and `diagnosticIndexes`; allow at most short evidence snippets only for warn/fail states if they are needed.
- Make branch freshness explicit: without `--base`, the branch-freshness dimension is `not-run`, not `pass`.
- Add focused tests for the mapper and `check --json` output.
- Update only the routed truth doc that owns the check/validation JSON contract.

## Explicitly Deferred

- No `data.workflowState.scorecard` in Pass 4.
- No generated playbook changes in Pass 4.
- No new `truthmark scorecard` command.
- No numeric percentages, weights, or health grade.
- No OpenSpec-style lifecycle behavior, proposal/task runtime objects, archive/apply semantics, arbitrary artifact scoring, or `truthmark/changes/*` runtime artifacts.

## Capabilities

### New Capabilities

- `truth-health-scorecard`: `truthmark check --json` reports a compact schema-versioned triage summary for repository-truth governance outcomes.

### Modified Capabilities

None in this pass. Workflow-state exposure is intentionally deferred until there is evidence agents need the scorecard inside `workflow status` / `workflow instructions` payloads.

## Impact

- Affected source: `src/checks/scorecard.ts`, `src/checks/check.ts`, and possibly a local type export from an existing diagnostics module.
- Affected tests: new `tests/checks/scorecard.test.ts`; focused updates to `tests/checks/check.test.ts` and one CLI check-output test if existing coverage already shells out to `check --json`.
- Affected docs/routing: update the routed truth doc that owns validation/check output, likely `docs/truthmark/truth/contracts.md` after confirming routes.
- No workflow-state source, generated-surface source, report validators, or platform surfaces are in scope.
- No new runtime dependency is expected.
