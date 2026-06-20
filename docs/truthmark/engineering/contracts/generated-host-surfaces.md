---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-20
---

# Generated Host Surfaces

## Purpose

This doc owns the current generated host surface contract.

## Scope

It covers configured platform output paths, generated workflow files, managed instruction blocks, and compact optional validation commands.

## Current Implementation Behavior

Truthmark renders workflow surfaces only for configured platforms. Legacy package artifacts and retired Preview adapters are explicitly retired.

- `truthmark init` removes obsolete generated files that are no longer in `renderGeneratedSurfaces(...)`, including `truthmark-preview` package contents, retired Preview prompt/command adapters, and legacy `helper-manifest.yml` and `support/helper-policy.md` files under host skill roots.
- `truthmark check` reports missing, stale, or obsolete generated surfaces when render outputs and committed files differ.

When `platforms` is omitted, fresh config does not assume a host platform; `truthmark init` still maintains instruction targets, but host-specific skill/prompt/command surfaces are opt-in through explicit `platforms` entries.
Host skill packages carry canonical workflow entrypoints plus support files for full procedures, report templates, and subagent/lease guidance when the workflow uses subagents; generated helper manifest and helper policy files are intentionally not emitted.
GitHub Copilot prompt files, Antigravity rule files, and Cursor rule files are lightweight workflow adapters for supported generated workflows: they point to the current host entrypoint and tell the agent not to invoke another Truthmark command from inside that entrypoint.
Truth Preview is not generated as a skill package, prompt file, or command file for any host.

## Contract Surface

- Codex, OpenCode, Claude Code, GitHub Copilot, Antigravity, and Cursor skills/prompts/rules/agents
- `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` managed blocks

## Platform Implementation References

- Antigravity support renders workflow rule files under `.antigravity/rules/truthmark-*.md`; implementation reference: Antigravity documentation entrypoint at <https://antigravity.google/docs>.
- Cursor support renders project rules under `.cursor/rules/truthmark-*.mdc` with Cursor frontmatter; implementation reference: Cursor Rules documentation at <https://cursor.com/docs/rules>.
- Gemini CLI support is retired. `GEMINI.md` and `.gemini/**` are treated as obsolete generated surfaces for cleanup and check diagnostics, not active host implementations.

## Inputs

- `platforms` in `.truthmark/config.yml`
- Workflow manifest entries
- Template renderer functions

## Outputs

- Host-native workflow skill packages and compact prompt/command adapters
- No generated Truth Preview skill package, prompt, or command
- Procedure, report-template, and subagent/lease support files only when a workflow needs them
- Managed instruction blocks with non-versioned refresh guidance

## Errors And Diagnostics

- `truthmark check` reports missing, stale, or obsolete generated surfaces.
- `truthmark init` removes retired managed artifacts when they are no longer rendered.
- Generated-surface freshness uses rendered-content comparison rather than package-version markers.

## Compatibility Rules

- Host-specific workflow files are generated only for configured platforms.
- Thin adapters are reserved for prompt, command, and top-level instruction surfaces.
- Host skill directories remain native generated packages with colocated support files when the host consumes skill-directory resources.

## Versioning And Migration

- Retired generated files are removed during init instead of remaining as stale runtime guidance.
- Generated surfaces use non-versioned refresh wording; package versions are not runtime authority.

## Product Truth Links

- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`

## Engineering Decisions

- Decision (2026-06-14): Generated surfaces must preserve Truthmark as a workflow injector, not a runtime authority.
- Decision (2026-06-15): GitHub Copilot prompt files, Antigravity rules, and Cursor rules stay compact workflow adapters; canonical workflow bodies remain in generated skill support files or rendered rule bodies.
- Decision (2026-06-15): GitHub Copilot prompt files, Antigravity rules, and Cursor rules must keep host invocation framing compact; cross-host invocation lists belong in human-facing docs or skill metadata, not adapter bodies.
- Decision (2026-06-18): Fresh configs do not assume Codex, OpenCode, or any other host platform. Host-specific surfaces are opt-in through explicit `platforms` entries.
- Decision (2026-06-18): Generated helper manifest and helper policy files are removed; optional validation commands remain in workflow metadata and report validation accepts manual fallback evidence.
- Decision (2026-06-20): Truth Preview generated host surfaces are retired. Truthmark no longer emits Preview skill packages, Copilot prompts, Antigravity rules, or Cursor rules; preview-like route/workflow selection remains internal advisory behavior rather than an installed workflow surface.
- Decision (2026-06-18): Truth Sync keeps bounded topology repair in the finish-time path; Sync runs or applies Truth Structure-style repair when safe and scoped, and hands off only unsafe or ambiguous topology work.

## Rationale

Host-native skill packages preserve progressive disclosure for agents that package skill directories, while compact adapters prevent prompt and command surfaces from duplicating full workflow bodies.

## Non-Goals

- Generated surfaces are not a live daemon or orchestration layer.
- Preview is not a generated host surface.
- Optional validators do not require generated helper manifest files.

## Maintenance Notes

Update when platform paths, supported hosts, optional validation commands, or managed block content changes.

## Source References

- ../../../../src/templates/generated-surfaces.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/agents-block.ts
- `src/templates/generated-surfaces.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/agents-block.ts`
