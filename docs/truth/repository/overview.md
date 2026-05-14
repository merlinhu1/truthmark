---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-05-14
source_of_truth:
  - ../../truthmark/areas/init-and-scaffold.md
  - ../../../src/init/init.ts
  - ../../../src/templates/init-files.ts
---

# Repository Overview

## Purpose

This doc owns the default bounded behavior leaf that `truthmark init` scaffolds for repositories using the default `repository` area.

## Scope

This doc covers the seed `docs/truth/repository/overview.md` behavior only. Broader init flow, routing files, and generated workflow surfaces stay in the main scaffold and workflow docs.

## Current Behavior

- `truthmark init` creates `docs/truth/repository/overview.md` as the default bounded behavior truth doc for the configured default area.
- The scaffold pairs this leaf doc with a sibling `README.md` index under `docs/truth/repository/`.
- The generated content is starter truth. Repositories are expected to replace it with repository-specific current behavior as their mapped code surface evolves.

## Core Rules

- Truth `README.md` files are indexes, not current-behavior targets.
- The default scaffold keeps behavior truth in bounded leaf docs under the configured truth root.
- The seeded repository leaf stays intentionally small so later Truth Sync runs can replace it instead of appending to an index file.

## Flows And States

- `truthmark init` creates the truth root index, the default area index, and this bounded leaf when those files are missing.
- Later repository work may update or replace the seeded leaf doc without changing the scaffold contract.

## Contracts

- The default leaf path is `docs/truth/<default-area>/overview.md` when the configured truth root is `docs/truth` and the default area is `repository`.
- The editable content standard for this leaf comes from `docs/templates/behavior-doc.md`.

## Product Decisions

- Decision (2026-05-14): The default scaffold seeds a bounded behavior truth doc instead of placing current behavior in a truth `README.md`.

## Rationale

Bounded seed docs give new repositories an immediately routeable truth target while keeping index files stable and small.

## Non-Goals

- This doc does not own the full `truthmark init` workflow.
- This doc does not define repository-specific behavior after downstream teams rewrite the seed content.

## Maintenance Notes

- Keep this doc aligned with `docs/templates/behavior-doc.md` when the behavior-doc standard changes.
- Update this doc when the default area leaf path or seeded content rules change.
