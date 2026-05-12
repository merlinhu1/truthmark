---
status: active
doc_type: feature
last_reviewed: 2026-05-12
source_of_truth:
  - {{source_of_truth}}
---

# {{title}}

## Purpose

<!-- State why this feature exists, the user or system outcome it protects, and the problem it solves. Keep roadmap or implementation plans out of this section. -->

{{purpose}}

## Scope

{{scope}}

<!--
This doc must own one coherent behavior surface.
Split into another leaf doc when content introduces:
- a distinct user or system outcome
- a separate lifecycle or state machine
- an unrelated rule family
- a different external contract
- code that should route through a different owner
Keep README.md files as indexes only.
-->

This doc was created from the editable feature-doc template at {{template_path}}.

## Current Behavior

<!-- Describe implemented behavior in present tense. Do not include desired future behavior. -->

{{current_behavior}}

## Core Rules

<!-- Capture stable business rules, invariants, precedence rules, validation rules, and must-never constraints. Omit incidental implementation details. -->

{{core_rules}}

## Flows And States

<!-- Use for route switches, state transitions, lifecycle stages, retries, fallbacks, and important error paths. Write 'None beyond current behavior.' when no distinct flow or state model exists. -->

{{flows_and_states}}

## Contracts

<!-- Capture user-visible or integration contracts: CLI/API shape, inputs, outputs, diagnostics, files, events, permissions, or links to canonical contract docs. Avoid duplicating a separate canonical contract doc. -->

{{contracts}}

## Product Decisions

<!-- Keep active decisions only. Replace stale decisions instead of appending historical logs. -->

{{decision}}

## Rationale

<!-- Explain why the current behavior and active decisions are this way, including tradeoffs. -->

{{rationale}}

## Non-Goals

<!-- Name adjacent behavior this doc intentionally does not own, especially tempting future expansions. -->

{{non_goals}}

## Maintenance Notes

<!-- List related tests, routing cautions, migration notes, and common drift risks for future agents. Keep this operational, not historical. -->

{{maintenance_notes}}
