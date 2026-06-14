---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-14
realizes:
  - docs/truthmark/product/capabilities/lane-separated-truth.md
---

# Repository Intelligence

## Purpose

This doc owns derived repository-intelligence artifacts used by agents and CLI output.

## Scope

It covers RepoIndex, RouteMap, ImpactSet, ContextPack, evidence validation, freshness, and WorkflowState behavior.

## Current Implementation Behavior

RepoIndex and RouteMap are derived from the active checkout and preserve route lane and relationship metadata. RepoIndex derives truth-doc lane and doc type from `truth_kind` when canonical truth docs omit explicit `truth_lane` and `doc_type` frontmatter. These artifacts guide routing and verification but do not override source files, route files, truth docs, or workflow write boundaries.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Repository intelligence is derived context, not hidden memory or off-repo authority.

## Maintenance Notes

Update when index, route-map, impact, context, evidence, freshness, or workflow-state output changes.

## Source References

- ../../../../src/repo-index/build.ts
- ../../../../src/repo-index/file-tree.ts
- ../../../../src/repo-index/route-map.ts
- ../../../../src/repo-index/types.ts
- ../../../../src/impact/build.ts
- ../../../../src/context-pack/build.ts
- `src/repo-index/build.ts`
- `src/repo-index/file-tree.ts`
- `src/repo-index/route-map.ts`
- `src/repo-index/types.ts`
- `src/impact/build.ts`
- `src/context-pack/build.ts`
