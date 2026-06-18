---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-15
---

# Generated Host Surfaces

## Purpose

This doc owns the current generated host surface contract.

## Scope

It covers configured platform output paths, generated workflow files, managed instruction blocks, and helper metadata.

## Current Implementation Behavior

Truthmark renders workflow surfaces for configured platforms and leaves already committed files in place when platforms are removed from config. Host skill packages carry canonical workflow entrypoints plus support files for full procedures, report templates, subagent guidance, and helper policy. GitHub Copilot prompt files and Gemini command files are lightweight workflow adapters: they identify the current host entrypoint, tell the agent not to invoke another Truthmark command from inside that entrypoint, point only to host-local skill package files, and use direct checkout inspection as fallback instead of duplicating full workflow bodies.

## Contract Surface

- Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini CLI skills/prompts/commands/agents
- `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, and `GEMINI.md` managed blocks

## Inputs

- `platforms` in `.truthmark/config.yml`
- Workflow manifest entries
- Template renderer functions

## Outputs

- Host-native workflow skill packages and compact prompt/command adapters
- Optional helper manifests
- Managed instruction blocks with non-versioned refresh guidance

## Product Truth Links

- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`

## Engineering Decisions

- Decision (2026-06-14): Generated surfaces must preserve Truthmark as a workflow injector, not a runtime authority.
- Decision (2026-06-15): GitHub Copilot prompt files and Gemini command files stay compact workflow adapters when a host skill package exists; canonical workflow bodies remain in generated skill support files.
- Decision (2026-06-15): GitHub Copilot prompt files and Gemini command files must not embed cross-host Truthmark invocation lists; those lists belong in human-facing docs or skill metadata, not adapter bodies.

## Maintenance Notes

Update when platform paths, supported hosts, helper manifests, or managed block content changes.

## Source References

- ../../../../src/templates/generated-surfaces.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/agents-block.ts
- `src/templates/generated-surfaces.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/agents-block.ts`
