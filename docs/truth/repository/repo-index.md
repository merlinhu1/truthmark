---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-05-16
source_of_truth:
  - ../../../src/repo-index/build.ts
  - ../../../src/repo-index/file-tree.ts
  - ../../../src/repo-index/route-map.ts
  - ../../../src/repo-index/types.ts
---

# RepoIndex

## Scope

This document owns RepoIndex v0 and RouteMap v0 behavior. RepoIndex describes the current checkout's files, docs, packages, tests, JavaScript/TypeScript imports and exports, public symbols, and Truthmark route ownership.

## Current Behavior

`truthmark index --json` builds a deterministic repository index from the active checkout. The command reads local files and Git metadata only. It does not start a daemon, call a remote service, use a model, or write generated artifacts by default.

RepoIndex output includes `schemaVersion: repo-index/v0`. RouteMap output includes `schemaVersion: route-map/v0` and is derived from `.truthmark/config.yml`, `docs/truthmark/areas.md`, and `docs/truthmark/areas/**/*.md`.

## Core Rules

- Paths are repository-relative POSIX paths.
- Arrays are sorted lexicographically unless source order is part of the contract.
- File discovery honors Git ignore rules through `git ls-files --exclude-standard` and then applies Truthmark config ignores, so ignored local artifacts are not indexed.
- Symbol extraction v0 covers JavaScript and TypeScript source files.
- Managed agent Markdown surfaces such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and Copilot instructions are classified as generated files rather than ordinary docs.
- Route ownership comes from Truthmark area files, not from package structure or import graphs.
- RepoIndex and RouteMap are derived artifacts. They speed up routing and review, but they do not override source files, route files, or truth docs.

## Runtime Dependency Boundary

RepoIndex requires the Truthmark CLI or an equivalent local runner to compute. If the CLI is unavailable, agents must inspect `.truthmark/config.yml`, route files, changed source files, and routed truth docs directly. Workflows may proceed manually, but completion reports must say RepoIndex and RouteMap were not generated.

If a RepoIndex or RouteMap artifact conflicts with the current checkout, the checkout wins. Agents must rerun the CLI when available or ignore the stale artifact when it cannot be regenerated.

## Product Decisions

- Decision (2026-05-16): RepoIndex v0 is a local deterministic acceleration layer, not a source of truth.
- Decision (2026-05-16): RouteMap v0 is aligned to `docs/truthmark/areas.md` instead of introducing a parallel ownership schema.

## Rationale

Keeping repository intelligence derived preserves Truthmark's branch-local review boundary. Teams can use fast machine-readable context when the CLI is available without making installed workflows unusable in constrained agent environments.

## Primary Code Files

- `src/repo-index/build.ts`
- `src/repo-index/file-tree.ts`
- `src/repo-index/route-map.ts`
- `src/repo-index/types.ts`
