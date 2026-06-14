---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-14
source_of_truth:
  - ../../../../src/config/schema.ts
  - ../../../../src/config/defaults.ts
  - ../../../../src/config/load.ts
  - ../../../../src/routing/areas.ts
  - ../../../../src/output/diagnostic.ts
realizes:
  - docs/truthmark/product/capabilities/lane-separated-truth.md
---

# Config, Route, And Check Contracts

## Purpose

This doc owns machine-facing contracts for Truthmark config, lane-aware route metadata, diagnostics, and command envelopes.

## Scope

It covers config normalization, route `truth_documents` metadata, diagnostic categories, and JSON result shape.

## Current Implementation Behavior

Default config does not expose configurable truth lane roots. Product truth is fixed at `product/` and engineering truth is fixed at `engineering/` under `truthmark.workspace`. Route entries can declare `kind`, optional `lane`, `realized_by`, `realizes`, and `depends_on`.

## Contract Surface

- `.truthmark/config.yml`
- `docs/truthmark/routes/areas.md`
- `docs/truthmark/routes/areas/**/*.md`
- `CommandResult` JSON envelopes

## Inputs

- Config YAML with version `2`
- Fenced route YAML with `truth_documents`
- Markdown frontmatter fields such as `truth_kind`, `realized_by`, and `realizes`

## Outputs

- Normalized config paths for product and engineering truth roots
- RouteMap and RepoIndex data preserving lane, derived doc type, and relationship metadata
- Diagnostics including `lane-shape`, `lane-drift`, and `traceability`

## Compatibility Rules

The target model is lane-first and does not use `docs/truthmark/truth` as the canonical scaffold target.

## Source Evidence

- `src/config/schema.ts`
- `src/routing/areas.ts`
- `src/repo-index/types.ts`
- `src/output/diagnostic.ts`

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Authored relationship fields use explicit `realized_by`, `realizes`, and `depends_on` fields.
- Decision (2026-06-14): Canonical truth docs use `truth_kind` as the frontmatter source for truth lane and doc type; `truth_lane` remains accepted only as an optional consistency check.

## Maintenance Notes

Update when config fields, route metadata, diagnostics, or route/index output schemas change.
