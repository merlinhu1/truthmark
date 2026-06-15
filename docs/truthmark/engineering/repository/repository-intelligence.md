---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-15
---

# Repository Intelligence

## Purpose

This doc owns checkout-derived repository-intelligence artifacts used by agents and CLI output.

## Scope

It covers RepoIndex, RouteMap, ImpactSet, evidence validation, freshness, ContextPack, and WorkflowState behavior.

## Current Implementation Behavior

RepoIndex and RouteMap are derived from the active checkout. They preserve repository metadata, discovered files, truth docs, test files, route lane metadata, and route-local relationship metadata. RouteMap emits duplicate truth document entries with the same path, kind, and lane as one relationship view whose `realized_by`, `realizes`, and `depends_on` metadata is merged by unique sorted set. RepoIndex derives truth-doc lane and doc type from `truth_kind` when canonical truth docs omit explicit `truth_lane` and `doc_type` frontmatter.

Repository intelligence is language-neutral workflow context, not a language-semantic code index. Truthmark does not maintain import graphs, export lists, public-symbol tables, or language-specific symbol validation. Agents inspect source code directly; these artifacts guide routing, context selection, verification planning, and write boundaries without overriding source files, route files, truth docs, or workflow write boundaries.

ImpactSet derives changed files from Git, affected routes from route code surfaces and truth-doc ownership, affected truth docs from affected routes, affected tests from changed test paths and path/name hints, and diagnostics for unmapped functional-code changes. It does not report TypeScript public-symbol changes or use TypeScript/JavaScript import parsing to infer affected tests.

Evidence validation checks repository containment, referenced file or glob existence, line spans, and `sha256:` content hashes. Evidence `symbol` metadata, when present in an evidence YAML block, is non-normative metadata and is not validated through TypeScript-specific parsing.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Repository intelligence is derived context, not hidden memory or off-repo authority.
- Decision (2026-06-15): Repository intelligence is a language-neutral workflow helper, not a semantic code index; TypeScript-specific import/export/public-symbol analysis is not part of the public contract.

## Maintenance Notes

Update when index, route-map, impact, context, evidence, freshness, or workflow-state output changes.

## Source References

- ../../../../src/repo-index/build.ts
- ../../../../src/repo-index/file-tree.ts
- ../../../../src/repo-index/route-map.ts
- ../../../../src/repo-index/types.ts
- ../../../../src/impact/build.ts
- ../../../../src/impact/types.ts
- ../../../../src/evidence/validate.ts
- ../../../../src/context-pack/build.ts
