---
status: active
doc_type: architecture
last_reviewed: 2026-05-14
source_of_truth:
  - overview.md
---

# Module Map

## Purpose

This is the quick module-level map for the current Truthmark codebase.

## Scope

This doc covers the current module grouping of the Truthmark codebase and the primary canonical docs that pair with those modules.

## Components

- CLI and config loading: `src/cli/`, `src/config/`, and shared result rendering.
- Scaffold and generated surfaces: `src/init/`, `src/templates/`, and containment-safe write helpers in `src/fs/`.
- Routing and checks: `src/routing/`, `src/checks/`, `src/markdown/`, and repository discovery in `src/git/`.
- Installed workflow support: `src/agents/`, `src/generation/`, `src/sync/`, `src/realize/`, and neutral truth helpers in `src/truth/`.

## Source Layout

| Path | Responsibility |
| --- | --- |
| `src/cli/` | Commander program setup and command dispatch |
| `src/init/` | Config-aware repository scaffold orchestration plus hierarchy migration checks |
| `src/templates/` | Text templates for scaffolded files, the AGENTS block, generated-surface manifests, and generated host-specific explicit surfaces |
| `src/checks/` | Validation passes for authority, areas, generated surfaces, decision-bearing docs, frontmatter, links, and branch scope |
| `src/config/` | `.truthmark/config.yml` schema and loader |
| `src/routing/` | Parsing of the root route index and delegated child route files |
| `src/markdown/` | Markdown discovery, parsing, and hashing helpers |
| `src/fs/` | Repository-safe path resolution and file writes shared by init and diagnostics |
| `src/generation/` | Source-internal content prompt contracts, JSON-safe prompt rendering, and structured draft validation |
| `src/truth/` | Neutral helpers for truth root resolution and evidence report formatting shared by scaffold, checks, sync, and agent renderers |
| `src/git/` | Git repository and worktree resolution plus change listing |
| `src/sync/` | Truth Sync policy and completed, skipped, or blocked report rendering |
| `src/agents/` | Installed Truth Structure, Truth Document, Truth Sync, Truth Realize, and Truth Check instruction text plus shared worker and skill contract fragments |
| `src/realize/` | Truth Realize report rendering |
| `src/output/` | Diagnostic types plus human and JSON rendering shared by CLI and check flows |
| `src/types/` | Local type shims |
| `tests/` | Vitest coverage for CLI, checks, routing, templates, and helpers |

## Practical Routing

- If the change affects scaffolded file contents or generated skill surfaces, start in `src/templates/` and `src/init/`.
- If the change affects diagnostics, start in `src/checks/` and `src/output/`.
- If the change affects installed workflow text, content prompt contracts, or explicit skill surfaces, start in `src/agents/`, `src/generation/`, `src/sync/`, `src/realize/`, and `src/templates/`.
- If the change affects path safety or repository detection, start in `src/fs/` and `src/git/`.

## Documentation Pairings

- `src/init/`, `src/templates/`, and the write-path parts of `src/fs/` pair with [docs/truth/init-and-scaffold.md](../truth/init-and-scaffold.md)
- `src/checks/`, `src/routing/`, `src/config/`, `src/output/`, and the containment-path parts of `src/fs/` pair with [docs/truth/check-diagnostics.md](../truth/check-diagnostics.md)
- `src/agents/`, `src/generation/`, `src/sync/`, `src/realize/`, `src/truth/`, and installed workflow skill templates under `src/templates/` pair with [docs/truth/workflows/overview.md](../truth/workflows/overview.md) and bounded workflow docs under `docs/truth/workflows/`

## Product Decisions

- Route ownership stays in Markdown route files rather than being duplicated into config objects.
- `src/agents/` and `src/templates/` render configured hierarchy and decision-truth guidance directly into installed workflow surfaces.
- Content-generation prompt contracts live outside `src/agents/` so workflow authority and draft-content shaping remain separate.
- `src/checks/decisions.ts` belongs with the validation layer because decision-bearing canonical docs are a truth-health concern, not an authoring convenience.
- Shared truth-root and evidence formatting helpers live in `src/truth/` so scaffold, checks, sync reports, and generated agent text do not duplicate the same domain defaults.

## Rationale

This split keeps layout contract, route ownership, validation, and generated workflow text in predictable places. Agents and maintainers can change one surface without rediscovering unrelated behavior hidden elsewhere.

The generation layer is source-internal in this slice because current packaging builds only the CLI entrypoint. Keeping prompt contracts separate from installed workflow renderers preserves the existing workflow authority model while giving future workflow code a tested draft-contract layer to consume.
