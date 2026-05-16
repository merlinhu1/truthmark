---
status: active
doc_type: architecture
last_reviewed: 2026-05-16
source_of_truth:
  - ../../.truthmark/config.yml
  - ../truth/contracts.md
  - ../truth/init-and-scaffold.md
  - ../truth/check-diagnostics.md
  - ../truth/workflows/overview.md
  - ../truth/workflows/shared-gates.md
---

# Architecture Overview

## Scope

This document describes Truthmark's current V1 architecture as implemented today.

## Runtime Model

Truthmark is a one-shot Node and TypeScript CLI. It runs against the active Git worktree, reads and writes repository files directly, and exits after producing diagnostics or scaffolding updates.

Truthmark does not currently include:

- a daemon
- a database
- a hosted service
- an MCP server
- packet or context-cache artifacts
- cross-branch memory

The durable surfaces are ordinary repository files:

- `.truthmark/config.yml`
- [docs/truthmark/areas.md](../truthmark/areas.md)
- canonical docs under `docs/`
- the managed Truthmark block inside [AGENTS.md](../../AGENTS.md)
- generated Truth Structure, Truth Document, Truth Sync, Truth Preview, Truth Realize, and Truth Check surfaces under `.codex/skills/`, `.opencode/skills/`, `.claude/skills/`, `.github/prompts/`, and `.gemini/commands/truthmark/`
- Codex workflow metadata under `.codex/skills/truthmark-*/agents/openai.yaml`
- configured platform instruction files such as [AGENTS.md](../../AGENTS.md), `CLAUDE.md`, `.github/copilot-instructions.md`, and `GEMINI.md`

Generated workflow surfaces are committed repository files with Truthmark version markers. The V1 upgrade path is to upgrade the package, rerun `truthmark init`, and review the generated diffs.

## Boundaries

- The CLI owns committed config, routing, diagnostics, scaffolded files, and generated workflow surfaces inside the active repository.
- Repository truth stays in Git-tracked Markdown and managed instruction surfaces rather than off-repo caches, daemons, or hosted services.
- Architecture docs own structure and ownership boundaries; behavior and contract docs own ordinary product behavior and machine-facing contracts.

## Core Pipelines

### Config and init pipeline

`truthmark config` writes the committed hierarchy contract to `.truthmark/config.yml`.

`truthmark init` requires that config, resolves the active repository, creates missing structural files for the configured hierarchy, reads the configured `platforms` list, writes or refreshes only those platform surfaces, and returns a structured list of created, updated, or unchanged files plus any migration-review diagnostics. The default scaffold creates truth `README.md` files as indexes and seeds current behavior truth in bounded leaf docs such as `<truth-root>/<default-area>/overview.md`. It does not delete platform files when a platform is removed from config, and it does not silently move existing truth docs when hierarchy changes.

Key implementation surfaces:

- `src/cli/*` for command wiring
- `src/init/init.ts` for orchestration
- `src/templates/*` for scaffold contents
- `src/fs/paths.ts` for containment-safe writes

### Check pipeline

`truthmark check` resolves branch-scope metadata, loads config, then validates authority entries, area mappings, frontmatter, internal links, decision structure, generated surfaces, and unmapped coverage before returning diagnostics plus branch-scope data.

Key implementation surfaces:

- `src/checks/*` for individual validation passes
- `src/config/*` for config loading and schema validation
- `src/routing/*` for `docs/truthmark/areas.md` parsing and area resolution
- `src/markdown/*` for document parsing and hashing
- `src/output/*` for result rendering

### Installed workflow support

Truthmark also contains support primitives for the installed Truth Structure, Truth Document, Truth Sync, Truth Preview, Truth Realize, and Truth Check workflows:

- `src/templates/agents-block.ts` renders compact managed instruction blocks
- `src/agents/*` renders detailed workflow and skill text for explicit workflow invocation
- `src/templates/workflow-surfaces.ts` renders generated skill, prompt, command, and metadata content for configured platforms
- `src/templates/generated-surfaces.ts` assembles configured platform surfaces from the renderers
- `src/sync/*` classifies functional-code paths and renders Truth Sync reports
- `src/realize/report.ts` renders the Truth Realize completion report shape

These modules support the installed workflow contract even though V1 does not expose dedicated CLI entrypoints for the installed Truth Structure, Truth Document, Truth Sync, Truth Preview, Truth Realize, or Truth Check workflows.

## Architecture Doc Boundary

Truthmark should maintain architecture docs when a change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.

Ordinary product behavior, endpoint details, UI copy, validation rules, and bug fixes belong in behavior or contract docs unless they change those architecture boundaries. Architecture docs should describe structure and ownership rather than becoming a second home for product truth.

## Branch Scope

Branch scope is computed from the active Git worktree, current branch or detached HEAD, and hashes of the core Truthmark control files:

- `.truthmark/config.yml`
- the configured root route index plus configured child route files

This keeps routing and diagnostics tied to the active checkout rather than to external memory.

Normal branch checkouts are identified by branch name plus HEAD SHA. Detached checkouts are identified by commit SHA. Worktrees include the current worktree path in branch-scope data so parallel checkouts do not silently share a truth identity.

## Polyglot Code Surface

Truth Sync path classification is multi-language and path-based. `truthmark check` coverage diagnostics reuse the same functional-code classifier across common code roots so V1 can support Go, Python, C#, and Java repositories at a minimum, in addition to JavaScript and TypeScript projects.

Current automatic coverage discovery scans common roots such as `src/`, `api/`, `app/`, `apps/`, `cmd/`, `frontend/`, `infra/`, `internal/`, `k8s/`, `lib/`, `packages/`, `proto/`, `schema/`, `scripts/`, `server/`, `services/`, `terraform/`, `web/`, and `.github/workflows/`. Area mappings remain the authority for which truth docs own each code surface.

## Primary Code Files

- `src/cli/program.ts`
- `src/init/init.ts`
- `src/checks/check.ts`
- `src/checks/authority.ts`
- `src/checks/areas.ts`
- `src/sync/surfaces.ts`
- `src/agents/instructions.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/generated-surfaces.ts`
- `src/templates/agents-block.ts`

## Product Decisions

- Truthmark is config-first: repositories review committed hierarchy before installed workflow surfaces are generated.
- Hierarchical routing is the only scaffold model in V1, with one child delegation level from the root route index.
- Default truth scaffolding uses index `README.md` files plus bounded leaf truth docs so Truth Sync has a small current-behavior target from the first init.
- Current architecture and truth docs carry their own active decisions and rationale instead of delegating that truth to historical ADR-style logs.
- Architecture docs are maintained for structure and ownership changes, not for ordinary product behavior.
- The current checkout is the truth boundary; Truthmark does not create off-repo memory, packet files, or cache files that compete with branch-local Markdown.
- Branch identity is diagnostic metadata, not an external authority source. It helps agents and humans see which checkout was validated without moving truth outside Git.

## Rationale

Separating hierarchy definition from workflow installation reduces accidental churn and makes generated agent behavior easier to reason about. Limiting routing delegation to one level keeps path resolution and diagnostics simple enough to audit. Keeping decisions in canonical docs improves reconstruction and maintenance because the current why lives beside the current what.

Avoiding generated context artifacts keeps the repository itself reviewable and prevents stale helper output from becoming a shadow source of truth.
