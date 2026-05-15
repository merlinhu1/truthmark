---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-14
source_of_truth:
  - ../../truthmark/areas/release-automation.md
  - ../../../.github/workflows/ci.yml
  - ../../../.github/workflows/publish.yml
---

# Release Automation

## Purpose

This doc owns the repository automation that verifies Truthmark changes in pull requests and publishes the package from GitHub releases.

## Scope

This doc covers the committed GitHub Actions workflows under `.github/workflows/`. It does not redefine the `truthmark` CLI contracts or the detailed behavior of `check`, `init`, or installed workflows.

## Triggers

- Pushes to `main`
- Pull requests
- Published GitHub releases

## Inputs

- The checked-out repository contents
- GitHub Actions event context for pushes, pull requests, and releases
- npm registry credentials and release-environment configuration for publishing

## Execution Model

Release automation runs through the committed GitHub Actions workflows under `.github/workflows/`. The `CI` workflow verifies repository changes, and the `Publish` workflow revalidates release state before publishing to npm.

The repository also ships `examples/github-actions/truthmark-impact.yml` as a consumer example. It is not a release workflow for this repository. The example shows a non-blocking PR mode that comments with `truthmark impact --base` and `truthmark check --base` results, uploads the JSON reports, and a blocking mode controlled by `TRUTHMARK_BLOCKING`.

## Steps

- The `CI` workflow runs on pushes to `main` and on every pull request.
- The `verify` job checks out the repository, installs Node 24 with npm caching, runs `npm ci`, then runs `npm run check` and `npm run package:check`.
- The `Publish` workflow runs when a GitHub release is published.
- The `publish` job checks out the repository, installs Node 24 with the npm registry configured, runs `npm ci`, runs `npm run release:check`, and then runs `npm publish`.

## State, Retry, And Failure Behavior

- Failed verification or release-check steps stop the current job and prevent later publish steps from running.
- Publishing occurs only for the GitHub release event path; branch pushes and pull requests do not publish.
- GitHub Actions reruns remain host-managed; Truthmark owns the committed workflow definitions, not GitHub's execution controls.
- The example ImpactSet workflow is intentionally opt-in and consumer-copied; it does not run unless a repository installs it.

## Outputs

- CI verification results for pushes and pull requests
- npm publication after a successful release-triggered publish job

## Core Rules

- Pull request and main-branch automation must verify linting, types, tests, build output, and package-file integrity through the existing npm scripts.
- Publish automation must re-run the full release verification before publishing.
- Publishing is triggered from a GitHub release event, not from branch pushes alone.

## Contracts

- Both workflows currently run on `ubuntu-latest`.
- Both workflows install Node 24 through `actions/setup-node@v4`.
- The publish workflow requires npm registry access through the configured GitHub Actions environment.

## Product Decisions

- Decision (2026-05-13): Repository automation stays script-driven and reuses committed npm verification commands instead of duplicating verification logic inline in GitHub Actions.

## Rationale

Keeping workflow steps thin makes repository automation follow the same verification contract developers run locally. That reduces drift between local validation, CI validation, and release publishing.

## Non-Goals

- This doc does not own release-note authoring or GitHub release drafting policy.
- This doc does not define npm package contents beyond invoking the existing package checks.

## Maintenance Notes

- Update this doc when workflow triggers, Node versions, or verification commands change.
- Keep this doc aligned with `package.json` scripts used by the workflows.
