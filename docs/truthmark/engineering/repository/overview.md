---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-20
---

# Repository Overview

## Purpose

<!--
State the user/system outcome this behavior protects and why it exists.
Include the problem boundary and durable value; exclude roadmap, implementation plan, and historical narrative.
List the code, config, docs, or tests that support the claim in Source References rather than prose-only assertion.
-->

Describe why the default repository behavior surface exists and what outcome it protects.

## Scope

<!--
Define the one coherent behavior surface this document owns.
Include in-scope actors, entrypoints, state/data owned by this doc, and explicit handoffs to neighboring truth docs.
Split into another leaf doc when content introduces a distinct outcome, state machine, rule family, external contract, or route owner.
Keep README.md files as indexes only.
-->

This bounded leaf truth doc owns the default repository behavior surface created by Truthmark.

This doc was created from the editable engineering-behavior template at docs/truthmark/templates/engineering-behavior.md.

## Current Implementation Behavior

<!--
Describe only current implemented behavior in present tense.
Cover observable behavior, important defaults, and user/system-visible effects; exclude desired future behavior and speculative design.
Every non-obvious claim should be checkable from Source References.
-->

- Document current behavior here when implementation changes make repository truth incomplete.

## Core Rules

<!--
Capture stable business rules, invariants, precedence rules, validation rules, and must-never constraints.
Separate rules from incidental implementation details; cite current implementation or tests for rule enforcement.
-->

- Truth README files are indexes; behavior truth belongs in bounded leaf docs.

## Flows And States

<!--
Document state transitions, lifecycle stages, retries, fallbacks, route switches, and important error paths.
State 'None beyond current behavior.' when this behavior has no distinct flow or state model.
-->

- None beyond current behavior.

## Contracts

<!--
Capture user-visible or integration contracts: CLI/API shape, inputs, outputs, diagnostics, files, events, permissions, or links to canonical contract docs.
Avoid duplicating a separate canonical contract doc; link to it when contract ownership lives elsewhere.
-->

- External contracts should link to the nearest canonical contract doc when one exists.

## Product Truth Links

- None.

## Engineering Decisions

<!--
Keep active decisions only, dated inline when added or changed.
Explain decisions that shape behavior, boundaries, rejected alternatives, or migration constraints; replace stale decisions instead of appending historical logs.
-->

- Decision (2026-06-14): Truth README files are indexes; behavior truth belongs in bounded leaf docs.

## Rationale

<!--
Explain why the current behavior and active decisions are this way, including tradeoffs and constraints.
Tie rationale to evidence-backed behavior; do not use this as a changelog.
-->

Bounded leaf docs keep agent context focused and prevent large products from accumulating unreviewable feature manuals.

## Non-Goals

<!--
Name adjacent behavior this doc intentionally does not own, especially tempting future expansions or neighboring route owners.
Use this section to prevent scope creep and duplicate truth ownership.
-->

- This doc is not a catch-all for unrelated repository behavior.

## Maintenance Notes

<!--
List related tests, routing cautions, migration notes, evidence drift risks, and review triggers for future maintainers or agents.
Keep this operational and current-state focused, not historical.
-->

- Update this doc when routed implementation changes alter current behavior, rules, contracts, or decisions.

## Source References

- ../../routes/areas/repository.md
