---
status: active
truth_kind: engineering-architecture
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

## System Role

<!--
Describe the current architectural role of this subsystem/component in the larger system.
State the primary responsibilities, consumers, providers, and why this boundary exists now.
-->

{{system_role}}

## Boundaries

<!--
Define owned code/config/data, external dependencies, trust boundaries, and interfaces crossed by this architecture.
Name what is deliberately outside the boundary and link neighboring architecture or contract docs when they own it.
-->

{{boundaries}}

## Components

<!--
List the major runtime/build-time components, modules, services, jobs, or generated artifacts and their responsibilities.
Keep the component list current and evidence-backed; avoid speculative target architecture.
-->

{{components}}

## Data And Control Flow

<!--
Describe important data movement, command/control paths, synchronization points, state ownership, and failure paths.
Call out persistence, queues, caches, external calls, and security-sensitive transitions where relevant.
-->

{{data_and_control_flow}}

## Ownership

<!--
Document team/module ownership, review responsibility, operational responsibility, and escalation paths if known.
If ownership is inferred from codeowners, config, or repository structure, cite that evidence.
-->

{{ownership}}

## Cross-Cutting Constraints

<!--
Record active constraints such as security, privacy, reliability, performance, portability, maintainability, compliance, and cost.
Tie constraints to source evidence, tests, standards, or operational requirements where available.
-->

{{cross_cutting_constraints}}

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
