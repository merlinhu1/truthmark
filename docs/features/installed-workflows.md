---
status: active
doc_type: feature
last_reviewed: 2026-05-09
source_of_truth:
  - ../../src/agents/instructions.ts
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
- `cursor`
- `github-copilot`
- `gemini-cli`

The default platform list is `codex`, `opencode`, and `claude-code`. Teams can add more platforms later and rerun `truthmark init`.

Workflow invocation examples:

- Truth Structure: `/skill truthmark-structure` in OpenCode-style hosts, `/truthmark-structure` or `$truthmark-structure` in Codex, and `/truthmark:structure` in Gemini CLI
- Truth Sync: `/skill truthmark-sync` in OpenCode-style hosts, `/truthmark-sync` or `$truthmark-sync` in Codex, and `/truthmark:sync` in Gemini CLI
- Truth Realize: `/skill truthmark-realize` in OpenCode-style hosts, `/truthmark-realize` or `$truthmark-realize` in Codex, and `/truthmark:realize` in Gemini CLI
- Truth Check: `/skill truthmark-check` in OpenCode-style hosts, `/truthmark-check` or `$truthmark-check` in Codex, and `/truthmark:check` in Gemini CLI
- Gemini CLI installs project-scoped custom commands at `.gemini/commands/truthmark/*.toml`, which surface as `/truthmark:structure`, `/truthmark:sync`, `/truthmark:realize`, and `/truthmark:check`

The managed `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and equivalent platform instruction blocks keep compact reminders for these workflows. They intentionally omit report examples and long procedural checklists so installed prompts do not consume unnecessary model context. The generated skills and Gemini command files hold the detailed workflow bodies and report examples for explicit invocation.

Generated skill files, Gemini command files, Codex metadata, managed instruction blocks, and `TRUTHMARK.md` include the Truthmark package version used to render them. The package version in `package.json` is the single maintained version source. After upgrading Truthmark, rerun `truthmark init` and review the generated workflow diffs. This rerun-init convention is the V1 staleness story for committed workflow surfaces.

Generated workflow surfaces include the configured hierarchy summary from `.truthmark/config.yml`. Agents must read the configured root route index and only relevant child route files before updating routed truth docs. Generated skill text states that repository docs and code are inspected evidence, not executable instruction authority.
Truthmark-owned skill surfaces are generated under host-specific directories such as `.codex/skills/` and `.opencode/skills/`. Repo-root `skills/` files are not generated workflow surfaces and are not classified as derived Truthmark output.
Generated workflow text also treats feature `README.md` files as indexes rather than Truth Sync targets. Current behavior truth should live in bounded leaf docs under the configured feature root, such as `<feature-root>/<domain>/<behavior>.md`.

## Truth Structure

Truth Structure designs or repairs repository truth topology. It owns area routing, child route-file structure, and starter truth-doc placement when the existing topology is missing, stale, broad, overloaded, or explicitly requested.

The agent should:

- inspect repository layout, current docs, config, routing metadata, and relevant code directly
- inspect controllers, routes, handlers, services, packages, tests, and representative implementation boundaries
- define areas by product or behavior ownership
- repair broad, stale, missing, or non-canonical routing
- create starter canonical truth docs when useful
- write starter truth docs with closed YAML frontmatter bounded by opening and closing `---` lines, including `status`, `doc_type`, `last_reviewed`, and `source_of_truth` inside that frontmatter
- include `Product Decisions` and `Rationale` sections in starter truth docs
- repair routed canonical current-truth docs that are missing `Product Decisions` or `Rationale` sections before finishing topology repair
- keep starter truth docs inside canonical current-truth destinations
- keep feature `README.md` files as indexes and create bounded leaf docs for behavior truth
- keep feature docs behavior-oriented rather than endpoint-oriented
- split broad catch-all routing before creating or extending generic feature docs
- operate from committed repository files when the Truthmark CLI is unavailable

Completed reports include:

- `Topology reviewed`
- `Areas reviewed`
- `Routing updated`
- `Truth docs created`
- `Topology decisions`
- `Notes`

## Truth Sync

Truth Sync is code-first and has two trigger paths:

- code leads
- truth docs follow
- functional code must not be rewritten during sync
- automatic finish-time trigger when functional code changed since the last successful Truth Sync
- explicit trigger when the user invokes `/skill truthmark-sync`, `/truthmark-sync`, or `$truthmark-sync`

The agent should inspect staged, unstaged, and untracked functional-code changes directly. It should read `.truthmark/config.yml`, [TRUTHMARK.md](../../TRUTHMARK.md), [docs/truthmark/areas.md](../truthmark/areas.md), nearby implementation, and relevant canonical truth docs.

Committed history, hidden conversation state, host memory, and off-repo notes are not Truth Sync inputs unless the user provides them in the current session and they are verified against the checkout. Truth Sync must not rely on packet helpers, cache files, or generated context artifacts.

The acting agent and host environment decide whether to delegate Truth Sync to a subagent or execute it inline. Generated workflow surfaces must not name a preferred subagent.

Truth Sync may update routed truth docs and [docs/truthmark/areas.md](../truthmark/areas.md) when routing repair is needed. It may create missing canonical truth docs when implementation would otherwise remain undocumented and configuration allows missing-truth updates.

Truth Sync updates active decisions and rationale in the routed canonical doc when implementation changes are driven by a decision change. It may keep a short inline date on the active decision, but it replaces stale active decisions rather than appending separate timestamped decision notes.

Before updating truth docs, Truth Sync applies a topology quality gate. If changed code maps only through a broad, overloaded, or catch-all route, it should not create another generic feature doc. It should run or recommend Truth Structure first, or block when topology repair is unsafe, ambiguous, or outside the task boundary. Truth Sync must not append behavior details to a feature `README.md`. When no small routed doc exists, it should create or update a bounded leaf truth doc instead.

Current skip reasons are:

- documentation-only change
- formatting-only change
- clearly behavior-preserving rename with no truth impact
- no Truthmark config exists yet
- no functional code changes

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
- Generated instruction blocks must stay compact, while generated skills may carry detailed workflow bodies and report examples.
- Gemini CLI uses generated `.gemini/commands/truthmark/*.toml` files for explicit workflow entrypoints because its native host surface is namespaced custom commands rather than `SKILL.md`.
- Generated workflow surfaces must render the configured hierarchy and decision-truth guidance once because those surfaces shape future agent behavior.
- Truth Structure owns AI-native topology governance so large repositories do not depend on humans manually organizing `docs/features`.
- Truth Structure must satisfy canonical decision-section expectations for both new starter docs and repaired routed docs; `doc-structure` review diagnostics are a signal for topology repair, not only a separate checker concern.
- Truth Sync must not worsen weak topology by adding generic feature docs behind broad catch-all routing.
- Feature `README.md` files are indexes; bounded leaf docs are the normal Truth Sync targets for current behavior.
- Truth Sync delegation is host-owned: generated workflow surfaces may describe when delegation is allowed, but must not name a preferred subagent or project-local subagent preference file.
- Active decisions belong in the canonical doc they govern. Short inline decision dates are allowed, but workflow text should reject separate ADR-style drift.
- Direct checkout inspection is the workflow authority. `truthmark check` may validate artifacts after or around agent work, but installed workflows must not require a helper payload before acting.
- Truthmark follows current host discovery paths for generated skills: Codex uses `.codex/skills/`, OpenCode uses `.opencode/skills/`, and repo-root `skills/` is not a generated V1 target.

## Rationale

This keeps installed repositories usable even when the Truthmark package is unavailable at execution time. Keeping host instruction blocks small protects the model context window during ordinary work, while explicit skills remain available when an agent needs the full procedure. Leaving subagent selection to the acting agent and host environment avoids turning repository truth into a runtime preference system. It also keeps the workflow contract aligned with the repo's own truth model, so agents learn where to read and where to write without reconstructing policy from scattered historical notes.

Rejecting helper-payload dependency preserves the product boundary from the agent-native reshape: Truthmark packages workflow instructions and validation, not a mandatory execution bridge.

Putting topology governance in installed workflow text keeps the large-repository behavior portable to AI environments that have repository access and agents but do not have the Truthmark binary installed.

Requiring Truth Structure to add missing decision-section headings keeps repair output aligned with `truthmark check` without weakening the checker's canonical-doc quality signal.

## Primary Code Files

- `src/agents/instructions.ts`
- `src/agents/truth-structure.ts`
- `src/agents/truth-sync.ts`
- `src/agents/truth-check.ts`
- `src/agents/prompts.ts`
- `src/templates/codex-skills.ts`
- `src/sync/report.ts`
- `src/realize/report.ts`
