## Why

Truthmark setup currently requires users to create and edit `.truthmark/config.yml` before `truthmark init` can install repository workflow surfaces. The next minor release can remove that redundant command by letting `init` collect the repository's platform selection directly while preserving the existing repository-native runtime.

## What Changes

- Add an interactive multi-select platform prompt to `truthmark init` when terminal input is available.
- Add repeatable `truthmark init --platform <id>` input for noninteractive first-run setup.
- Let `init` create the existing version-2 config when it is missing and update only its platform selection on rerun.
- Generate and reconcile surfaces through the existing platform catalog and lifecycle planner.
- Remove the redundant public `truthmark config` command, its command-only options, handler, implementation, tests, and active documentation. This is a non-breaking setup simplification because `truthmark init` retains the setup capability and existing repository config remains valid.
- Keep existing version-2 configs valid and keep Repository Truth Sync behavior unchanged.
- Defer Personal installation, Git hooks, platform executors, and local automation runtime.

## Capabilities

### New Capabilities

- `repository-initialization`: One-command interactive and noninteractive repository initialization, explicit platform selection, config persistence, selected-surface reconciliation, and removal of the redundant config command.

### Modified Capabilities

None. This repository does not yet contain main OpenSpec capability specifications.

## Impact

- CLI parsing and handlers: `src/cli/program.ts`, `src/cli/handlers.ts`, and a small platform-selection helper under `src/cli/`.
- Init and config rendering: `src/init/init.ts`, `src/config/defaults.ts`, and `src/templates/init-files.ts`.
- Removed command implementation: `src/config/command.ts`.
- Tests that currently call `runConfig`, CLI help and built-artifact tests, init integration tests, and a new prompt/parser test.
- Active setup documentation: `README.md`, `docs/README.md`, `docs/user-guide.md`, localized READMEs, canonical init behavior, and the config contract.
- Release metadata for the next minor version. Publication and Personal-installation work remain out of scope.
