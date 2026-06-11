# workflow-state-core Specification

## Purpose
TBD - created by archiving change workflow-state-core. Update Purpose after archive.
## Requirements
### Requirement: Schema-versioned workflow state

Truthmark MUST provide an internal `WorkflowState` contract with schema version `truthmark-workflow/v0` for representing the safety and context state of one fixed Truthmark workflow.

#### Scenario: Minimal state can be constructed

- **WHEN** a test constructs a minimal valid workflow state for `truthmark-check`
- **THEN** the object includes `schemaVersion: "truthmark-workflow/v0"`, a full `TruthmarkWorkflowId`, applicability state, action context, diagnostics, checks, next steps, and report sections

#### Scenario: Workflow IDs use manifest identifiers

- **WHEN** workflow state is built for a workflow
- **THEN** `workflow` uses a full manifest identifier such as `truthmark-sync` rather than a short alias such as `truth-sync`

### Requirement: State composition from existing Truthmark systems

Truthmark MUST build workflow state by composing existing manifest, config, repo index, branch impact, context-pack, and check/diagnostic systems rather than introducing a separate workflow engine.

#### Scenario: State includes route and truth ownership

- **WHEN** `buildWorkflowState(cwd, { workflow: "truthmark-sync", base })` runs in a configured repository with changed files that map to routes
- **THEN** the returned state includes affected routes, target truth docs, changed files, and diagnostics derived from existing route/index/impact data

#### Scenario: No branch base produces safe state

- **WHEN** `buildWorkflowState()` runs without a branch base for a workflow that depends on changed-file impact
- **THEN** the returned state does not invent changed files and explains the missing branch comparison in applicability reasons or next steps

#### Scenario: Existing diagnostics are preserved

- **WHEN** config loading, repo indexing, impact analysis, context-pack building, or check logic emits diagnostics
- **THEN** workflow state includes those diagnostics without dropping their severity or message

### Requirement: Machine-readable action context

Truthmark MUST derive a machine-readable action context for every fixed workflow from the workflow manifest and currently available repository data.

#### Scenario: Read-only workflows have no allowed writes

- **WHEN** action context is built for `truthmark-preview` or `truthmark-check`
- **THEN** the mode is `read-only`, `allowedWritePaths` is empty, and write lease is not required

#### Scenario: Sync and document workflows restrict truth writes

- **WHEN** action context is built for `truthmark-sync` or `truthmark-document` in a configured repository
- **THEN** the mode is `truth-doc-write` and allowed writes are limited to routed truth docs and route/truth files supported by existing context or index data

#### Scenario: Structure workflow restricts route writes

- **WHEN** action context is built for `truthmark-structure`
- **THEN** the mode is `route-write` and allowed writes are limited to truth routing files and starter truth docs needed to resolve ownership

#### Scenario: Realize workflow forbids truth documentation writes

- **WHEN** action context is built for `truthmark-realize`
- **THEN** the mode is `code-write` and Truthmark route/truth documentation paths appear in `forbiddenWritePaths`

#### Scenario: Portal workflow restricts portal output

- **WHEN** action context is built for `truthmark-portal`
- **THEN** the mode is `portal-write` and allowed writes are limited to configured portal output paths when portal output is enabled

#### Scenario: Helper validation commands are exposed

- **WHEN** the workflow manifest declares helper validation commands
- **THEN** the action context or checks section includes those helper commands in executable argv/string form for agent use

### Requirement: Fail-closed applicability

Truthmark MUST report blocked, not applicable, or ambiguous workflow state instead of permissive defaults when prerequisite repository truth context is missing or unsafe.

#### Scenario: Missing config blocks write-capable workflows

- **WHEN** workflow state is built in a repository without `.truthmark/config.yml` for a write-capable workflow
- **THEN** applicability is `blocked` or `not_applicable`, reasons mention missing config, and allowed write paths are empty

#### Scenario: Ambiguous routing is surfaced

- **WHEN** changed functional files cannot be mapped to bounded truth ownership
- **THEN** applicability is `ambiguous` or `blocked`, target truth docs are not guessed, and next steps direct the caller toward Truth Structure or route repair

#### Scenario: Invalid workflow IDs are rejected

- **WHEN** a caller requests a workflow ID that is not present in `TRUTHMARK_WORKFLOW_MANIFEST`
- **THEN** state building fails with a typed error or returns blocked state without falling back to another workflow

### Requirement: Internal-only Pass 1 boundary

Pass 1 MUST keep workflow state internal and MUST NOT expose new CLI commands, generated host instructions, or OpenSpec-like lifecycle behavior.

#### Scenario: CLI surface is unchanged

- **WHEN** Pass 1 is implemented
- **THEN** `truthmark --help` does not list `workflow status`, `workflow instructions`, `proposal`, `archive`, `apply`, `changes`, or `tasks` as Truthmark lifecycle commands introduced by this pass

#### Scenario: Builder does not mutate repository files

- **WHEN** `buildWorkflowState()` runs for any workflow
- **THEN** it reads repository state and returns data without writing truth docs, route files, generated surfaces, or portal output
