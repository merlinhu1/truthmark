## ADDED Requirements

### Requirement: Canonical workflow package

Truthmark SHALL generate a repository-local canonical agent workflow package under `.truthmark/agent/` that contains the canonical workflow package projection for every supported Truthmark workflow.

#### Scenario: Canonical package is generated

- **WHEN** `truthmark init` renders Truthmark agent surfaces for a configured repository
- **THEN** `.truthmark/agent/manifest.json` exists
- **AND** `.truthmark/agent/workflows/<workflow>/SKILL.md` exists for each supported workflow
- **AND** workflow procedure/report/helper support files exist when that workflow exposes those sections

#### Scenario: Canonical package records generated package modes

- **WHEN** the manifest describes a workflow
- **THEN** it records deterministic repository-relative paths and hashes for canonical package files
- **AND** it records host skill directories as native package projections when they carry colocated resources

### Requirement: Host-native skill package projections

Truthmark SHALL render configured host skill directories as native generated skill packages when the host discovers and invokes skills from skill folders.

#### Scenario: Native host skill package

- **WHEN** a host workflow is emitted under a skill directory such as `.agents/skills`, `.opencode/skills`, `.claude/skills`, `.github/skills`, or `.gemini/skills`
- **THEN** the generated skill folder contains `SKILL.md`
- **AND** the generated skill folder contains the workflow support files (`support/procedure.md`, `support/report-template.md`, subagent/lease guidance, helper metadata, and helper policy when applicable)
- **AND** those files are generated from the canonical workflow renderer rather than maintained as independent source authority

#### Scenario: Thin non-skill adapter surface

- **WHEN** a host workflow is emitted as a prompt, command, managed instruction block, or other non-skill entrypoint
- **THEN** the generated surface names the workflow entrypoint it expects the agent to use
- **AND** it contains host invocation, discovery, or handoff guidance rather than full workflow procedure/report bodies

### Requirement: Deterministic manifest and freshness checks

Truthmark SHALL render deterministic manifest and generated-surface metadata so canonical and host-native package freshness can be checked without relying on manual review of copied prompt bodies.

#### Scenario: Stable manifest content

- **WHEN** canonical workflow content and configuration inputs are unchanged
- **THEN** repeated `truthmark init` runs produce the same manifest entries and hashes
- **AND** hashes use repository-relative canonical paths rather than absolute checkout paths

#### Scenario: Canonical content changes

- **WHEN** a canonical workflow package file changes
- **THEN** the manifest hash for that package changes
- **AND** `truthmark check` reports generated-surface freshness diagnostics until generated files are refreshed

### Requirement: Generated-surface hygiene diagnostics

Truthmark SHALL detect stale or unsafe generated-surface convergence states through existing validation paths without introducing hooks, CI blockers, or mandatory workflow preflight execution.

#### Scenario: Host skill package file is missing

- **WHEN** a generated host-native skill support file is absent from the checkout
- **THEN** `truthmark check` reports a generated-surface diagnostic naming the missing file

#### Scenario: Host skill package file is stale

- **WHEN** a generated host-native skill entrypoint or support file differs from the renderer output
- **THEN** `truthmark check` reports a generated-surface freshness diagnostic naming the stale file

#### Scenario: Thin adapter contains duplicated procedure prose

- **WHEN** a non-skill host adapter surface is intended to be thin
- **AND** it contains full workflow procedure/report body markers that belong in package files
- **THEN** tests or generated-surface diagnostics report unauthorized duplicated workflow prose

### Requirement: Preserve workflow behavior during convergence

Truthmark SHALL preserve current workflow semantics while moving workflow authority into canonical renderers and generated package files.

#### Scenario: Existing workflow renderer tests remain meaningful

- **WHEN** workflow source renderers are refactored to write canonical and host-native packages
- **THEN** tests assert those packages contain the workflow sections consumed by skill hosts
- **AND** adapter tests assert host-specific routing/provenance rather than copied workflow prose where the surface is not a skill package

#### Scenario: Direct repository-file fallback remains available

- **WHEN** a host cannot use a live service, MCP server, or CLI command during an agent workflow
- **THEN** the agent can still read committed canonical and host-native package files directly
- **AND** the workflow does not require network access or a running daemon

### Requirement: Optional future MCP prompt exposure

Truthmark MAY later expose canonical workflow packages through MCP prompts, but committed repository-file packages SHALL remain the primary durable fallback.

#### Scenario: MCP unavailable

- **WHEN** no MCP server is configured or running
- **THEN** generated host-native skill packages and thin prompt/command adapters remain usable from the repository checkout
