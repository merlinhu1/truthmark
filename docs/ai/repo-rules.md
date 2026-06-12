---
status: active
doc_type: agent-rules
last_reviewed: 2026-06-12
source_of_truth:
  - ../../AGENTS.md
  - ../README.md
  - ../architecture/product-boundary.md
---

# Repository Rules

Repository-wide agent authority, routing, and completion rules. Read the smallest sufficient set; detailed behavior lives in [docs/](../README.md).

## Authority

Conflict order:

1. this file
2. [.truthmark/config.yml](../../.truthmark/config.yml)
3. [docs/truthmark/routes/areas.md](../truthmark/routes/areas.md) and `docs/truthmark/routes/areas/**/*.md`
4. `docs/standards/**/*.md`
5. `docs/architecture/**/*.md`
6. `docs/truthmark/truth/**/*.md`

Authoritative context is the current checkout plus user-provided session context; chat, external notes, and off-repo memory are non-authoritative unless committed or supplied now.

Code is the implementation. On code/doc conflict, inspect code, decide whether code is intentional or docs are stale, update stale docs for intentional behavior, and change code to match docs only when requested or required.

## Product Boundary

The canonical product boundary is [docs/architecture/product-boundary.md](../architecture/product-boundary.md). Read it before generating any new design, implementation plan, generated-workflow redesign, architecture proposal, runtime/dependency change, or command-surface change. New designs and plans must include a product-boundary check that explains how the proposal preserves Truthmark's North Star, in-scope surfaces, explicit non-goals, optional-helper rule, and fail-closed write boundaries.

Truthmark public CLI commands are `config`, `init`, `check`, `index`, `impact`, `context`, `workflow`, and `validate`. The `workflow` subcommands expose read-only agent-facing status/instructions contracts; they do not run installed workflows. The `validate` subcommands are optional CLI-owned workflow helper validators; they validate reports or write leases but do not run Truth Structure, Truth Document, Truth Sync, Truth Preview, Truth Realize, or Truth Check. Those named workflows are installed workflow surfaces, not top-level CLI commands.

Agents inspect the active checkout directly. There is no daemon, database, remote service, hidden memory layer, or product-centered MCP server.

## Rules

1. Workflow and skill quality, performance, dispatch clarity, and agent effectiveness are the highest-priority repo concerns. Treat workflows and skills as the core product surface of this agent-native project; when tradeoffs conflict, optimize them before secondary structure, convenience, or polish.
2. Product boundaries are mandatory design inputs. Before generating a new design or plan, read [docs/architecture/product-boundary.md](../architecture/product-boundary.md) and include its product-boundary check in the design/plan artifact.
3. Rules in this file are a compact behavior contract for observed repository failure modes. Prefer replacing weak or stale rules over accumulating generic prompts, identity statements, examples, or tool-dependent ceremony.
4. Branch-local Markdown is canonical; the current checkout is the truth boundary.
5. Current truth belongs in canonical docs, not historical plans or separate timestamped decision logs.
6. Active decisions and rationale live in the canonical doc for the governed behavior.
7. Read owning surfaces before writing: for workflows, skills, prompts, commands, generated instructions, or managed blocks, inspect the nearest canonical doc plus the source renderer, template, schema, or parser before editing.
8. Generated surfaces are products, not source authority. Edit templates and renderers by default; patch generated output only when explicitly maintaining that generated surface.
9. Claims about commands, platforms, runtime topology, services, generated surfaces, or workflow capabilities require primary checkout evidence. Surface desired-vs-implemented conflicts instead of averaging patterns or inventing future behavior.
10. Deterministic policy belongs in code, schemas, parsers, templates, or checks when the repository can enforce it. Use model-facing workflow prose to guide agents, not as the only guard for repeatable routing, ownership, parsing, or generation decisions.
11. Keep routing explicit: when a code area changes canonical docs, update truth routing in the same change.
12. Behavior, contract, workflow, and completion-rule changes update the nearest canonical doc. Major product/onboarding/install/command/positioning/workflow changes also update the root README. A material root README change blocks completion until the localized root READMEs change in the same working change.
13. Follow established module boundaries and existing generated-surface patterns; avoid duplicate surfaces, single-use abstractions, speculative configurability, and impossible-scenario error handling.
14. Verify the text and file contracts that changed with the narrowest evidence that can falsify them: generated diffs, structured parsers, snapshots, fixture round-trips, build/package/check commands, or focused tests. Do not run broad tests as ceremony when they add no evidence; state skipped checks.
15. Work surgically and fail visibly: surface assumptions, conflicts, skipped files, blocked ownership, and unverified claims; touch only request-traceable lines, match existing style, checkpoint long workflow or skill edits, and report unrelated issues instead of editing them.

## Instruction Surface Boundary

In `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md`, only text between `<!-- truthmark:start -->` and `<!-- truthmark:end -->` is the generated Truthmark workflow surface. Repo-local preamble outside those markers should delegate to this file and conditional routing docs, not duplicate completion policy. Do not put this repository's internal policy, completion gates, or maintainer-only standards inside marker-delimited blocks, package templates, installed workflow skills, prompts, or downstream scaffold output.

## Completion Gate

Before declaring changed repository work complete, apply [docs/standards/pre-completion-checklist.md](../standards/pre-completion-checklist.md) and [docs/standards/testing-and-verification.md](../standards/testing-and-verification.md). Skip this gate only for read-only or no-file-change sessions, and state the skip reason when completion or verification would otherwise be expected.

## Routing

Fast task routing lives in [agent-onboarding.md](agent-onboarding.md). Read only the docs that govern the slice you are changing.

If blocked, re-read the relevant canonical docs and owning implementation, then surface the blocker instead of guessing. If one file diverges from an established pattern, require justification before copying it.

## Maintenance

Update this file only for repository-wide agent rules. Keep it compact and policy-focused. Put procedures in standards or guides, feature behavior in `docs/truthmark/truth`, and update `last_reviewed`.
