---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-05-16
source_of_truth:
  - ../../../../src/impact/build.ts
  - ../../../../src/impact/git-diff.ts
  - ../../../../src/repo-index/build.ts
---

# ImpactSet

## Purpose

This document protects ImpactSet v0 as the derived mapping from Git changes to routed truth ownership, affected docs, affected tests, and public-symbol impact.

## Scope

This document owns ImpactSet v0 behavior. ImpactSet maps Git changes to Truthmark routes, truth docs, owning areas, related tests, and public symbol changes.

## Current Behavior

`truthmark impact --base <ref> --json` compares the active checkout to the supplied base ref and returns `schemaVersion: impact-set/v0`. The command combines Git diff data with RepoIndex and RouteMap data.

ImpactSet reports changed files, affected routes, affected truth docs, affected tests, changed public symbols, and diagnostics. It includes staged, unstaged, and untracked worktree changes so local agent work can be evaluated before commit.

## Core Rules

- Changed functional code is mapped through `Code surface` entries in Truthmark route files.
- Changed routed truth docs are mapped back to their owning routes and included in `affectedTruthDocs`.
- Renamed files preserve `previousPath`, map both old and new paths to route ownership, and report moved exports as removed from the old path and added at the new path.
- Changed test files are reported as affected tests instead of missing truth-route diagnostics.
- Related tests are selected from direct imports, basename hints, and package-level test path conventions.
- Public symbol changes are computed from JavaScript/TypeScript exports in v0.
- Missing or invalid base refs produce an `impact` error diagnostic instead of silently returning an empty comparison.
- Changed public symbols produce review diagnostics when no affected truth doc exists or when affected truth docs exist but were not changed in the impact set.
- ImpactSet is derived. It does not grant write permission and does not replace route ownership.

## Flows And States

`truthmark impact --base <ref> --json` compares the active checkout to the supplied base ref, combines Git diff data with RepoIndex and RouteMap data, and reports changed files, affected routes, affected truth docs, affected tests, changed public symbols, and diagnostics. It includes staged, unstaged, and untracked worktree changes so local agent work can be evaluated before commit.

## Contracts

`truthmark impact --base <ref> --json` returns the shared command envelope with `schemaVersion: impact-set/v0` data. Renames preserve `previousPath`, and changed test files are reported as affected tests rather than missing truth-route diagnostics.

## Product Decisions

- Decision (2026-05-16): ImpactSet v0 uses Git plus route ownership as the review boundary instead of a background cache.
- Decision (2026-05-16): Public API impact starts with JavaScript and TypeScript exports because this repository's first implementation stack is TypeScript.

## Rationale

ImpactSet gives Truth Sync and CI a stable, reviewable way to explain what code changed and which truth surfaces are affected without making a model decide ownership.

## Non-Goals

- ImpactSet is not a background cache.
- ImpactSet does not replace route files as ownership authority.
- ImpactSet does not override the current checkout when an artifact conflicts with local files.

## Maintenance Notes

ImpactSet requires the Truthmark CLI or an equivalent local runner. If unavailable, agents must inspect Git changes and route ownership directly. The workflow may proceed manually, but completion reports must say ImpactSet was not generated.

If an ImpactSet conflicts with the current checkout, agents must trust the checkout and rerun or ignore the artifact.

Primary implementation files:

- `src/impact/build.ts`
- `src/impact/git-diff.ts`
- `src/repo-index/build.ts`

Update this doc when the command output, schema version, derived inputs, fallback behavior, or workflow relationship changes.
