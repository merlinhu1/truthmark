---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-16
---

# Repository Intelligence

## Purpose

This doc owns checkout-derived repository-intelligence artifacts used by agents and CLI output.

## Scope

It covers RepoIndex, RouteMap, ImpactSet, evidence validation, freshness, and WorkflowState/action-context behavior.

## Current Implementation Behavior

RepoIndex and RouteMap are derived from the active checkout. They preserve repository metadata, discovered files, truth docs, test files, route lane metadata, and route-local relationship metadata. RouteMap emits duplicate truth document entries with the same path, kind, and lane as one relationship view whose `realized_by`, `realizes`, and `depends_on` metadata is merged by unique sorted set. RepoIndex derives truth-doc lane and doc type from `truth_kind` when canonical truth docs omit explicit `truth_lane` and `doc_type` frontmatter.

Repository intelligence is language-neutral workflow context, not a language-semantic code index. Truthmark does not maintain import graphs, export lists, public-symbol tables, or language-specific symbol validation. Agents inspect source code directly; these artifacts guide routing, context selection, verification planning, and write boundaries without overriding source files, route files, truth docs, or workflow write boundaries.

ImpactSet remains the branch-diff routing handoff for changed files, affected routes, affected truth docs, affected tests, and diagnostics. It derives affected routes from route code surfaces and truth-doc ownership, derives affected tests from changed test paths and path/name hints, and reports diagnostics for unmapped functional-code changes. It does not report TypeScript public-symbol changes or use TypeScript/JavaScript import parsing to infer affected tests.

WorkflowState is the workflow-scoped handoff for applicability, action context, write boundaries, target truth docs, helper validation commands, checks, compact affected-test guidance, diagnostics, next steps, and report sections. `truthmark-sync` includes `Sync Intent` in its report sections as a transient pre-write checklist, keeps affected truth docs in `targetTruthDocs` for review focus, and intentionally authorizes indexed canonical truth docs and truth routing files so Sync can correct stale repository truth beyond the initially affected route when evidence supports it. The standalone ContextPack handoff is retired; agents use workflow status plus impact instead. These outputs do not emit source-file or truth-doc body contents.

Evidence validation checks repository containment, referenced file or glob existence, line spans, and `sha256:` content hashes. Evidence `symbol` metadata, when present in an evidence YAML block, is non-normative metadata and is not validated through TypeScript-specific parsing.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Repository intelligence is derived context, not hidden memory or off-repo authority.
- Decision (2026-06-15): Repository intelligence is a language-neutral workflow helper, not a semantic code index; TypeScript-specific import/export/public-symbol analysis is not part of the public contract.
- Decision (2026-06-15): The standalone ContextPack handoff is retired; agents use `truthmark workflow status --workflow <workflow> [--base <ref>] --json` for optional workflow-scoped guidance and `truthmark impact --base <ref> --json` for branch-diff routing.
- Decision (2026-06-16): `workflow status` is status/debug/handoff only; Truthmark does not expose a `workflow instructions` command and generated workflows must remain usable from committed repository files without live CLI preflight.
- Decision (2026-06-16): Truth Sync write context is broad across indexed canonical truth docs and truth routing files; `targetTruthDocs` remains the affected-doc focus list, not the full write lease.
- Decision (2026-06-16): Sync Intent is a transient report-section checklist exposed through workflow/report surfaces and WorkflowState report sections; it is not repository-intelligence state or a persisted plan.

## Maintenance Notes

Update when index, route-map, impact, evidence, freshness, or workflow-state output changes.

## Source References

- ../../../../src/repo-index/build.ts
- ../../../../src/repo-index/file-tree.ts
- ../../../../src/repo-index/route-map.ts
- ../../../../src/repo-index/types.ts
- ../../../../src/impact/build.ts
- ../../../../src/impact/types.ts
- ../../../../src/evidence/validate.ts
- ../../../../src/workflow-state/build.ts
- `src/repo-index/build.ts`
- `src/repo-index/file-tree.ts`
- `src/repo-index/route-map.ts`
- `src/repo-index/types.ts`
- `src/impact/build.ts`
- `src/workflow-state/build.ts`
