---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-14
realizes:
  - docs/truthmark/product/capabilities/agent-native-workflow-injection.md
---

# Installed Workflow Runtime

## Purpose

This doc describes how the repository currently realizes host-native Truthmark workflow surfaces.

## Scope

It owns generated workflow runtime behavior, managed instruction blocks, helper metadata, and direct-checkout fallback rules.

## Current Implementation Behavior

The source manifest and renderers generate host-specific skills, prompts, commands, subagents, helper manifests, and managed instruction blocks. Generated text instructs agents to classify lane impact before writing canonical truth docs.

## Triggers

- `truthmark init` refreshes configured workflow surfaces.
- Explicit host invocations run manual workflows.
- Truth Sync is the finish-time workflow when functional code changed.

## Execution Model

Committed workflow files are the runtime contract. The CLI installs and validates surfaces but does not act as daemon, database, or workflow orchestrator.

## Product Truth Links

- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`

## Engineering Decisions

- Decision (2026-06-14): Lane classification is part of generated workflow text before any canonical truth write.

## Maintenance Notes

Update this doc when workflow manifest fields, generated surface paths, helper metadata, or managed instruction behavior changes.

## Source References

- ../../../../src/agents/instructions.ts
- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/generated-surfaces.ts
- `src/agents/workflow-manifest.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/generated-surfaces.ts`
