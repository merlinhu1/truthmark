---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-14
source_of_truth:
  - {{source_of_truth}}
---

# {{title}}

## Purpose

<!--
State the software-engineering outcome this document protects and why the documented surface exists.
Include durable value, impacted users/systems, and the problem boundary; exclude roadmap, implementation plans, and historical narrative.
Keep claims traceable to source_of_truth evidence rather than prose-only assertion.
-->

{{purpose}}

## Scope

<!--
Define the one coherent surface this document owns, including actors, entrypoints, owned state/data, and handoffs to neighboring truth docs.
Call out important out-of-scope boundaries here or in Non-Goals; split the doc when it mixes distinct outcomes, lifecycles, contracts, or owners.
-->

{{scope}}

## Triggers

<!--
List events, commands, schedules, user actions, webhooks, or dependency signals that start this workflow.
Include preconditions, authorization requirements, debounce/coalescing behavior, and disabled states when applicable.
-->

{{triggers}}

## Inputs

<!--
Document data, files, config, context, credentials, and environmental assumptions consumed by the workflow.
Include validation, defaults, and normalization that happen before execution.
-->

{{inputs}}

## Execution Model

<!--
Describe synchronous/asynchronous execution, concurrency, locking, leases, batching, ordering, and idempotency behavior.
State whether the workflow is user-blocking, background, distributed, or delegated to another system.
-->

{{execution_model}}

## Steps

<!--
Capture the current ordered steps or phases at a level useful for maintenance and review.
Reference implementation entrypoints instead of duplicating line-by-line code behavior.
-->

{{steps}}

## State, Retry, And Failure Behavior

<!--
Document state transitions, retries, timeouts, compensation, fallback, partial-success, and terminal-failure behavior.
Make externally visible failure semantics and recovery responsibilities clear.
-->

{{state_retry_and_failure_behavior}}

## Outputs

<!--
List artifacts, state changes, notifications, logs, metrics, diagnostics, and downstream triggers produced by the workflow.
Include success criteria and handoff points to other truth docs or systems.
-->

{{outputs}}

## Engineering Decisions

<!--
Keep active engineering, architecture, contract, workflow, or operational decisions only, dated inline when added or changed.
Do not restate product promises, product rationale, or business decisions here; link product truth instead.
Replace stale decisions instead of appending historical logs.
-->

{{engineering_decisions}}

## Rationale

<!--
Explain why the current behavior, structure, or contract is this way, including tradeoffs and constraints.
Tie rationale to evidence-backed facts and active decisions; do not use this as a changelog.
-->

{{rationale}}

## Non-Goals

<!--
Name adjacent behavior, responsibilities, interfaces, or future expansions this doc intentionally does not own.
Use this section to prevent scope creep and duplicate truth ownership.
-->

{{non_goals}}

## Maintenance Notes

<!--
List related tests, routing cautions, migration notes, compatibility risks, evidence drift risks, and review triggers for future maintainers or agents.
Keep this operational and current-state focused, not historical.
-->

{{maintenance_notes}}
