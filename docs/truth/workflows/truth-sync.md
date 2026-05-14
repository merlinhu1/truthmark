---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-15
source_of_truth:
  - ../../../src/agents/truth-sync.ts
  - ../../../src/sync/report.ts
  - ../../../src/agents/shared.ts
---

# Truth Sync Workflow

## Purpose

Truth Sync aligns canonical truth docs with functional-code changes.

## Scope

Truth Sync is code-first. Code leads, truth docs follow, and functional code must not be rewritten during sync.

## Triggers

- automatic finish-time trigger after functional code changes since the last successful Truth Sync
- explicit user invocation through the installed host surface

## Inputs

- staged, unstaged, and untracked functional-code changes
- `.truthmark/config.yml`
- root and child route files
- relevant canonical docs and nearby implementation

## Execution Model

Truth Sync may update routed truth docs and routing when routing repair is needed. It may create missing canonical truth docs when routeable implementation would otherwise remain undocumented.

## Current Behavior

Before updating truth docs, Truth Sync applies the topology and ownership gates. If routing is missing, stale, broad, overloaded, catch-all, or cannot map changed code to a bounded truth owner, it must not create another generic truth doc. It runs Truth Structure first when repair is safe and in scope, or blocks and recommends Truth Structure when topology repair is unsafe, ambiguous, or outside the task boundary.

If an impacted truth doc is broad, mixed-owner, index-like, or the code change spans independent behavior owners, Truth Sync switches to Truth Structure when safe and in scope. Otherwise it blocks and reports manual-review files.

Truth Sync updates active decisions and rationale in the routed canonical doc when implementation changes are driven by a decision change. It dates active decisions inline when added or changed and replaces stale active decisions rather than appending separate timestamped decision notes.

When Truth Sync restructures a bounded truth doc or runs Structure inline, it inventories Product Decisions and Rationale before editing. Existing entries must be preserved in or moved to their bounded owner docs, narrowed or removed only with checkout evidence, or blocked for manual review when ownership is unclear.

Truth Sync updates architecture docs in the same sync when changed code alters architecture-level structure or ownership.

Completed reports include `Changed code reviewed`, `Ownership reviewed`, `Structure required` when applicable, `Truth docs updated`, `Truth docs split` when Structure is run inline, `Evidence checked`, and `Notes`. Skipped reports include `Reason`. Blocked reports include `Reason`, `Files requiring manual review`, and `Next action`.

Current skip reasons are:

- documentation-only change
- formatting-only change
- clearly behavior-preserving rename with no truth impact
- no Truthmark config exists yet
- no functional code changes

Truth Sync's generated frontmatter description and Codex metadata carry those skip cases because skill metadata is the host-visible routing boundary before the full workflow body is loaded.

Truth Sync delegation is host-owned. Generated workflow surfaces may describe when delegation is allowed, but must not name a preferred subagent or project-local subagent preference file.

## Product Decisions

- Decision (2026-05-15): Truth Sync metadata carries skip cases because docs-only, formatting-only, behavior-preserving rename, missing-config, and no-code changes should not trigger the finish-time sync path.
- Decision (2026-05-15): Truth Sync must not worsen weak topology by adding generic truth docs behind missing, stale, broad, overloaded, catch-all, or unrouteable routing.
- Decision (2026-05-15): Truth Sync must switch to Truth Structure or block when impacted truth docs are mixed-owner or broad.
- Decision (2026-05-15): Truth Sync must not lose Product Decisions or Rationale during bounded shape repair or inline Structure handoff.

## Rationale

Truth Sync is the finish-time bridge from code to truth, so it must protect route ownership before claim evidence. Otherwise it can accurately document behavior in the wrong place.

## Non-Goals

- no functional-code rewrites during sync
- no generic docs behind weak routing
- no preferred subagent baked into generated surfaces

## Maintenance Notes

Update this doc when Sync triggers, skip reasons, report shape, delegation language, or ownership handoff behavior changes.
