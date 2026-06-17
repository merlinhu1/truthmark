## ADDED Requirements

### Requirement: Host-native workflow skill packages

Truthmark SHALL generate configured host skill directories as native workflow skill packages with package-local resources.

#### Scenario: Init writes package-local resources for configured skill hosts

- **WHEN** `truthmark init` runs with Codex, OpenCode, Claude Code, GitHub Copilot, or Gemini CLI configured
- **THEN** each configured host skill directory contains `SKILL.md`
- **AND** write/read workflow procedure guidance is colocated under `support/procedure.md`
- **AND** report shape guidance is colocated under `support/report-template.md`
- **AND** subagent/lease support and helper metadata are colocated when the workflow uses those resources
- **AND** the skill package does not require a separate `.truthmark/agent/` workflow copy to be usable

### Requirement: No unused repo-local workflow package copy

Truthmark SHALL NOT generate a separate `.truthmark/agent/` workflow package unless an active host surface consumes that package.

#### Scenario: Default generated surfaces omit unused workflow copies

- **WHEN** generated surfaces are rendered for the default configured platforms
- **THEN** no generated surface path starts with `.truthmark/agent/`
- **AND** generated host skill packages contain the workflow resources agents need at runtime

### Requirement: Compact non-skill adapters

Truthmark SHALL keep non-skill host entrypoints compact and route them to host-native skill package files.

#### Scenario: Prompt and command surfaces route to host-local resources

- **WHEN** GitHub Copilot prompt files or Gemini command files are generated
- **THEN** they identify the workflow entrypoint
- **AND** they point to the host-local skill package files such as `SKILL.md`, `support/procedure.md`, and `support/report-template.md`
- **AND** they do not embed the full workflow body
- **AND** they do not dispatch another Truthmark workflow command recursively

### Requirement: Host package freshness diagnostics

Truthmark SHALL validate generated host-native package files through `truthmark check`.

#### Scenario: Missing or stale host package support files are reported

- **WHEN** a generated host skill package entrypoint or support file is missing or stale
- **THEN** `truthmark check` reports a generated-surface review diagnostic naming that host package file
- **AND** the diagnostic remains advisory review output, not a CI hook, PR blocker, daemon, or mandatory workflow preflight

### Requirement: Product decision recorded

Truthmark SHALL keep the native-skill-package decision in product truth.

#### Scenario: Product truth explains why adapter-only skill folders are rejected

- **WHEN** the product capability doc for agent-native workflow injection is read
- **THEN** it states that host skill directories are native packages, not adapter-only pointers
- **AND** it explains that some hosts package and progressively disclose resources from the skill directory
- **AND** it states that a separate `.truthmark/agent/` workflow copy is not generated unless an active host surface consumes it
