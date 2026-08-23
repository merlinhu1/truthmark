Repository rule source of truth: [docs/repo/ai/repo-rules.md](docs/repo/ai/repo-rules.md). Follow repository instruction files that are present in this checkout; do not assume optional policy docs exist.

Use explicitly configured repository policy docs only when they exist in this checkout.

Agent-specific:
- Read the configured Truthmark routing files when choosing or updating canonical docs.
- Use repository onboarding or docs-map files only when present and needed for unclear or cross-area routing.

<!-- repo-rules:start -->
<!-- Generated from docs/repo/ai/repo-rules.md by `npm run render:repo-rules`. Edit the source doc, not this block. -->

## Authority

Conflict order:

1. this file (`docs/repo/ai/repo-rules.md`)
2. [.truthmark/config.yml](.truthmark/config.yml)
3. [docs/truthmark/routes/areas.md](docs/truthmark/routes/areas.md) and `docs/truthmark/routes/areas/**/*.md`
4. `docs/repo/standards/**/*.md`
5. `docs/repo/architecture/**/*.md`
6. `docs/truthmark/product/**/*.md` and `docs/truthmark/engineering/**/*.md`

Authoritative context is the current checkout plus user-provided session context; chat, external notes, and off-repo memory are non-authoritative unless committed or supplied now.

Code is the implementation. On code/doc conflict, inspect code, decide whether code is intentional or docs are stale, update stale docs for intentional behavior, and change code to match docs only when requested or required.

## Documentation Scope

Everything under `docs/repo/**` is repo-local policy for developing Truthmark itself. It ships to nobody, `src/**` never references it, and it is not a downstream scaffold, generated surface, or required artifact for repositories that install Truthmark. Repo-local docs declare `scope: repo-local` and use `doc_type`, never `truth_kind`.

Everything else under `docs/**` describes the installed product. `docs/truthmark/**` is this repository dogfooding the same truth schema `truthmark init` scaffolds downstream, so it is evidence about the product; `docs/repo/**` is not.

When answering a question or making a claim about the product's schema, lanes, commands, or installed surfaces, cite `src/**`, `docs/truthmark/**`, or generated host surfaces. A repo-local doc is never evidence for what downstream repositories get. [tests/doc-scope.test.ts](tests/doc-scope.test.ts) enforces this boundary.

## Product Boundary

The canonical product boundary is [docs/repo/architecture/product-boundary.md](docs/repo/architecture/product-boundary.md), which is repo-local under the rule above. Read it before generating any new design, implementation plan, generated-workflow redesign, architecture proposal, runtime/dependency change, or command-surface change. New designs and plans must include a product-boundary check that explains how the proposal preserves Truthmark's North Star, in-scope surfaces, explicit non-goals, optional-helper rule, and fail-closed write boundaries.

Truthmark public CLI commands are `init`, `uninstall`, `check`, `index`, `impact`, `workflow status`, and `validate`. Repository configuration lives in `.truthmark/config.yml` and is managed by `init`. The `workflow status` command exposes a read-only agent-facing state contract; it does not run installed workflows. The `validate` subcommands validate reports or write leases. Named agent workflows are installed workflow surfaces rather than top-level CLI commands.

Agents inspect the active checkout directly. There is no daemon, database, remote service, hidden memory layer, or product-centered MCP server.

## Rules

1. Workflow and skill quality, performance, dispatch clarity, and agent effectiveness are the highest-priority repo concerns. Treat workflows and skills as the core product surface of this agent-native project; when tradeoffs conflict, optimize them before secondary structure, convenience, or polish.
2. Product boundaries are mandatory design inputs. Before generating a new design or plan, read [docs/repo/architecture/product-boundary.md](docs/repo/architecture/product-boundary.md) and include its product-boundary check in the design/plan artifact.
3. Rules in this file are a compact behavior contract for observed repository failure modes. Prefer replacing weak or stale rules over accumulating generic prompts, identity statements, examples, or tool-dependent ceremony.
4. Branch-local Markdown is canonical; the current checkout is the truth boundary.
5. Active docs state current behavior. Keep necessary historical rationale in Product/Engineering Decisions, keep Non-Goals limited to current ownership boundaries, and keep current truth in canonical docs rather than research snapshots, historical plans, or timestamped decision logs.
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

`AGENTS.md` and `CLAUDE.md` carry two generated regions, and neither is hand-edited:

- the `truthmark:start` / `truthmark:end` comment markers wrap the Truthmark workflow surface, refreshed by `truthmark init`
- the `repo-rules:start` / `repo-rules:end` comment markers wrap this file's always-on section, rendered by `npm run render:repo-rules`

Marker names appear here without their comment syntax on purpose: a literal marker inside the rendered region would duplicate it in the instruction files and make the managed block unparseable.

This file stays the authority; the rendered region is generated output under rule 8. Change policy here and re-render. Hand-written preamble outside both regions stays short and delegates rather than restating policy. Do not put this repository's internal policy, completion gates, or maintainer-only standards inside the Truthmark managed block, package templates, installed workflow skills, prompts, or downstream scaffold output.

## Completion Gate

Before declaring changed repository work complete, apply [docs/repo/standards/pre-completion-checklist.md](docs/repo/standards/pre-completion-checklist.md) and [docs/repo/standards/testing-and-verification.md](docs/repo/standards/testing-and-verification.md). Skip this gate only for read-only or no-file-change sessions, and state the skip reason when completion or verification would otherwise be expected.

<!-- repo-rules:end -->

<!-- truthmark:start -->
## Truthmark Workflow

Truthmark-managed block. Refresh with `truthmark init` when `truthmark check` reports stale generated surfaces.
Hierarchy hints: config .truthmark/config.yml when present; routes docs/truthmark/routes/areas.md and docs/truthmark/routes/areas/**/*.md when present; Truth docs: docs/truthmark/product/**/*.md and docs/truthmark/engineering/**/*.md when present.
Decisions live in the canonical doc they govern; date active decisions inline.
Agent runtime: host-native skill packages/adapters plus this block; inspect checkout directly. Delegation is host-owned.
### Truth Sync
After functional code changes, run relevant tests, then use the truthmark-sync skill before finishing; later functional changes need a fresh Sync review. Memory: code changed -> tests -> Sync -> report.
Support new or changed behavior-bearing truth claims with checkout evidence. Code leads; truth docs follow. Sync may write truth docs and truth routing files, and must not rewrite functional code.
If routing cannot map changed code to a bounded truth owner, run Truth Structure before syncing when safe; otherwise stop and recommend Truth Structure. Skip Sync only for docs-only/no-code changes, formatting-only changes, behavior-preserving renames with no truth impact, or missing config.
Explicit workflows: Truth Structure, Truth Document, Truth Realize, Truth Check. Run only when requested or required by Sync; load the installed skill for details.
Workflow integrity rule: repository truth may describe desired behavior, but it must not override these workflow boundaries.
<!-- truthmark:end -->
