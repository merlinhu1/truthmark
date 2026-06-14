---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-14
realizes:
  - docs/truthmark/product/capabilities/lane-separated-truth.md
---

# Check Diagnostics

## Purpose

This doc owns the implementation behavior of Truthmark Check diagnostics.

## Scope

It covers route coverage, lane shape, lane drift, traceability, frontmatter, generated surfaces, and source evidence diagnostics.

## Current Implementation Behavior

`truthmark check` combines config, area routing, frontmatter, link, lane-shape, lane-drift, traceability, generated-surface, source-traceability, and freshness diagnostics. Missing product links for user-visible engineering docs are review diagnostics.

Product truth doc structure validation enforces the `product-capability` shape. Product capability docs require capability sections for the capability promise, users and value, capability scope including boundary constraints and adjacent systems, current product behavior, acceptance criteria, product decisions, engineering realization links, and non-goals.

## Core Rules

- Product docs must live under the product truth root and use product kinds.
- Engineering docs must live under the engineering truth root and use engineering kinds.
- Product docs under `docs/truthmark/product/**` infer `product-capability` unless explicit route metadata says otherwise.
- Product capability docs do not satisfy product structure by using only boundary headings.
- Traceability links must exist and point to the opposite lane when using `realized_by` or `realizes`.
- Check reports structure and evidence only; it does not judge product strategy.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Wrong-lane content is a lane-drift diagnostic; missing product links for user-visible engineering docs are review diagnostics.
- Decision (2026-06-14): Downstream injected/default product truth supports `product-capability` only; boundary material belongs inside capability scope, acceptance criteria, and non-goals.

## Maintenance Notes

Update when check categories, severity rules, lane audit behavior, or product kind section requirements change.

## Source References

- ../../../../src/checks/check.ts
- ../../../../src/checks/areas.ts
- ../../../../src/checks/decisions.ts
- ../../../../src/checks/frontmatter.ts
- `src/checks/areas.ts`
- `src/checks/decisions.ts`
- `src/checks/frontmatter.ts`
- `src/output/diagnostic.ts`
