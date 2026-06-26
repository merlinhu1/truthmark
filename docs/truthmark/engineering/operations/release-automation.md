---
status: active
truth_kind: engineering-operations
last_reviewed: 2026-06-26
---

# Release Automation

## Purpose

This doc owns current release and CI automation behavior.

## Scope

It covers GitHub workflow triggers, verification steps, and generated GitHub Action template behavior.

## Current Implementation Behavior

Release, CI, GitHub Pages deployment, and repository-readiness automation are implemented through checked-in GitHub workflow files, repository automation configuration, and GitHub repository settings.

The npm publish workflow runs from `release/**` tag push events, with manual `workflow_dispatch` as an operator fallback. Tag-triggered publishing keeps the GitHub Actions OIDC signing certificate tied to a concrete `refs/tags/...` source ref for npm provenance verification.

The GitHub Pages workflow deploys the committed static introduction site from `site/**` after pushes to `main` that change the site or Pages workflow.

CodeQL is handled by GitHub's default setup for this repository.

Checked-in advanced CodeQL workflow configuration is intentionally absent while default setup is enabled.

OpenSSF Scorecard runs as a repository-readiness check on mainline, pull request, scheduled, manual, and branch-protection-rule events.

The Scorecard workflow does not upload SARIF and does not request `security-events: write`; it publishes Scorecard results through OIDC on non-pull-request events.

Dependabot checks npm dependencies and GitHub Actions weekly.

## Operational Surface

- GitHub Actions workflows under `.github/workflows/**`
- Dependabot configuration at `.github/dependabot.yml`
- static introduction site files under `site/**`
- GitHub Action template rendering in `src/templates/github-action.ts`

## Runtime Topology

Automation runs in GitHub Actions. There is no Truthmark daemon or persistent runtime service.

## Configuration

- GitHub workflow YAML files define CI, release, Pages deployment, and Scorecard triggers.
- GitHub repository settings own CodeQL default setup.
- `.github/dependabot.yml` defines dependency-update monitoring for npm and GitHub Actions.
- `src/templates/github-action.ts` owns generated GitHub Action template behavior.

## Permissions

Permissions are owned by the checked-in GitHub workflow and action template definitions.

This doc does not add permissions beyond those source files.

The Scorecard workflow keeps workflow-level token permissions read-only and grants `id-token: write` only to the Scorecard job.

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
- Decision (2026-06-26): Project-readiness checks use standard GitHub-native scanners before custom readiness badges or claims.
  - CodeQL default setup covers code scanning without a checked-in advanced workflow.
  - OpenSSF Scorecard covers external repository-health/security heuristics.
  - Dependabot covers dependency-update monitoring.

## Rationale

Release automation is documented as operations truth because failures, permissions, and rollback are repository mechanics rather than product capability promises.

## Non-Goals

- This doc does not define package versioning policy.
- This doc does not own npm publishing credentials or external registry behavior.

## Maintenance Notes

Update when CI triggers, release prerequisites, publish steps, Pages deployment steps, readiness scans, dependency-update monitoring, or action templates change.

## Source References

- ../../../../.github/workflows/ci.yml
- ../../../../.github/workflows/pages.yml
- ../../../../src/templates/github-action.ts
- ../../../../.github/workflows/scorecard.yml
- ../../../../.github/dependabot.yml
- ../../../../site/index.html
- `.github/workflows/**`
- `.github/dependabot.yml`
- `site/**`
- `src/templates/github-action.ts`
