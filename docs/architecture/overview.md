---
status: active
doc_type: architecture
last_reviewed: 2026-05-09
source_of_truth:
  - ../../TRUTHMARK.md
  - ../features/contracts.md
  - ../features/init-and-scaffold.md
  - ../features/check-diagnostics.md
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
- [TRUTHMARK.md](../../TRUTHMARK.md)
- [docs/truthmark/areas.md](../truthmark/areas.md)
- canonical docs under `docs/`
- the managed Truthmark block inside [AGENTS.md](../../AGENTS.md)
- the generated Codex Truth Structure, Truth Sync, Truth Realize, and Truth Check skills under `.codex/skills/`
- the generated OpenCode Truth Structure, Truth Sync, Truth Realize, and Truth Check skills under `.opencode/skills/`
- configured platform instruction files such as [AGENTS.md](../../AGENTS.md), `CLAUDE.md`, `.cursor/rules/truthmark.mdc`, `.github/copilot-instructions.md`, and `GEMINI.md`
- Gemini custom command surfaces under `.gemini/commands/truthmark/*.toml`

Generated workflow surfaces are committed repository files with Truthmark version markers. The V1 upgrade path is to upgrade the package, rerun `truthmark init`, and review the generated diffs.

## Core Pipelines

### Config and init pipeline

`truthmark config` writes the committed hierarchy contract to `.truthmark/config.yml`.

`truthmark init` requires that config, resolves the active repository, creates missing structural files for the configured hierarchy, reads the configured `platforms` list, writes or refreshes only those platform surfaces, and returns a structured list of created, updated, or unchanged files plus any migration-review diagnostics. The default scaffold creates feature `README.md` files as indexes and seeds current behavior truth in bounded leaf docs such as `<feature-root>/<default-area>/overview.md`. It does not delete platform files when a platform is removed from config, and it does not silently move existing truth docs when hierarchy changes.

Key implementation surfaces:

- `src/cli/*` for command wiring
- `src/init/init.ts` for orchestration
- `src/templates/*` for scaffold contents
- `src/fs/paths.ts` for containment-safe writes

### Check pipeline

`truthmark check` resolves branch-scope metadata, loads config, then validates authority entries, area mappings, frontmatter, and internal links before returning diagnostics plus branch-scope data.

Key implementation surfaces:

- `src/checks/*` for individual validation passes
- `src/config/*` for config loading and schema validation
- `src/routing/areas.ts` for `docs/truthmark/areas.md` parsing
- `src/markdown/*` for document parsing and hashing
- `src/output/*` for result rendering

### Installed workflow support

Truthmark also contains support primitives for the installed Truth Structure, Truth Sync, Truth Realize, and Truth Check workflows:

- `src/agents/*` renders the installed instruction text used in the managed AGENTS block
- `src/templates/codex-skills.ts` renders the generated Codex and OpenCode skills for explicit workflow invocation
- `src/sync/*` classifies functional-code paths and renders Truth Sync reports
- `src/realize/report.ts` renders the Truth Realize completion report shape

These modules support the installed workflow contract even though V1 does not expose dedicated CLI entrypoints for structure, sync, realization, or check workflows.

## Branch Scope

Branch scope is computed from the active Git worktree, current branch or detached HEAD, and hashes of the core Truthmark control files:

- `.truthmark/config.yml`
- [TRUTHMARK.md](../../TRUTHMARK.md)
- the configured root route index plus configured child route files

This keeps routing and diagnostics tied to the active checkout rather than to external memory.

Normal branch checkouts are identified by branch name plus HEAD SHA. Detached checkouts are identified by commit SHA. Worktrees include the current worktree path in branch-scope data so parallel checkouts do not silently share a truth identity.

## Polyglot Code Surface

Truth Sync path classification is multi-language and path-based. `truthmark check` coverage diagnostics reuse the same functional-code classifier across common code roots so V1 can support Go, Python, C#, and Java repositories at a minimum, in addition to JavaScript and TypeScript projects.

Current automatic coverage discovery scans common roots such as `src/`, `cmd/`, `internal/`, `pkg/`, `scripts/`, `server/`, `services/`, `app/`, `lib/`, and `bin/`. Area mappings remain the authority for which truth docs own each code surface.

## Primary Code Files

- `src/cli/program.ts`
- `src/init/init.ts`
- `src/checks/check.ts`
- `src/checks/authority.ts`
- `src/checks/areas.ts`
- `src/sync/surfaces.ts`
- `src/agents/instructions.ts`
- `src/templates/codex-skills.ts`

## Product Decisions

- Truthmark is config-first: repositories review committed hierarchy before installed workflow surfaces are generated.
- Hierarchical routing is the only scaffold model in V1, with one child delegation level from the root route index.
- Default feature scaffolding uses index `README.md` files plus bounded leaf truth docs so Truth Sync has a small current-behavior target from the first init.
- Current architecture and feature docs carry their own active decisions and rationale instead of delegating that truth to historical ADR-style logs.
- The current checkout is the truth boundary; Truthmark does not create off-repo memory, packet files, or cache files that compete with branch-local Markdown.
- Branch identity is diagnostic metadata, not an external authority source. It helps agents and humans see which checkout was validated without moving truth outside Git.

## Rationale

Separating hierarchy definition from workflow installation reduces accidental churn and makes generated agent behavior easier to reason about. Limiting routing delegation to one level keeps path resolution and diagnostics simple enough to audit. Keeping decisions in canonical docs improves reconstruction and maintenance because the current why lives beside the current what.

Avoiding generated context artifacts keeps the repository itself reviewable and prevents stale helper output from becoming a shadow source of truth.
