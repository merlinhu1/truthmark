---
status: active
truth_kind: engineering-test-behavior
last_reviewed: 2026-06-14
---

# {{title}}

## Purpose

<!--
State the software-engineering outcome this document protects and why the documented surface exists.
Include durable value, impacted users/systems, and the problem boundary; exclude roadmap, implementation plans, and historical narrative.
Keep claims traceable to Source References rather than prose-only assertion.
-->

{{purpose}}

## Scope

<!--
Define the one coherent surface this document owns, including actors, entrypoints, owned state/data, and handoffs to neighboring truth docs.
Call out important out-of-scope boundaries here or in Non-Goals; split the doc when it mixes distinct outcomes, lifecycles, contracts, or owners.
-->

{{scope}}

## Test Surface

<!--
Define the behavior, contract, architecture, or workflow surface these tests verify.
Link the canonical truth docs and code paths the tests are meant to protect.
-->

{{test_surface}}

## Fixtures And Data Model

<!--
Document fixtures, factories, seeds, mocks/fakes, test repositories, external-service substitutes, and data lifecycle rules.
Include cleanup, determinism, privacy, and cross-test contamination constraints.
-->

{{fixtures_and_data_model}}

## Execution Model

<!--
Describe how tests run: command, framework, parallelism, isolation, network/filesystem assumptions, and required services.
State whether tests are unit, integration, e2e, contract, smoke, regression, or generated checks.
-->

{{execution_model}}

## Assertions And Invariants

<!--
List the critical assertions, invariants, failure modes, and negative cases that make the tests meaningful.
Tie assertions to product/contract rules rather than incidental implementation details.
-->

{{assertions_and_invariants}}

## Isolation Rules

<!--
Document transaction boundaries, temp directories, fake clocks, network blocking, shared resources, and teardown rules.
Call out known order dependencies or flake risks and how they are controlled.
-->

{{isolation_rules}}

## Reporting And Failure Semantics

<!--
Describe diagnostics, snapshots, logs, coverage signals, retry policy, and how maintainers should interpret failures.
Include escalation or quarantine criteria for flaky or environment-sensitive tests.
-->

{{reporting_and_failure_semantics}}

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

## Source References

<!--
List source files, tests, configs, generated templates, route files, or product instructions that support current claims.
-->

{{source_references}}
