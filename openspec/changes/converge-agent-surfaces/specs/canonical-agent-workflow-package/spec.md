## ADDED Requirements

### Requirement: Canonical workflow package

Truthmark SHALL generate a repository-local canonical agent workflow package under `.truthmark/agent/` that contains the authoritative workflow skill/prompt content for every supported Truthmark workflow.

#### Scenario: Canonical package is generated

- **WHEN** `truthmark init` renders Truthmark agent surfaces for a configured repository
- **THEN** `.truthmark/agent/manifest.json` exists
- **AND** `.truthmark/agent/workflows/<workflow>/SKILL.md` exists for each supported workflow
- **AND** workflow procedure/report/helper support files exist when that workflow exposes those sections

#### Scenario: Canonical package owns workflow behavior

- **WHEN** a generated host adapter references a Truthmark workflow
- **THEN** the workflow behavior is defined by `.truthmark/agent/workflows/<workflow>/` files
- **AND** adapter-only host files do not contain full workflow procedure or report template bodies

### Requirement: Host adapter projections

Truthmark SHALL render host-specific files as adapters that reference canonical workflow package files instead of duplicating workflow procedure prose, except where an explicit expanded-adapter compatibility mode is selected.

#### Scenario: Adapter-only host surface

- **WHEN** a host is configured for adapter mode
- **THEN** its generated skill, prompt, or command file names the canonical workflow files it expects the agent to read
- **AND** the file states that the adapter is not the workflow source of truth
- **AND** the file contains only host invocation, discovery, and handoff guidance

#### Scenario: Expanded-adapter host surface

- **WHEN** a host is configured for expanded-adapter compatibility mode
- **THEN** its generated file MAY contain an inline workflow body
- **AND** it MUST include machine-readable provenance identifying adapter mode, canonical source path, canonical content hash, and generated content hash
- **AND** `truthmark check` can detect when the expanded body is stale relative to the canonical package

### Requirement: Deterministic manifest and hashes

Truthmark SHALL render deterministic manifest and adapter metadata so generated-surface freshness can be checked without relying on manual review of copied prompt bodies.

#### Scenario: Stable manifest content

- **WHEN** canonical workflow content and configuration inputs are unchanged
- **THEN** repeated `truthmark init` runs produce the same manifest entries and hashes
- **AND** hashes use repository-relative canonical paths rather than absolute checkout paths

#### Scenario: Canonical content changes

- **WHEN** a canonical workflow package file changes
- **THEN** the manifest hash for that package changes
- **AND** any generated expanded adapter referencing the old hash is reported stale by generated-surface freshness checks

### Requirement: Generated-surface hygiene diagnostics

Truthmark SHALL detect stale or unsafe generated-surface convergence states through existing validation paths without introducing hooks, CI blockers, or mandatory workflow preflight execution.

#### Scenario: Adapter contains duplicated procedure prose

- **WHEN** a host file is marked or inferred as adapter mode
- **AND** it contains full workflow procedure/report body markers that belong in canonical files
- **THEN** `truthmark check` reports a generated-surface diagnostic for unauthorized duplicated workflow prose

#### Scenario: Adapter references missing canonical file

- **WHEN** a host adapter points at a canonical workflow package file that does not exist
- **THEN** `truthmark check` reports a generated-surface diagnostic naming the adapter and missing canonical file

#### Scenario: Expanded adapter is stale

- **WHEN** an expanded adapter's recorded canonical hash does not match the current canonical package file
- **THEN** `truthmark check` reports a generated-surface freshness diagnostic

### Requirement: Preserve workflow behavior during convergence

Truthmark SHALL preserve current workflow semantics while moving workflow authority into canonical package files.

#### Scenario: Existing workflow renderer tests remain meaningful

- **WHEN** workflow source renderers are refactored to write canonical packages
- **THEN** tests assert the canonical package contains the workflow sections previously asserted in host skill bodies
- **AND** adapter tests assert host-specific routing/provenance rather than copied workflow prose

#### Scenario: Direct repository-file fallback remains available

- **WHEN** a host cannot use a live service, MCP server, or CLI command during an agent workflow
- **THEN** the agent can still read committed canonical package files directly
- **AND** the workflow does not require network access or a running daemon

### Requirement: Optional future MCP prompt exposure

Truthmark MAY later expose canonical workflow packages through MCP prompts, but the canonical repository-file package SHALL remain the primary durable fallback.

#### Scenario: MCP unavailable

- **WHEN** no MCP server is configured or running
- **THEN** generated host adapters still point to committed canonical package files
- **AND** Truthmark workflows remain usable from the repository checkout
