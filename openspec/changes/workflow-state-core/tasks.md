## 1. Contract Shape

- [x] 1.1 Create `tests/workflow-state/build.test.ts` with a failing contract-shape test that imports `WorkflowState` from `src/workflow-state/types.ts`, constructs a minimal state with `schemaVersion: "truthmark-workflow/v0"`, and asserts the schema version and full workflow ID.
- [x] 1.2 Create `src/workflow-state/types.ts` with `WorkflowStateSchemaVersion`, `WorkflowApplicabilityState`, `WorkflowActionMode`, `WorkflowActionContext`, `WorkflowState`, and `BuildWorkflowStateOptions` types matching the spec.
- [x] 1.3 Run `npx vitest run tests/workflow-state/build.test.ts -t "workflow state contract"`; expected after implementation: pass.
- [x] 1.4 Run `npm run typecheck`; expected after implementation: pass without new type errors.

## 2. Action Context Mapping

- [x] 2.1 Extend `tests/workflow-state/build.test.ts` with failing action-context tests for `truthmark-preview`, `truthmark-check`, `truthmark-sync`, `truthmark-document`, `truthmark-structure`, `truthmark-realize`, and `truthmark-portal`.
- [x] 2.2 Create `src/workflow-state/action-context.ts` with `buildWorkflowActionContext()` that maps `TRUTHMARK_WORKFLOW_MANIFEST` entries to action modes, write boundaries, stop conditions, required evidence, helper validation commands, and write-lease requirement.
- [x] 2.3 Ensure preview/check return mode `read-only` and empty `allowedWritePaths`.
- [x] 2.4 Ensure realize returns mode `code-write` and forbids configured Truthmark route/truth documentation paths.
- [x] 2.5 Ensure sync/document/structure/portal never use permissive wildcard writes when config or route data is missing.
- [x] 2.6 Run `npx vitest run tests/workflow-state/build.test.ts -t "action context"`; expected after implementation: pass.

## 3. State Builder Composition

- [x] 3.1 Add failing tests in `tests/workflow-state/build.test.ts` for `buildWorkflowState(cwd, { workflow: "truthmark-sync", base })` returning changed files, affected routes, target truth docs, diagnostics, checks, next steps, and manifest report sections in a configured fixture repo.
- [x] 3.2 Create `src/workflow-state/build.ts` with `buildWorkflowState(cwd, options)` that loads the workflow manifest entry, repo index, config, optional impact set, context pack where supported, and check diagnostics.
- [x] 3.3 Bridge full manifest IDs to current `ContextPackWorkflow` short IDs only for `truthmark-sync`, `truthmark-document`, and `truthmark-realize`; do not fabricate context packs for unsupported workflows.
- [x] 3.4 Merge diagnostics from config/index/impact/context/check while preserving severity and message.
- [x] 3.5 Derive `checks.required`, `checks.recommended`, and `checks.helpers` from manifest gates, workflow-specific expectations, and helper commands.
- [x] 3.6 Run `npx vitest run tests/workflow-state/build.test.ts -t "buildWorkflowState"`; expected after implementation: pass.

## 4. Fail-Closed Fixtures

- [x] 4.1 Add or reuse temp-repo helpers for a repository missing `.truthmark/config.yml`; assert sync/document/structure/portal are blocked or not applicable and have empty allowed writes.
- [x] 4.2 Add or reuse fixture coverage for a changed functional file that has no bounded route mapping; assert applicability is ambiguous or blocked and next steps point to Truth Structure or route repair.
- [x] 4.3 Add a no-base test for branch-impact workflows; assert no changed files are invented and applicability reasons mention missing branch comparison when relevant.
- [x] 4.4 Add an invalid-workflow test; assert the builder rejects the ID or returns blocked state without fallback.
- [x] 4.5 Run `npx vitest run tests/workflow-state/build.test.ts`; expected after implementation: all workflow-state tests pass.

## 5. Internal Boundary Guardrails

- [x] 5.1 Add or extend CLI/help absence coverage so Pass 1 does not expose `workflow status`, `workflow instructions`, `proposal`, `archive`, `apply`, `changes`, or `tasks` as Truthmark lifecycle commands.
- [x] 5.2 Add a repository mutation guard test around `buildWorkflowState()` that snapshots relevant truth/route/generated paths before and after running the builder and asserts no files were written.
- [x] 5.3 Run `npx vitest run tests/workflow-state/build.test.ts tests/cli/help.test.ts`; expected after implementation: pass.

## 6. Final Verification

- [x] 6.1 Run `npx vitest run tests/workflow-state/build.test.ts`; expected: pass.
- [x] 6.2 Run `npm run typecheck`; expected: pass.
- [x] 6.3 Run `npm run check` when feasible; expected: no new errors from workflow-state changes.
- [x] 6.4 Run `git diff --check`; expected: no whitespace errors.
- [x] 6.5 Because implementation will change functional source files, run the repository Truth Sync workflow before reporting Pass 1 implementation complete.
