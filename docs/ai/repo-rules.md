---
status: active
doc_type: agent-rules
last_reviewed: 2026-05-10
source_of_truth:
  - ../../AGENTS.md
  - ../README.md
  - ../../TRUTHMARK.md
---

# Repository Rules

Repository-wide agent authority, routing, and completion rules. Prefer the smallest sufficient read; detailed behavior lives in [docs/](../README.md).

## Authority

Conflict order:

1. this file
2. [TRUTHMARK.md](../../TRUTHMARK.md)
3. [docs/truthmark/areas.md](../truthmark/areas.md) and `docs/truthmark/areas/**/*.md`
4. `docs/standards/**/*.md`
5. `docs/architecture/**/*.md`
6. `docs/features/**/*.md`

Authoritative context is the current checkout plus user-provided session context; chat, external notes, and off-repo memory are non-authoritative unless committed or supplied now.

Code is the implementation. On code/doc conflict, inspect code, decide whether code is intentional or docs are stale, update stale docs for intentional behavior, and change code to match docs only when requested or clearly required.

## Product Boundary

Truthmark is a local-first Node/TypeScript repository truth protocol. CLI commands are `config`, `init`, and `check`; Truth Structure, Truth Sync, Truth Realize, and Truth Check are installed workflow surfaces, not CLI commands. Runtime is installed `SKILL.md` files plus the managed `AGENTS.md` block. `config` writes `.truthmark/config.yml` (`platforms` selects agent surfaces), `init` installs or refreshes surfaces, and `check` validates truth artifacts. Agents inspect the active worktree directly. No daemon, database, remote service, or V1 MCP server.

## Rules

1. Branch-local Markdown is canonical; the current checkout is the truth boundary.
2. Current truth belongs in canonical docs, not historical plans or separate timestamped decision logs.
3. Active decisions and rationale live in the canonical doc for the governed behavior.
4. The `AGENTS.md` Truthmark block is generated; edit templates, not the managed block, unless explicitly maintaining the generated surface.
5. Document implemented V1 behavior only; do not add speculative commands, services, or capabilities.
6. Keep routing explicit: when a code area changes canonical docs, update truth routing in the same change.
7. Behavior, contract, workflow, and completion-rule changes update the nearest canonical doc; major product/onboarding/install/command/positioning/workflow changes also review the root README and localized variants.
8. Follow established module boundaries; avoid duplicate surfaces, single-use abstractions, speculative configurability, and impossible-scenario error handling.
9. Use [testing-and-verification.md](../standards/testing-and-verification.md) and [pre-completion-checklist.md](../standards/pre-completion-checklist.md); define success criteria and loop until verified or blocked.
10. Work surgically: surface material assumptions or ambiguity, touch only request-traceable lines, match existing style, clean up only artifacts made unused by the current change, and report unrelated issues instead of editing them.

## Routing

When unfamiliar, start with [docs/README.md](../README.md), [overview.md](../architecture/overview.md), [module-map.md](../architecture/module-map.md), and [contracts.md](../features/contracts.md).

- CLI/scaffold: [init-and-scaffold.md](../features/init-and-scaffold.md), [contracts.md](../features/contracts.md), plus [maintaining-repository-truth.md](../standards/maintaining-repository-truth.md) for docs placement or AGENTS management; new repos run `truthmark config` before `truthmark init`.
- Check/routing/validation: [check-diagnostics.md](../features/check-diagnostics.md), [documentation-governance.md](../standards/documentation-governance.md), [contracts.md](../features/contracts.md).
- Workflows/reporting: [TRUTHMARK.md](../../TRUTHMARK.md), [installed-workflows.md](../features/installed-workflows.md), plus [maintaining-repository-truth.md](../standards/maintaining-repository-truth.md) for routing or canonical doc placement.
- Docs organization: [docs/README.md](../README.md), [documentation-governance.md](../standards/documentation-governance.md), [maintaining-repository-truth.md](../standards/maintaining-repository-truth.md).

If blocked, re-read the relevant canonical docs and owning implementation, then surface the blocker instead of guessing. When one file diverges from an established pattern, require justification before copying it.

## Maintenance

Update this file only for repository-wide agent rules. Keep it compact and policy-focused; move procedures to standards or guides, keep feature behavior in `docs/features`, and update `last_reviewed`.
