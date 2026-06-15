## ADDED Requirements

### Requirement: ContextPack replacement uses existing compact outputs
Truthmark SHALL replace the standalone ContextPack public workflow handoff with the combined use of `truthmark workflow status --json` and `truthmark impact --json`.

#### Scenario: Agent requests workflow-scoped guidance
- **WHEN** an agent needs Truthmark workflow applicability, write boundaries, helper validation commands, target truth docs, diagnostics, checks, next steps, or report sections
- **THEN** the agent SHALL use `truthmark workflow status --workflow <workflow> [--base <ref>] --json`

#### Scenario: Agent requests branch-diff routing guidance
- **WHEN** an agent needs changed files, affected routes, affected truth docs, affected tests, changed public symbols, or impact diagnostics for a branch comparison
- **THEN** the agent SHALL use `truthmark impact --base <ref> --json`

#### Scenario: ContextPack is not the recommended handoff
- **WHEN** help text, README text, generated workflow guidance, or repository-intelligence truth docs describe agent-facing repository-intelligence commands
- **THEN** they SHALL direct users to workflow status and impact instead of presenting ContextPack as a current primary handoff

### Requirement: Replacement outputs remain content-free
Truthmark SHALL NOT embed truth-doc contents or source-file contents in the workflow status or impact replacement outputs.

#### Scenario: Workflow status is serialized
- **WHEN** `truthmark workflow status --workflow truthmark-sync --base <ref> --json` succeeds
- **THEN** the serialized `workflowState` SHALL NOT contain `contextPack`, `truthDocs[].content`, `sourceFiles[].content`, or any `content` field containing file bodies

#### Scenario: Impact output is serialized
- **WHEN** `truthmark impact --base <ref> --json` succeeds
- **THEN** the serialized `impactSet` SHALL NOT contain truth-doc body text, source-file body text, or any ContextPack object

#### Scenario: Built artifact is executed
- **WHEN** the built CLI artifact runs workflow status from outside the source repository cwd
- **THEN** the JSON output SHALL preserve the no-content invariant and SHALL NOT depend on ContextPack runtime assets

### Requirement: WorkflowState carries compact ContextPack replacement data
Truthmark SHALL expose the compact workflow-specific data formerly useful from path-only ContextPack output through WorkflowState fields.

#### Scenario: Truth Sync status includes bounded write context
- **WHEN** `truthmark workflow status --workflow truthmark-sync --base <ref> --json` runs on a configured repository with mapped changes
- **THEN** `workflowState.actionContext.allowedWritePaths` SHALL include only the route index and relevant truth-document paths that the workflow may update
- **AND** `workflowState.targetTruthDocs` SHALL identify the affected truth docs without embedding their contents

#### Scenario: Truth Realize status includes code-write context
- **WHEN** `truthmark workflow status --workflow truthmark-realize --base <ref> --json` runs on a configured repository with mapped changes
- **THEN** `workflowState.actionContext.allowedWritePaths` or the relevant code-write action context field SHALL identify affected code surfaces without embedding file contents

#### Scenario: Test guidance is compact
- **WHEN** impact analysis identifies affected tests for a workflow status request
- **THEN** WorkflowState SHALL expose compact test guidance either as affected test paths or derived test command strings
- **AND** it SHALL NOT read test file contents to produce that guidance

### Requirement: ContextPack command is retired or explicitly deprecated
Truthmark SHALL stop presenting `truthmark context` as a current ContextPack generator.

#### Scenario: Hard removal path
- **WHEN** users run `truthmark --help`
- **THEN** the command list SHALL NOT advertise `context` as a primary command

#### Scenario: Compatibility shim path
- **WHEN** users run `truthmark context` during a deprecation window
- **THEN** the command SHALL return a clear deprecation message that names `truthmark workflow status --workflow <workflow> [--base <ref>] --json` and `truthmark impact --base <ref> --json` as replacements
- **AND** it SHALL NOT build or render a content-bearing ContextPack

#### Scenario: JSON ContextPack stays removed
- **WHEN** users request any JSON ContextPack format during the deprecation window
- **THEN** Truthmark SHALL continue to reject JSON ContextPack output or return the deprecation guidance without exposing a ContextPack data object

### Requirement: Implementation avoids discarded content reads
Truthmark SHALL remove public code paths that read truth-doc or source-file contents solely to discard them from output.

#### Scenario: ContextPack internals are removed
- **WHEN** the patch removes `src/context-pack/**`
- **THEN** all imports, tests, CLI handlers, and docs SHALL compile without ContextPack modules

#### Scenario: Shared compact helpers remain
- **WHEN** the patch keeps helper functions formerly located near ContextPack code
- **THEN** those helpers SHALL compute only compact path, write-boundary, affected-test, or diagnostic data
- **AND** they SHALL NOT read file bodies for public workflow/impact output

### Requirement: Documentation and truth surfaces reflect the folded design
Truthmark SHALL update product, engineering, command, and repository-intelligence documentation to describe the folded workflow/impact design.

#### Scenario: Repository intelligence docs are updated
- **WHEN** docs describe derived repository-intelligence helpers
- **THEN** they SHALL list RepoIndex, RouteMap, ImpactSet, and WorkflowState/action context as current compact helpers
- **AND** they SHALL not describe ContextPack as a current content or path-pack artifact

#### Scenario: Command contract docs are updated
- **WHEN** command contract docs list public CLI surfaces
- **THEN** they SHALL describe `workflow status` and `impact` as the replacement for ContextPack handoff behavior
- **AND** they SHALL document that source/doc contents are not emitted

#### Scenario: Localized README parity is preserved
- **WHEN** the root README changes the ContextPack wording or command table
- **THEN** localized root READMEs SHALL receive equivalent natural-language updates in the same patch
