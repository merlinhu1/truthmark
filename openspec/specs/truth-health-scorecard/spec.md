# truth-health-scorecard Specification

## Purpose
Define the compact `truthmark check --json` scorecard contract that summarizes repository-truth health without replacing raw diagnostics or inflating workflow-state payloads.

## Requirements
### Requirement: Compact truth health scorecard contract

Truthmark MUST provide a compact schema-versioned Truth Health Scorecard contract in `check --json` that summarizes repository-truth governance outcomes above raw diagnostics without replacing those diagnostics.

#### Scenario: Scorecard has stable schema and compact dimensions

- **WHEN** a Truth Health Scorecard is built
- **THEN** it includes `schemaVersion: "truthmark-scorecard/v0"`
- **AND** it includes dimensions for routing coverage, ownership clarity, source traceability, branch freshness, generated-surface freshness, truth-doc structure, and decision/rationale preservation
- **AND** each dimension includes a stable `id`, categorical `status`, and `diagnosticIndexes`
- **AND** each dimension MAY include compact `evidence` only for non-pass states
- **AND** the runtime JSON does not repeat long labels, remediation paragraphs, full diagnostic messages, or source/document excerpts for every dimension

#### Scenario: Dimension statuses are categorical

- **WHEN** diagnostics are mapped to a dimension
- **THEN** the dimension status is `fail` if any mapped diagnostic has severity `error`
- **AND** the dimension status is `warn` if mapped diagnostics exist but none are errors
- **AND** the dimension status is `pass` if the dimension's relevant checker ran and produced no mapped diagnostics
- **AND** the dimension status is `not-run` if required context was unavailable or the relevant check was intentionally skipped
- **AND** Truthmark does not emit numeric health percentages, grades, or weighted scores in this pass

#### Scenario: Scorecard points back to raw diagnostics

- **WHEN** one or more diagnostics contribute to a dimension
- **THEN** the dimension's `diagnosticIndexes` reference positions in the same raw `diagnostics` array returned with the command result
- **AND** compact `evidence`, when present, does not replace full diagnostic messages, files, severity, category, or data

### Requirement: Scorecard maps existing diagnostics to governance dimensions

Truthmark MUST derive scorecard dimensions from existing check diagnostics and explicit checker run context rather than introducing a second validation engine.

#### Scenario: Routing and ownership diagnostics map to routing dimensions

- **WHEN** diagnostics with categories such as `authority`, `area-index`, `coverage`, `repo-index`, `impact`, or route-ambiguity diagnostics are present
- **THEN** the scorecard maps them to routing coverage, ownership clarity, or both according to explicit mapping rules
- **AND** ambiguous or unmapped functional ownership is visible as ownership clarity warning or failure rather than hidden in raw diagnostics only

#### Scenario: Source traceability and freshness diagnostics map to distinct dimensions

- **WHEN** diagnostics with category `source-traceability`, broken source evidence links, missing source evidence targets, or branch `freshness` diagnostics are present
- **THEN** the scorecard maps source reference diagnostics to source traceability and branch freshness diagnostics to branch freshness as appropriate
- **AND** branch freshness uses the same branch base context as `check --base`

#### Scenario: Generated-surface diagnostics map to generated-surface freshness

- **WHEN** diagnostics with category `generated-surface` are present
- **THEN** the scorecard maps them to generated-surface freshness
- **AND** generated-surface freshness does not claim pass when generated-surface checks were skipped or unavailable

#### Scenario: Structure and decision diagnostics map to documentation dimensions

- **WHEN** diagnostics with categories such as `frontmatter`, `links`, or `doc-structure` are present
- **THEN** the scorecard maps them to truth-doc structure
- **AND** diagnostics that specifically concern decision or rationale sections map to decision/rationale preservation

#### Scenario: Branch freshness is not-run without a base

- **WHEN** `check` runs without a branch comparison base
- **THEN** the branch freshness dimension status is `not-run`
- **AND** it does not report `pass` merely because no freshness diagnostics were produced

### Requirement: Check JSON includes additive scorecard data

Truthmark MUST include the compact health scorecard in `check --json` output while preserving the raw diagnostic contract and existing compatibility fields.

#### Scenario: Healthy check includes compact scorecard dimensions

- **WHEN** `truthmark check --json` runs in a healthy initialized repository
- **THEN** the standard command result envelope still includes `command`, `summary`, `diagnostics`, and `data`
- **AND** `data.scorecard.schemaVersion` is `truthmark-scorecard/v0`
- **AND** dimensions whose checks ran and had no diagnostics have status `pass`
- **AND** branch freshness has status `not-run` unless a branch base was supplied

#### Scenario: Check preserves raw diagnostics and compatibility fields

- **WHEN** `truthmark check --json` returns diagnostics and scorecard data
- **THEN** raw diagnostics remain present at the top-level `diagnostics` field with unchanged diagnostic shape
- **AND** existing `data.branchScope`, optional `data.impactSet`, and existing `data.truthVisibility` compatibility summary remain available in this pass
- **AND** consumers can inspect raw diagnostics using scorecard `diagnosticIndexes`

#### Scenario: Missing config still returns a scorecard

- **WHEN** `truthmark check --json` runs in a repository that cannot load a valid Truthmark config
- **THEN** the command still returns a parseable standard JSON envelope
- **AND** `data.scorecard` is present
- **AND** affected dimensions report `fail` or `not-run` based on the config diagnostics and skipped checks rather than omitting the scorecard

### Requirement: Workflow-state scorecard exposure is deferred

Pass 4 MUST avoid adding scorecard payload to workflow state or generated playbooks so routine workflow instruction payloads do not grow before the need is proven.

#### Scenario: Workflow state remains unchanged by Pass 4

- **WHEN** Pass 4 is implemented
- **THEN** Truthmark does not add `data.workflowState.scorecard`
- **AND** `workflow status` and `workflow instructions` continue to expose their existing workflow-state contract without duplicated check scorecard data
- **AND** generated playbooks remain unchanged unless a later pass explicitly chooses compact workflow-state scorecard exposure

### Requirement: Scorecard output preserves Truthmark product boundaries

Pass 4 MUST improve verification UX without adding OpenSpec-style lifecycle behavior or mutation semantics.

#### Scenario: No new lifecycle command or artifacts are introduced

- **WHEN** Pass 4 is implemented
- **THEN** Truthmark does not add a new `scorecard` lifecycle command, proposal/spec/task workflow, archive/apply behavior, arbitrary artifact DAG scoring, or `truthmark/changes/*` runtime artifact creation
- **AND** scorecard generation is read-only and does not create, modify, or delete repository files

#### Scenario: Routed truth docs describe the check scorecard contract

- **WHEN** Pass 4 implementation is complete
- **THEN** routed truth documentation that owns check/validation output documents `data.scorecard`, the `truthmark-scorecard/v0` schema, compact dimension fields, categorical statuses, branch-freshness `not-run` behavior, and raw diagnostic preservation
- **AND** workflow-state truth documentation is not expanded to claim scorecard exposure in this pass
