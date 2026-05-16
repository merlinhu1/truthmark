---
status: active
doc_type: agent-rules
last_reviewed: 2026-05-16
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
6. `docs/truth/**/*.md`

Authoritative context is the current checkout plus user-provided session context; chat, external notes, and off-repo memory are non-authoritative unless committed or supplied now.

Code is the implementation. On code/doc conflict, inspect code, decide whether code is intentional or docs are stale, update stale docs for intentional behavior, and change code to match docs only when requested or required.

## Product Boundary

Truthmark public CLI commands are `config`, `init`, `check`, `index`, `impact`, and `context`. Truth Structure, Truth Document, Truth Sync, Truth Realize, and Truth Check are installed workflow surfaces, not CLI commands.

Agents inspect the active checkout directly. There is no daemon, database, remote service, or V1 MCP server.

## Rules

1. Workflow and skill quality, performance, dispatch clarity, and agent effectiveness are the highest-priority repo concerns. Treat workflows and skills as the core product surface of this agent-native project; when tradeoffs conflict, optimize them before secondary structure, convenience, or polish.
2. Rules in this file are a compact behavior contract for observed repository failure modes. Prefer replacing weak or stale rules over accumulating generic prompts, identity statements, examples, or tool-dependent ceremony.
3. Branch-local Markdown is canonical; the current checkout is the truth boundary.
4. Current truth belongs in canonical docs, not historical plans or separate timestamped decision logs.
5. Active decisions and rationale live in the canonical doc for the governed behavior.
6. Read owning surfaces before writing: for workflows, skills, prompts, commands, generated instructions, or managed blocks, inspect the nearest canonical doc plus the source renderer, template, schema, or parser before editing.
7. Generated surfaces are products, not source authority. Edit templates and renderers by default; patch generated output only when explicitly maintaining that generated surface.
8. Claims about commands, platforms, runtime topology, services, generated surfaces, or workflow capabilities require primary checkout evidence. Surface desired-vs-implemented conflicts instead of averaging patterns or inventing future behavior.
9. Deterministic policy belongs in code, schemas, parsers, templates, or checks when the repository can enforce it. Use model-facing workflow prose to guide agents, not as the only guard for repeatable routing, ownership, parsing, or generation decisions.
10. Keep routing explicit: when a code area changes canonical docs, update truth routing in the same change.
11. Behavior, contract, workflow, and completion-rule changes update the nearest canonical doc. Major product/onboarding/install/command/positioning/workflow changes also update the root README. A material root README change blocks completion until the localized root READMEs change in the same working change.
12. Follow established module boundaries and existing generated-surface patterns; avoid duplicate surfaces, single-use abstractions, speculative configurability, and impossible-scenario error handling.
13. Verify the text and file contracts that changed with the narrowest evidence that can falsify them: generated diffs, structured parsers, snapshots, fixture round-trips, build/package/check commands, or focused tests. Do not run broad tests as ceremony when they add no evidence; state skipped checks.
14. Work surgically and fail visibly: surface assumptions, conflicts, skipped files, blocked ownership, and unverified claims; touch only request-traceable lines, match existing style, checkpoint long workflow or skill edits, and report unrelated issues instead of editing them.

## Instruction Surface Boundary

In `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`, only text between `<!-- truthmark:start -->` and `<!-- truthmark:end -->` is the generated Truthmark workflow surface. Repo-local preamble outside those markers should delegate to this file and conditional routing docs, not duplicate completion policy. Do not put this repository's internal policy, completion gates, or maintainer-only standards inside marker-delimited blocks, package templates, installed workflow skills, prompts, or downstream scaffold output.

## Completion Gate

Before declaring changed repository work complete, apply [docs/standards/pre-completion-checklist.md](../standards/pre-completion-checklist.md) and [docs/standards/testing-and-verification.md](../standards/testing-and-verification.md). Skip this gate only for read-only or no-file-change sessions, and state the skip reason when completion or verification would otherwise be expected.

## Routing

Fast task routing lives in [agent-onboarding.md](agent-onboarding.md). Read only the docs that govern the slice you are changing.

If blocked, re-read the relevant canonical docs and owning implementation, then surface the blocker instead of guessing. If one file diverges from an established pattern, require justification before copying it.

## Maintenance

Update this file only for repository-wide agent rules. Keep it compact and policy-focused. Put procedures in standards or guides, feature behavior in `docs/truth`, and update `last_reviewed`.
