---
status: active
doc_type: index
last_reviewed: 2026-05-12
source_of_truth:
  - docs/ai/repo-rules.md
  - ../.truthmark/config.yml
---

# Truthmark Docs Index

## Purpose

`docs/` is Truthmark's canonical repository documentation tree. It keeps repository-wide agent rules, reusable standards, current architecture, and current feature behavior separate from onboarding copy and historical planning notes.

`AGENTS.md` is the agent entry point, but it delegates repository-wide rules to [docs/ai/repo-rules.md](ai/repo-rules.md). [README.md](../README.md) remains the human onboarding and product entry point. `.truthmark/config.yml` defines the committed hierarchy contract.

## Authority Order

When documents conflict, authority descends in this order:

1. [docs/ai/repo-rules.md](ai/repo-rules.md) for repository-wide agent rules and completion policy
2. [.truthmark/config.yml](../.truthmark/config.yml) for the committed hierarchy contract
3. [docs/truthmark/areas.md](truthmark/areas.md) and `docs/truthmark/areas/**/*.md` for code-to-doc routing metadata
4. `docs/standards/**/*.md` for reusable repository standards
5. `docs/architecture/**/*.md` for current structure and module boundaries
6. `docs/features/**/*.md` for current product behavior and contracts

[README.md](../README.md) may help with onboarding and positioning, but it must not override current-state docs.

## Audience Split

### Agent-centric docs

- `docs/ai/` for repository rules and agent onboarding
- `docs/truthmark/` for routing metadata
- `docs/standards/` for reusable constraints and completion rules
- `docs/architecture/` for current system structure
- `docs/features/` for current behavior and invariants
- `docs/templates/` for editable scaffold templates used to create new docs
- `docs/features/contracts.md` for stable contracts the CLI exposes

### Human-centric docs

- [README.md](../README.md) for onboarding and positioning

## Directory Map

| Path | Type | Primary audience | Purpose |
| --- | --- | --- | --- |
| `docs/ai/` | agent rules | agent | Repository-wide rules and fast onboarding |
| `docs/truthmark/` | routing | both | Truth-routing metadata such as `areas.md` and `areas/**/*.md` |
| `docs/standards/` | standard | agent | Reusable constraints, verification rules, completion gates |
| `docs/architecture/` | architecture | agent | Current structure and module boundaries |
| `docs/features/` | feature | agent | Current behavior for init, check, contracts, and installed workflows |
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
- When `truthmark init` or scaffolded files change, update the relevant feature or architecture doc, not only [README.md](../README.md).
- When `truthmark check` changes what it validates or how it reports diagnostics, update both the current feature doc and the contract doc.
- When major product, onboarding, install, command, positioning, or workflow behavior changes, review the root [README.md](../README.md) and update it if the human entry point would otherwise be stale.
- Keep planning or proposal material outside the canonical current-state docs until it becomes implemented truth.
- When current behavior changes for architecture, contracts, or features, update the owning canonical doc's `Product Decisions` and `Rationale` sections in the same change.
- Do not keep parallel documentation trees for the same subject.

## Important Truthmark-Specific Caveat

New repositories should run `truthmark config` before `truthmark init` so teams can review the committed hierarchy contract before workflow surfaces are installed. The current scaffold writes a root route index plus one child route file under the configured routing root.

## Recommended Reading Order

### For humans

1. [README.md](../README.md)
2. [.truthmark/config.yml](../.truthmark/config.yml)
3. [docs/ai/repo-rules.md](ai/repo-rules.md)
4. [docs/architecture/overview.md](architecture/overview.md)
5. the relevant feature or standard doc for the area being changed

### For agents

1. [docs/ai/repo-rules.md](ai/repo-rules.md)
2. [docs/ai/agent-onboarding.md](ai/agent-onboarding.md)
3. [docs/truthmark/areas.md](truthmark/areas.md)
4. [docs/architecture/module-map.md](architecture/module-map.md)
5. the relevant standard and feature docs for the task

Use [docs/features/routing-examples.md](features/routing-examples.md) when designing areas for larger API, frontend, infrastructure, or monorepo repositories.

## Maintenance Principle

The canonical tree should stay small, explicit, and current. Historical notes are useful for traceability, but current behavior belongs in the nearest maintained document class, not in old plans or chat summaries.
