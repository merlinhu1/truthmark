## ADDED Requirements

### Requirement: Platforms determine managed instruction files
Truthmark SHALL derive managed repository instruction destinations from the configured `platforms` instead of accepting repository paths as write destinations. Claude Code SHALL own `CLAUDE.md`; platforms that use the shared repository instruction file SHALL own `AGENTS.md`; host-specific canonical instruction surfaces SHALL remain owned by their platform renderer. When several selected platforms resolve to the same file, Truthmark SHALL manage one marker-delimited block in that file.

#### Scenario: Claude Code selected
- **WHEN** `claude-code` is selected
- **THEN** `truthmark init` manages one Truthmark block in `CLAUDE.md`
- **AND** Claude Code does not cause a generic Truthmark block to be written to an arbitrary configured path

#### Scenario: Shared-instruction platform selected
- **WHEN** a selected platform uses the shared repository instruction file
- **THEN** `truthmark init` manages one Truthmark block in `AGENTS.md`

#### Scenario: Multiple platforms share one target
- **WHEN** multiple selected platforms resolve to `AGENTS.md`
- **THEN** Init writes one deduplicated managed block

#### Scenario: No platform selected
- **WHEN** `platforms` is omitted
- **THEN** Init does not create a generic managed instruction file
- **AND** it still creates the platform-neutral Truthmark scaffold

### Requirement: Legacy instruction target configuration is non-authoritative
Truthmark SHALL continue to parse existing configs that contain `instruction_targets` so this safety correction does not require a major-version migration. The field MUST NOT control any write destination. Config, Check, or Init SHALL emit actionable guidance that the field is ignored and platform selection controls managed instruction placement.

#### Scenario: Legacy arbitrary target remains in config
- **WHEN** an existing config contains `instruction_targets: ["src/session.ts"]`
- **THEN** config loading succeeds with a compatibility diagnostic
- **AND** Init does not modify `src/session.ts`
- **AND** Init writes only the canonical instruction surfaces derived from selected platforms

#### Scenario: Legacy standard target remains in config
- **WHEN** an existing config contains `instruction_targets: ["AGENTS.md"]`
- **THEN** config loading succeeds
- **AND** the field does not force `AGENTS.md` when the selected platform maps elsewhere

### Requirement: Managed instruction updates preserve user content
When Init updates a platform-derived instruction file, it SHALL create or replace only the marker-delimited Truthmark block and preserve content outside the markers.

#### Scenario: Existing platform instruction file
- **WHEN** a derived instruction file already contains user-authored content and zero or one valid Truthmark block
- **THEN** Init updates only the Truthmark block
- **AND** user-authored content remains unchanged
