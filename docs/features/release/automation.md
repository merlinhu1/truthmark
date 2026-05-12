---
status: active
doc_type: feature
last_reviewed: 2026-05-13
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

## Current Behavior

- The `CI` workflow runs on pushes to `main` and on every pull request.
- The `verify` job checks out the repository, installs Node 24 with npm caching, runs `npm ci`, then runs `npm run check` and `npm run package:check`.
- The `Publish` workflow runs when a GitHub release is published.
- The `publish` job checks out the repository, installs Node 24 with the npm registry configured, runs `npm ci`, runs `npm run release:check`, and then runs `npm publish`.

## Core Rules

- Pull request and main-branch automation must verify linting, types, tests, build output, and package-file integrity through the existing npm scripts.
- Publish automation must re-run the full release verification before publishing.
- Publishing is triggered from a GitHub release event, not from branch pushes alone.

## Flows And States

- Change validation flow: push or pull request -> `CI` workflow -> `verify` job -> `npm run check` and `npm run package:check`.
- Release flow: published GitHub release -> `Publish` workflow -> `publish` job -> `npm run release:check` -> `npm publish`.

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
