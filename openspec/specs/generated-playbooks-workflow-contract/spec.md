# generated-playbooks-workflow-contract Specification

## Purpose
Define the generated workflow-surface contract that points agents to live local workflow status/instructions preflight before using checked-in static playbook prose.

## Requirements
### Requirement: Generated workflow surfaces run live workflow preflight

Truthmark generated workflow surfaces MUST instruct agents to query the local workflow status and instructions CLI for the canonical full workflow ID before acting when the local CLI is available.

#### Scenario: Generated skill package includes workflow status command

- **WHEN** generated workflow skill package entrypoints are rendered for Codex, OpenCode, Claude Code, GitHub Copilot, or Gemini
- **THEN** each workflow entrypoint includes `truthmark workflow status --workflow <workflow-id> --json` using the canonical full manifest workflow ID
- **AND** generated prose shows the optional `--base <ref>` shape only as caller-supplied comparison metadata, not as an implicit branch default

#### Scenario: Generated skill package includes workflow instructions command

- **WHEN** generated workflow skill package entrypoints are rendered for Codex, OpenCode, Claude Code, GitHub Copilot, or Gemini
- **THEN** each workflow entrypoint includes `truthmark workflow instructions --workflow <workflow-id> --json` using the canonical full manifest workflow ID
- **AND** agents are instructed to inspect `data.instructions` rather than relying only on embedded static procedure text

#### Scenario: Generated prompt and command surfaces include the same preflight

- **WHEN** host-specific prompt or command files are rendered for GitHub Copilot or Gemini workflow invocation
- **THEN** those surfaces include the same live workflow status/instructions preflight policy
- **AND** host-specific frontmatter, command syntax, and argument placeholders remain valid for that host

#### Scenario: Legacy public workflow renderers include the same preflight

- **WHEN** public legacy renderer functions still emit Truthmark workflow instructions directly
- **THEN** those rendered instructions include the same live workflow status/instructions preflight policy or the renderer is explicitly documented as out of scope before implementation

### Requirement: Generated playbooks obey workflow action context

Generated workflow surfaces MUST instruct agents to treat returned workflow status and instructions as operational guardrails for applicability, writes, helpers, and reporting.

#### Scenario: Blocked, not-applicable, or ambiguous workflows stop before writes

- **WHEN** generated workflow prose describes handling the `workflow status` response
- **THEN** it instructs agents to inspect `data.workflowState.applicability.state`
- **AND** it instructs agents to stop before writes when workflow applicability is `blocked`, `not_applicable`, or `ambiguous`
- **AND** it permits continuing with writes only when the user explicitly changes scope or selects a different workflow that returns applicable status
- **AND** it permits only read-only inspection/reporting without writes while reporting `data.workflowState.nextSteps` or diagnostics for the current blocked, not-applicable, or ambiguous state

#### Scenario: Write boundaries come from action context

- **WHEN** generated workflow prose describes allowed and forbidden writes
- **THEN** it tells agents to obey `data.workflowState.actionContext.allowedWritePaths`
- **AND** it tells agents to obey `data.workflowState.actionContext.forbiddenWritePaths`
- **AND** it does not broaden write authority beyond the returned action context, the current user task, and any parent/lease rules

#### Scenario: Stop conditions remain hard boundaries

- **WHEN** generated workflow prose describes `data.instructions.stopConditions` or `data.workflowState.actionContext.stopConditions`
- **THEN** it treats them as hard stop/report boundaries rather than warnings that can be ignored silently

#### Scenario: Helper validators are executed and reported

- **WHEN** a workflow has structured helper validator commands in `data.instructions.helperValidationCommands` or the helper manifest
- **THEN** generated prose tells agents to run applicable helpers when available
- **AND** it tells agents to report helper status as passed, failed, or skipped with reason
- **AND** it does not claim helper success unless a helper actually ran and returned successful validation

#### Scenario: Report shape comes from live instructions when available

- **WHEN** generated workflow prose describes final reporting after `workflow instructions` succeeds
- **THEN** it tells agents to use `data.instructions.reportTemplate.sections` or `data.instructions.finalReportShape` when present
- **AND** it falls back to checked-in report templates only when live instructions are unavailable or skipped

### Requirement: Generated playbooks preserve safe CLI-unavailable fallback

Generated workflow surfaces MUST remain usable in repositories where the installed Truthmark CLI is unavailable, too old, or not on `PATH`, without silently expanding write scope.

#### Scenario: CLI unavailable falls back to checked-in procedure

- **WHEN** the generated workflow preflight cannot run because the CLI is unavailable or too old
- **THEN** generated prose instructs the agent to continue with direct checkout inspection and checked-in support procedure files
- **AND** generated prose tells the agent not to broaden allowed writes because the CLI did not run
- **AND** the final report must include that workflow status/instructions preflight was skipped and why

#### Scenario: Direct checkout inspection remains canonical evidence

- **WHEN** the CLI preflight succeeds
- **THEN** generated prose still instructs agents to inspect implementation, tests, config, route files, truth docs, or generated templates directly as evidence required by the workflow
- **AND** CLI output is treated as current context and guardrails rather than sole proof of implemented behavior

### Requirement: Generated playbooks preserve Truthmark product boundaries

Generated workflow surfaces MUST consume the workflow status/instructions contract without adding OpenSpec-style lifecycle behavior to Truthmark.

#### Scenario: No OpenSpec lifecycle artifact instructions are generated

- **WHEN** generated Truthmark workflow surfaces are rendered
- **THEN** they do not instruct agents to create proposal, spec, design, task, change, archive, apply, artifact DAG, or `truthmark/changes/*` lifecycle artifacts as Truthmark workflow behavior

#### Scenario: Generated playbooks use full manifest workflow IDs

- **WHEN** generated preflight commands are rendered
- **THEN** they use full manifest IDs such as `truthmark-sync`, `truthmark-document`, `truthmark-realize`, `truthmark-structure`, `truthmark-check`, `truthmark-preview`, and `truthmark-portal`
- **AND** they do not use short aliases such as `truth-sync`, `truth-document`, or `truth-realize`

#### Scenario: All emitted workflow surfaces are matrix-verified

- **WHEN** generated surfaces are rendered for default and Portal-enabled configurations
- **THEN** every emitted workflow entrypoint, prompt, and command surface contains the correct full-ID workflow status and workflow instructions commands for its workflow
- **AND** checked-in support procedure files are treated as subordinate references unless invoked through an entrypoint, prompt, or command that has performed or explicitly skipped the live preflight

### Requirement: Generated output refresh and documentation are synchronized

Pass 3 implementation MUST refresh generated surfaces through the normal renderer/init path and update routed truth documentation for the new generated-playbook behavior.

#### Scenario: Generated outputs are refreshed from renderer changes

- **WHEN** Pass 3 is implemented
- **THEN** generated host files are refreshed through `truthmark init` or the equivalent source CLI path
- **AND** generated files are not hand-edited as the primary implementation source
- **AND** managed blocks and host-specific file formats remain valid

#### Scenario: Routed truth docs describe the CLI-first generated playbook contract

- **WHEN** Pass 3 implementation is complete
- **THEN** all routed truth documentation owners touched by the behavior change have been evaluated, including installed workflow behavior, init/scaffold generated surfaces, and CLI/generated-surface contracts
- **AND** updated truth docs state that generated workflow surfaces prefer live `workflow status` and `workflow instructions` preflight before acting
- **AND** they document safe fallback behavior when the CLI is unavailable
- **AND** they document canonical full workflow IDs and exact JSON field paths for generated preflight commands and guardrails
