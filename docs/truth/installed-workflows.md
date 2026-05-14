---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-14
source_of_truth:
  - ../../src/agents/shared.ts
  - ../../src/agents/instructions.ts
  - ../../src/agents/truth-document.ts
  - ../../src/agents/truth-structure.ts
  - ../../src/agents/truth-sync.ts
  - ../../src/agents/truth-check.ts
  - ../../src/agents/prompts.ts
  - ../../src/generation/**
  - ../../src/templates/codex-skills.ts
  - ../../src/truth/**
  - ../../src/sync/report.ts
  - ../../src/realize/report.ts
---

# Installed Workflows

## Scope

This document describes the current installed Truthmark workflow contract written into [AGENTS.md](../../AGENTS.md) and generated `SKILL.md` files.

## Triggers

- Explicit host invocations such as `/truthmark-structure`, `/truthmark-document`, `/truthmark-sync`, `/truthmark-realize`, and `/truthmark-check`.
- Truth Sync's automatic finish-time trigger when functional code changes require repository truth updates.
- `truthmark init` refreshes the installed workflow surfaces after config or renderer changes.

## Inputs

- `.truthmark/config.yml`
- [docs/truthmark/areas.md](../truthmark/areas.md) and delegated child route files
- canonical truth docs and relevant implementation code in the active checkout
- host-supported explicit workflow invocation surfaces such as generated skills, prompts, and commands

## Execution Model

Installed skills and the managed `AGENTS.md` block are the workflow runtime. Agents inspect the checkout directly, apply workflow boundaries from committed surfaces, and write only the allowed repository files for the active workflow. The `truthmark` CLI installs and refreshes workflow surfaces and may validate artifacts afterward, but it does not orchestrate workflow execution.

## Steps

- `truthmark init` writes or refreshes the managed instruction blocks and explicit workflow surfaces for configured platforms.
- The acting agent reads committed config, routing, canonical docs, and relevant code directly from the checkout.
- The selected workflow applies its own write boundaries, evidence rules, and report contract.
- Explicit workflow subsections later in this doc define the current procedure for Truth Structure, Truth Document, Truth Sync, Truth Realize, and Truth Check.

## State, Retry, And Failure Behavior

- Explicit workflow invocation runs immediately in the host surface that exposes it.
- Truth Sync may complete, skip, or block depending on changed code and routing state.
- Blocked workflows leave the checkout as-is and report manual-review files rather than silently repairing unrelated surfaces.
- Re-running `truthmark init` refreshes generated workflow surfaces when renderers or configuration change.

## Outputs

- Managed instruction blocks such as `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`
- Generated skill, prompt, command, and metadata files for configured platforms
- Structured completion, blocked, or skipped workflow reports emitted by the acting agent

## Product Model

Truthmark is agent-native. Installed skills and the managed `AGENTS.md` block are the runtime.

Agents are expected to inspect the checkout directly, make semantic judgments, update repository truth, and report what they changed. The `truthmark` CLI installs and refreshes workflow surfaces, and `truthmark check` validates artifacts after agent work. The CLI is not required to prepare workflow context before an agent can run.

Truthmark assumes capable acting AI models. Weak model performance is a host or user choice, not a reason for the product to make the CLI the workflow orchestrator.

Workflow prompts and content-generation prompt contracts are separate surfaces. Workflow prompts define invocation, write boundaries, and report shape. Content-generation prompt contracts may render JSON-backed evidence context and validate structured draft output, but they do not grant permission to write files or replace direct checkout inspection. Truth Sync completed reports also have a deterministic structured report parser for the required Markdown shape, including `Evidence checked` entries with `Claim`, `Evidence`, and `Result` fields. Truth Sync, Truth Document, and Truth Structure prompts include a truth-doc restructure gate so agents can repair divergent doc shape inside the active workflow scope instead of appending narrow patches that would make canonical truth worse.

## Installed Surfaces

Current explicit workflow surfaces are installed per configured platform in `.truthmark/config.yml`.
Truth Realize is not separately configurable; selected platforms receive its explicit manual workflow surface alongside the other manual workflows.

Supported platform values:

- `codex`
- `opencode`
- `claude-code`
- `github-copilot`
- `gemini-cli`

The default platform list includes all supported platforms. Teams should remove unused platforms from `.truthmark/config.yml` before rerunning `truthmark init`.

Workflow invocation examples:

- Truth Structure: `/skill truthmark-structure` in OpenCode-style hosts, `/truthmark-structure` or `$truthmark-structure` in Codex, `/truthmark-structure` in Claude Code, `/truthmark-structure` in GitHub Copilot, and `/truthmark:structure` in Gemini CLI
- Truth Document: `/skill truthmark-document` in OpenCode-style hosts, `/truthmark-document` or `$truthmark-document` in Codex, `/truthmark-document` in Claude Code, `/truthmark-document` in GitHub Copilot, and `/truthmark:document` in Gemini CLI
- Truth Sync: `/skill truthmark-sync` in OpenCode-style hosts, `/truthmark-sync` or `$truthmark-sync` in Codex, `/truthmark-sync` in Claude Code, `/truthmark-sync` in GitHub Copilot, and `/truthmark:sync` in Gemini CLI
- Truth Realize: `/skill truthmark-realize` in OpenCode-style hosts, `/truthmark-realize` or `$truthmark-realize` in Codex, `/truthmark-realize` in Claude Code, `/truthmark-realize` in GitHub Copilot, and `/truthmark:realize` in Gemini CLI
- Truth Check: `/skill truthmark-check` in OpenCode-style hosts, `/truthmark-check` or `$truthmark-check` in Codex, `/truthmark-check` in Claude Code, `/truthmark-check` in GitHub Copilot, and `/truthmark:check` in Gemini CLI
- Claude Code installs project skills at `.claude/skills/truthmark-*/SKILL.md`, which surface as `/truthmark-structure`, `/truthmark-document`, `/truthmark-sync`, `/truthmark-realize`, and `/truthmark-check`
- GitHub Copilot installs prompt files at `.github/prompts/truthmark-*.prompt.md`, which surface as `/truthmark-structure`, `/truthmark-document`, `/truthmark-sync`, `/truthmark-realize`, and `/truthmark-check` in supported Copilot IDEs
- Gemini CLI installs project-scoped custom commands at `.gemini/commands/truthmark/*.toml`, which surface as `/truthmark:structure`, `/truthmark:document`, `/truthmark:sync`, `/truthmark:realize`, and `/truthmark:check`

The managed `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and equivalent platform instruction blocks are compact automatic-Sync trigger and boundary indexes. They intentionally omit non-automatic workflow procedures, report examples, and long checklists so installed prompts do not consume unnecessary model context. The generated skills and Gemini command files hold the detailed workflow bodies and report examples for explicit invocation.

Generated skill files, Gemini command files, Codex metadata, and managed instruction blocks include the Truthmark package version used to render them. The package version in `package.json` is the single maintained version source. After upgrading Truthmark, rerun `truthmark init` and review the generated workflow diffs. This rerun-init convention is the V1 staleness story for committed workflow surfaces.

Generated workflow surfaces include the configured hierarchy summary from `.truthmark/config.yml`. Agents must read the configured root route index and only relevant child route files before updating routed truth docs. Generated skill text preserves repository instruction authority while clarifying that implementation code and canonical truth docs are inspected evidence for current behavior and must not silently override workflow write boundaries.
Truthmark-owned workflow surfaces are generated under host-specific directories such as `.codex/skills/`, `.claude/skills/`, `.opencode/skills/`, and `.github/prompts/`. Repo-root `skills/` files are not generated workflow surfaces and are not classified as derived Truthmark output.
Generated workflow text also treats truth `README.md` files as indexes rather than Truth Sync targets. Current behavior truth should live in bounded leaf docs under the configured truth root, such as `<truth-root>/<domain>/<behavior>.md`.
When generated Truth Structure, Truth Document, or Truth Sync surfaces tell an agent to create or update a truth doc, they point to the routed truth kind's matching template under [docs/templates/](../templates/). Agents should inspect the routed truth kind, follow the matching template's frontmatter, heading order, and section intent, and align existing truth docs to that template standard while preserving authored content that remains accurate. When a matching template is missing, generated workflow text falls back to the built-in minimal truth-doc structure.

Generated Truth Structure, Truth Document, and Truth Sync surfaces also require a truth-doc restructure gate before editing a truth doc. Agents may restructure when a narrow append or section replacement would worsen truth because required template sections are missing, ownership or behavior boundaries are mixed, stale sections conflict with implementation evidence, updates span unrelated sections, an index-like summary is being used as a bounded behavior doc, or frontmatter/source evidence/headings no longer match the routed truth kind or template. Restructuring must preserve supported claims, remove or narrow unsupported claims, prefer bounded leaf docs and routing updates for large splits, and report why a smaller edit was not enough.

Generated workflows maintain architecture docs only for architecture-level changes: system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership. Ordinary product behavior, endpoint details, UI copy, validation rules, and bug fixes belong in behavior or contract docs unless they change those architecture boundaries.

## Truth Structure

Truth Structure designs or repairs repository truth topology. It owns area routing, child route-file structure, and starter truth-doc placement when the existing topology is missing, stale, broad, overloaded, catch-all, unrouteable, or explicitly requested.

The agent should:

- inspect repository layout, current docs, config, routing metadata, and relevant code directly
- inspect controllers, routes, handlers, services, packages, tests, and representative implementation boundaries
- define areas by product or behavior ownership
- repair missing, stale, broad, overloaded, catch-all, unrouteable, or non-canonical routing
- create starter canonical truth docs when useful
- write starter truth docs with closed YAML frontmatter bounded by opening and closing `---` lines, including `status`, `doc_type`, `last_reviewed`, and `source_of_truth` inside that frontmatter
- include `Product Decisions` and `Rationale` sections in starter truth docs
- inspect the routed truth kind and read the matching template under [docs/templates/](../templates/) before creating or updating truth docs
- restructure broader routed truth docs when topology, ownership, or doc-shape repair is already in scope and a narrow edit would make truth worse
- repair routed canonical current-truth docs that are missing `Product Decisions` or `Rationale` sections before finishing topology repair
- keep starter truth docs inside canonical current-truth destinations
- keep truth `README.md` files as indexes and create bounded leaf docs for behavior truth
- keep behavior truth docs behavior-oriented rather than endpoint-oriented
- split broad, overloaded, or catch-all routing before creating or extending generic truth docs
- when Truth Structure writes routed docs, ownership claims, `Product Decisions`, or `Rationale`, apply the Evidence Gate before finishing
- support each new or changed ownership or behavior-bearing claim with primary evidence from implementation, config, routing, generated-surface templates, schemas, or contract definitions in the active checkout
- use tests, examples, snapshots, and existing canonical docs as corroborating evidence, not as the sole source when implementation conflicts
- remove, narrow, or block unsupported claims instead of leaving unsupported truth behind
- operate from committed repository files when the Truthmark CLI is unavailable

Completed reports include:

- `Topology reviewed`
- `Areas reviewed`
- `Routing updated`
- `Truth docs created`
- `Truth docs restructured`
- `Evidence checked`
- `Topology decisions`
- `Notes`

## Truth Document

Truth Document is manual and implementation-first. It documents existing implemented behavior when no functional-code change is required, or when Truth Sync, Truth Check, or Truth Structure reports implemented behavior that lacks canonical truth docs.

The agent should:

- inspect implementation code, tests, `.truthmark/config.yml`, [docs/truthmark/areas.md](../truthmark/areas.md), relevant child route files, and existing canonical docs directly
- document current implemented behavior only, without inventing planned behavior or future endpoints
- write canonical truth docs and routing files only
- never write functional code
- when routing is missing, stale, broad, overloaded, catch-all, or cannot map the behavior to a bounded truth owner, run Truth Structure first when routing repair is safe and in scope
- block and recommend Truth Structure when routing repair is unsafe, ambiguous, or outside the task boundary
- keep truth `README.md` files as indexes and create or update bounded leaf truth docs for current behavior
- keep behavior truth docs behavior-oriented rather than endpoint-oriented, unless the endpoint itself is the behavior boundary
- keep API endpoint details in the nearest contract truth doc when such a doc owns the API contract
- inspect the routed truth kind and read the matching template under [docs/templates/](../templates/) before creating or updating truth docs
- restructure only truth docs for the implemented behavior being documented when a narrow edit would make truth worse
- before finishing, perform a route-first impacted-doc check
- map documented behavior to bounded truth owners and primary canonical docs
- support each new or changed behavior-bearing claim with primary evidence from implementation, config, routing, generated-surface templates, schemas, or contract definitions in the active checkout
- use tests, examples, snapshots, and existing canonical docs as corroborating evidence, not as the sole source when implementation conflicts
- remove, narrow, or block unsupported claims instead of leaving unsupported truth behind
- if no truth doc changed, report why current truth was already sufficient or why documentation was blocked

Completed reports include:

- `Implementation reviewed`
- `Truth docs created`
- `Truth docs updated`
- `Truth docs restructured`
- `Routing updated`
- `Evidence checked`
- `Notes`

## Truth Sync

Truth Sync is code-first and has two trigger paths:

- code leads
- truth docs follow
- functional code must not be rewritten during sync
- automatic finish-time trigger when functional code changed since the last successful Truth Sync
- explicit trigger when the user invokes `/skill truthmark-sync`, `/truthmark-sync`, or `$truthmark-sync`

The agent should inspect staged, unstaged, and untracked functional-code changes directly. It should read `.truthmark/config.yml`, [docs/truthmark/areas.md](../truthmark/areas.md), nearby implementation, and relevant canonical truth docs.

Committed history, hidden conversation state, host memory, and off-repo notes are not Truth Sync inputs unless the user provides them in the current session and they are verified against the checkout. Truth Sync must not rely on packet helpers, cache files, or generated context artifacts.

The acting agent and host environment decide whether to delegate Truth Sync to a subagent or execute it inline. Generated workflow surfaces must not name a preferred subagent.

Truth Sync may update routed truth docs and [docs/truthmark/areas.md](../truthmark/areas.md) when routing repair is needed. It may create missing canonical truth docs when implementation would otherwise remain undocumented and configuration allows missing-truth updates.

Truth Sync updates active decisions and rationale in the routed canonical doc when implementation changes are driven by a decision change. It dates active decisions inline when added or changed, and replaces stale active decisions rather than appending separate timestamped decision notes.

Before updating truth docs, Truth Sync applies a topology quality gate. If routing is missing, stale, broad, overloaded, catch-all, or cannot map changed code to a bounded truth owner, it should not create another generic truth doc. It should run Truth Structure first when repair is safe and in scope, or block and recommend Truth Structure when topology repair is unsafe, ambiguous, or outside the task boundary. Truth Sync must not append behavior details to a truth `README.md`. When routeable behavior lacks a small current-truth doc, it should create or update a bounded leaf truth doc instead.
When Truth Sync creates or updates a truth doc, it should inspect the routed truth kind, read the matching template under [docs/templates/](../templates/), follow the repository's local template standard, and fix poor truth-doc alignment encountered in the touched doc. Truth Sync may restructure only truth docs impacted by the current functional-code change when a narrow edit would make truth worse.
When Truth Sync sees an architecture-level code change, it should update the owning architecture doc in the same sync instead of hiding structure or ownership changes in a truth doc.
Before finishing, Truth Sync performs a route-first impacted-doc check. It maps changed functional files to bounded route owners and primary canonical docs, uses `source_of_truth` entries, nearby tests, architecture docs, contract docs, and generated-surface templates as secondary impacted-doc signals when they govern the behavior, supports each new or changed behavior-bearing claim in touched truth docs, route ownership, `Product Decisions`, and `Rationale` with primary evidence from implementation, config, routing, generated-surface templates, schemas, or contract definitions in the active checkout, uses tests and existing docs as corroborating evidence rather than sole proof, removes, narrows, or blocks unsupported claims, and reports why truth was already current or why sync was skipped when no impacted doc changed.

Current skip reasons are:

- documentation-only change
- formatting-only change
- clearly behavior-preserving rename with no truth impact
- no Truthmark config exists yet
- no functional code changes

Truth Sync's generated frontmatter description and Codex metadata carry these skip cases because skill metadata is the host-visible routing boundary before the full workflow body is loaded.

Completed reports include:

- `Changed code reviewed`
- `Truth docs updated`
- `Evidence checked`
- `Notes`

The completed report shape is parseable by the package report helper. Completed reports without structured `Claim`, `Evidence`, and `Result` evidence entries are invalid. If Truth Sync restructures a doc, it reports the doc and why a narrow edit was not sufficient in `Notes` to preserve the parseable report shape.

Skipped reports include:

- `Reason`

Blocked reports include:

- `Reason`
- `Files requiring manual review`
- `Next action`

## Truth Realize

Truth Realize is doc-first and manual:

- truth docs lead
- code follows
- the agent may write functional code only
- the agent must not edit truth docs or truth routing while realizing those docs
- there is no automatic trigger and no `realization.enabled` config switch

Completion reports include:

- `Truth docs used`
- `Code updated`
- `Verification`

## Truth Check

Truth Check is an agent-led audit of repository truth health.

The agent should inspect config, the configured root route index, relevant child route files, canonical docs, and relevant implementation directly. It may optionally run `truthmark check` when local tooling is available, but installed workflows must not depend on the binary being present. Truth Check supports each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests; treats existing canonical docs as context rather than sole proof when implementation conflicts; removes unsupported findings or marks them as open questions with explicit confidence; and validates new or changed behavior-bearing claims before finishing if the audit also edits docs.

Completed reports include:

- `Files reviewed`
- `Issues found`
- `Fixes suggested`
- `Evidence checked`
- `Validation`

## Current Behavior

Truthmark currently provides installed workflow text, generated Codex and OpenCode-compatible skill surfaces, report renderers, structured Truth Sync report parsing, and validation diagnostics. It does not provide autonomous background execution or top-level `truthmark sync`, `truthmark realize`, `truthmark structure`, or `truthmark audit` CLI subcommands.

## Product Decisions

- Installed skills and managed agent blocks are the workflow runtime; the CLI installs and validates those surfaces but does not orchestrate Truth Sync itself.
- Generated instruction blocks must stay compact enough for ordinary agent context; non-automatic workflow procedure belongs in generated skills and command files.
- Generated workflow surfaces must not demote repository instruction docs such as `docs/ai/repo-rules.md` when warning agents that product truth cannot override workflow write boundaries.
- Truth Document exists because documenting existing implemented behavior without code changes is not a Truth Sync run; Sync stays code-first while Document owns manual missing-truth generation.
- Truth Document metadata should name Truth Sync, Truth Check, and Truth Structure as the workflows that can hand off missing implemented-behavior documentation, rather than using generic update wording.
- Gemini CLI uses generated `.gemini/commands/truthmark/*.toml` files for explicit workflow entrypoints because its native host surface is namespaced custom commands rather than `SKILL.md`.
- Generated workflow surfaces must render the configured hierarchy and decision-truth guidance once because those surfaces shape future agent behavior.
- Evidence validation is a workflow contract first: generated workflows require route-first evidence review, compact evidence reporting, and a parseable structured Truth Sync completed-report shape while keeping CLI validation optional and checkout-first.
- Truth Structure owns AI-native topology governance so large repositories do not depend on humans manually organizing the configured truth root.
- Truth Structure must satisfy canonical decision-section expectations for both new starter docs and repaired routed docs; `doc-structure` review diagnostics are a signal for topology repair, not only a separate checker concern.
- Truth Sync must not worsen weak topology by adding generic truth docs behind missing, stale, broad, overloaded, catch-all, or unrouteable routing.
- Truth Sync metadata should include its skip cases because documentation-only work, formatting-only work, behavior-preserving renames, missing Truthmark config, and no-functional-code changes should not trigger the finish-time sync path.
- Truth `README.md` files are indexes; bounded leaf docs are the normal Truth Sync targets for current behavior.
- Generated workflow surfaces refer to routed truth-doc templates under `docs/templates/` instead of embedding full template text so repository owners have one editable standard per truth-doc kind as more skills are added.
- Truth Sync delegation is host-owned: generated workflow surfaces may describe when delegation is allowed, but must not name a preferred subagent or project-local subagent preference file.
- Active decisions belong in the canonical doc they govern. Workflow text should date active decisions inline when added or changed and reject separate ADR-style drift.
- Direct checkout inspection is the workflow authority. `truthmark check` may validate artifacts after or around agent work, but installed workflows must not require a helper payload before acting.
- Truthmark follows current host discovery paths for generated workflow files: Codex uses `.codex/skills/`, Claude Code uses `.claude/skills/`, GitHub Copilot uses `.github/prompts/`, OpenCode uses `.opencode/skills/`, and repo-root `skills/` is not a generated V1 target.
- Content-generation prompt contracts are source-internal draft helpers, not workflow authority; installed workflow surfaces continue to own permission, boundaries, and reporting.
- Decision (2026-05-14): Truth Realize remains available only through explicit user invocation and is always generated for configured platforms instead of being gated by a config toggle.
- Decision (2026-05-14): Truth Sync, Truth Document, and Truth Structure include a truth-doc restructure gate. Truth Sync may restructure only docs impacted by the current functional-code change, Truth Document may restructure only docs for the implemented behavior being documented, and Truth Structure may restructure broader routed docs when topology, ownership, or doc-shape repair is already in scope.

## Rationale

This keeps installed repositories usable even when the Truthmark package is unavailable at execution time. Keeping host instruction blocks small protects the model context window during ordinary work, while explicit skills remain available when an agent needs the full procedure. Leaving subagent selection to the acting agent and host environment avoids turning repository truth into a runtime preference system. It also keeps the workflow contract aligned with the repo's own truth model, so agents learn where to read and where to write without reconstructing policy from scattered historical notes.

Rejecting helper-payload dependency preserves the product boundary from the agent-native reshape: Truthmark packages workflow instructions and validation, not a mandatory execution bridge.

Putting topology governance in installed workflow text keeps the large-repository behavior portable to AI environments that have repository access and agents but do not have the Truthmark binary installed.

Requiring Truth Structure to add missing decision-section headings keeps repair output aligned with `truthmark check` without weakening the checker's canonical-doc quality signal.

Keeping truth-doc structure in editable routed templates prevents generated skills from becoming competing template copies while preserving a built-in fallback when a matching template file is unavailable.

Draft prompt contracts improve output consistency without changing the installed workflow runtime. Agents still inspect the checkout directly and use workflow surfaces for permissions; generated draft content remains advisory until a workflow-authorized agent applies it to canonical docs.

Making evidence review part of the workflow contract adds claim-level grounding without turning the CLI into a required orchestration layer or pushing noisy citations into maintained truth docs.

Allowing scoped truth-doc restructuring prevents drift from being hidden behind small patches. Keeping the permission inside installed workflow text preserves the agent-native runtime model: agents inspect evidence directly, apply workflow-specific write boundaries, and report why a restructure was necessary instead of depending on a separate rewrite command.

## Primary Code Files

- `src/agents/instructions.ts`
- `src/agents/shared.ts`
- `src/agents/truth-document.ts`
- `src/generation/types.ts`
- `src/generation/prompts/truth-doc-update.ts`
- `src/generation/registry.ts`
- `src/generation/validate.ts`
- `src/agents/truth-structure.ts`
- `src/agents/truth-sync.ts`
- `src/agents/truth-check.ts`
- `src/agents/prompts.ts`
- `src/templates/codex-skills.ts`
- `src/sync/report.ts`
- `src/realize/report.ts`
