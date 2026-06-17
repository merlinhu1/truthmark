---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-17
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

WorkflowState is the workflow-scoped advisory handoff for helper readiness, a workflow card, write-boundary suggestions, target truth docs, optional helper commands, review checklist, compact affected-test guidance, diagnostics, next steps, and report sections. The advisory card presents affected files, likely route owners, suggested truth docs, open questions, and skipped optional-helper status so helper output remains review material rather than repository authority. Workflow applicability uses context-shaped states such as `ready`, `needs_manual_review`, and `needs_routing_review`; diagnostics or missing route ownership produce open questions and manual handoff guidance instead of making the CLI the arbiter. `truthmark-sync` includes `Sync Intent` in its report sections as a transient pre-write checklist and keeps affected truth docs in `targetTruthDocs` for review focus. Sync action context separates `primaryTruthDocs`, `candidateStaleTruthDocs`, and `routeFiles`: agents start with impacted route owners, while indexed canonical truth docs outside the impact set remain candidate stale-truth repair targets that require checkout evidence and a recorded reason before being touched. The standalone ContextPack handoff is retired; agents use workflow status plus impact as optional guidance and continue with direct checkout inspection when helpers are skipped or unavailable. These outputs do not emit source-file or truth-doc body contents.

Evidence validation checks repository containment, referenced file or glob existence, line spans, and `sha256:` content hashes. Evidence `symbol` metadata, when present in an evidence YAML block, is non-normative metadata and is not validated through TypeScript-specific parsing.

Generated-surface diagnostics are checkout-derived repository intelligence for the installed workflow runtime. `truthmark check` compares rendered generated surfaces with committed files and reports missing or stale generated host-native skill package files so skill-directory resources stay colocated with `SKILL.md`.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Repository intelligence is derived context, not hidden memory or off-repo authority.
- Decision (2026-06-15): Repository intelligence is a language-neutral workflow helper, not a semantic code index; TypeScript-specific import/export/public-symbol analysis is not part of the public contract.
- Decision (2026-06-15): The standalone ContextPack handoff is retired; agents use `truthmark workflow status --workflow <workflow> [--base <ref>] --json` for optional workflow-scoped guidance and `truthmark impact --base <ref> --json` for branch-diff routing.
- Decision (2026-06-16): `workflow status` is status/debug/handoff only; Truthmark does not expose a `workflow instructions` command and generated workflows must remain usable from committed repository files without live CLI preflight.
- Decision (2026-06-17): WorkflowState presents optional helper output as an advisory workflow card with affected files, likely route owners, suggested truth docs, open questions, skipped helper status, `reviewChecklist`, and `evidencePrompts`; it does not expose retired enforcement-shaped names such as `checks.required`, the old gate alias, or `requiredEvidence`.
- Decision (2026-06-16): Sync Intent is a transient report-section checklist exposed through workflow/report surfaces and WorkflowState report sections; it is not repository-intelligence state or a persisted plan.
- Decision (2026-06-17): Generated-surface freshness includes host-native package diagnostics; these diagnostics are review output and do not add hooks, live services, duplicate workflow packages, or mandatory workflow preflight execution.

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
- ../../../../src/workflow-state/action-context.ts
- ../../../../src/workflow-state/build.ts
- ../../../../src/workflow-state/types.ts
- ../../../../src/checks/generated-surfaces.ts
- ../../../../tests/workflow-state/build.test.ts
- `src/repo-index/build.ts`
- `src/repo-index/file-tree.ts`
- `src/repo-index/route-map.ts`
- `src/repo-index/types.ts`
- `src/impact/build.ts`
- `src/workflow-state/build.ts`
