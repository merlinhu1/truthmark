---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-14
---

# Repository Intelligence

## Purpose

This doc owns derived repository-intelligence artifacts used by agents and CLI output.

## Scope

It covers RepoIndex, RouteMap, ImpactSet, evidence validation, freshness, and WorkflowState/action-context behavior.

## Current Implementation Behavior

RepoIndex and RouteMap are derived from the active checkout and preserve route lane and relationship metadata. RouteMap emits duplicate truth document entries with the same path, kind, and lane as one relationship view whose `realized_by`, `realizes`, and `depends_on` metadata is merged by unique sorted set. RepoIndex derives truth-doc lane and doc type from `truth_kind` when canonical truth docs omit explicit `truth_lane` and `doc_type` frontmatter. ImpactSet remains the branch-diff routing handoff for changed files, affected routes, affected truth docs, affected tests, changed public symbols, and diagnostics. WorkflowState is the workflow-scoped handoff for applicability, action context, write boundaries, target truth docs, helper validation commands, checks, compact affected-test guidance, diagnostics, next steps, and report sections. These artifacts guide routing and verification but do not override source files, route files, truth docs, or workflow write boundaries, and they do not emit source-file or truth-doc body contents.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Repository intelligence is derived context, not hidden memory or off-repo authority.
- Decision (2026-06-15): The standalone ContextPack handoff is retired; agents use `truthmark workflow status --workflow <workflow> [--base <ref>] --json` for workflow-scoped guidance and `truthmark impact --base <ref> --json` for branch-diff routing.

## Maintenance Notes

Update when index, route-map, impact, evidence, freshness, or workflow-state output changes.

## Source References

- ../../../../src/repo-index/build.ts
- ../../../../src/repo-index/file-tree.ts
- ../../../../src/repo-index/route-map.ts
- ../../../../src/repo-index/types.ts
- ../../../../src/impact/build.ts
- ../../../../src/workflow-state/build.ts
- `src/repo-index/build.ts`
- `src/repo-index/file-tree.ts`
- `src/repo-index/route-map.ts`
- `src/repo-index/types.ts`
- `src/impact/build.ts`
- `src/workflow-state/build.ts`
