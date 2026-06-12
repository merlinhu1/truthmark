## 1. Compact Contract And Mapper Tests

- [x] 1.1 Create `tests/checks/scorecard.test.ts` and add a shape test for `TruthHealthScorecard` with `schemaVersion: "truthmark-scorecard/v0"` and the seven dimension IDs: `routing-coverage`, `ownership-clarity`, `source-traceability`, `branch-freshness`, `generated-surface-freshness`, `truth-doc-structure`, and `decision-rationale-preservation`.
- [x] 1.2 Assert each dimension contains only the compact runtime fields: `id`, `status`, `diagnosticIndexes`, and optional capped `evidence`; do not require repeated labels, remediation text, or full diagnostic copies in JSON.
- [x] 1.3 Add mapper tests proving `error` diagnostics produce `fail`, non-error mapped diagnostics produce `warn`, no mapped diagnostics after the relevant checker runs produces `pass`, and intentionally skipped context produces `not-run`.
- [x] 1.4 Add category mapping tests for the minimal mappings in `design.md`, including branch freshness as `not-run` when no base was supplied.
- [x] 1.5 Add a test proving `diagnosticIndexes` reference the raw diagnostics array positions returned by the same command result and remain stable when a diagnostic maps to more than one dimension.

## 2. Scorecard Module Implementation

- [x] 2.1 Create `src/checks/scorecard.ts` with exported types for the compact contract and a pure builder such as `buildTruthHealthScorecard(diagnostics, context)`.
- [x] 2.2 Implement deterministic diagnostic-to-dimension mapping in one place; use diagnostic category first and tightly scoped predicates only where categories are too coarse.
- [x] 2.3 Implement branch freshness run context so `branch-freshness` is `not-run` when `runCheck()` has no `base`, and pass/warn/fail only when freshness actually ran.
- [x] 2.4 Cap optional dimension `evidence` to short non-pass snippets derived from diagnostic file/category/run context; do not copy full diagnostic messages, source excerpts, or remediation paragraphs.
- [x] 2.5 Keep the builder side-effect free: no filesystem writes, no Git commands, no OpenSpec artifacts, no external calls, and no LLM judgment.

## 3. `check --json` Integration

- [x] 3.1 Modify `src/checks/check.ts` to build the scorecard after the final `diagnostics` array is assembled, so `diagnosticIndexes` point into the exact returned raw diagnostics array.
- [x] 3.2 Include `data.scorecard` in every `runCheck()` result path, including missing/invalid config paths that return before downstream checks run.
- [x] 3.3 Preserve existing `diagnostics`, `data.branchScope`, optional `data.impactSet`, and current `data.truthVisibility`; do not rename or remove them in this pass.
- [x] 3.4 Update `tests/checks/check.test.ts` to assert healthy initialized repos include a compact scorecard, broken route/authority/frontmatter/link/generated/freshness fixtures produce the expected dimension status, and no-base runs report branch freshness as `not-run`.
- [x] 3.5 Add or update one CLI-level `check --json` assertion to verify `data.scorecard.schemaVersion === "truthmark-scorecard/v0"` and raw diagnostics are still present.

## 4. Documentation And Truth Sync

- [x] 4.1 Read `.truthmark/config.yml`, `docs/truthmark/routes/areas.md`, and relevant child route files to identify the routed truth owner for check/validation output.
- [x] 4.2 Update only the routed check/validation truth doc, likely `docs/truthmark/truth/contracts.md`, to document `data.scorecard`, the `truthmark-scorecard/v0` schema, compact dimension fields, branch-freshness `not-run` behavior, and raw diagnostic preservation.
- [x] 4.3 Do not update workflow-state truth docs in this pass except to say scorecard exposure there is deferred if the existing doc would otherwise imply it.
- [x] 4.4 Do not refresh or rewrite generated platform surfaces for this pass.
- [x] 4.5 Because this pass changes public JSON output, run the repository Truth Sync workflow after code/tests and update only routed truth docs required by the changed check output.

## 5. Boundary Review And Validation

- [x] 5.1 Search changed source/tests/docs for accidental OpenSpec lifecycle behavior: proposal, spec delta, changes, archive, apply, tasks, artifact DAG, and `truthmark/changes/*` as Truthmark runtime behavior.
- [x] 5.2 Run focused tests: `npx vitest run tests/checks/scorecard.test.ts tests/checks/check.test.ts` plus the focused CLI check-output test if it lives elsewhere.
- [x] 5.3 Run `npm run check` when feasible.
- [x] 5.4 Run source-tree Truthmark gates: `npx tsx src/cli/main.ts check --json` and `npx tsx src/cli/main.ts index --json`.
- [x] 5.5 Run built-artifact gates after build if check JSON output has built CLI coverage: `node dist/main.js check --json` and `node dist/main.js index --json`.
- [x] 5.6 Run OpenSpec gates: `/opt/data/node/bin/openspec validate truth-health-scorecard --strict --json`, `/opt/data/node/bin/openspec validate --all --strict --json`, and `/opt/data/node/bin/openspec status --change truth-health-scorecard --json`.
- [x] 5.7 Run `git diff --check -- src/checks tests docs/truthmark openspec/changes/truth-health-scorecard` and inspect `git status --short --branch --untracked-files=all` for out-of-scope collateral.
