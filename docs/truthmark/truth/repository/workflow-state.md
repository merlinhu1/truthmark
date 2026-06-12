---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-06-12
source_of_truth:
  - ../../../../src/workflow-state/types.ts
  - ../../../../src/workflow-state/action-context.ts
  - ../../../../src/workflow-state/build.ts
  - ../../../../src/workflow-state/instructions.ts
  - ../../../../tests/workflow-state/build.test.ts
  - ../../../../tests/cli/check-workflow.test.ts
---

# WorkflowState

## Purpose

This document protects WorkflowState v0 as the derived workflow-state artifact used to summarize whether a Truthmark workflow is safe to run and which bounded action context applies.

## Scope

This document owns the WorkflowState contract, instruction projection, and builder behavior under `src/workflow-state/**`. It hands lower-level repository facts to RepoIndex, ImpactSet, ContextPack, and Truthmark Check, and it hands installed workflow policy text to the generated workflow manifest.

## Current Behavior

`buildWorkflowState(cwd, { workflow, base })` returns `schemaVersion: truthmark-workflow/v0` with a full manifest workflow ID such as `truthmark-sync`. It composes the installed workflow manifest, `.truthmark/config.yml`, RepoIndex, optional ImpactSet, supported ContextPack output, and Truthmark Check diagnostics into one internal state object.

WorkflowState includes applicability, action context, changed files, affected routes, target truth docs, merged diagnostics, required and recommended checks, helper validation commands, next steps, report sections, and a ContextPack when the selected workflow has a supported ContextPack mapping.

`truthmark workflow status --workflow <workflow-id> [--base <ref>] --json` exposes the full `truthmark-workflow/v0` state in `data.workflowState` for agent-facing use. Caller-supplied request metadata such as `--base` is reported in the CLI envelope under `data.request` unless a later schema change explicitly adds it to WorkflowState.

`truthmark workflow instructions --workflow <workflow-id> [--base <ref>] --json` builds WorkflowState once and derives `data.instructions` from that same source state plus manifest metadata. The instruction schema is `truthmark-workflow-instructions/v0` and preserves structured helper validation commands with `id`, `runner`, `argv`, and `optional`.

## Core Rules

- WorkflowState is exposed through agent-facing `workflow status` and `workflow instructions` CLI JSON, but it still does not add Truthmark lifecycle commands.
- Workflow IDs stay in the full manifest form (`truthmark-sync`, `truthmark-document`, `truthmark-realize`, and peers). The builder maps to ContextPack's shorter workflow IDs only for supported ContextPack calls. Pass 2 rejects short workflow aliases such as `truth-sync`; full manifest IDs are canonical.
- Read-only workflows (`truthmark-preview` and `truthmark-check`) have mode `read-only` and no allowed write paths.
- Sync and document workflows use mode `truth-doc-write`; structure uses `route-write`; realize uses `code-write`; portal uses `portal-write` when portal output is configured.
- Missing config, ambiguous route ownership, invalid workflow IDs, or missing branch comparison data fail closed instead of widening allowed writes.
- `truthmark-sync` may select a cheap existing local Git base when the caller omits `--base`; `truthmark-realize` still blocks without `--base` because code-write paths must be derived from a bounded comparison.
- Realize forbids writes to configured route and truth documentation paths.
- Helper validation commands are copied from the workflow manifest into machine-readable action context and check metadata.
- Full WorkflowState output may include ContextPack truth document and source file content, subject to existing ContextPack truncation behavior.

## Flows And States

The builder validates the workflow ID, loads config and RepoIndex, derives ImpactSet only when a base ref is supplied, derives ContextPack only for supported workflows, runs Truthmark Check, merges diagnostics, determines applicability, then derives action context from the manifest and bounded route/config/impact data.

Applicability is `applicable`, `not_applicable`, `blocked`, or `ambiguous`. Ambiguous changed functional files leave target truth docs empty and direct the caller toward Truth Structure or route repair. Sync without a caller-supplied base performs cheap local base selection from existing upstream/main/master refs. Realize without a comparison base is `blocked` with a next step to rerun with `--base <ref>` so code-write paths remain bounded.

## Contracts

`WorkflowState` is a TypeScript contract exported from `src/workflow-state/types.ts`. Its schema version is `truthmark-workflow/v0`. `buildWorkflowActionContext()` derives write modes, allowed and forbidden paths, stop conditions, required evidence, helper commands, and write-lease requirements from a workflow manifest entry plus bounded route/config data.

`WorkflowInstructions` is a TypeScript projection exported from `src/workflow-state/instructions.ts`. Its schema version is `truthmark-workflow-instructions/v0`. It includes workflow identity, command sequence, required reads, action context, stop conditions, helper validation commands, report template sections, final report shape, and source-state summary.

## Product Decisions

- Decision (2026-06-01): WorkflowState v0 remains an internal repository-intelligence artifact in Pass 1; it does not expose OpenSpec-like lifecycle commands through the Truthmark CLI.
- Decision (2026-06-01): WorkflowState composes existing manifest, config, RepoIndex, ImpactSet, ContextPack, and Check systems instead of creating a separate workflow engine.
- Decision (2026-06-01): Fail-closed write boundaries are preferred over default or wildcard fallback paths whenever config, route ownership, or branch comparison data is ambiguous.
- Decision (2026-06-01): Pass 2 exposes WorkflowState and derived instructions through agent-facing CLI JSON while keeping lifecycle concepts such as proposals, specs, tasks, archive, and apply outside Truthmark runtime behavior.
- Decision (2026-06-12): OpenSpec remains research input only; Truthmark must not add an OpenSpec dependency, committed OpenSpec workspace, OPSX command surface, or generated `openspec-*` agent skills.
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
- `src/workflow-state/instructions.ts`
- `tests/workflow-state/build.test.ts`
- `tests/cli/workflow.test.ts`

Update this doc when the WorkflowState schema, applicability states, action-context mapping, fail-closed behavior, or ContextPack composition behavior changes.
