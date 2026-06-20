---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-20
---

# Check Diagnostics

## Purpose

This doc owns the implementation behavior of Truthmark Check diagnostics.

## Scope

It covers route coverage, lane shape, lane drift, traceability, frontmatter, generated surfaces, and source evidence diagnostics.

## Current Implementation Behavior

`truthmark check` combines config, area routing, frontmatter, link, lane-shape, lane-drift, traceability, generated-surface, source-traceability, and freshness diagnostics. Missing product links for engineering behavior, workflow, and contract docs are review diagnostics only when the same routed area includes product truth evidence. Cross-lane route metadata is route-local: product `realized_by` links and engineering `realizes` links must target existing opposite-lane truth docs, but they do not have to be reciprocated by the target entry. Repeated route entries for the same truth document, kind, and lane merge their `realized_by`, `realizes`, and `depends_on` metadata before traceability validation; conflicting duplicate kinds or lanes are area-index errors.

Frontmatter diagnostics reject relationship metadata fields `realized_by`, `realizes`, and `depends_on` when they appear in truth document frontmatter. Relationship authority stays in fenced route YAML entries.

Product truth doc structure validation enforces the `product-capability` shape. Product capability docs require capability sections for the capability promise, users and value, capability scope including boundary constraints and adjacent systems, current product behavior, acceptance criteria, product decisions, engineering realization links, and non-goals.

## Core Rules

- Product docs must live under the product truth root and use product kinds.
- Engineering docs must live under the engineering truth root and use engineering kinds.
- Product docs under `docs/truthmark/product/**` infer `product-capability` unless explicit route metadata says otherwise.
- Product capability docs do not satisfy product structure by using only boundary headings.
- Relationship metadata belongs in route YAML; truth document frontmatter must not declare `realized_by`, `realizes`, or `depends_on`.
- Traceability links must exist and point to the opposite lane; reciprocal `realized_by` and `realizes` metadata is allowed but not required.
- Duplicate route entries for the same path, kind, and lane merge `realized_by`, `realizes`, and `depends_on` by unique sorted set.
- Check reports structure and evidence only; it does not judge product strategy.

## Flows And States

- Check loads config and routed truth docs from the active checkout.
- It runs structural, generated-surface, routing, traceability, and truth-doc checks.
- It reports diagnostics and scorecard dimensions without mutating files.

## Contracts

- Diagnostic names, severities, and JSON shape are owned by contract truth.
- Route relationship validation is described in `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md`.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Wrong-lane content is a lane-drift diagnostic; missing product links for engineering behavior, workflow, and contract docs are review diagnostics only when routed area evidence indicates product truth context.
- Decision (2026-06-14): Downstream injected/default product truth supports `product-capability` only; boundary material belongs inside capability scope, acceptance criteria, and non-goals.
- Decision (2026-06-15): Duplicate route entries with the same path, kind, and lane are an additive relationship model; divergent relationship arrays merge instead of erroring so area-local route entries do not have to repeat the full relationship closure.
- Decision (2026-06-15): `realized_by` and `realizes` route metadata is route-local navigation metadata, not a canonical global graph, so check validates target existence and lane compatibility without requiring reciprocal edges.

## Rationale

Check keeps diagnostics local to repository truth and route metadata so agents can repair docs without treating Truthmark as a hidden graph database.

## Non-Goals

- Check does not execute workflow agents.
- Check does not rewrite truth docs or route files.
- Check does not judge product strategy beyond structure and traceability rules.

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
