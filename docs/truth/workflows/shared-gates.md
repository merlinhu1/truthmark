---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-15
source_of_truth:
  - ../../../src/agents/shared.ts
  - ../../../src/truth/**
  - ../../../src/sync/report.ts
---

# Shared Workflow Gates

## Purpose

Shared workflow gates ensure agents choose the correct truth owner before validating claims or repairing document shape.

## Scope

This document owns shared ownership, evidence, shape-repair, architecture-boundary, template, and decision-truth guidance rendered into installed workflows.

## Triggers

The gates apply whenever Truth Structure, Truth Document, Truth Sync, Truth Realize, or Truth Check reads, writes, audits, or relies on canonical truth docs.

## Inputs

- `.truthmark/config.yml`
- route files under `docs/truthmark/`
- routed truth docs
- implementation, config, generated templates, schemas, and contract definitions
- tests and existing canonical docs as corroboration

## Execution Model

Ownership comes first. Evidence review and shape repair are valid only after the target or source truth doc is confirmed as a bounded owner for the behavior.

## Ownership Gate

Before editing or relying on a truth doc, the workflow verifies that each target or source truth doc is a bounded owner for the behavior. If a doc mixes independent owners, spans unrelated behaviors, acts as an index, or needs cross-owner edits, the workflow must not patch or repair it in place.

Truth Sync and Truth Document switch to Truth Structure when ownership repair is safe and in scope; otherwise they block and recommend Truth Structure. Truth Realize blocks before writing code when source truth is broad, mixed-owner, stale, unrouteable, or conflicting. Truth Check reports mixed-owner truth docs as topology issues. Truth Structure owns split and reroute repair.

Reports name the ownership result: `Ownership reviewed`, `Structure required`, `Truth docs split`, `Truth docs restructured`, or `Blocked reason`.

## Product Decisions/Rationale Preservation Gate

Before any truth-doc split, restructure, or shape repair, the workflow inventories existing `Product Decisions` and `Rationale` sections in every source or touched truth doc.

Current decisions and rationale are preserved in the bounded owner doc they govern. When a doc is split, the workflow moves each entry to the new owner doc instead of deleting it or leaving it stranded in an index.

A decision or rationale may be removed or narrowed only when checkout evidence shows it is stale or unsupported, and the report names the claim, evidence, and result. If ownership is unclear, the workflow blocks with manual-review files rather than guessing or deleting the entry.

After the edit, every touched truth doc must still have `Product Decisions` and `Rationale` sections, and every pre-existing entry must be preserved, moved, narrowed, removed with evidence, or blocked.

## Evidence Gate

Truth Structure, Truth Document, and Truth Sync validate new or changed behavior-bearing claims only. Agents map the changed or documented behavior to bounded route owners and primary canonical docs, support changed claims with primary checkout evidence, use tests and existing docs only as corroboration when implementation conflicts, and remove, narrow, or block unsupported claims.

Primary checkout evidence includes implementation, config, routing, generated-surface templates, schemas, and contract definitions.

Truth Check uses an audit-shaped gate: findings and suggested fixes need evidence from config, route files, canonical docs, implementation, templates, or tests. Unsupported findings are removed or marked as open questions with confidence. If an audit edits docs, changed claims pass through the claim-level gate before completion.

Truth Sync completed reports have a deterministic structured parser for Markdown reports with `Evidence checked` entries containing `Claim`, `Evidence`, and `Result` fields.

## Shape Repair Gate

Shape repair is in-place cleanup inside an already-bounded truth owner. It covers missing template sections, stale evidence conflicts, cross-section updates within one owner, or wrong frontmatter/source/headings.

Shape repair does not cover ownership splits. Broad or mixed-owner docs require Truth Structure before claim updates.

## Template And Decision Guidance

Generated workflows point to the routed truth kind's matching template under `docs/templates/`, rendered as `docs/templates/<kind>-doc.md`. Agents inspect the routed truth kind, align existing docs to the template while preserving accurate authored content, and fall back to the built-in minimal truth-doc structure only when the matching template is missing.

Decision truth lives in the canonical doc it governs. Active decisions are dated inline when added or changed; separate active-decision ADR or planning logs are rejected.

## Product Decisions

- Decision (2026-05-15): Shared generated workflow gates are correctness gates first. Compactness is allowed only after ownership routing, evidence validation, and report obligations remain explicit.
- Decision (2026-05-15): Ownership repair is not shape repair. Mixed-owner truth docs require Truth Structure, split/reroute, or a blocked report.
- Decision (2026-05-15): Evidence validation is changed-claim-only and requires primary checkout evidence.
- Decision (2026-05-15): Generated workflow surfaces refer to routed truth-doc templates instead of embedding full template text.
- Decision (2026-05-15): Truth-doc split, restructure, and shape repair must preserve, move, explicitly narrow/remove with evidence, or block every pre-existing Product Decision and Rationale entry.

## Rationale

The product is the workflow. Agents must choose the correct owner before making local edits, otherwise evidence-backed prose can still preserve the wrong truth boundary.

Keeping ownership, evidence, and shape repair separate prevents broad-doc cleanup from hiding topology drift.

## Non-Goals

- no inline evidence ledger in canonical docs by default
- no in-place repair for mixed-owner truth docs
- no full truth-doc template embedding inside generated workflow prompts

## Maintenance Notes

Update this doc when shared gate wording, template rules, decision-truth behavior, evidence reporting, or ownership/split behavior changes.
