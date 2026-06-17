---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-17
---

# Init And Scaffold

## Purpose

This doc owns current scaffold behavior for Truthmark hierarchy, templates, and default route files.

## Scope

It covers config defaults, lane root creation, template files, and starter route metadata.

## Current Implementation Behavior

Defaults derive all scaffold paths from `truthmark.workspace`. Routes are fixed at `<workspace>/routes/areas.md` and `<workspace>/routes/areas/`; the default scaffolded route area is `repository`; max route delegation depth is `1`; product truth is fixed at `<workspace>/product`; engineering truth is fixed at `<workspace>/engineering`; editable truth templates are fixed at `<workspace>/templates`. Template filenames match `truth_kind` values directly: `product-capability.md`, `engineering-behavior.md`, `engineering-contract.md`, `engineering-architecture.md`, `engineering-workflow.md`, `engineering-operations.md`, and `engineering-test-behavior.md`. Generated truth-doc frontmatter includes `truth_kind` and does not include `doc_type` or `truth_lane`.

Init seeds the broad default `repository` route as provisional bootstrap routing, not as normal behavior ownership. The route still maps `src/**` so a fresh repository is routeable, but it points at `engineering/repository/bootstrap-routing.md` as an `engineering-workflow` handoff that tells agents to run Truth Structure before normal Truth Sync when real code touches only the broad default route. Init does not create `engineering/repository/overview.md` from `engineering-behavior.md`; behavior truth should be created in bounded areas after ownership is known. Downstream product truth uses the `product-capability` template only. Capability docs own a single user-visible capability promise, users/value, scope including boundary constraints and adjacent systems, current product behavior, acceptance criteria, decisions, realization links, and non-goals.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): New scaffold targets do not create `docs/truthmark/truth` as the canonical target root.
- Decision (2026-06-14): Editable template filenames match `truth_kind` values directly so generated docs do not point agents at legacy `*-doc.md` names.
- Decision (2026-06-14): Init scaffolds routes, templates, product truth, and engineering truth at fixed workspace-derived paths rather than accepting route or template roots from config.
- Decision (2026-06-17): The default broad `repository` route is provisional bootstrap state; init creates a compact `bootstrap-routing.md` workflow handoff instead of a catch-all behavior overview so agents run Truth Structure before normal Sync on real touched code.

## Maintenance Notes

Update when init writes new files, changes default paths, changes template filenames, or changes template shape.

## Source References

- ../../../../src/config/defaults.ts
- ../../../../src/init/hierarchy.ts
- ../../../../src/templates/init-files.ts
- ../../../../tests/init/init.test.ts
