## ADDED Requirements

### Requirement: Interactive platform selection
Truthmark SHALL present the supported repository platforms as a multi-select when `truthmark init` runs with interactive terminal input and no explicit platform arguments.

#### Scenario: First interactive initialization
- **WHEN** a user runs `truthmark init` in a TTY without an existing config
- **THEN** Truthmark lists every value from the authoritative supported-platform catalog and accepts zero, one, or several selections
- **AND** Truthmark does not preselect the current process host

#### Scenario: Existing selections are defaults
- **WHEN** a user runs interactive `truthmark init` with a valid config containing platforms
- **THEN** Truthmark presents those platforms as the current default selection
- **AND** the user can retain, add, remove, or clear selections

#### Scenario: Interactive cancellation
- **WHEN** the user cancels platform selection
- **THEN** Truthmark exits without an error diagnostic
- **AND** Truthmark performs no config, scaffold, lifecycle, or generated-surface writes

### Requirement: Noninteractive platform selection
Truthmark SHALL support repeatable `--platform <id>` options and SHALL never prompt when JSON output is selected or terminal input is unavailable.

#### Scenario: Explicit noninteractive selection
- **WHEN** a user runs `truthmark init --platform codex --platform cursor --json`
- **THEN** Truthmark treats the explicit values as the complete selected platform set
- **AND** it initializes without reading interactive input

#### Scenario: Duplicate explicit values
- **WHEN** an explicit platform appears more than once
- **THEN** Truthmark deduplicates the selection and persists one entry in supported-catalog order

#### Scenario: Unsupported explicit value
- **WHEN** an explicit platform value is not in the supported-platform catalog
- **THEN** Truthmark returns an error diagnostic and a nonzero exit status
- **AND** no repository files are changed

#### Scenario: Existing noninteractive configuration
- **WHEN** noninteractive init receives no explicit platforms and a valid config exists
- **THEN** Truthmark uses the saved platform set without prompting

#### Scenario: Host-neutral noninteractive first run
- **WHEN** noninteractive init receives no explicit platforms and config is missing
- **THEN** Truthmark creates the existing host-neutral config with no platform field
- **AND** it generates no host-specific workflow surfaces

### Requirement: Init owns config persistence
`truthmark init` SHALL create a version-2 config when it is missing and SHALL update only platform ownership when a valid config already exists.

#### Scenario: Missing config is created
- **WHEN** initialization proceeds without `.truthmark/config.yml`
- **THEN** Truthmark writes the current default version-2 workspace, generated-output, frontmatter, and ignore settings
- **AND** it includes the resolved platforms only when the set is nonempty

#### Scenario: Existing config platform update
- **WHEN** interactive or explicit platform input differs from a valid saved selection
- **THEN** Truthmark updates the top-level platform field
- **AND** it preserves other supported config values and YAML comments

#### Scenario: Unchanged platform selection
- **WHEN** the resolved platform set equals the valid saved set
- **THEN** Truthmark leaves config bytes unchanged

#### Scenario: Invalid existing config
- **WHEN** `.truthmark/config.yml` is present but invalid
- **THEN** Truthmark reports the existing config diagnostics
- **AND** it does not prompt, overwrite config, scaffold, or mutate generated surfaces

### Requirement: Selected platforms control generated surfaces
Initialization SHALL continue to use the existing generated-surface catalog and lifecycle ownership rules with the resolved platform set.

#### Scenario: Selected surfaces are generated
- **WHEN** initialization resolves one or more platforms
- **THEN** Truthmark generates only the current documented surfaces owned by those platforms

#### Scenario: Platform removal reconciles managed output
- **WHEN** a rerun removes a previously selected platform
- **THEN** Truthmark uses the existing lifecycle planner to remove only recognized unowned generated files or managed blocks
- **AND** it preserves divergent, ambiguous, user-owned, and retired Gemini content according to current rules

#### Scenario: Inapplicable lifecycle plan blocks init writes
- **WHEN** the existing generated-surface lifecycle planner returns an inapplicable plan
- **THEN** Truthmark writes neither config nor scaffold nor generated surfaces

### Requirement: Config command is removed
Truthmark 2.3 SHALL remove `truthmark config` as a public command and SHALL use `truthmark init` as the setup replacement.

#### Scenario: Top-level help
- **WHEN** a user runs `truthmark --help`
- **THEN** help lists `init` and does not list `config`

#### Scenario: Removed command invocation
- **WHEN** a user runs `truthmark config`
- **THEN** the CLI rejects it as an unknown command with a nonzero exit status

#### Scenario: First-run replacement
- **WHEN** a user previously depended on `truthmark config` followed by `truthmark init`
- **THEN** one `truthmark init` invocation creates config and initializes the repository

### Requirement: Repository workflow behavior remains unchanged
The setup change SHALL NOT modify the installed Repository workflow contract.

#### Scenario: Finish-time Truth Sync remains active
- **WHEN** selected platform surfaces are initialized
- **THEN** their existing instructions continue to require Truth Sync after functional changes
- **AND** later functional changes in the same continuing task require a fresh Sync review

#### Scenario: Deferred Personal behavior remains absent
- **WHEN** Truthmark 2.3 initializes a repository
- **THEN** it installs no Git hook, provider executor, local scan state, background worker, or Personal-installation surface

### Requirement: Change ships in the next minor release
The non-breaking setup simplification SHALL target the next package minor release without changing the persisted config schema solely for release numbering.

#### Scenario: Package and config versions
- **WHEN** the implementation is prepared for release
- **THEN** package metadata reports version `2.3.0`
- **AND** generated and existing repository config remains schema version `2`

#### Scenario: Existing repository continuity
- **WHEN** an existing repository with a valid version-2 config runs Truthmark 2.3 init
- **THEN** initialization proceeds without a config migration
- **AND** repository workflow and finish-time Truth Sync semantics remain unchanged

#### Scenario: Historical and active documentation
- **WHEN** documentation is updated for Truthmark 2.3
- **THEN** active setup instructions use `truthmark init` and contain no prerequisite `truthmark config` step
- **AND** historical release notes may retain prior commands as historical evidence
