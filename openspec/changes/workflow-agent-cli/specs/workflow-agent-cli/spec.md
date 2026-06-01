## ADDED Requirements

### Requirement: Workflow status CLI exposes workflow state

Truthmark MUST provide a `workflow status` CLI command that returns request metadata and the Pass 1 `WorkflowState` contract for the requested canonical Truthmark workflow ID in the standard JSON command envelope.

#### Scenario: Status command returns schema-versioned workflow state

- **WHEN** `truthmark workflow status --workflow truthmark-sync --json` runs in a Truthmark repository
- **THEN** the command exits successfully unless error diagnostics require a non-zero exit
- **AND** the JSON output includes `command: "workflow status"`, a human-readable `summary`, `diagnostics`, and `data.workflowState`
- **AND** `data.request.workflow` is `truthmark-sync`
- **AND** `data.workflowState.schemaVersion` is `truthmark-workflow/v0`
- **AND** `data.workflowState.workflow` is the full manifest ID `truthmark-sync`

#### Scenario: Status command passes branch base through to state builder

- **WHEN** `truthmark workflow status --workflow truthmark-sync --base fixture-base --json` runs in a repository with changes relative to `fixture-base`
- **THEN** `data.request.base` is `fixture-base`
- **AND** `data.workflowState.changedFiles`, `affectedRoutes`, and `targetTruthDocs` are derived from the same impact data used by the internal workflow-state builder

#### Scenario: Status command fails closed for unknown workflows

- **WHEN** `truthmark workflow status --workflow not-a-workflow --json` runs
- **THEN** Truthmark does not fall back to another workflow
- **AND** stdout is a parseable JSON `CommandResult` envelope with `command: "workflow status"`
- **AND** the command returns a `workflow-state` error diagnostic explaining that the workflow is unknown and exits non-zero through the normal error-diagnostic path
- **AND** no permissive workflow state or allowed write paths are returned for the unknown workflow

#### Scenario: Status command returns JSON for missing workflow option

- **WHEN** `truthmark workflow status --json` runs without `--workflow`
- **THEN** stdout is a parseable JSON `CommandResult` envelope with `command: "workflow status"`
- **AND** the command returns a `workflow-state` error diagnostic explaining that `--workflow` is required and exits non-zero through the normal error-diagnostic path
- **AND** no workflow state, instructions, or write-boundary payload is returned

#### Scenario: Status command is read-only

- **WHEN** `truthmark workflow status --workflow truthmark-sync --base fixture-base --json` runs
- **THEN** it does not create, modify, or delete truth docs, route files, generated agent surfaces, portal output, source files, `truthmark/changes/*`, or lifecycle artifacts such as proposal, spec, design, task, archive, or apply outputs

#### Scenario: Status payload exposes full workflow state intentionally

- **WHEN** the requested workflow state includes a ContextPack
- **THEN** `data.workflowState` may include ContextPack truth document and source file content subject to existing ContextPack truncation behavior
- **AND** the CLI contract documentation identifies this local-content exposure so callers can handle logging and sharing deliberately

### Requirement: Workflow instructions CLI exposes an agent playbook

Truthmark MUST provide a `workflow instructions` CLI command that derives schema-versioned operational instructions from the same workflow state and manifest policy used by `workflow status`.

#### Scenario: Instructions command returns agent-readable playbook

- **WHEN** `truthmark workflow instructions --workflow truthmark-sync --json` runs in a Truthmark repository
- **THEN** the JSON output includes `command: "workflow instructions"`, a human-readable `summary`, `diagnostics`, and `data.instructions`
- **AND** `data.request.workflow` is `truthmark-sync`
- **AND** `data.instructions.schemaVersion` is `truthmark-workflow-instructions/v0`
- **AND** `data.instructions.workflow` is `truthmark-sync`
- **AND** `data.instructions.commandSequence` lists structured command entries with `command`, `when`, and `required`
- **AND** `data.instructions.requiredReads` lists structured entries with `path` and `reason`
- **AND** `data.instructions.actionContext` mirrors `data.workflowState.actionContext`
- **AND** `data.instructions.stopConditions`, `helperValidationCommands`, `finalReportShape`, and `sourceStateSummary` are present
- **AND** `data.instructions.reportTemplate.sections` is derived from the workflow manifest report sections

#### Scenario: Instructions include stop conditions and write boundaries

- **WHEN** `truthmark workflow instructions --workflow truthmark-realize --json` runs
- **THEN** the instructions include stop conditions from the workflow state/action context
- **AND** the instructions include allowed write paths and forbidden write paths from the action context
- **AND** Truthmark route and truth documentation paths are not presented as allowed writes for the realize workflow

#### Scenario: Instructions preserve helper validator commands

- **WHEN** a workflow manifest entry declares helper validation commands
- **THEN** `workflow instructions` includes those helper validation commands in structured executable form with `id`, `runner`, `argv`, and `optional`
- **AND** the structured helper commands match `data.workflowState.actionContext.helperValidationCommands`
- **AND** the output makes clear that helpers must be run and checked rather than assumed successful

#### Scenario: Instructions are derived from returned state

- **WHEN** `truthmark workflow instructions --workflow truthmark-sync --base fixture-base --json` runs
- **THEN** the output includes the source `data.workflowState` payload
- **AND** `data.request.base` is `fixture-base`
- **AND** instruction fields that duplicate applicability, diagnostics, action context, report sections, or helper commands match the source workflow state

#### Scenario: Instructions command returns JSON for missing workflow option

- **WHEN** `truthmark workflow instructions --json` runs without `--workflow`
- **THEN** stdout is a parseable JSON `CommandResult` envelope with `command: "workflow instructions"`
- **AND** the command returns a `workflow-state` error diagnostic explaining that `--workflow` is required and exits non-zero through the normal error-diagnostic path
- **AND** no workflow state, instructions, or write-boundary payload is returned

### Requirement: Workflow CLI uses deliberate workflow identifier handling

Truthmark MUST accept canonical full manifest workflow IDs for the new workflow commands and MUST NOT accidentally treat short context-pack aliases as canonical workflow IDs.

#### Scenario: Full manifest IDs are accepted

- **WHEN** `truthmark workflow status --workflow truthmark-check --json` runs
- **THEN** the command builds state for `truthmark-check`
- **AND** the returned workflow ID remains `truthmark-check`

#### Scenario: Short aliases are rejected in Pass 2

- **WHEN** `truthmark workflow status --workflow truth-sync --json` runs
- **THEN** Truthmark rejects `truth-sync` with a `workflow-state` unknown-workflow diagnostic
- **AND** it does not map the alias to `truthmark-sync`
- **AND** it does not silently map unsupported short names to unrelated workflows

### Requirement: Workflow CLI preserves Truthmark product boundaries

Pass 2 MUST expose workflow status and instructions only; it MUST NOT add OpenSpec-style lifecycle behavior to Truthmark.

#### Scenario: Workflow help excludes OpenSpec lifecycle commands

- **WHEN** `truthmark --help` and `truthmark workflow --help` are rendered after Pass 2
- **THEN** they may list `workflow status` and `workflow instructions`
- **AND** they do not list proposal, spec, design, task, changes, archive, or apply lifecycle commands as Truthmark workflow behavior

#### Scenario: No lifecycle artifacts are created

- **WHEN** either workflow CLI command runs
- **THEN** Truthmark does not create `truthmark/changes/*`, proposal, spec, design, task, archive, or apply artifacts

### Requirement: Built CLI output supports the workflow contract

Truthmark MUST verify the new workflow CLI commands against built package output, not only source-level test runners.

#### Scenario: Built status command works from dist output

- **WHEN** the package is built
- **AND** `node /absolute/path/to/dist/main.js workflow status --workflow truthmark-check --json` runs with `cwd` set to a temporary fixture repository rather than the source repo root
- **THEN** the command returns the standard JSON envelope
- **AND** `data.workflowState.schemaVersion` is `truthmark-workflow/v0`
- **AND** output does not depend on source-only paths or unbuilt TypeScript files

#### Scenario: Built instructions command works from dist output

- **WHEN** the package is built
- **AND** `node /absolute/path/to/dist/main.js workflow instructions --workflow truthmark-check --json` runs with `cwd` set to a temporary fixture repository rather than the source repo root
- **THEN** the command returns the standard JSON envelope
- **AND** `data.instructions.schemaVersion` is `truthmark-workflow-instructions/v0`
- **AND** output does not depend on source-only paths or unbuilt TypeScript files

### Requirement: CLI contract documentation is synchronized

Truthmark MUST update the routed CLI/workflow and WorkflowState truth documentation when Pass 2 is implemented.

#### Scenario: Contract docs distinguish human and agent commands

- **WHEN** the Pass 2 implementation is complete
- **THEN** the routed truth documentation identifies setup/human commands such as `config` and `init`
- **AND** it identifies agent/context commands including `check`, `index`, `impact`, `context`, `validate`, `workflow status`, and `workflow instructions`
- **AND** it documents the standard JSON envelope and nested workflow schema-version guarantees
- **AND** it documents that caller-supplied request metadata such as `--base` is reported in `data.request` unless a later schema change deliberately adds it to `WorkflowState`
- **AND** it documents that full `data.workflowState` output may include ContextPack truth document and source file content when present
- **AND** it documents the `workflow-state` diagnostic category for workflow CLI input errors
