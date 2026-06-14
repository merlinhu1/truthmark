---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-14
source_of_truth:
  - ../../../../src/init/hierarchy.ts
  - ../../../../src/templates/init-files.ts
  - ../../../../src/config/defaults.ts
realizes:
  - docs/truthmark/product/capabilities/lane-separated-truth.md
---

# Init And Scaffold

## Purpose

This doc owns current scaffold behavior for Truthmark hierarchy, templates, and default route files.

## Scope

It covers config defaults, lane root creation, template files, and starter route metadata.

## Current Implementation Behavior

Defaults scaffold product truth under `docs/truthmark/product` and engineering truth under `docs/truthmark/engineering`. Editable truth templates are installed under `docs/truthmark/templates` with filenames that match `truth_kind` values directly: `product-capability.md`, `engineering-behavior.md`, `engineering-contract.md`, `engineering-architecture.md`, `engineering-workflow.md`, `engineering-operations.md`, and `engineering-test-behavior.md`. Generated truth-doc frontmatter includes `truth_kind` and does not include `doc_type` or `truth_lane`.

Init reads the default seeded behavior leaf from `engineering-behavior.md`. Downstream product truth uses the `product-capability` template only. Capability docs own a single user-visible capability promise, users/value, scope including boundary constraints and adjacent systems, current product behavior, acceptance criteria, decisions, realization links, and non-goals.

## Source Evidence

- `src/config/defaults.ts`
- `src/init/hierarchy.ts`
- `src/templates/init-files.ts`

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): New scaffold targets do not create `docs/truthmark/truth` as the canonical target root.
- Decision (2026-06-14): Editable template filenames match `truth_kind` values directly so generated docs do not point agents at legacy `*-doc.md` names.

## Maintenance Notes

Update when init writes new files, changes default paths, changes template filenames, or changes template shape.
