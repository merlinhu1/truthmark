## Context

The existing improvement plan identifies Pass 1 as an internal-only workflow-state core. Current Truthmark behavior already has stable sources for most of the desired state:

- `TRUTHMARK_WORKFLOW_MANIFEST` defines fixed workflow identity, triggers, gates, helper commands, report sections, and declared write boundaries.
- `buildRepoIndex(cwd)` and route maps define repository structure, routes, truth docs, and routing diagnostics.
- `buildImpactSet(cwd, { base })` defines changed files and affected routes/truth docs when branch comparison is available.
- `buildContextPack(cwd, { workflow, base })` defines bounded context and allowed write paths for write-capable workflows.
- `runCheck(cwd, { base })` and diagnostics define repository truth health.

The gap is not a missing workflow engine; it is a missing typed composition layer that agents and future CLIs can rely on.

## Goals / Non-Goals

**Goals:**

- Create a schema-versioned internal `WorkflowState` contract.
- Keep all workflow identity and policy grounded in the existing fixed manifest.
- Make action write policy machine-readable and fail-closed.
- Preserve diagnostics from config, index, impact, context-pack, and check systems.
- Make applicability mean "can this Truthmark workflow safely run now?".
- Provide enough tests for Pass 2 to expose the same contract via CLI without redesign.

**Non-Goals:**

- Do not add OpenSpec-style `changes/`, proposal/spec/task lifecycle, archive/apply semantics, artifact DAGs, or arbitrary workflow schemas to Truthmark.
- Do not expose new `truthmark workflow ...` CLI commands in this pass.
- Do not regenerate agent host surfaces in this pass.
- Do not make the builder write files or mutate repository state.
- Do not replace `buildRepoIndex`, `buildImpactSet`, `buildContextPack`, or `runCheck`.

## Decisions

### Decision 1: Add a narrow `src/workflow-state/` module

Create these modules:

- `src/workflow-state/types.ts` for the contract.
- `src/workflow-state/action-context.ts` for manifest-to-policy mapping.
- `src/workflow-state/build.ts` for orchestration.
- `src/workflow-state/index.ts` only if the repository already uses barrel exports for similar modules; otherwise import concrete files directly in tests.

Rationale: a dedicated module avoids leaking composition logic into CLI handlers before the CLI surface is ready.

### Decision 2: Use full `TruthmarkWorkflowId` values in `WorkflowState`

`WorkflowState.workflow` uses the existing full manifest IDs such as `truthmark-sync`, `truthmark-document`, and `truthmark-realize`. If the implementation calls `buildContextPack()`, it bridges only compatible full IDs to the current `ContextPackWorkflow` short IDs:

- `truthmark-sync` -> `truth-sync`
- `truthmark-document` -> `truth-document`
- `truthmark-realize` -> `truth-realize`

Read-only workflows (`truthmark-preview`, `truthmark-check`) and topology workflows that do not have context-pack support must not fake a context pack.

Rationale: full IDs match the workflow manifest and avoid accidentally documenting legacy aliases as the new contract.

### Decision 3: Action context derives from manifest policy plus context/index data

`buildWorkflowActionContext()` accepts a manifest entry and optional derived data. It returns:

- `read-only` for preview/check with empty allowed writes.
- `truth-doc-write` for sync/document with context-derived truth docs and route/truth paths where available.
- `route-write` for structure with route files and starter truth docs only.
- `code-write` for realize with truth docs/routing in forbidden paths.
- `portal-write` for portal with only configured portal output paths when enabled.

If config or routing data is missing, write-capable workflows must return blocked applicability or empty allowed writes rather than permissive defaults.

Rationale: write boundaries are the safety-critical part of the contract and must be explicit even before a CLI exists.

### Decision 4: Applicability is safety state, not artifact progress

Use the values `applicable`, `not_applicable`, `blocked`, and `ambiguous` to describe whether a fixed Truthmark workflow can safely run in the current repository state. Do not model proposal/design/tasks readiness or "next artifact" semantics.

Rationale: Truthmark governs repository truth workflows, not OpenSpec planning artifacts.

### Decision 5: Tests drive the contract before implementation

Add `tests/workflow-state/build.test.ts` and write tests in this order:

1. Contract shape and schema version.
2. Action-context mapping for each workflow class.
3. Composition from repo index, impact, context pack, and check diagnostics.
4. Fail-closed cases for missing config and ambiguous routing.
5. Absence checks that the implementation did not add OpenSpec-like lifecycle concepts.

Rationale: future CLI and generated-surface work need this model to be stable before exposure.

## Risks / Trade-offs

- **Risk:** Builder duplicates logic from context-pack write path derivation.  
  **Mitigation:** Extract a tiny shared helper only if needed, and cover it with existing context-pack tests plus workflow-state tests.

- **Risk:** Running `runCheck()` inside state building could be slow or produce duplicate diagnostics.  
  **Mitigation:** Keep checks included but grouped; if performance is a problem, add a builder option later rather than omitting diagnostics from the initial contract.

- **Risk:** Read-only workflows lack context-pack coverage today.  
  **Mitigation:** Represent their write boundaries directly from manifest policy and repo diagnostics; do not fabricate context packs.

- **Risk:** Future Pass 2 wants JSON output fields renamed.  
  **Mitigation:** Keep Pass 1 schema explicit and versioned as `truthmark-workflow/v0`; future breaking changes require a version bump.

## Migration Plan

1. Add tests and internal modules without changing CLI behavior.
2. Run focused workflow-state tests and typecheck.
3. Run `npm run check` when feasible.
4. Because this pass changes functional source behavior, run the repository Truth Sync workflow after implementation according to `AGENTS.md`.

Rollback is simple: remove `src/workflow-state/` and `tests/workflow-state/` if the internal contract proves wrong before Pass 2 consumes it.

## Open Questions

None for Pass 1. Pass 2 will decide the exact CLI command spelling and JSON rendering behavior.
