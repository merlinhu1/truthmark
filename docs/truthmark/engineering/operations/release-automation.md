---
status: active
truth_kind: engineering-operations
last_reviewed: 2026-06-14
source_of_truth:
  - ../../../../.github/workflows/ci.yml
  - ../../../../src/templates/github-action.ts
---

# Release Automation

## Purpose

This doc owns current release and CI automation behavior.

## Scope

It covers GitHub workflow triggers, verification steps, and generated GitHub Action template behavior.

## Current Implementation Behavior

Release and CI behavior is implemented through checked-in GitHub workflow files and the GitHub Action template renderer.

## Operational Surface

- GitHub Actions workflows under `.github/workflows/**`
- GitHub Action template rendering in `src/templates/github-action.ts`

## Runtime Topology

Automation runs in GitHub Actions. There is no Truthmark daemon or persistent runtime service.

## Source Evidence

- `.github/workflows/**`
- `src/templates/github-action.ts`

## Product Truth Links

- None.

## Engineering Decisions

- Decision (2026-06-14): Release automation truth is engineering/operational truth because it describes current repository mechanics.

## Maintenance Notes

Update when CI triggers, release prerequisites, publish steps, or action templates change.
