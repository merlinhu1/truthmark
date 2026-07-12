## Why

Truthmark currently has three fail-open edges in repository maintenance: `instruction_targets` can route managed blocks into arbitrary files instead of following the selected host platform, routing coverage can ignore functional code outside a fixed root list, and disabling a host leaves its generated instructions installed with no safe uninstall path. These behaviors weaken the product's core promise that repository-local documentation workflows remain bounded, current, and reviewable.

## What Changes

- Derive managed instruction files from platform selection instead of using `instruction_targets` as a write-routing control. Claude Code owns `CLAUDE.md`; platforms that use the shared repository instruction file own `AGENTS.md`; existing host-specific canonical instruction surfaces remain renderer-owned.
- Continue accepting legacy `instruction_targets` config for compatibility, but ignore it for writes and report that platform selection now controls instruction placement.
- Replace hard-coded coverage roots with lightweight Git-visible repository file discovery shared by Check and RepoIndex.
- Make `truthmark check` report generated surfaces that belong to disabled platforms or disabled Portal host integrations.
- Make `truthmark init` reconcile disabled generated surfaces using exact-path, preservation-aware cleanup.
- Add `truthmark uninstall --dry-run|--apply` for deterministic removal of Truthmark host integrations while preserving configuration, routing, authored truth, templates, Portal output, Gemini files, and unrelated user files.
- Keep all behavior local and deterministic; add no daemon, database, hosted service, plugin, or required workflow runtime.

## Capabilities

### New Capabilities

- `platform-instruction-routing`: Platform-derived, non-configurable routing for managed repository instruction blocks.
- `repository-routing-coverage`: Repository-wide functional-code discovery for routing coverage without fixed top-level root assumptions.
- `generated-surface-lifecycle`: Preview, reconciliation, and safe uninstall behavior for generated host surfaces and managed instruction blocks.

### Modified Capabilities

None. This repository has no archived OpenSpec capability specs yet; the three capabilities above establish the current contracts for these fixes.

## Impact

- Configuration and initialization: `src/config/**`, `src/init/**`, and generated-surface rendering.
- Routing diagnostics and repository intelligence: `src/checks/**`, `src/git/**`, `src/repo-index/**`, and `src/sync/classify.ts`.
- CLI and lifecycle behavior: `src/cli/**`, generated-surface checks, a new uninstall implementation, and built CLI tests.
- Public package contract: `truthmark-lifecycle/v0` uninstall JSON and a versioned change note; this change does not force a major release.
- Canonical behavior, contract, architecture, product capability, user-guide, README/localization, and change-note documentation.
- No new runtime dependency or service. Existing configs continue to load; legacy `instruction_targets` values no longer control writes.