---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-14
---

# {{title}}

<!--
Prefer diff-friendly Markdown: one durable claim per bullet or line.
Keep paragraphs to one or two short sentences, and use bullets or tables for rules, criteria, fields, files, and lists.
-->

## Purpose

<!--
State the user/system outcome this behavior protects and why it exists.
Include the problem boundary and durable value; exclude roadmap, implementation plan, and historical narrative.
List the code, config, docs, or tests that support the claim in Source References rather than prose-only assertion.
-->

{{purpose}}

## Scope

<!--
Define the one coherent behavior surface this document owns.
Include in-scope actors, entrypoints, state/data owned by this doc, and explicit handoffs to neighboring truth docs.
Split into another leaf doc when content introduces a distinct outcome, state machine, rule family, external contract, or route owner.
Keep README.md files as indexes only.
-->

{{scope}}

This doc was created from the editable engineering-behavior template at {{template_path}}.

## Current Implementation Behavior

<!--
Describe only current implemented behavior in present tense.
Cover observable behavior, important defaults, and user/system-visible effects; exclude desired future behavior and speculative design.
Every non-obvious claim should be checkable from Source References.
-->

{{current_implementation_behavior}}

## Core Rules

<!--
Capture stable business rules, invariants, precedence rules, validation rules, and must-never constraints.
Separate rules from incidental implementation details; cite current implementation or tests for rule enforcement.
-->

{{core_rules}}

## Flows And States

<!--
Document state transitions, lifecycle stages, retries, fallbacks, route switches, and important error paths.
State 'None beyond current behavior.' when this behavior has no distinct flow or state model.
-->

{{flows_and_states}}

## Contracts

<!--
Capture user-visible or integration contracts: CLI/API shape, inputs, outputs, diagnostics, files, events, permissions, or links to canonical contract docs.
Avoid duplicating a separate canonical contract doc; link to it when contract ownership lives elsewhere.
-->

{{contracts}}

## Product Truth Links

<!--
List product truth docs this engineering doc realizes; author canonical realizes links in route YAML, not doc frontmatter.
Use 'None.' when this is purely internal engineering behavior.
-->

{{product_truth_links}}

## Engineering Decisions

<!--
Keep active decisions only, dated inline when added or changed.
Explain decisions that shape behavior, boundaries, rejected alternatives, or migration constraints; replace stale decisions instead of appending historical logs.
-->

{{engineering_decisions}}

## Rationale

<!--
Explain why the current behavior and active decisions are this way, including tradeoffs and constraints.
Tie rationale to evidence-backed behavior; do not use this as a changelog.
-->

{{rationale}}

## Non-Goals

<!--
Name adjacent behavior this doc intentionally does not own, especially tempting future expansions or neighboring route owners.
Use this section to prevent scope creep and duplicate truth ownership.
-->

{{non_goals}}

## Maintenance Notes

<!--
List related tests, routing cautions, migration notes, evidence drift risks, and review triggers for future maintainers or agents.
Keep this operational and current-state focused, not historical.
-->

{{maintenance_notes}}

## Source References

<!--
List source files, tests, configs, generated templates, route files, or product instructions that support current claims.
-->

{{source_references}}
