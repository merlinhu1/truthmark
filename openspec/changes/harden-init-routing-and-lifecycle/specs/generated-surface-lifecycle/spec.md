## ADDED Requirements

### Requirement: Shared generated-surface ownership inventory
Truthmark SHALL derive one exact-path inventory for every current supported platform, optional Portal host surface, platform-derived managed instruction block, and historical retired surface. Each entry MUST identify whole-file versus managed-block ownership and aggregate every ownership claim for the path. Ownership claims MUST express platform ownership, Portal-plus-platform conjunctive ownership, and retired/manual-only ownership. Init, Check, and Uninstall MUST consume this shared inventory instead of maintaining independent path lists.

#### Scenario: Complete platform catalog
- **WHEN** the inventory is rendered for all supported platforms with Portal enabled and disabled
- **THEN** every path emitted by the current platform renderers appears with the correct ownership class
- **AND** configured surface content remains unchanged

#### Scenario: Multiple platforms share one instruction file
- **WHEN** several configured platforms derive `AGENTS.md`
- **THEN** its inventory entry retains every active platform ownership claim after exact-path deduplication

#### Scenario: Portal ownership is conjunctive
- **WHEN** Portal remains enabled but one host platform is removed
- **THEN** only that platform's Portal host surfaces become inactive
- **AND** Portal host surfaces for still-configured platforms remain desired

#### Scenario: Portal disabled for configured host
- **WHEN** a host remains configured and Portal becomes disabled
- **THEN** that host's Portal surfaces become inactive while its non-Portal surfaces remain desired

### Requirement: Check previews inactive generated surfaces
`truthmark check` SHALL report existing current-platform outputs that are no longer desired by configuration, including Portal host surfaces after Portal is disabled. It SHALL report only exact catalogued paths or present managed blocks and SHALL not classify unrelated sibling files as obsolete.

#### Scenario: Platform removed from config
- **WHEN** Claude Code and Codex surfaces exist and `claude-code` is removed from `platforms`
- **THEN** Check reports Claude whole-file outputs and a present Truthmark block in `CLAUDE.md` as inactive
- **AND** it does not report Codex outputs or unrelated `.claude/**` files

#### Scenario: Shared managed target remains desired
- **WHEN** one platform that derives `AGENTS.md` is removed while another such platform remains configured
- **THEN** Check does not classify the managed block as inactive

### Requirement: Init reconciles disabled integrations safely
After writing desired surfaces, `truthmark init` SHALL remove inactive exact-path outputs only when ownership can be proven safely. It MUST preserve unrelated files and MUST NOT recursively delete host directories.

#### Scenario: Unmodified disabled platform output
- **WHEN** a platform is removed and its whole-file outputs still match a recognized generated rendering
- **THEN** init removes those exact files and emits action diagnostics
- **AND** configured-platform outputs and sibling user files remain unchanged

#### Scenario: Diverged disabled platform output
- **WHEN** a catalogued whole-file output contains user edits or cannot be matched to recognized generated content
- **THEN** init preserves the file and emits an actionable manual-cleanup diagnostic

#### Scenario: Portal disabled
- **WHEN** Portal host surfaces exist and Portal becomes disabled
- **THEN** init removes safely recognized Portal host files
- **AND** preserves the committed Portal presentation output under the Truthmark workspace

### Requirement: Managed block removal preserves user content
Truthmark SHALL remove only one structurally valid marker-delimited Truthmark block. Content outside the block MUST be preserved, including line-ending style where practical. A file containing only the block and whitespace MAY be removed.

#### Scenario: User content surrounds block
- **WHEN** an inactive instruction file contains user prose before and after one valid Truthmark block
- **THEN** reconciliation removes only the block and preserves the user prose

#### Scenario: Ambiguous markers
- **WHEN** an instruction file contains missing, reversed, nested, or duplicate Truthmark markers
- **THEN** the complete mutation plan fails closed before any write
- **AND** the file is identified for manual cleanup

#### Scenario: Desired instruction file has ambiguous markers
- **WHEN** a platform-derived managed instruction file contains missing, reversed, nested, or duplicate Truthmark markers
- **THEN** Check reports the malformed structure
- **AND** Init fails the complete plan before scaffolding, desired-surface writes, or cleanup
- **AND** no repository file changes

### Requirement: Safe generated-host uninstall is previewable
Truthmark SHALL expose `truthmark uninstall --dry-run` and `truthmark uninstall --apply`, both supporting `--json`. Exactly one mode MUST be selected. Dry-run and apply MUST use the same deterministic plan; dry-run MUST perform no mutation.

For a valid mode selection, the JSON command result MUST expose `data.lifecyclePlan` with `schemaVersion: "truthmark-lifecycle/v0"`, `mode: "dry-run" | "apply"`, sorted `entries`, `applicable`, and `applied`. Entries MUST contain exact `path`, `action`, and `reason` fields. Dry-run and apply for the same checkout MUST return identical entries; only `mode` and `applied` MAY differ. Invalid mode selection SHALL fail before lifecycle planning and SHALL NOT return `data.lifecyclePlan`.

#### Scenario: Dry-run plan
- **WHEN** uninstall dry-run executes in a valid Truthmark repository
- **THEN** it lists exact safe removals, preserved paths, and manual-review paths
- **AND** file bytes, modes, and Git status remain unchanged

#### Scenario: Invalid mode selection
- **WHEN** uninstall is invoked with neither mode or with both modes
- **THEN** it exits nonzero and performs no mutation
- **AND** no lifecycle plan is created or returned

#### Scenario: Unsafe plan blocks all writes
- **WHEN** uninstall encounters missing or invalid config, malformed markers, unsafe paths, or alias uncertainty
- **THEN** `applicable` and `applied` are false
- **AND** the command exits nonzero without applying any safe or unsafe entry

#### Scenario: Diverged generated file is a planned preservation
- **WHEN** uninstall finds a catalogued whole-file output whose content does not match a recognized generated rendering
- **THEN** the plan contains a `manual-review` or `preserve` entry for that path
- **AND** `applicable` remains true so other safe entries MAY be applied
- **AND** apply exits successfully with review diagnostics while leaving the diverged path unchanged

### Requirement: Uninstall preserves repository truth and user files
Uninstall apply SHALL remove only safely recognized generated host whole files and valid managed blocks. It MUST preserve `.truthmark/config.yml`, route files, product truth, engineering truth, editable templates, Portal presentation output, Gemini files, unrelated host-directory files, and user content outside managed blocks. It SHALL NOT uninstall the globally installed npm package.

#### Scenario: Apply uninstall
- **WHEN** uninstall apply runs with generated host surfaces and authored truth present
- **THEN** safely recognized host surfaces and managed blocks are removed
- **AND** all configuration, routing, truth, template, Portal output, Gemini, and unrelated user files remain unchanged

#### Scenario: Missing or invalid config
- **WHEN** uninstall cannot load a valid configuration needed to prove safe ownership
- **THEN** it performs no mutation
- **AND** it returns manual cleanup guidance

### Requirement: Gemini cleanup remains manual
Truthmark MUST NOT automatically remove `GEMINI.md` or `.gemini/**` during Check reconciliation, Init, or Uninstall because those files may contain user-owned instructions.

#### Scenario: Retired Gemini files exist
- **WHEN** lifecycle reconciliation or uninstall discovers retired Gemini surfaces
- **THEN** it preserves them and reports manual review guidance

### Requirement: Filesystem removal is contained and preflighted
Every planned removal or managed-block rewrite MUST pass active-worktree containment, symlink, regular-file, and hard-link checks before any mutation begins. A target or existing parent symlink that escapes or aliases another file, or a multiply-linked destination whose mutation could affect another path, MUST fail the full plan closed.

#### Scenario: Catalogued path resolves through symlink
- **WHEN** a planned generated-file removal resolves through a symbolic link or outside the active worktree
- **THEN** no lifecycle mutation is applied
- **AND** the unsafe path is reported

#### Scenario: Managed block destination has multiple hard links
- **WHEN** a planned managed-block removal or rewrite targets a file with multiple hard links
- **THEN** no lifecycle mutation is applied
- **AND** every linked path remains byte-for-byte unchanged
