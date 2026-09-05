---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-09-05
---

# Generated Host Surfaces

## Purpose

This doc owns the current generated host surface contract.

## Scope

It covers configured platform output paths, generated workflow files, managed instruction blocks, and compact optional validation commands.

## Current Implementation Behavior

Truthmark renders logical workflow surfaces only for configured platforms.

- `truthmark init` reconciles generated files against `renderGeneratedSurfaces(...)` and removes a whole file only when exact recognized bytes establish renderer ownership.
- `truthmark check` reports missing or stale generated surfaces when render outputs and committed files differ.
- Check, Init reconciliation, and Uninstall consume the same renderer-derived catalog and lifecycle inventory.
- Destructive lifecycle application snapshots and revalidates containment, parent and final link status, regular-file and hard-link status, managed-block structure, and recognized whole-file bytes for every mutation before applying the first mutation.
- Lifecycle inventory catalogs exact renderer paths plus bounded ownership patterns. Check previews inactive claims; Init and Uninstall reconcile only recognized whole files or valid managed blocks, preserve diverged or unsafe paths and unrelated siblings, and never recursively delete generated directories.
- Managed-block removal preserves all bytes outside the single valid marker range. A direct block-only file is removed; an aliased target is left as an empty file so the user-owned symlink remains valid.
- When `platforms` is omitted, fresh config does not assume a host platform.
- `platforms` declares the logical surfaces Truthmark writes. User-owned aliases may expose a managed block to another host; Truthmark does not infer platform ownership or visibility from that repository topology.
- A managed-block instruction path may be a final symlink that resolves through repository-owned in-worktree topology to any regular, single-link file outside Git administrative paths. External, broken, circular, directory, hard-linked, and Git-administrative targets fail preflight. Truthmark-owned whole-file surfaces remain direct files.
- Lifecycle cleanup coalesces inactive managed aliases by canonical resolved path and never removes a block through an inactive alias when an active generated surface resolves to that path.
- Host skill packages carry canonical workflow entrypoints plus support files for full procedures, report templates, and subagent/lease guidance when the workflow uses subagents.
- GitHub Copilot prompt files are lightweight workflow adapters that point to the current host entrypoint.
- Cursor Agent Skills are generated as native project skill packages under `.cursor/skills/truthmark-*` with package-local support files.

## Contract Surface

- Codex, OpenCode, Claude Code, GitHub Copilot, Cursor, and Antigravity skills/prompts/rules/agents
- `AGENTS.md` and `.github/copilot-instructions.md` managed blocks
- Claude Code's whole-file `.claude/rules/truthmark.md` rule

## Platform Implementation References

- Antigravity support renders workflow rule files under `.antigravity/rules/truthmark-*.md`.
  - Implementation reference: Antigravity documentation entrypoint at <https://antigravity.google/docs>.
- Cursor support renders Agent Skill project packages under `.cursor/skills/truthmark-*` with package-local `SKILL.md` and `support/` resources.
  - Implementation reference: Cursor Agent Skills documentation at <https://cursor.com/docs/skills>.

## Inputs

- `platforms` in `.truthmark/config.yml`
- Workflow manifest entries
- Template renderer functions

## Outputs

- Host-native workflow skill packages, compact prompt adapters, and flat Antigravity rule surfaces
- Procedure, report-template, and subagent/lease support files only when a workflow needs them
- Managed instruction blocks with non-versioned refresh guidance

## Errors And Diagnostics

- `truthmark check` reports missing or stale generated surfaces.
- `truthmark init` reconciles renderer-owned artifacts to the selected platform set and leaves unsafe or diverged paths for manual review.
- Generated-surface freshness uses rendered-content comparison rather than package-version markers.

## Compatibility Rules

- Host-specific workflow files are generated only for configured platforms.
- Truthmark validates alias mechanics, not the meaning or file format of an in-worktree target chosen by the repository owner.
- Thin adapters are reserved for prompt, command, and top-level instruction surfaces.
- Host skill directories remain native generated packages with colocated support files when the host consumes skill-directory resources.

## Versioning And Migration

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
  - Native `SKILL.md` quick procedures do not repeat support-file read instructions already listed under Reference files.
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
- Decision (2026-07-10, refined 2026-09-02): Logical-path lifecycle inventory and fail-closed revalidation are shared by Check, Init, and Uninstall so reconciliation never requires recursive directory deletion; managed aliases are coalesced by canonical resolved path for cleanup.
- Decision (2026-09-02): Claude Code receives the compact workflow block through an unscoped `.claude/rules/truthmark.md` rule instead of injection into `CLAUDE.md`.
- Decision (2026-09-02): Managed-block instruction files may use final in-worktree symlinks; Truthmark-owned whole-file surfaces may not.
- Decision (2026-09-05): Skill frontmatter descriptions state what the workflow does before when to use it, so host skill selection has both signals.
- Decision (2026-09-05): `SKILL.md` lists support files under a Reference files heading with named Markdown links rather than naming the progressive-disclosure mechanism.
- Decision (2026-09-05): Quick procedures carry only workflow-specific direction; the instruction-authority rule stays in `support/procedure.md` instead of repeating in every skill entrypoint.
- Decision (2026-09-05): Workflow skill packages are the only rendered skill body; per-workflow standalone skill renderers are removed so no second rendering path can drift from installed output.
  - Truthmark rejects mechanical hazards but does not judge the target's extension, content type, or cross-host visibility.
  - `platforms` governs logical generated surfaces; user-owned aliases remain repository policy.

## Rationale

- Host-native skill packages preserve progressive disclosure for agents that package skill directories.
- Compact prompt adapters avoid duplicating full workflow bodies, while flat Antigravity rules inline only the procedure/report body that rule host can load directly.
- Cursor now uses Agent Skill packages because that current native Cursor surface supports description-based selection and package-local resources.

## Non-Goals

- Generated surfaces are not a live daemon or orchestration layer.

## Maintenance Notes

Update when platform paths, supported hosts, optional validation commands, or managed block content changes.

## Source References

- ../../../../src/templates/generated-surfaces.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/agents-block.ts
