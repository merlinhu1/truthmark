## Context

Truthmark currently splits setup between `truthmark config`, which writes a host-neutral version-2 config, and `truthmark init`, which refuses to run without that file. Platform ownership already lives in the top-level `platforms` array, and existing generated-surface rendering and lifecycle reconciliation already honor that array.

The change crosses CLI parsing, terminal input, config persistence, init orchestration, tests, active documentation, and release metadata. It does not change workflow runtime semantics or require a new config schema.

## Goals / Non-Goals

**Goals:**

- Make `truthmark init` the only setup command.
- Ask interactive users which repository platforms to enable.
- Support repeatable noninteractive `--platform` input.
- Preserve host-neutral initialization when the user selects no platforms.
- Keep version-2 configs valid and preserve non-platform config content on rerun.
- Reuse current renderers and lifecycle ownership checks.
- Remove `truthmark config` in the next minor release.

**Non-Goals:**

- Personal installation, Git hooks, commit-triggered Sync, provider executors, or local runtime state.
- A new config version or migration framework.
- Changes to Truth Sync timing, routing, generated-surface contents, uninstall, or workflow authority.
- A generic setup-wizard framework or a new external prompt dependency.
- Package publication as part of implementation.

## Decisions

### Use a focused Node built-in prompt

Add a small CLI helper under `src/cli/` using `node:readline/promises`. It prints the authoritative `SUPPORTED_PLATFORMS` list with stable numbers and accepts a comma-separated set. Existing selections are shown as defaults; pressing Enter keeps them. An empty selection is valid and means host-neutral CLI-only setup.

The helper receives input and output streams so parser and prompt behavior can be tested without a pseudo-terminal dependency. The CLI passes it to init only when stdin and stdout are TTYs and `--json` is absent.

Alternative considered: add an interactive prompt package. Rejected because one numbered multi-select does not justify another runtime dependency.

### Resolve platform input inside init

`runInit` accepts an options object containing explicit platform values and an optional selector callback. Resolution order is:

1. Explicit repeated `--platform` values, when present.
2. The selector callback in interactive mode, preselected from saved config.
3. Saved config platforms in noninteractive mode.
4. The existing host-neutral empty default when config is missing and no explicit input exists.

Explicit and prompted values are validated against `SUPPORTED_PLATFORMS`, deduplicated, and normalized to catalog order. Truthmark never selects the current host automatically.

Cancellation returns a successful no-write result. Unsupported values return error diagnostics and no writes.

Alternative considered: let `program.ts` load and update config before calling init. Rejected because it duplicates repository/config discovery and splits init atomicity across public layers.

### Keep config version 2 and update only platform ownership

For a missing config, init renders `createDefaultRawConfig()` with the resolved platform set. An empty set omits `platforms`, matching current host-neutral output.

For an existing valid config, init uses `yaml.parseDocument` to set or remove the top-level `platforms` key while preserving other supported values and comments. If the resolved set equals the normalized saved set, the source bytes remain unchanged.

Invalid config remains fail-closed. Init does not overwrite or repair it implicitly.

For renderer input, init uses the already normalized config with only its `platforms` field replaced. This avoids writing and reloading config before generated-surface preflight.

Alternative considered: introduce a new config schema version with an installation block. Rejected because no persisted semantic change requires it.

### Reuse the existing lifecycle planner

The resolved config feeds `renderGeneratedSurfaces` and `buildLifecyclePlan` exactly as today. Current ownership, stale-surface, managed-block, alias, and retired-Gemini rules remain authoritative.

Init performs generated-surface preflight before writing a new or updated config. It then applies the lifecycle plan, writes config, scaffolds hierarchy, and writes selected surfaces through current helpers. The change does not add a second lifecycle registry or transaction system.

### Remove the config command completely

Delete the `config` command registration, `ConfigOptions`, handler export, `src/config/command.ts`, command-specific tests, and active documentation. Do not keep an alias or hidden compatibility command. Commander reports `truthmark config` as unknown.

Tests that need a configured fixture use a test helper that writes `renderConfigTemplate(platforms)` directly. Product behavior tests use `runInit(..., { platforms })` so they exercise the replacement setup path.

### Ship in the next package minor without a config migration

The setup simplification is non-breaking: `truthmark init` absorbs config creation and existing version-2 repositories remain valid. From the current `2.2.7`, implementation targets the next minor release, `2.3.0`, and adds a change note, but it does not publish the package.

Historical release notes may retain old commands as history. Active setup documentation and localized READMEs must not instruct users to run `truthmark config`.

## Risks / Trade-offs

- Numbered comma-separated selection is less polished than a checkbox widget. It keeps the implementation dependency-free and remains a real multi-select.
- Rewriting the YAML platform node can alter nearby formatting. Using `parseDocument` and preserving unchanged bytes limits churn while retaining comments and other values.
- Combining config creation and init increases the number of writes in one command. Existing lifecycle preflight remains the safety boundary; no new transaction framework is added.
- Stale setup instructions may still invoke `truthmark config`. Updated active documentation and the direct `truthmark init` replacement keep the supported setup flow clear.
- Many tests import `runConfig` only as setup. A shared test config helper prevents repetitive raw YAML and keeps those changes mechanical.

## Migration Plan

1. Add and test platform parsing, selection, and init option resolution.
2. Move default config creation and platform update into init.
3. Remove the public config command and migrate test fixtures.
4. Update active documentation, canonical truth, package metadata, and the minor-version change note.
5. Run focused tests, the full repository check, package checks, Truthmark check/index, and stale-command scans.

Rollback before release restores the config command and package version while retaining version-2 config files. No repository data migration is required.

## Open Questions

None. Personal installation remains deferred and is not an implementation option in this change.
