---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-05-16
source_of_truth:
  - ../../../src/context-pack/build.ts
  - ../../../src/context-pack/render.ts
  - ../../../src/impact/build.ts
---

# ContextPack

## Scope

This document owns ContextPack v0 behavior for Truth Sync, Truth Document, and Truth Realize workflows.

## Current Behavior

`truthmark context --workflow <workflow> [--base <ref>] --json` generates a bounded context artifact for a workflow. `--format markdown` renders a deterministic human-readable pack, and `--json --format markdown` includes the rendered Markdown in `data.markdown`. ContextPack rejects unsupported `--format` values with a `context-pack` error diagnostic. ContextPack includes route ownership, affected truth docs, selected source files, related tests, warnings, and allowed write paths.

ContextPack output includes `schemaVersion: context-pack/v0`. It is generated from the active checkout and, when a base ref is supplied, ImpactSet.

## Core Rules

- ContextPack is optional generated context and does not replace direct checkout inspection.
- ContextPack write paths restate workflow boundaries; they do not create new permissions.
- Truth Sync and Truth Document write paths include the route index and selected truth docs. Truth Realize write paths include the matched route code surfaces because Realize may write functional code but not truth docs or routing.
- Truth Realize without `--base` cannot infer matched code surfaces, so selected truth docs, source files, and `allowedWritePaths` are empty and ContextPack emits a review warning instead of widening to every route.
- Source files include changed files from ImpactSet when a base ref is supplied and `source_of_truth` references from selected truth docs. Glob references are expanded against the checkout.
- ContextPack-only text is not evidence. Generated docs must cite checkout files, route files, truth docs, tests, schemas, or explicit evidence blocks.
- If ContextPack conflicts with the current checkout, the checkout wins.

## Runtime Dependency Boundary

ContextPack requires the Truthmark CLI or an equivalent local runner. If unavailable, agents must follow the installed workflow manually by reading route files, truth docs, source files, and tests directly. Completion reports must say ContextPack was not generated.

## Product Decisions

- Decision (2026-05-16): ContextPack v0 is a bounded review artifact, not memory and not a source of authority.
- Decision (2026-05-16): No-CLI workflow execution remains supported, but with weaker automation and explicit reporting.

## Rationale

ContextPack makes agent context auditable without making hidden retrieval or stale generated artifacts authoritative. Keeping it derived prevents a fast path from changing ownership or write behavior.

## Primary Code Files

- `src/context-pack/build.ts`
- `src/context-pack/render.ts`
- `src/impact/build.ts`
