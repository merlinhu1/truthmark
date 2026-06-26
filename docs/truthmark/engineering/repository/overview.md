---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-26
---

# Repository Overview

## Purpose

This doc records the repository-directory guardrail that broad repository docs are indexes or handoffs, not catch-all implementation truth.

## Scope

It covers the repository truth-doc directory shape and the handoff away from legacy broad overview ownership.

It does not own implementation behavior under `src/**`, route-map behavior, or repository-intelligence output details.

## Current Implementation Behavior

- Truthmark no longer treats this file as the default behavior owner for broad repository code surfaces.
- Init uses `engineering/repository/bootstrap-routing.md` as the provisional broad-route handoff when a fresh repository needs initial routeability.
- Normal behavior truth belongs in bounded route-owned leaf docs after Truth Structure identifies the durable owner.
- Repository-intelligence behavior lives in `engineering/repository/repository-intelligence.md`.
- README files in truth-doc directories remain indexes instead of Truth Sync targets.

## Core Rules

- Do not append unrelated implementation behavior to this overview.
- Use `bootstrap-routing.md` when the repository still needs a provisional broad-route handoff.
- Use bounded route-owned truth docs for real implementation behavior.
- Use `repository-intelligence.md` for RepoIndex, RouteMap, ImpactSet, evidence, freshness, and WorkflowState behavior.

## Behavior Scenarios

#### Scenario: Broad default routing does not expand the overview

- **GIVEN** a real code change maps only to a provisional broad repository route
- **WHEN** Truth Sync cannot identify a bounded truth owner safely
- **THEN** agents run or recommend Truth Structure before updating behavior truth
- **AND** they do not append implementation claims to this overview

#### Scenario: Repository truth docs stay indexable by bounded owner

- **GIVEN** a maintainer opens the repository truth-doc directory
- **WHEN** they choose a target truth doc for repository behavior
- **THEN** the directory index points to bounded leaf docs and bootstrap handoffs
- **AND** this overview remains a guardrail against catch-all behavior prose

## Flows And States

- None beyond the broad-overview-to-bounded-owner handoff described above.

## Contracts

- Route metadata and check diagnostics are owned by `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md`.
- Repository-intelligence JSON contracts are owned by `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md`.

## Product Truth Links

- None. This is an internal engineering guardrail.

## Engineering Decisions

- Decision (2026-06-26): The repository overview is a guardrail against catch-all truth ownership, not the default behavior owner.
  - Init creates `bootstrap-routing.md` for provisional broad routes.
  - Truth Structure creates or repairs bounded owners before normal Truth Sync writes behavior details.

## Rationale

Broad overview docs tend to accumulate unrelated behavior and become hard to review in Git.

Keeping this file as a narrow guardrail preserves the old path's intent while directing real behavior to bounded owners.

## Non-Goals

- This doc is not a catch-all for repository behavior.
- This doc is not a route-map, impact, or workflow-state behavior owner.
- This doc is not a product capability or external contract.

## Maintenance Notes

Update this doc only when repository-directory ownership, bootstrap handoff behavior, or broad-overview retirement behavior changes.

## Source References

- docs/truthmark/engineering/repository/bootstrap-routing.md
- docs/truthmark/engineering/repository/repository-intelligence.md
- docs/truthmark/engineering/behaviors/init-and-scaffold.md
- docs/truthmark/engineering/repository/README.md
