---
status: active
truth_kind: product-capability
last_reviewed: 2026-07-30
---

# Lane-Separated Truth

## Capability Promise

Truthmark keeps product truth and engineering truth separate, first-class, and cross-linked.

## Users And Value

Maintainers can review product promises and implementation realization without either lane becoming a derived summary of the other.

## Capability Scope

- Product truth belongs under `docs/truthmark/product`; engineering truth belongs under `docs/truthmark/engineering`.
- Downstream product truth uses `product-capability` only.
- Product boundary, scope, adjacent-system, and non-goal guidance lives inside capability docs instead of a separate downstream boundary kind.
- Relationships between lanes are traceability edges, not content inheritance.

## Current Product Behavior

- Route metadata supports explicit `lane`, `realized_by`, `realizes`, and `depends_on` fields for route-local traceability.
- Product-path kind inference returns `product-capability`, and init scaffolds `product-capability.md` as the product truth template.
- Routing coverage considers Git-visible functional code under any repository root. Tests, ignored paths, documentation, assets, and generated surfaces do not create unmapped-code findings.

## Acceptance Criteria

- New scaffolds use separate product and engineering truth roots under the configured workspace.
- Product truth defaults, path inference, and templates use `product-capability`.
- Product capability scope and non-goals carry product boundary guidance.
- RouteMap and RepoIndex preserve lane and relationship metadata.
- Check diagnostics report lane shape, lane drift, and route-local traceability.
- Missing product links for user-visible engineering docs remain review diagnostics.

## Product Decisions

- Decision (2026-06-14): Product docs may cite code directly as evidence for current product behavior, but detailed mechanics stay in engineering docs.
- Decision (2026-06-14): Missing product links for user-visible engineering docs are review diagnostics, not hard errors.
- Decision (2026-06-14): Downstream product truth supports `product-capability` only; product boundary guidance belongs inside capability scope, acceptance criteria, and non-goals.
- Decision (2026-06-15): Route `realized_by` and `realizes` relationships are local navigation metadata, not a single global doc graph.
  - Validation requires existing opposite-lane targets without requiring reciprocal declarations.
- Decision (2026-07-10): Repository-wide coverage follows Git-visible functional code across arbitrary roots while excluding non-functional and ignored surfaces.

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
