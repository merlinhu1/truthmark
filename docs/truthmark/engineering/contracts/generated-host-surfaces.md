---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-14
realizes:
  - docs/truthmark/product/capabilities/agent-native-workflow-injection.md
---

# Generated Host Surfaces

## Purpose

This doc owns the current generated host surface contract.

## Scope

It covers configured platform output paths, generated workflow files, managed instruction blocks, and helper metadata.

## Current Implementation Behavior

Truthmark renders workflow surfaces for configured platforms and leaves already committed files in place when platforms are removed from config.

## Contract Surface

- Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini CLI skills/prompts/commands/agents
- `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, and `GEMINI.md` managed blocks

## Inputs

- `platforms` in `.truthmark/config.yml`
- Workflow manifest entries
- Template renderer functions

## Outputs

- Host-native workflow files and optional helper manifests
- Managed instruction blocks with the Truthmark version marker

## Product Truth Links

- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`

## Engineering Decisions

- Decision (2026-06-14): Generated surfaces must preserve Truthmark as a workflow injector, not a runtime authority.

## Maintenance Notes

Update when platform paths, supported hosts, helper manifests, or managed block content changes.

## Source References

- ../../../../src/templates/generated-surfaces.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/agents-block.ts
- `src/templates/generated-surfaces.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/agents-block.ts`
