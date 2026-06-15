---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-15
---

# Installed Workflow Runtime

## Purpose

This doc describes how the repository currently realizes host-native Truthmark workflow surfaces.

## Scope

It owns generated workflow runtime behavior, managed instruction blocks, helper metadata, and direct-checkout fallback rules.

## Current Implementation Behavior

The source manifest and renderers generate host-specific skills, prompts, commands, subagents, helper manifests, and managed instruction blocks. Generated skill packages hold the full workflow procedures and report contracts. Generated GitHub Copilot prompts and Gemini commands act as compact host entrypoint adapters: they direct the current invocation to host-local skill package files and explicitly avoid dispatching another Truthmark command rather than embedding duplicate workflow bodies or cross-host invocation lists. Generated write-capable workflow text instructs agents to classify lane impact before writing canonical truth docs, while read-only Preview and Check surfaces classify lane ownership for reporting without write-authorizing phrasing. The manual Truth Realize prompt path uses Realize-specific lane guidance: read product truth as requirements, read engineering truth as implementation context, and do not write truth docs or truth routing while realizing docs into code. Truth Preview keeps route selection thin by reading the root route index first and then only child route files relevant to the selected scope or changed paths. Truth Check and read-only route auditors use route-first bounded inspection for lane and cross-lane relationship checks: narrow audits stay within the routed area plus directly linked counterpart docs, root-wide health first builds a route-map/index from route files, and missing product links for user-visible engineering docs are second-pass review diagnostics rather than default full-document reads. Optional CLI repository-intelligence helpers are compact: workflow status exposes WorkflowState/action context, and impact exposes branch-diff routing data; neither helper emits source-file or truth-doc body contents.

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
- Decision (2026-06-15): Optional workflow handoff helpers use `workflow status --json` and `impact --json`; generated surfaces must not direct agents to a standalone ContextPack command.

## Maintenance Notes

Update this doc when workflow manifest fields, generated surface paths, helper metadata, or managed instruction behavior changes.

## Source References

- ../../../../src/agents/instructions.ts
- ../../../../src/agents/prompts.ts
- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/generated-surfaces.ts
- `src/agents/workflow-manifest.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/generated-surfaces.ts`
