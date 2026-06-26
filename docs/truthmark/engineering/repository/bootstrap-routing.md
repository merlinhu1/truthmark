---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-26
---

# Repository Bootstrap Routing

## Purpose

This doc records the provisional broad route for repository.
This doc is a bootstrap handoff, not a behavior truth dumping ground.
It is not a substitute for bounded product and engineering truth docs.

## Scope

This doc owns only the initial routing workflow for a fresh Truthmark repository whose default route still maps a broad code surface such as `src/**`.
It does not own implementation behavior under that code surface.

## Current Implementation Behavior

- The scaffold creates this provisional bootstrap handoff only when a default broad route needs a canonical owner.
- Agents use it as a signal to run Truth Structure and create bounded routes before normal Truth Sync, not as a place to accumulate implementation claims.

## Product Truth Links

- None. This is an engineering bootstrap handoff for routing setup, not a product promise.

## Triggers

- A real code change maps only to this provisional broad route.
- Truth Sync cannot identify a specific behavior-owned route and bounded truth owner.
- A maintainer or agent is onboarding the first real product, service, domain, package, or ownership area.

## Inputs

- Current route files under the configured Truthmark route root.
- The touched code, tests, configuration, and existing docs needed to infer the smallest real owner.
- Repository instruction files that exist in the checkout.

## Execution Model

- Run Truth Structure before normal Truth Sync when real code changes touch only this broad route.
- Truth Structure should create or repair bounded areas first; Truth Sync should then update the bounded owner docs.

## Steps

1. Treat this route as provisional and insufficient for normal behavior maintenance.
2. Inspect the touched code/test surface and infer the narrowest durable owner.
3. Create or repair route entries and truth docs for that owner.
4. Leave this bootstrap doc small; do not append behavior details here.
5. Resume Truth Sync only after the touched code resolves to a bounded owner.

## State, Retry, And Failure Behavior

If ownership cannot be inferred safely, stop and report manual-review files instead of widening this route or adding generic behavior prose.

## Outputs

- Bounded route areas and lane-appropriate truth docs for the touched surface.
- A compact manual handoff report when ownership remains ambiguous.

## Engineering Decisions

- Decision (2026-06-17): Default broad routing is provisional bootstrap state. Agents should create bounded areas before normal Truth Sync rather than extending a catch-all overview doc.

## Rationale

- Scoped ownership keeps agent context close to affected files and prevents broad default docs from absorbing unrelated behavior.
- This preserves agent-native truth maintenance without adding a token-heavy discovery layer.

## Non-Goals

- This doc is not a repository behavior overview.
- This doc is not a product capability or engineering behavior owner.
- This doc is not a permanent home for claims about files under `src/**`.

## Maintenance Notes

Keep this doc short. When a repository has real bounded routes, prefer updating those routes and their truth docs instead of expanding this bootstrap handoff.

## Source References

- docs/truthmark/engineering/behaviors/init-and-scaffold.md
- src/templates/init-files.ts
- .truthmark/config.yml
