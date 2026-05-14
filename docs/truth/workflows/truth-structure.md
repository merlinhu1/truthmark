---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-15
source_of_truth:
  - ../../../src/agents/truth-structure.ts
  - ../../../src/agents/shared.ts
  - ../../../src/routing/**
---

# Truth Structure Workflow

## Purpose

Truth Structure designs or repairs repository truth topology.

## Scope

Truth Structure owns area routing, child route-file structure, ownership splits, and starter truth-doc placement when topology is missing, stale, broad, overloaded, catch-all, unrouteable, or explicitly requested.

## Triggers

- explicit user invocation
- handoff from Truth Sync or Truth Document when routing or truth ownership is unsafe
- handoff from Truth Check when audit findings require topology repair

## Inputs

- repository layout
- `.truthmark/config.yml`
- root and child route files
- current canonical docs
- representative implementation boundaries and tests

## Execution Model

Truth Structure inspects the checkout directly and defines areas by product or behavior ownership, not mechanical directory mirroring.

## Current Behavior

When topology pressure exists, Truth Structure repairs structure before creating or extending truth docs.

Topology pressure includes broad code mappings, overloaded child route files, multiple unrelated controllers or bounded contexts in one area, mixed-owner truth docs, too many direct truth docs in one folder, catch-all routing, or changed code that cannot map to a specific behavior doc.

Truth Structure splits broad, overloaded, catch-all, or mixed-owner areas into behavior-owned route files and bounded leaf truth docs when safe. It updates routing so future Truth Sync can target small docs. If a split is unsafe or ambiguous, it blocks with manual-review files.

Before splitting or restructuring truth docs, Truth Structure inventories Product Decisions and Rationale in every source doc. It moves each current entry into the bounded owner doc it governs, removes or narrows entries only with checkout evidence, and blocks with manual-review files when ownership is unclear.

Starter truth docs use closed YAML frontmatter with `status`, `doc_type`, `last_reviewed`, and `source_of_truth`, and include `Product Decisions` and `Rationale` sections.

Completed reports include `Topology reviewed`, `Areas reviewed`, `Routing updated`, `Truth docs created`, `Truth docs split`, `Truth docs restructured`, `Evidence checked`, `Topology decisions`, and `Notes`.

## Product Decisions

- Decision (2026-05-15): Truth Structure owns ownership repair. Mixed-owner docs must be split/rerouted when safe, not repaired in place by Sync or Document.
- Decision (2026-05-15): Truth Structure must satisfy canonical decision-section expectations for new starter docs and repaired routed docs.
- Decision (2026-05-15): Truth Structure must preserve or explicitly account for Product Decisions and Rationale when splitting or restructuring truth docs.

## Rationale

Ownership repair needs a workflow that can change route topology and create bounded docs. Letting Sync or Document patch broad docs preserves drift.

## Non-Goals

- no mechanical directory mirroring when behavior ownership is clearer
- no generic truth docs behind broad catch-all routing

## Maintenance Notes

Update this doc when topology pressure signals, split behavior, starter-doc requirements, or Structure report shape changes.
