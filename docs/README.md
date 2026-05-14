---
status: active
doc_type: index
last_reviewed: 2026-05-15
source_of_truth:
  - docs/ai/repo-rules.md
  - ../.truthmark/config.yml
---

# Truthmark Docs Index

## Purpose

`docs/` is Truthmark's canonical repository documentation tree. It keeps repository-wide agent rules, reusable standards, current architecture, and current truth docs separate from onboarding copy and historical planning notes.

`AGENTS.md` is the agent entry point, but it delegates repository-wide rules to [docs/ai/repo-rules.md](ai/repo-rules.md). [README.md](../README.md) remains the human onboarding and product entry point. `.truthmark/config.yml` defines the committed hierarchy contract.

## Scope

This doc defines the current structure, navigation map, and maintenance expectations of Truthmark's canonical `docs/` tree.

## Authority Source

Repository-wide conflict order and completion policy live in [docs/ai/repo-rules.md](ai/repo-rules.md). Use this index for navigation and document-class guidance; it does not restate the full authority hierarchy.

[README.md](../README.md) may help with onboarding and positioning, but it must not override current-state docs or repository-wide agent rules.

## Audience Split

### Agent-centric docs

- `docs/ai/` for repository rules and agent onboarding
- `docs/truthmark/` for routing metadata
- `docs/standards/` for reusable constraints and completion rules
- `docs/architecture/` for current system structure
- `docs/truth/` for current behavior and invariants
- `docs/templates/` for editable scaffold templates used to create new docs
- `docs/truth/contracts.md` for stable contracts the CLI exposes

### Human-centric docs

- [README.md](../README.md) for onboarding and positioning

## Directory Map

| Path | Type | Primary audience | Purpose |
| --- | --- | --- | --- |
| `docs/ai/` | agent rules | agent | Repository-wide rules and fast onboarding |
| `docs/truthmark/` | routing | both | Truth-routing metadata such as `areas.md` and `areas/**/*.md` |
| `docs/standards/` | standard | agent | Reusable constraints, verification rules, completion gates |
| `docs/architecture/` | architecture | agent | Current structure and module boundaries |
| `docs/truth/` | truth | agent | Current behavior for init, check, contracts, and installed workflows |
| `docs/templates/` | template | both | Editable templates for scaffolded docs; templates are not Truth Sync targets |

## Frontmatter Policy

Canonical docs should include frontmatter and keep these fields current:

- `status`
- `doc_type`
- `last_reviewed`
- `source_of_truth`

## Update Rules

- When repository-wide agent policy changes, update [docs/ai/repo-rules.md](ai/repo-rules.md).
- When code-to-doc routing changes, update [docs/truthmark/areas.md](truthmark/areas.md) in the same change.
- When `truthmark init` or scaffolded files change, update the relevant truth or architecture doc, not only [README.md](../README.md).
- When `truthmark check` changes what it validates or how it reports diagnostics, update both the current truth doc and the contract doc.
- When major product, onboarding, install, command, positioning, or workflow behavior changes, review the root [README.md](../README.md) and update it if the human entry point would otherwise be stale.
- Keep planning or proposal material outside the canonical current-state docs until it becomes implemented truth.
- When current behavior changes for architecture, contracts, or truth docs, update the owning canonical doc's `Product Decisions` and `Rationale` sections in the same change.
- Do not keep parallel documentation trees for the same subject.

## Important Truthmark-Specific Caveat

New repositories should run `truthmark config` before `truthmark init` so teams can review the committed hierarchy contract before workflow surfaces are installed. The current scaffold writes a root route index plus one child route file under the configured routing root.

## Recommended Reading Order

### For humans

1. [README.md](../README.md)
2. [.truthmark/config.yml](../.truthmark/config.yml)
3. [docs/ai/repo-rules.md](ai/repo-rules.md)
4. [docs/architecture/overview.md](architecture/overview.md)
5. the relevant truth or standard doc for the area being changed

### For agents

1. [docs/ai/repo-rules.md](ai/repo-rules.md)
2. [docs/ai/agent-onboarding.md](ai/agent-onboarding.md), when routing is unclear or cross-area
3. [docs/truthmark/areas.md](truthmark/areas.md), when mapping code to canonical truth
4. [docs/architecture/module-map.md](architecture/module-map.md), when changing module boundaries
5. the relevant standard and truth docs for the task

Use [docs/truth/routing-examples.md](truth/routing-examples.md) when designing areas for larger API, frontend, infrastructure, or monorepo repositories.

## Maintenance Principle

The canonical tree should stay small, explicit, and current. Historical notes are useful for traceability, but current behavior belongs in the nearest maintained document class, not in old plans or chat summaries.

## Product Decisions

- Decision (2026-05-15): The docs index owns navigation and document-class guidance for the canonical tree, while [docs/ai/repo-rules.md](ai/repo-rules.md) owns repository-wide authority order and completion policy.

## Rationale

Keeping the docs index focused on navigation avoids loading duplicated authority prose while still giving agents and maintainers one stable place to resolve where current truth should live before they edit deeper canonical docs.
