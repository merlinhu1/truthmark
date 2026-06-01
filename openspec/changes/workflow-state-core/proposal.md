## Why

Truthmark already has the ingredients agents need before running a workflow—workflow manifest metadata, route ownership, branch impact, context packs, diagnostics, and write boundaries—but those signals are spread across separate commands and modules. Pass 1 creates an internal, typed workflow-state contract so later agent-facing CLI and generated-surface work can compose stable JSON instead of duplicating stale workflow prose.

## What Changes

- Add an internal `WorkflowState` model with schema version `truthmark-workflow/v0`.
- Add a `buildWorkflowState(cwd, options)` composition layer that derives workflow state from existing Truthmark systems.
- Add action-context mapping for fixed Truthmark workflows, including machine-readable write modes, allowed/forbidden paths, stop conditions, helper validation commands, and evidence requirements.
- Add fail-closed handling for missing config, invalid workflow IDs, ambiguous routing, missing branch impact, and unavailable context.
- Add focused tests for type shape, action-context policy, composition, diagnostics propagation, and non-OpenSpec boundaries.
- Do not add new end-user CLI commands in this pass; Pass 2 will expose the contract through `truthmark workflow status/instructions`.

## Capabilities

### New Capabilities

- `workflow-state-core`: Internal schema-versioned workflow-state builder and action-context contract for Truthmark workflows.

### Modified Capabilities

- None. There are no archived OpenSpec specs yet, and this pass introduces a new internal capability without changing an existing OpenSpec capability contract.

## Impact

- New source modules under `src/workflow-state/`.
- New tests under `tests/workflow-state/`.
- Reads existing systems from `src/agents/workflow-manifest.ts`, `src/repo-index/build.ts`, `src/impact/build.ts`, `src/context-pack/build.ts`, `src/config/load.ts`, and `src/checks/check.ts`.
- May minimally share or expose context-pack write-boundary helpers if implementation proves duplication would be unsafe.
- No new runtime dependency, no generated host-surface changes, and no new CLI surface in this pass.
