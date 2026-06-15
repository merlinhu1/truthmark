---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-15
---

# Check Diagnostics

## Purpose

This doc owns the implementation behavior of Truthmark Check diagnostics.

## Scope

It covers route coverage, lane shape, lane drift, traceability, frontmatter, generated surfaces, and source evidence diagnostics.

## Current Implementation Behavior

`truthmark check` combines config, area routing, frontmatter, link, lane-shape, lane-drift, traceability, generated-surface, source-traceability, and freshness diagnostics. Missing product links for engineering behavior, workflow, and contract docs are review diagnostics only when the same routed area includes product truth evidence. Asymmetric cross-lane route metadata is an error: product `realized_by` links must be reciprocated by engineering `realizes` links, and engineering `realizes` links must be reciprocated by product `realized_by` links. Repeated route entries for the same truth document and kind are valid only when their `realized_by`, `realizes`, and `depends_on` metadata matches; divergent duplicate relationship metadata is an area-index error.

Frontmatter diagnostics reject relationship metadata fields `realized_by`, `realizes`, and `depends_on` when they appear in truth document frontmatter. Relationship authority stays in fenced route YAML entries.

Product truth doc structure validation enforces the `product-capability` shape. Product capability docs require capability sections for the capability promise, users and value, capability scope including boundary constraints and adjacent systems, current product behavior, acceptance criteria, product decisions, engineering realization links, and non-goals.

## Core Rules

- Product docs must live under the product truth root and use product kinds.
- Engineering docs must live under the engineering truth root and use engineering kinds.
- Product docs under `docs/truthmark/product/**` infer `product-capability` unless explicit route metadata says otherwise.
- Product capability docs do not satisfy product structure by using only boundary headings.
- Relationship metadata belongs in route YAML; truth document frontmatter must not declare `realized_by`, `realizes`, or `depends_on`.
- Traceability links must exist, point to the opposite lane, and be reciprocal when using `realized_by` or `realizes`.
- Duplicate route entries for the same path and kind must not disagree on `realized_by`, `realizes`, or `depends_on`.
- Check reports structure and evidence only; it does not judge product strategy.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Wrong-lane content is a lane-drift diagnostic; missing product links for engineering behavior, workflow, and contract docs are review diagnostics only when routed area evidence indicates product truth context.
- Decision (2026-06-14): Downstream injected/default product truth supports `product-capability` only; boundary material belongs inside capability scope, acceptance criteria, and non-goals.

## Maintenance Notes

Update when check categories, severity rules, lane audit behavior, or product kind section requirements change.

## Source References

- ../../../../src/checks/check.ts
- ../../../../src/checks/areas.ts
- ../../../../src/checks/decisions.ts
- ../../../../src/checks/frontmatter.ts
- ../../../../tests/checks/frontmatter.test.ts
- `src/checks/areas.ts`
- `src/checks/decisions.ts`
- `src/checks/frontmatter.ts`
- `tests/checks/frontmatter.test.ts`
- `src/output/diagnostic.ts`
