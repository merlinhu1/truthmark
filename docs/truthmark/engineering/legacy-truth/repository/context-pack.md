---
status: archived
last_reviewed: 2026-06-01
---

# ContextPack

## Purpose

This document protects ContextPack v0 as a bounded, derived workflow-context artifact for Truth Sync, Truth Document, and Truth Realize.

## Scope

This document owns ContextPack v0 behavior for Truth Sync, Truth Document, and Truth Realize workflows.

## Current Behavior

`truthmark context --workflow <workflow> [--base <ref>]` generates a bounded context artifact for a workflow and renders deterministic Markdown by default. When `--json` is used, the JSON envelope returns only `data.markdown` plus `data.summary` and does not include the full content-bearing `data.contextPack`. `--format json` returns a `context-pack` error diagnostic because JSON ContextPack output was removed in v2. ContextPack rejects other unsupported `--format` values with a `context-pack` error diagnostic. ContextPack includes route ownership, affected truth docs, selected source files, related tests, warnings, and allowed write paths in its internal markdown-rendering model. Truth docs and source files over 200 lines are truncated to the first 80 lines and last 40 lines with an explicit `truncated: true` marker and a review warning before markdown rendering.

The internal ContextPack model includes `schemaVersion: context-pack/v0`. It is generated from the active checkout and, when a base ref is supplied, ImpactSet.

## Core Rules

- ContextPack is optional generated context and does not replace direct checkout inspection.
- ContextPack write paths restate workflow boundaries; they do not create new permissions.
- Truth Sync and Truth Document write paths include the active configured route index and selected truth docs, including non-default workspace layouts. Truth Realize write paths include the matched route code surfaces because Realize may write functional code but not truth docs or routing.
- If `.truthmark/config.yml` exists but is invalid, ContextPack includes config diagnostics as warnings and leaves `allowedWritePaths` empty instead of falling back to default write paths.
- Truth Realize without `--base` cannot infer matched code surfaces, so selected truth docs, source files, and `allowedWritePaths` are empty and ContextPack emits a review warning instead of widening to every route.
- Source files include changed files from ImpactSet when a base ref is supplied and final `Source References` entries from selected truth docs. Glob references are expanded against the checkout. Selected truth docs and source files are content-bounded before markdown rendering.
- ContextPack-only text is not evidence. Generated docs must cite checkout files, route files, truth docs, tests, schemas, or explicit evidence blocks.
- If ContextPack conflicts with the current checkout, the checkout wins.

## Flows And States

`truthmark context` resolves route ownership, affected truth docs, selected source files, related tests, and write-boundary guidance from the active checkout, applies deterministic content bounds to included truth docs and source files, then renders deterministic Markdown for the selected workflow. Agents use the artifact as reviewable context and still inspect the checkout directly before acting.

## Contracts

`truthmark context --workflow <workflow> [--base <ref>] --json` returns the shared command envelope with rendered Markdown in `data.markdown` plus `data.summary`; it never returns `data.contextPack`, `truthDocs[*].content`, or `sourceFiles[*].content`. `--format markdown` renders deterministic Markdown. `--format json` and other unsupported formats produce a `context-pack` error diagnostic.

## Product Decisions

- Decision (2026-05-16): ContextPack v0 is a bounded review artifact, not memory and not a source of authority.
- Decision (2026-05-16): No-CLI workflow execution remains supported, but with weaker automation and explicit reporting.
- Decision (2026-06-01): Invalid config must not grant default write paths in ContextPack; missing config may still use the default fallback where supported.
- Decision (2026-06-12): Public JSON ContextPack output was removed in v2; `truthmark context --json` returns markdown-only command data, and `--format json` is rejected.

## Rationale

ContextPack makes agent context auditable without making hidden retrieval or stale generated artifacts authoritative. Keeping it derived prevents a fast path from changing ownership or write behavior.

## Non-Goals

- ContextPack is not repository authority.
- ContextPack does not grant permissions beyond installed workflow boundaries.
- ContextPack does not replace direct checkout inspection.

## Maintenance Notes

ContextPack requires the Truthmark CLI or an equivalent local runner. If unavailable, agents must follow the installed workflow manually by reading route files, truth docs, source files, and tests directly. Completion reports must say ContextPack was not generated.

Primary implementation files:

- `src/context-pack/build.ts`
- `src/context-pack/render.ts`
- `src/impact/build.ts`

Update this doc when the command output, schema version, derived inputs, fallback behavior, or workflow relationship changes.

## Source References

- ../../../../src/context-pack/build.ts
- ../../../../src/context-pack/render.ts
- ../../../../src/impact/build.ts
