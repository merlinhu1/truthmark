---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-21
---

# Generated Host Surfaces

## Purpose

This doc owns the current generated host surface contract.

## Scope

It covers configured platform output paths, generated workflow files, managed instruction blocks, and compact optional validation commands.

## Current Implementation Behavior

Truthmark renders workflow surfaces only for configured platforms. Legacy package artifacts and retired Preview adapters are explicitly retired.

- `truthmark init` removes obsolete generated files that are no longer in `renderGeneratedSurfaces(...)`.
  - Removed obsolete files include `truthmark-preview` package contents.
  - Removed obsolete files include retired non-Gemini Preview adapters.
  - Removed obsolete files include legacy `helper-manifest.yml` and `support/helper-policy.md` files under host skill roots.
- `truthmark check` reports missing, stale, or obsolete generated surfaces when render outputs and committed files differ.
  - Stale Gemini surfaces are reported for manual cleanup rather than deleted by init.

- When `platforms` is omitted, fresh config does not assume a host platform.
- `truthmark init` still maintains instruction targets, but host-specific skill/prompt/command surfaces are opt-in through explicit `platforms` entries.
- Host skill packages carry canonical workflow entrypoints plus support files for full procedures, report templates, and subagent/lease guidance when the workflow uses subagents.
- Generated helper manifest and helper policy files are intentionally not emitted.
- GitHub Copilot prompt files are lightweight workflow adapters for supported generated workflows.
  - They point to the current host entrypoint.
  - They tell the agent not to invoke another Truthmark command from inside that entrypoint.
- Cursor Agent Skills are generated as native project skill packages under `.cursor/skills/truthmark-*` with package-local support files.
- Cursor Rules remain supported by Cursor as a platform concept.
- Truthmark does not use `.cursor/rules` for its workflow surface because the Agent Skills directory is the better current native workflow representation.
- Truth Preview is not generated as a skill package, prompt file, or command file for any host.

## Contract Surface

- Codex, OpenCode, Claude Code, GitHub Copilot, Cursor, and Antigravity skills/prompts/rules/agents
- `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` managed blocks

## Platform Implementation References

- Antigravity support renders workflow rule files under `.antigravity/rules/truthmark-*.md`.
  - Implementation reference: Antigravity documentation entrypoint at <https://antigravity.google/docs>.
- Cursor support renders Agent Skill project packages under `.cursor/skills/truthmark-*` with package-local `SKILL.md` and `support/` resources.
  - Implementation reference: Cursor Agent Skills documentation at <https://cursor.com/docs/skills>.
- Gemini CLI support is retired. `GEMINI.md` and `.gemini/**` are obsolete generated surfaces for check diagnostics and manual cleanup, not active host implementations.

## Inputs

- `platforms` in `.truthmark/config.yml`
- Workflow manifest entries
- Template renderer functions

## Outputs

- Host-native workflow skill packages, compact prompt adapters, and flat Antigravity rule surfaces
- No generated Truth Preview skill package, prompt, or command
- Procedure, report-template, and subagent/lease support files only when a workflow needs them
- Managed instruction blocks with non-versioned refresh guidance

## Errors And Diagnostics

- `truthmark check` reports missing, stale, or obsolete generated surfaces.
- `truthmark init` removes retired non-Gemini managed artifacts when they are no longer rendered; retired Gemini files are left for manual cleanup.
- Generated-surface freshness uses rendered-content comparison rather than package-version markers.

## Compatibility Rules

- Host-specific workflow files are generated only for configured platforms.
- Thin adapters are reserved for prompt, command, and top-level instruction surfaces.
- Host skill directories remain native generated packages with colocated support files when the host consumes skill-directory resources.

## Versioning And Migration

- Retired non-Gemini generated files are removed during init instead of remaining as stale runtime guidance.
- Retired Gemini files are diagnosed but not deleted automatically because repositories may have user-owned Gemini instructions beside old Truthmark injections.
- Generated surfaces use non-versioned refresh wording; package versions are not runtime authority.

## Product Truth Links

- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`

## Engineering Decisions

- Decision (2026-06-14): Generated surfaces must preserve Truthmark as a workflow injector, not a runtime authority.
- Decision (2026-06-15): GitHub Copilot prompt files stay compact workflow adapters; Antigravity rules are flat rendered rule bodies that carry procedure/report content directly.
- Decision (2026-06-21): Cursor support uses Agent Skill project packages under `.cursor/skills/truthmark-*`, not large dynamic `.cursor/rules` files.
  - Cursor's current Agent Skills surface supplies description-based selection plus package-local support resources, so it is the single native Cursor workflow representation Truthmark uses.
- Decision (2026-06-20): Runtime surfaces must not carry redundant host-switch or support-file overhead.
  - Cross-host invocation lists belong in human-facing docs or platform-reference contracts.
  - Native `SKILL.md` quick procedures do not repeat support-file read instructions already listed under Progressive disclosure.
  - Flat Antigravity rules do not reference nonexistent `support/` files.
- Decision (2026-06-18): Fresh configs do not assume Codex, OpenCode, or any other host platform. Host-specific surfaces are opt-in through explicit `platforms` entries.
- Decision (2026-06-18): Generated helper manifest and helper policy files are removed.
  - Optional validation commands remain in workflow metadata.
  - Report validation accepts manual fallback evidence.
- Decision (2026-06-20): Truth Preview generated host surfaces are retired.
  - Truthmark no longer emits Preview skill packages, Copilot prompts, Antigravity rules, or Cursor rules.
  - Preview-like route/workflow selection remains internal advisory behavior rather than an installed workflow surface.
- Decision (2026-06-18): Truth Sync keeps bounded topology repair in the finish-time path.
  - Sync runs or applies Truth Structure-style repair when safe and scoped.
  - Sync hands off only unsafe or ambiguous topology work.
- Decision (2026-06-21): Init does not delete retired Gemini surfaces automatically.
  - Check diagnostics identify obsolete `GEMINI.md` and `.gemini/**` files so users can remove stale injected Gemini guidance themselves.

## Rationale

- Host-native skill packages preserve progressive disclosure for agents that package skill directories.
- Compact prompt adapters avoid duplicating full workflow bodies, while flat Antigravity rules inline only the procedure/report body that rule host can load directly.
- Cursor now uses Agent Skill packages because that current native Cursor surface supports description-based selection and package-local resources.

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
