---
status: active
doc_type: agent-rules
last_reviewed: 2026-05-13
source_of_truth:
  - ../../AGENTS.md
  - ../README.md
---

# Repository Rules

Repository-wide agent authority, routing, and completion rules. Read the smallest sufficient set; detailed behavior lives in [docs/](../README.md).

## Authority

Conflict order:

1. this file
2. [.truthmark/config.yml](../../.truthmark/config.yml)
3. [docs/truthmark/areas.md](../truthmark/areas.md) and `docs/truthmark/areas/**/*.md`
4. `docs/standards/**/*.md`
5. `docs/architecture/**/*.md`
6. `docs/features/**/*.md`

Authoritative context is the current checkout plus user-provided session context; chat, external notes, and off-repo memory are non-authoritative unless committed or supplied now.

Code is the implementation. On code/doc conflict, inspect code, decide whether code is intentional or docs are stale, update stale docs for intentional behavior, and change code to match docs only when requested or required.

## Product Boundary

Truthmark has three CLI commands: `config`, `init`, and `check`. Truth Structure, Truth Document, Truth Sync, Truth Realize, and Truth Check are installed workflow surfaces, not CLI commands.

Agents inspect the active checkout directly. There is no daemon, database, remote service, or V1 MCP server.

## Rules

1. Branch-local Markdown is canonical; the current checkout is the truth boundary.
2. Current truth belongs in canonical docs, not historical plans or separate timestamped decision logs.
3. Active decisions and rationale live in the canonical doc for the governed behavior.
4. The `AGENTS.md` Truthmark block is generated. Edit templates, not the managed block, unless explicitly maintaining the generated surface.
5. Document implemented V1 behavior only; do not add speculative commands, services, or capabilities.
6. Keep routing explicit: when a code area changes canonical docs, update truth routing in the same change.
7. Behavior, contract, workflow, and completion-rule changes update the nearest canonical doc. Major product/onboarding/install/command/positioning/workflow changes also update the root README. A material root README change blocks completion until the localized root READMEs change in the same working change. 
8. Follow established module boundaries; avoid duplicate surfaces, single-use abstractions, speculative configurability, and impossible-scenario error handling.
9. Follow [testing-and-verification.md](../standards/testing-and-verification.md) and [pre-completion-checklist.md](../standards/pre-completion-checklist.md). Define success criteria. Continue until verified or blocked.
10. Work surgically: surface material assumptions or ambiguity, touch only request-traceable lines, match existing style, clean up only artifacts made unused by the current change, and report unrelated issues instead of editing them.
11. Tests prove supported behavior and current contracts. Do not prove a removal by asserting that a deleted string or file is absent unless that absence is the protected boundary.

## Routing

Fast task routing lives in [agent-onboarding.md](agent-onboarding.md). Read only the docs that govern the slice you are changing.

If blocked, re-read the relevant canonical docs and owning implementation, then surface the blocker instead of guessing. If one file diverges from an established pattern, require justification before copying it.

## Maintenance

Update this file only for repository-wide agent rules. Keep it compact and policy-focused. Put procedures in standards or guides, feature behavior in `docs/features`, and update `last_reviewed`.
