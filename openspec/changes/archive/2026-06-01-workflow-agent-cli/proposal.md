## Why

Pass 1 created an internal, schema-versioned `WorkflowState` contract, but agents still cannot ask the Truthmark CLI for that state before acting. Pass 2 exposes that contract through stable JSON commands so agents can inspect applicability, diagnostics, write boundaries, and workflow instructions without relying on stale generated prose.

## What Changes

- Add an agent-facing `truthmark workflow status --workflow <workflow-id> [--base <ref>] --json` command that returns the existing `WorkflowState` in the standard Truthmark command envelope.
- Add an agent-facing `truthmark workflow instructions --workflow <workflow-id> [--base <ref>] --json` command that derives a playbook from the same `WorkflowState`.
- Document the human/setup vs agent/context command split and the nested workflow schema-version guarantees.
- Add source CLI tests and built-artifact black-box tests so the new commands work from `src` and packaged `dist` output.
- Preserve Truthmark's product boundary: this pass does not add OpenSpec-style changes, proposals, specs, task lifecycles, archive/apply semantics, or arbitrary workflow DAGs.

## Capabilities

### New Capabilities

- `workflow-agent-cli`: Agent-facing workflow status and instructions CLI commands backed by the internal `WorkflowState` contract.

### Modified Capabilities

- None.

## Impact

- Affected CLI modules: `src/cli/program.ts`, `src/cli/handlers.ts`, and normal `CommandResult` rendering.
- Affected workflow-state modules: new instruction derivation, likely `src/workflow-state/instructions.ts`, consuming `src/workflow-state/build.ts` and existing manifest metadata; the public instruction schema must preserve structured helper validator commands.
- Affected output contract: add or deliberately reuse a diagnostic category for workflow CLI input errors; this change chooses a new `workflow-state` category in `src/output/diagnostic.ts`.
- Affected tests: new `tests/cli/workflow.test.ts` coverage and built CLI/package-output coverage such as `tests/cli/build-artifact.test.ts` or an equivalent workflow-specific test.
- Affected truth docs/routing: update the routed public CLI contract truth doc and the routed WorkflowState truth doc after implementation because functional CLI behavior changes and an internal state contract becomes agent-facing.
- No new runtime dependency is expected.
