---
status: active
truth_kind: engineering-operations
last_reviewed: 2026-06-14
---

# {{title}}

<!--
Prefer diff-friendly Markdown: one durable claim per bullet or line.
Keep paragraphs to one or two short sentences, and use bullets or tables for rules, criteria, fields, files, and lists.
-->

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

## Operational Surface

<!--
Describe what operators, maintainers, or automated systems can observe or control for this surface.
Include commands, dashboards, alerts, runbooks, jobs, or operational APIs that define current operations.
-->

{{operational_surface}}

## Runtime Topology

<!--
Document services, processes, containers, hosts, regions, dependencies, queues, stores, and network boundaries involved at runtime.
State single-node/local behavior explicitly when there is no distributed topology.
-->

{{runtime_topology}}

## Configuration

<!--
List operational config, environment variables, feature flags, secrets references, defaults, and reload/restart requirements.
Do not include secret values; describe storage and rotation expectations instead.
-->

{{configuration}}

## Permissions

<!--
Document required identities, roles, scopes, filesystem/network permissions, and least-privilege boundaries.
Include user-facing authorization behavior and operator access requirements when relevant.
-->

{{permissions}}

## Deployment And Rollback

<!--
Describe deployment mechanism, migration ordering, compatibility windows, rollback path, and known irreversible operations.
Call out manual review points, smoke checks, and post-deploy verification responsibilities.
-->

{{deployment_and_rollback}}

## Availability And Observability

<!--
Capture availability expectations, health checks, metrics, logs, traces, alerts, SLO/error-budget signals, and known blind spots.
Include what maintainers should inspect first during incidents or degraded behavior.
-->

{{availability_and_observability}}

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
