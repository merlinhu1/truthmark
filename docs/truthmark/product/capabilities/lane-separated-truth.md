---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-14
realized_by:
  - docs/truthmark/engineering/contracts/config-route-and-check-contracts.md
  - docs/truthmark/engineering/behaviors/check-diagnostics.md
---

# Lane-Separated Truth

## Capability Promise

Truthmark keeps product truth and engineering truth separate, first-class, and cross-linked.

## Users And Value

Maintainers can review product promises and implementation realization without either lane becoming a derived summary of the other.

## Capability Scope

Product truth belongs under `docs/truthmark/product`; engineering truth belongs under `docs/truthmark/engineering`. Downstream product truth uses `product-capability` only. Product boundary, scope, adjacent-system, and non-goal guidance lives inside capability docs instead of a separate downstream boundary kind. Relationships between lanes are traceability edges, not content inheritance.

## Current Product Behavior

Route metadata supports explicit `lane`, `realized_by`, `realizes`, and `depends_on` fields for traceability. Product-path kind inference returns `product-capability`, and init scaffolds `product-capability.md` without scaffolding a downstream `product-boundary` template.

## Acceptance Criteria

- New scaffold defaults do not target `docs/truthmark/truth`.
- Product truth defaults, path inference, and templates use `product-capability` only.
- `product-boundary` is rejected as downstream truth kind metadata instead of being listed as supported.
- RouteMap and RepoIndex preserve lane and relationship metadata.
- Check diagnostics report lane shape, lane drift, and traceability.
- Missing product links for user-visible engineering docs remain review diagnostics.

## Product Decisions

- Decision (2026-06-14): Product docs may cite code directly as evidence for current product behavior, but detailed mechanics stay in engineering docs.
- Decision (2026-06-14): Missing product links for user-visible engineering docs are review diagnostics, not hard errors.
- Decision (2026-06-14): Downstream product truth supports `product-capability` only; product boundary guidance belongs inside capability scope, acceptance criteria, and non-goals.

## Engineering Realization Links

- `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md`
- `docs/truthmark/engineering/behaviors/check-diagnostics.md`

## Non-Goals

- No automated business correctness, priority, or desirability judgment.

## Source References

- ../../../../src/config/defaults.ts
- ../../../../src/routing/areas.ts
- ../../../../src/init/hierarchy.ts
- ../../../../src/templates/init-files.ts
