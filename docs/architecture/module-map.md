---
status: active
doc_type: architecture
last_reviewed: 2026-05-09
source_of_truth:
  - overview.md
---

# Module Map

## Purpose

This is the quick module-level map for the current Truthmark codebase.

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
| `src/git/` | Git repository and worktree resolution plus change listing |
| `src/sync/` | Truth Sync policy and completed, skipped, or blocked report rendering |
| `src/agents/` | Installed Truth Structure, Truth Sync, Truth Realize, and Truth Check instruction text plus shared worker and skill contract fragments |
| `src/realize/` | Truth Realize report rendering |
| `src/output/` | Diagnostic types plus human and JSON rendering shared by CLI and check flows |
| `src/types/` | Local type shims |
| `tests/` | Vitest coverage for CLI, checks, routing, templates, and helpers |

## Practical Routing

- If the change affects scaffolded file contents or generated skill surfaces, start in `src/templates/` and `src/init/`.
- If the change affects diagnostics, start in `src/checks/` and `src/output/`.
- If the change affects installed workflow text or explicit skill surfaces, start in `src/agents/`, `src/sync/`, `src/realize/`, and `src/templates/`.
- If the change affects path safety or repository detection, start in `src/fs/` and `src/git/`.

## Documentation Pairings

- `src/init/`, `src/templates/`, and the write-path parts of `src/fs/` pair with [docs/features/init-and-scaffold.md](../features/init-and-scaffold.md)
- `src/checks/`, `src/routing/`, `src/config/`, `src/output/`, and the containment-path parts of `src/fs/` pair with [docs/features/check-diagnostics.md](../features/check-diagnostics.md)
- `src/agents/`, `src/sync/`, `src/realize/`, and installed workflow skill templates under `src/templates/` pair with [docs/features/installed-workflows.md](../features/installed-workflows.md)

## Product Decisions

- Route ownership stays in Markdown route files rather than being duplicated into config objects.
- `src/agents/` and `src/templates/` render configured hierarchy and decision-truth guidance directly into installed workflow surfaces.
- `src/checks/decisions.ts` belongs with the validation layer because decision-bearing canonical docs are a truth-health concern, not an authoring convenience.

## Rationale

This split keeps layout contract, route ownership, validation, and generated workflow text in predictable places. Agents and maintainers can change one surface without rediscovering unrelated behavior hidden elsewhere.
