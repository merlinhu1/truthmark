---
status: active
truth_kind: engineering-architecture
last_reviewed: 2026-06-20
---

# Architecture Overview

## Purpose

This doc owns the current source-level architecture of Truthmark as a workflow injector.

## Scope

It covers CLI handlers, config loading, routing, checks, generation, repository intelligence, and workflow-surface rendering.

## System Role

Truthmark is a repository-local documentation workflow injector.

It turns checkout evidence, route metadata, and source renderers into committed truth docs, checks, and host-native workflow files.

## Current Implementation Behavior

- Truthmark is a local CLI and generated-surface renderer.
- It reads checkout files, normalizes configuration, parses route files, emits diagnostics, and writes configured workflow surfaces during init.

## Boundaries

- CLI command parsing and handlers live under `src/cli`.
- Config and defaults live under `src/config`.
- Route parsing and resolution live under `src/routing`.
- Checks live under `src/checks`.
- Generated workflow rendering lives under `src/templates` and `src/agents`.

## Components

- Config loader
- Route parser and resolver
- Check pipeline
- Init/scaffold renderer
- Workflow manifest and generated surface renderer
- RepoIndex, RouteMap, ImpactSet, and WorkflowState/action-context builders

## Data And Control Flow

- CLI commands load config and repository paths from the active checkout.
- Route parsing builds area ownership and truth-doc relationships from route markdown files.
- Check and index flows inspect committed files and emit diagnostics or compact repository metadata.
- Init flows render templates and generated surfaces back into the checkout.

## Ownership

Architecture ownership follows the source modules and routed truth docs listed in Source References.

Workflow-surface architecture is owned by the installed-workflows route area.

## Cross-Cutting Constraints

- Truthmark must remain usable from committed repository files without a live daemon.
- Generated workflow surfaces are refreshable artifacts; source renderers remain the generation authority.
- Product and engineering truth remain separate lanes.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Architecture docs describe current repository realization and do not redefine product promises.

## Rationale

Keeping architecture truth source-backed and lane-scoped prevents generated agent workflow guidance from becoming an alternate product authority.

## Non-Goals

- This doc does not own product capability promises.
- This doc does not describe every command contract in detail; contract docs own public surfaces.

## Maintenance Notes

Update when module boundaries, generated-surface ownership, or command architecture changes.

## Source References

- ../../../../src/cli/handlers.ts
- ../../../../src/config/load.ts
- ../../../../src/routing/areas.ts
- ../../../../src/templates/generated-surfaces.ts
- `src/cli/handlers.ts`
- `src/config/load.ts`
- `src/routing/areas.ts`
- `src/templates/generated-surfaces.ts`
