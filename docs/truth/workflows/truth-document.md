---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-16
source_of_truth:
  - ../../../src/agents/truth-document.ts
  - ../../../src/agents/shared.ts
  - ../../../src/templates/workflow-surfaces.ts
---

# Truth Document Workflow

## Purpose

Truth Document records existing implemented behavior when no functional-code change is required.

## Scope

Truth Document owns manual missing-truth generation for implemented behavior. It may write canonical truth docs and routing files only.

## Triggers

- explicit user request to document existing implemented behavior
- handoff from Truth Sync, Truth Check, or Truth Structure when implemented behavior lacks canonical truth docs

## Inputs

- implementation code and tests
- `.truthmark/config.yml`
- root and child route files
- existing canonical docs

## Execution Model

Truth Document is implementation-first and never writes functional code. It documents current implemented behavior only and does not invent future behavior or planned endpoints. In Codex, Claude Code, GitHub Copilot, or OpenCode, Truth Document may automatically use generated read-only verifier subagents when the host supports subagent dispatch and the parent agent chooses bounded fan-out.

## Current Behavior

Truth Document applies the ownership gate before writing. If routing is missing, stale, broad, overloaded, catch-all, or cannot map behavior to a bounded truth owner, it runs Truth Structure first when repair is safe and in scope. If repair is unsafe, ambiguous, or outside the task boundary, it blocks and recommends Truth Structure.

If the candidate truth doc is broad, mixed-owner, index-like, or the documented behavior spans independent owners, Truth Document does not repair it in place. It switches to Truth Structure or blocks.

When ownership is bounded, Truth Document creates or updates leaf truth docs, keeps behavior truth docs behavior-oriented, keeps API endpoint details in the nearest contract truth doc when that doc owns the contract, and preserves unrelated authored content.

When Truth Document restructures a bounded truth doc or runs Structure first, it inventories Product Decisions and Rationale before editing. Existing entries must be preserved in or moved to their bounded owner docs, narrowed or removed only with checkout evidence, or blocked for manual review when ownership is unclear.

ContextPack may be used to gather bounded source context when available. It does not replace checkout inspection, does not create write permission, and cannot be cited as evidence unless it points to real checkout files, tests, route files, truth docs, schemas, or explicit evidence blocks. If ContextPack is unavailable, Truth Document proceeds manually and reports that repository-intelligence artifacts were not generated.

When subagent mode is available, the parent agent may dispatch read-only route and claim verifier workers to gather route and evidence findings. Codex exposes `truth_route_auditor` and `truth_claim_verifier`; Claude Code exposes `truth-route-auditor` and `truth-claim-verifier` project subagents; GitHub Copilot and OpenCode expose `@truth-route-auditor` and `@truth-claim-verifier`. The parent agent owns every Truth Document write, routing edit, shape repair, and final report.

Completed reports include `Implementation reviewed`, `Ownership reviewed`, `Structure required` when applicable, `Truth docs created`, `Truth docs updated`, `Truth docs restructured`, `Routing updated`, `Evidence checked`, and `Notes`.

## Product Decisions

- Decision (2026-05-15): Truth Document exists because documenting existing implemented behavior without code changes is not a Truth Sync run.
- Decision (2026-05-15): Truth Document must switch to Truth Structure rather than patching mixed-owner truth docs.
- Decision (2026-05-15): Truth Document must not lose Product Decisions or Rationale during bounded shape repair or Structure handoff.
- Decision (2026-05-16): Codex, Claude Code, GitHub Copilot, and OpenCode subagents may gather read-only evidence for Document, but parent agents retain all write ownership.

## Rationale

Documentation-only work can still damage repository truth if it appends implemented behavior to the wrong owner. The ownership gate keeps Document from turning broad docs into larger broad docs.

## Non-Goals

- no functional-code edits
- no planned behavior documentation
- no in-place ownership repair for mixed-owner docs

## Maintenance Notes

Update this doc when Truth Document triggers, write boundaries, ownership handoff behavior, or report shape changes.
