---
status: active
truth_kind: engineering-operations
last_reviewed: 2026-09-05
---

# Release Automation

## Purpose

This doc owns current release and CI automation behavior.

## Scope

It covers GitHub workflow triggers, verification steps, and generated GitHub Action template behavior.

## Current Implementation Behavior

Release, CI, GitHub Pages deployment, and repository-readiness automation are implemented through checked-in GitHub workflow files and GitHub repository settings.

The npm publish workflow runs from `release/**` tag push events, with manual `workflow_dispatch` as an operator fallback. Tag-triggered publishing keeps the GitHub Actions OIDC signing certificate tied to a concrete `refs/tags/...` source ref for npm provenance verification.

The GitHub Pages workflow deploys the committed static introduction site from `site/**` after pushes to `main` that change the site or Pages workflow.

The static introduction site replaces the positioned hero illustration with a bounded grid at narrow desktop and tablet widths, then stacks the same content at phone widths. The header brand mark uses an inline SVG checkmark that remains contained within its rounded glyph.

The introduction site groups its overview, workflow guide, truth model, and adoption content into hash-addressable tab pages. The static page keeps each view in the committed HTML, uses client-side navigation as progressive enhancement, and keeps the selected tab visible inside the horizontally scrollable phone navigation.

The CI verify job runs as a matrix on `ubuntu-latest` and `windows-latest` with `fail-fast: false`, so a failure on one operating system does not hide the result on the other.

Tests that assert POSIX-only filesystem semantics are skipped on Windows through `tests/helpers/platform.ts`:

- symlink creation, which a non-elevated Windows user cannot perform
- the executable bit on published package files
- file names containing tabs, newlines, or trailing spaces, which Windows rejects

CodeQL is handled by GitHub's default setup for this repository.

Checked-in advanced CodeQL workflow configuration is intentionally absent while default setup is enabled.

Dependency-update monitoring is managed by existing GitHub repository configuration outside this PR's checked-in workflow changes.

## Operational Surface

- GitHub Actions workflows under `.github/workflows/**`
- static introduction site files under `site/**`
- GitHub Action template rendering in `src/templates/github-action.ts`

## Runtime Topology

Automation runs in GitHub Actions. There is no Truthmark daemon or persistent runtime service.

## Configuration

- GitHub workflow YAML files define CI, release, and Pages deployment triggers.
- The CI verify job is defined as an operating-system matrix rather than a single Linux runner.
- Checked-in workflow actions are pinned to full commit SHAs, with inline comments preserving the upstream action version tag used to choose each SHA.
- GitHub repository settings own CodeQL default setup and existing dependency-update monitoring.
- `src/templates/github-action.ts` owns generated GitHub Action template behavior.

## Permissions

Permissions are owned by the checked-in GitHub workflow and action template definitions.

This doc does not add permissions beyond those source files.

## Deployment And Rollback

- Workflow changes deploy when repository workflow files are committed to the target branch.
- Static introduction site changes deploy through GitHub Pages after they merge to `main`.
- Rollback is a normal Git revert or follow-up workflow-file change.

## Availability And Observability

- GitHub Actions provides run status and logs.
- Truthmark has no separate release automation runtime to monitor.

## Product Truth Links

- None.

## Engineering Decisions

- Decision (2026-06-14): Release automation truth is engineering/operational truth because it describes current repository mechanics.
- Decision (2026-06-26): GitHub Pages deploys only the committed static introduction site under `site/**`.
  - The site is a presentation artifact; Markdown truth docs remain canonical.
- Decision (2026-06-26): Repository-readiness checks stay on existing GitHub-native configuration unless a checked-in workflow is explicitly needed.
  - CodeQL default setup covers code scanning without a checked-in advanced workflow.
  - Existing GitHub repository configuration covers dependency-update monitoring.
- Decision (2026-09-05): CI verifies on Windows as well as Linux.
  - A Linux-only matrix let a path-separator defect in route file containment ship, which disabled area routing on every Windows checkout while CI stayed green.
  - Tests that can only pass on POSIX are skipped by platform rather than removed, so the Windows leg reports a real result instead of a known failure.

## Rationale

Release automation is documented as operations truth because failures, permissions, and rollback are repository mechanics rather than product capability promises.

## Non-Goals

- This doc does not define package versioning policy.
- This doc does not own npm publishing credentials or external registry behavior.

## Maintenance Notes

Update when CI triggers, CI runner platforms, release prerequisites, publish steps, Pages deployment steps, checked-in readiness scans, or action templates change.

`npm run format:check` is not part of `npm run check` and therefore not part of CI; it runs only through `npm run release:check`.

## Source References

- ../../../../.github/workflows/ci.yml
- ../../../../.github/workflows/pages.yml
- ../../../../src/templates/github-action.ts
- ../../../../site/index.html
- ../../../../tests/helpers/platform.ts
- `.github/workflows/**`
- `site/**`
- `src/templates/github-action.ts`
