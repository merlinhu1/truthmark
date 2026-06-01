## 1. Contract And Failing Tests

- [x] 1.1 Add `tests/cli/workflow.test.ts` with a failing source CLI test for `workflow status --workflow truthmark-sync --json`; expected pre-implementation failure is command-not-found, expected post-implementation output has `data.workflowState.schemaVersion === "truthmark-workflow/v0"`.
- [x] 1.2 Add a failing source CLI test for `workflow status --workflow truthmark-sync --base fixture-base --json`; verify `data.request.base === "fixture-base"` and impact-backed changed-file fields are populated from fixture changes relative to that caller-supplied ref.
- [x] 1.3 Add failing source CLI tests for unknown workflow IDs and missing `--workflow`; verify `--json` output is a parseable `CommandResult` with a `workflow-state` error diagnostic, exits non-zero through the normal error-diagnostic path, does not fall back to another workflow, and returns no workflow state, instructions, or permissive allowed write paths.
- [x] 1.4 Add a failing source CLI test for `workflow instructions --workflow truthmark-sync --json`; verify `data.instructions.schemaVersion === "truthmark-workflow-instructions/v0"`, `data.instructions.commandSequence`, `data.instructions.requiredReads`, `data.instructions.actionContext`, `data.instructions.stopConditions`, structured `data.instructions.helperValidationCommands`, `data.instructions.reportTemplate.sections`, `data.instructions.finalReportShape`, and `data.instructions.sourceStateSummary`.
- [x] 1.5 Add tests for full manifest workflow IDs and rejected short aliases; verify `truth-sync` is not mapped to `truthmark-sync` in Pass 2.
- [x] 1.6 Add absence tests that both `truthmark --help` and `truthmark workflow --help` do not advertise proposal/spec/design/task/change/archive/apply lifecycle behavior.

## 2. CLI Status Implementation

- [x] 2.1 Add `workflow-state` to the central diagnostic category contract in `src/output/diagnostic.ts` and cover it in tests/docs.
- [x] 2.2 Add workflow CLI option types in `src/cli/program.ts` for optional parser-level `--workflow <workflow>` and optional `--base <ref>` while preserving the shared `--json` option; route missing `--workflow` through handler-level JSON error envelopes instead of Commander pre-handler failures.
- [x] 2.3 Add `runWorkflowStatus()` in `src/cli/handlers.ts` that validates the workflow ID, calls `buildWorkflowState(process.cwd(), { workflow, base })`, and returns `CommandResult` with `command: "workflow status"`, `data.request`, and `data.workflowState`.
- [x] 2.4 Wire a nested `workflow` command group with `status` in `src/cli/program.ts` and confirm source CLI tests for workflow status pass.
- [x] 2.5 Verify `workflow status` is read-only by snapshotting relevant temp-repo truth/route/generated paths and lifecycle artifact paths before and after the command.

## 3. Instructions Implementation

- [x] 3.1 Create `src/workflow-state/instructions.ts` with a `buildWorkflowInstructions()` projection from `WorkflowState` plus manifest metadata.
- [x] 3.2 Define `truthmark-workflow-instructions/v0` with workflow identity, command sequence, required reads, action context, stop conditions, structured helper validation commands matching `WorkflowState["actionContext"]["helperValidationCommands"]`, report template sections, final report shape, and source-state summary.
- [x] 3.3 Add `runWorkflowInstructions()` in `src/cli/handlers.ts` that builds workflow state once, derives instructions from that state, and returns `CommandResult` with `command: "workflow instructions"`, `data.request`, `data.instructions`, and source `data.workflowState`.
- [x] 3.4 Wire `workflow instructions` in `src/cli/program.ts` and confirm source CLI tests for workflow instructions pass.
- [x] 3.5 Confirm instruction fields that duplicate action context, report sections, helper commands, diagnostics, or applicability match the returned source workflow state.
- [x] 3.6 Verify `workflow instructions` is read-only by snapshotting relevant temp-repo truth/route/generated paths and lifecycle artifact paths before and after the command.

## 4. Built Artifact And Packaging Verification

- [x] 4.1 Add or extend a built CLI black-box test, such as `tests/cli/build-artifact.test.ts`, that runs `npm run build`, resolves `dist/main.js` to an absolute path, and executes that built entrypoint with `cwd` set to a temporary fixture repository.
- [x] 4.2 Verify `node /absolute/path/to/dist/main.js workflow status --workflow truthmark-check --json` returns a valid JSON envelope from the temp fixture repository.
- [x] 4.3 Verify `node /absolute/path/to/dist/main.js workflow instructions --workflow truthmark-check --json` returns a valid JSON envelope from the temp fixture repository.
- [x] 4.4 Confirm built output does not rely on source-only TypeScript paths, repo-root-only assets, relative `dist/main.js` lookup from the repo root, or stale `dist` artifacts.

## 5. Documentation And Truth Sync

- [x] 5.1 Read `.truthmark/config.yml`, `docs/truthmark/routes/areas.md`, and relevant child route files to identify the routed owner for CLI/workflow contract docs.
- [x] 5.2 Update the routed public CLI contract truth doc to describe human/setup commands, agent/context commands, the standard JSON command envelope, `workflow status`, `workflow instructions`, nested schema-version guarantees, full-ID-only workflow selection, and the `workflow-state` diagnostic category.
- [x] 5.3 Update the routed WorkflowState truth doc to describe that the `truthmark-workflow/v0` state contract is now exposed through agent-facing CLI JSON, caller-supplied request metadata such as `--base` lives in `data.request` unless the state schema is explicitly extended later, and full state output may include ContextPack truth/source content.
- [x] 5.4 Document that short workflow aliases are rejected in Pass 2 and that full manifest IDs are canonical.
- [x] 5.5 Run focused verification: `npx vitest run tests/cli/workflow.test.ts`, built-artifact tests, `npm run typecheck`, and `npx openspec validate workflow-agent-cli --strict`.
- [x] 5.6 Run `npm run check` when feasible.
- [x] 5.7 Because this pass changes functional CLI behavior, run the repository Truth Sync workflow after tests, write the sync report, and validate it with the installed helper command.

## 6. Boundary Review

- [x] 6.1 Inspect `truthmark --help` and `truthmark workflow --help` to confirm the new surface is limited to status/instructions.
- [x] 6.2 Search changed files for accidental OpenSpec lifecycle vocabulary in Truthmark runtime behavior: proposal, spec delta, changes, archive, apply, tasks, artifact DAG; verify lifecycle artifact paths such as `truthmark/changes/*` are not created by workflow status/instructions tests.
- [x] 6.3 Run `git diff --check -- src/cli src/workflow-state tests/cli docs/truthmark openspec/changes/workflow-agent-cli` and fix any whitespace errors.
- [x] 6.4 Run `npx openspec status --change workflow-agent-cli --json` and confirm proposal, design, specs, and tasks are complete before implementation begins.
