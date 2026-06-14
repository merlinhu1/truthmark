---
status: archived
last_reviewed: 2026-06-12
---

# WorkflowState

## Purpose

This document protects WorkflowState v0 as the derived workflow-state artifact used to summarize whether a Truthmark workflow is safe to run and which bounded action context applies.

## Scope

This document owns the WorkflowState contract and builder behavior under `src/workflow-state/**`. It hands lower-level repository facts to RepoIndex, ImpactSet, config, and Truthmark Check, and it hands installed workflow policy text to generated workflow surfaces through the manifest and renderer layers.

## Current Behavior

`buildWorkflowState(cwd, { workflow, base })` returns `schemaVersion: truthmark-workflow/v0` with a full manifest workflow ID such as `truthmark-sync`. It composes the installed workflow manifest, `.truthmark/config.yml`, RepoIndex, optional ImpactSet, and Truthmark Check diagnostics into one internal state object.

WorkflowState includes applicability, action context, changed files, affected routes, target truth docs, merged diagnostics, required and recommended checks, helper validation commands, next steps, and report sections. WorkflowState does not carry ContextPack.

`truthmark workflow status --workflow <workflow-id> [--base <ref>] --json` exposes a manifest-only `truthmark-workflow/v0` state in `data.workflowState` for status-only or debug inspection. It does not include `workflowState.contextPack`, truth document content, source file content, or a full route map. Caller-supplied request metadata such as `--base` is reported in the CLI envelope under `data.request` unless a later schema change explicitly adds it to WorkflowState.

## Core Rules

- WorkflowState is exposed through agent-facing `workflow status` CLI JSON for focused status/debug inspection, while generated workflows rely on checked-in workflow surfaces and direct checkout inspection as their execution contract.
- Workflow IDs stay in the full manifest form (`truthmark-sync`, `truthmark-document`, `truthmark-realize`, and peers). Pass 2 rejects short ContextPack aliases such as `truth-sync`; full manifest IDs are canonical.
- Read-only workflows (`truthmark-preview` and `truthmark-check`) have mode `read-only` and no allowed write paths.
- Sync and document workflows use mode `truth-doc-write`; structure uses `route-write`; realize uses `code-write`; portal uses `portal-write` when portal output is configured.
- Missing config, ambiguous route ownership, invalid workflow IDs, or missing branch comparison data fail closed instead of widening allowed writes.
- `truthmark-sync` may select a cheap existing local Git base when the caller omits `--base`, but blocks with no allowed writes when no candidate base exists; `truthmark-realize` still blocks without `--base` because code-write paths must be derived from a bounded comparison.
- Realize forbids writes to configured route and truth documentation paths.
- Helper validation commands are copied from the workflow manifest into machine-readable action context and check metadata.
- WorkflowState output is manifest-only and has no ContextPack opt-in path.

## Flows And States

The builder validates the workflow ID, loads config and RepoIndex, derives ImpactSet only when a base ref is supplied, runs Truthmark Check, merges diagnostics, determines applicability, then derives action context from the manifest and bounded route/config/impact data.

Applicability is `applicable`, `not_applicable`, `blocked`, or `ambiguous`. Ambiguous changed functional files leave target truth docs empty and direct the caller toward Truth Structure or route repair. Sync without a caller-supplied base performs cheap local base selection from existing upstream/main/master refs, and if none exists it is `blocked` with a next step to rerun with `--base <ref>` so truth-doc write paths remain bounded. Realize without a comparison base is `blocked` with a next step to rerun with `--base <ref>` so code-write paths remain bounded.

## Contracts

`WorkflowState` is a TypeScript contract exported from `src/workflow-state/types.ts`. Its schema version is `truthmark-workflow/v0`. `buildWorkflowActionContext()` derives write modes, allowed and forbidden paths, stop conditions, required evidence, helper commands, and write-lease requirements from a workflow manifest entry plus bounded route/config data.

## Product Decisions

- Decision (2026-06-01): WorkflowState v0 remains an internal repository-intelligence artifact in Pass 1; it does not expose OpenSpec-like lifecycle commands through the Truthmark CLI.
- Decision (2026-06-01): WorkflowState composes existing manifest, config, RepoIndex, ImpactSet, and Check systems instead of creating a separate workflow engine.
- Decision (2026-06-01): Fail-closed write boundaries are preferred over default or wildcard fallback paths whenever config, route ownership, or branch comparison data is ambiguous.
- Decision (2026-06-12): WorkflowState does not carry ContextPack; public ContextPack JSON output was removed in v2.
- Decision (2026-06-01): Pass 2 accepts only full manifest workflow IDs and rejects short ContextPack aliases instead of silently mapping them.

## Rationale

WorkflowState gives workflow surfaces a single machine-readable state contract. Keeping it derived preserves route files, truth docs, and implementation as the authorities, while making agent workflow decisions easier to test and audit.

## Non-Goals

- WorkflowState is not a source of repository truth.
- WorkflowState does not grant permissions beyond installed workflow boundaries.
- WorkflowState does not replace direct checkout inspection, route files, truth docs, or Truthmark Check.
- WorkflowState does not add proposal lifecycle commands or OpenSpec-style archive/apply behavior.

## Maintenance Notes

Primary implementation files:

- `src/workflow-state/types.ts`
- `src/workflow-state/action-context.ts`
- `src/workflow-state/build.ts`
- `tests/workflow-state/build.test.ts`
- `tests/cli/check-workflow.test.ts`

Update this doc when the WorkflowState schema, applicability states, action-context mapping, fail-closed behavior, repository-intelligence composition behavior, or generated-surface CLI validation policy changes.

## Source References

- ../../../../src/workflow-state/types.ts
- ../../../../src/workflow-state/action-context.ts
- ../../../../src/workflow-state/build.ts
- ../../../../tests/workflow-state/build.test.ts
- ../../../../tests/cli/check-workflow.test.ts
