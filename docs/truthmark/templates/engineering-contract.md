---
status: active
truth_kind: engineering-contract
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

## Contract Surface

<!--
Identify the owned API, CLI, file format, event, protocol, permission boundary, or integration surface.
State consumers/producers, stability level, and the source files/tests that define the contract.
-->

{{contract_surface}}

## Inputs

<!--
Document accepted parameters, payloads, files, environment/config keys, permissions, and validation rules.
Include required/optional status, defaults, constraints, and normalization behavior.
-->

{{inputs}}

## Outputs

<!--
Document returned values, emitted files/events, state changes, side effects, and success diagnostics.
Make externally observable behavior explicit enough for compatibility review.
-->

{{outputs}}

## Errors And Diagnostics

<!--
List error classes, exit/status codes, user-facing diagnostics, retries, and recoverability expectations.
Distinguish validation errors, dependency failures, authorization failures, and internal faults when applicable.
-->

{{errors_and_diagnostics}}

## Compatibility Rules

<!--
State backward/forward compatibility guarantees, tolerated inputs, deprecation rules, and breaking-change triggers.
Include compatibility tests or review gates that protect the contract.
-->

{{compatibility_rules}}

## Versioning And Migration

<!--
Document version negotiation, schema/API version fields, rollout requirements, migration steps, and rollback expectations.
State 'Not versioned' only when the implementation truly has no versioning or migration surface.
-->

{{versioning_and_migration}}

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
