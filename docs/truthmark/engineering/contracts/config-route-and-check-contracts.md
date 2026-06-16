---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-15
---

# Config, Route, And Check Contracts

## Purpose

This doc owns machine-facing contracts for Truthmark config, lane-aware route metadata, diagnostics, and command envelopes.

## Scope

It covers config normalization, route `truth_documents` metadata, diagnostic categories, public CLI surfaces, and JSON result shape.

## Current Implementation Behavior

Default config exposes `truthmark.workspace` and `truthmark.generated.portal.enabled`; it does not expose route layout, template layout, or truth lane roots as knobs. Routes are fixed at `<workspace>/routes/areas.md` and `<workspace>/routes/areas/`, the default area is the product invariant `repository`, max delegation depth is the product invariant `1`, templates are fixed at `<workspace>/templates`, product truth is fixed at `<workspace>/product`, and engineering truth is fixed at `<workspace>/engineering`. User-provided `truthmark.routes`, `truthmark.templates`, or `truthmark.truth` blocks are rejected as unsupported additional properties. Route entries can declare `kind`, optional `lane`, `realized_by`, `realizes`, and `depends_on`; product `realized_by` and engineering `realizes` links are valid when their targets exist and point to the opposite lane, without requiring reciprocal declarations. Duplicate route entries for the same path, kind, and lane merge relationship metadata for `realized_by`, `realizes`, and `depends_on` by unique sorted set before validation and RouteMap output; conflicting duplicate kinds or lanes are reported as area-index errors. The public ContextPack command surface is retired. Agents use `truthmark workflow status --workflow <workflow> [--base <ref>] --json` for workflow applicability, write boundaries, target truth docs, checks, helper commands, diagnostics, next steps, and compact affected-test guidance, and `truthmark impact --base <ref> --json` for branch-diff routing. These replacement JSON outputs emit paths, metadata, diagnostics, and command arrays only; they do not embed source-file or truth-doc body contents.

## Contract Surface

- `.truthmark/config.yml`
- `docs/truthmark/routes/areas.md`
- `docs/truthmark/routes/areas/**/*.md`
- `CommandResult` JSON envelopes
- `truthmark workflow status --workflow <workflow> [--base <ref>] --json`
- `truthmark impact --base <ref> --json`

## Inputs

- Config YAML with version `2`
- Fenced route YAML with `truth_documents`
- Markdown frontmatter fields such as `truth_kind`

## Outputs

- Normalized config paths for fixed route, template, product truth, engineering truth, and Portal locations derived from `truthmark.workspace`
- RouteMap data preserving lane and relationship metadata, plus RepoIndex data preserving derived doc type and lane metadata
- WorkflowState data preserving workflow write boundaries and compact test guidance without file contents
- ImpactSet data preserving branch-diff routing and affected tests without file contents
- Diagnostics including `lane-shape`, `lane-drift`, and `traceability`

## Compatibility Rules

The target model is lane-first and does not use `docs/truthmark/truth` as the canonical scaffold target.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Authored relationship fields use explicit `realized_by`, `realizes`, and `depends_on` fields in route YAML, not doc frontmatter.
- Decision (2026-06-14): Canonical truth docs use `truth_kind` as the frontmatter source for truth lane and doc type; `truth_lane` remains accepted only as an optional consistency check.
- Decision (2026-06-14): Route layout, template layout, default area `repository`, and max delegation depth `1` are product invariants derived from `truthmark.workspace`, not user config fields.
- Decision (2026-06-15): Duplicate route relationship metadata is additive for matching path, kind, and lane entries; kind and lane conflicts remain hard validation errors.
- Decision (2026-06-15): Route relationships are route-local metadata; checks validate relationship targets for existence and lane compatibility without requiring a reciprocal global graph edge.
- Decision (2026-06-15): ContextPack is folded into workflow status and impact; the standalone `truthmark context` command is hard-removed from the public CLI.

## Maintenance Notes

Update when config fields, route metadata, diagnostics, route/index output schemas, workflow status output, or impact output changes.

## Source References

- ../../../../src/config/schema.ts
- ../../../../src/config/defaults.ts
- ../../../../src/config/load.ts
- ../../../../src/routing/areas.ts
- ../../../../src/output/diagnostic.ts
- `src/config/schema.ts`
- `src/routing/areas.ts`
- `src/repo-index/types.ts`
- `src/output/diagnostic.ts`
