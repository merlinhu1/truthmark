---
status: active
truth_kind: engineering-architecture
last_reviewed: 2026-06-14
source_of_truth:
  - ../../../../src/cli/handlers.ts
  - ../../../../src/config/load.ts
  - ../../../../src/routing/areas.ts
  - ../../../../src/templates/generated-surfaces.ts
realizes:
  - docs/truthmark/product/capabilities/lane-separated-truth.md
---

# Architecture Overview

## Purpose

This doc owns the current source-level architecture of Truthmark as a workflow injector.

## Scope

It covers CLI handlers, config loading, routing, checks, generation, repository intelligence, and workflow-surface rendering.

## Current Implementation Behavior

Truthmark is a local CLI and generated-surface renderer. It reads checkout files, normalizes configuration, parses route files, emits diagnostics, and writes configured workflow surfaces during init.

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
- RepoIndex, RouteMap, ImpactSet, ContextPack, and WorkflowState builders

## Source Evidence

- `src/cli/handlers.ts`
- `src/config/load.ts`
- `src/routing/areas.ts`
- `src/templates/generated-surfaces.ts`

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): Architecture docs describe current repository realization and do not redefine product promises.

## Maintenance Notes

Update when module boundaries, generated-surface ownership, or command architecture changes.
