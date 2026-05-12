---
status: active
doc_type: feature
last_reviewed: 2026-05-13
source_of_truth:
  - ../../src/agents/shared.ts
  - ../../src/agents/instructions.ts
  - ../../src/agents/truth-document.ts
  - ../../src/agents/truth-structure.ts
  - ../../src/agents/truth-sync.ts
  - ../../src/agents/truth-check.ts
  - ../../src/agents/prompts.ts
  - ../../src/templates/codex-skills.ts
  - ../../src/sync/report.ts
  - ../../src/realize/report.ts
---

# Installed Workflows

## Scope

This document describes the current installed Truthmark workflow contract written into [AGENTS.md](../../AGENTS.md) and generated `SKILL.md` files.

## Product Model

Truthmark is agent-native. Installed skills and the managed `AGENTS.md` block are the runtime.

Agents are expected to inspect the checkout directly, make semantic judgments, update repository truth, and report what they changed. The `truthmark` CLI installs and refreshes workflow surfaces, and `truthmark check` validates artifacts after agent work. The CLI is not required to prepare workflow context before an agent can run.

Truthmark assumes capable acting AI models. Weak model performance is a host or user choice, not a reason for the product to make the CLI the workflow orchestrator.

## Installed Surfaces

Current explicit workflow surfaces are installed per configured platform in `.truthmark/config.yml`.

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
Generated workflow text also treats feature `README.md` files as indexes rather than Truth Sync targets. Current behavior truth should live in bounded leaf docs under the configured feature root, such as `<feature-root>/<domain>/<behavior>.md`.
When generated Truth Structure, Truth Document, or Truth Sync surfaces tell an agent to create or update a feature doc, they point to [docs/templates/feature-doc.md](../templates/feature-doc.md) as the editable local standard. Agents should read that file, follow its frontmatter, heading order, and section intent, and align existing feature docs to the template standard while preserving authored content that remains accurate. When the template is missing, generated workflow text falls back to the built-in minimal feature-doc structure.

Generated workflows maintain architecture docs only for architecture-level changes: system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership. Ordinary feature behavior, endpoint details, UI copy, validation rules, and bug fixes belong in feature or contract docs unless they change those architecture boundaries.

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
- read [docs/templates/feature-doc.md](../templates/feature-doc.md) before creating or updating feature docs
- repair routed canonical current-truth docs that are missing `Product Decisions` or `Rationale` sections before finishing topology repair
- keep starter truth docs inside canonical current-truth destinations
- keep feature `README.md` files as indexes and create bounded leaf docs for behavior truth
- keep feature docs behavior-oriented rather than endpoint-oriented
- split broad, overloaded, or catch-all routing before creating or extending generic feature docs
- operate from committed repository files when the Truthmark CLI is unavailable

Completed reports include:

- `Topology reviewed`
- `Areas reviewed`
- `Routing updated`
- `Truth docs created`
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
- keep feature `README.md` files as indexes and create or update bounded leaf truth docs for current behavior
- keep feature docs behavior-oriented rather than endpoint-oriented, unless the endpoint itself is the behavior boundary
- keep API endpoint details in the nearest contract truth doc when such a doc owns the API contract
- read [docs/templates/feature-doc.md](../templates/feature-doc.md) before creating or updating feature docs

Completed reports include:

- `Implementation reviewed`
- `Truth docs created`
- `Truth docs updated`
- `Routing updated`
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

Before updating truth docs, Truth Sync applies a topology quality gate. If routing is missing, stale, broad, overloaded, catch-all, or cannot map changed code to a bounded truth owner, it should not create another generic feature doc. It should run Truth Structure first when repair is safe and in scope, or block and recommend Truth Structure when topology repair is unsafe, ambiguous, or outside the task boundary. Truth Sync must not append behavior details to a feature `README.md`. When routeable behavior lacks a small current-truth doc, it should create or update a bounded leaf truth doc instead.
When Truth Sync creates or updates a feature doc, it should read [docs/templates/feature-doc.md](../templates/feature-doc.md) first, follow the repository's local template standard, and fix poor truth-doc alignment encountered in the touched doc.
When Truth Sync sees an architecture-level code change, it should update the owning architecture doc in the same sync instead of hiding structure or ownership changes in a feature doc.

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
- `Notes`

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

Completion reports include:

- `Truth docs used`
- `Code updated`
- `Verification`

## Truth Check

Truth Check is an agent-led audit of repository truth health.

The agent should inspect config, the configured root route index, relevant child route files, canonical docs, and relevant implementation directly. It may optionally run `truthmark check` when local tooling is available, but installed workflows must not depend on the binary being present.

Completed reports include:

- `Files reviewed`
- `Issues found`
- `Fixes suggested`
- `Validation`

## Current Boundary

Truthmark currently provides installed workflow text, generated Codex and OpenCode-compatible skill surfaces, report renderers, and validation diagnostics. It does not provide autonomous background execution or top-level `truthmark sync`, `truthmark realize`, `truthmark structure`, or `truthmark audit` CLI subcommands.

## Product Decisions

- Installed skills and managed agent blocks are the workflow runtime; the CLI installs and validates those surfaces but does not orchestrate Truth Sync itself.
- Generated instruction blocks must stay compact enough for ordinary agent context; non-automatic workflow procedure belongs in generated skills and command files.
- Generated workflow surfaces must not demote repository instruction docs such as `docs/ai/repo-rules.md` when warning agents that product truth cannot override workflow write boundaries.
- Truth Document exists because documenting existing implemented behavior without code changes is not a Truth Sync run; Sync stays code-first while Document owns manual missing-truth generation.
- Truth Document metadata should name Truth Sync, Truth Check, and Truth Structure as the workflows that can hand off missing implemented-behavior documentation, rather than using generic update wording.
- Gemini CLI uses generated `.gemini/commands/truthmark/*.toml` files for explicit workflow entrypoints because its native host surface is namespaced custom commands rather than `SKILL.md`.
- Generated workflow surfaces must render the configured hierarchy and decision-truth guidance once because those surfaces shape future agent behavior.
- Truth Structure owns AI-native topology governance so large repositories do not depend on humans manually organizing `docs/features`.
- Truth Structure must satisfy canonical decision-section expectations for both new starter docs and repaired routed docs; `doc-structure` review diagnostics are a signal for topology repair, not only a separate checker concern.
- Truth Sync must not worsen weak topology by adding generic feature docs behind missing, stale, broad, overloaded, catch-all, or unrouteable routing.
- Truth Sync metadata should include its skip cases because documentation-only work, formatting-only work, behavior-preserving renames, missing Truthmark config, and no-functional-code changes should not trigger the finish-time sync path.
- Feature `README.md` files are indexes; bounded leaf docs are the normal Truth Sync targets for current behavior.
- Generated workflow surfaces refer to `docs/templates/feature-doc.md` instead of embedding a full feature-doc template so repository owners have one editable standard as more skills are added.
- Truth Sync delegation is host-owned: generated workflow surfaces may describe when delegation is allowed, but must not name a preferred subagent or project-local subagent preference file.
- Active decisions belong in the canonical doc they govern. Workflow text should date active decisions inline when added or changed and reject separate ADR-style drift.
- Direct checkout inspection is the workflow authority. `truthmark check` may validate artifacts after or around agent work, but installed workflows must not require a helper payload before acting.
- Truthmark follows current host discovery paths for generated workflow files: Codex uses `.codex/skills/`, Claude Code uses `.claude/skills/`, GitHub Copilot uses `.github/prompts/`, OpenCode uses `.opencode/skills/`, and repo-root `skills/` is not a generated V1 target.

## Rationale

This keeps installed repositories usable even when the Truthmark package is unavailable at execution time. Keeping host instruction blocks small protects the model context window during ordinary work, while explicit skills remain available when an agent needs the full procedure. Leaving subagent selection to the acting agent and host environment avoids turning repository truth into a runtime preference system. It also keeps the workflow contract aligned with the repo's own truth model, so agents learn where to read and where to write without reconstructing policy from scattered historical notes.

Rejecting helper-payload dependency preserves the product boundary from the agent-native reshape: Truthmark packages workflow instructions and validation, not a mandatory execution bridge.

Putting topology governance in installed workflow text keeps the large-repository behavior portable to AI environments that have repository access and agents but do not have the Truthmark binary installed.

Requiring Truth Structure to add missing decision-section headings keeps repair output aligned with `truthmark check` without weakening the checker's canonical-doc quality signal.

Keeping feature-doc structure in an editable template prevents generated skills from becoming competing template copies while preserving a built-in fallback for repositories that do not have the template file yet.

## Primary Code Files

- `src/agents/instructions.ts`
- `src/agents/truth-structure.ts`
- `src/agents/truth-sync.ts`
- `src/agents/truth-check.ts`
- `src/agents/prompts.ts`
- `src/templates/codex-skills.ts`
- `src/sync/report.ts`
- `src/realize/report.ts`
