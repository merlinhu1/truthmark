## Context

Current code has three overlapping repository-intelligence surfaces:

- `buildImpactSet()` produces compact branch-diff data: changed files, affected routes, affected truth docs, affected tests, public symbol changes, and diagnostics.
- `buildWorkflowState()` composes repo index, impact, check diagnostics, workflow manifest data, action context, target truth docs, checks, next steps, and report sections.
- `buildContextPack()` still reads truth-doc and source-file contents into an internal `ContextPack`, but the public renderer emits only Markdown paths, allowed write paths, and test commands. JSON ContextPack output is deliberately rejected.

The content-bearing ContextPack design was removed for token-cost reasons. The remaining path-only `truthmark context` command is therefore redundant with `workflow status` and `impact`, while still carrying the name and internal model of a token-hungry context bundle.

## Goals / Non-Goals

**Goals:**

- Preserve compact agent-useful context: allowed write paths, target truth docs, changed files, affected routes, affected tests, helper validation commands, applicability, diagnostics, and next steps.
- Avoid any default source/doc content embedding in workflow, impact, or replacement outputs.
- Make `truthmark workflow status --json` the workflow-scoped handoff for agents.
- Make `truthmark impact --json` the branch-diff/routing handoff for agents.
- Remove or retire the standalone `truthmark context` command once replacement fields and docs are in place.
- Delete or reduce `src/context-pack/**` so no public code path pays file-content read cost for discarded data.

**Non-Goals:**

- No return of JSON ContextPack content.
- No Markdown excerpt mode in this patch.
- No mandatory runtime packet before agents can act.
- No OpenSpec-style proposal/spec/task lifecycle behavior inside Truthmark itself.
- No broad rewrite of RepoIndex, RouteMap, or ImpactSet beyond fields needed to replace ContextPack.

## Decisions

### Decision 1: ContextPack is folded, not expanded

Do not make ContextPack a richer evidence bundle. The feature failed the token-cost test for immersive JSON/content output. Instead, fold the small useful pieces into existing compact contracts.

Alternatives rejected:

- **Restore JSON ContextPack**: rejected because it recreates the token-heavy artifact the product decision already killed.
- **Add Markdown excerpts**: rejected for this patch because it keeps the same token-cost failure mode under a different format.
- **Keep path-only ContextPack indefinitely**: rejected because it overlaps with workflow/impact outputs and keeps a misleading name.

### Decision 2: WorkflowStatus owns workflow-specific write/test guidance

`WorkflowState` should own workflow-scoped action guidance. If the current `actionContext` or `checks` sections do not fully cover ContextPack’s remaining value, extend them minimally with compact, path-only fields rather than invoking `buildContextPack()`.

Candidate fields:

- `actionContext.allowedWritePaths` already covers allowed writes.
- `targetTruthDocs` already covers impacted truth docs for applicable workflows.
- `changedFiles` and `affectedRoutes` already mirror ImpactSet in workflow context.
- `checks.required`, `checks.recommended`, and `checks.helpers` exist; if test commands are still needed, add `checks.testCommands: string[]` or derive them from `impactSet.affectedTests`.
- `nextSteps` and `diagnostics` carry warnings/blockers.

### Decision 3: ImpactSet owns diff-derived routing and tests

`ImpactSet` remains the source for branch-diff routing: changed files, affected routes, affected truth docs, affected tests, public symbol changes, and impact diagnostics. If agents need test command strings, prefer deriving them in WorkflowState rather than storing shell commands in ImpactSet unless existing CLI contract already treats commands as ImpactSet data.

### Decision 4: Removal should be staged but explicit

The implementation should remove public `truthmark context` help/tests in the same patch if feasible. If compatibility risk is too high, replace it with a deprecation result that points to exact replacement commands and remove `src/context-pack` content reads. In either case, the OpenSpec acceptance contract treats `context` as no longer the recommended agent-facing surface.

Preferred end state:

```bash
truthmark workflow status --workflow truthmark-sync --base main --json
truthmark impact --base main --json
```

Deprecated command message, if a compatibility shim remains:

```text
truthmark context has been folded into workflow status and impact. Use:
  truthmark workflow status --workflow <workflow> [--base <ref>] --json
  truthmark impact --base <ref> --json
```

### Decision 5: No-content invariant is tested directly

The patch must retain tests that fail if workflow or impact output starts embedding file contents. This guards against accidentally reintroducing the token-heavy design under another command name.

## Risks / Trade-offs

- **Breaking existing users of `truthmark context`** → Mitigate with a clear deprecation shim if hard removal is too abrupt; update README/help/tests to point to replacement commands.
- **WorkflowState payload grows too much** → Mitigate by adding only compact path arrays or command strings already derivable from existing data; no doc/source contents.
- **Duplicate test-command derivation drifts** → Mitigate by extracting a tiny shared helper such as `testCommandsForAffectedTests(affectedTests)` if both workflow and legacy context paths temporarily need it.
- **Docs/generated surfaces still mention ContextPack** → Mitigate with a stale-term sweep for `ContextPack`, `truthmark context`, `context --workflow`, and `src/context-pack` after implementation.
- **Route ownership/truth docs not updated** → Mitigate by updating routed repository-intelligence and contract docs in the same patch and running `npx tsx src/cli/main.ts check --json`.

## Migration Plan

1. Add failing tests that express the folded contract and no-content invariant.
2. Extend WorkflowState with any missing compact fields needed to replace ContextPack.
3. Retire the public context command by removal or deprecation shim.
4. Delete or simplify ContextPack internals so file contents are not read for discarded output.
5. Update docs and generated/help expectations.
6. Run focused CLI/workflow tests, typecheck, build, built-artifact checks, and Truthmark docs validation.

Rollback strategy: restore the previous `context` command and tests from git if downstream compatibility breaks, but keep the no-content invariant unless explicitly revisiting the token-cost decision.
