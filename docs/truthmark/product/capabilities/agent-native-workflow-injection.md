---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-16
---

# Agent-Native Workflow Injection

## Capability Promise

Truthmark gives supported AI hosts explicit, committed workflow surfaces for Structure, Document, Sync, Preview, Realize, Check, and Portal.

## Users And Value

Repository maintainers and agents can follow the checked-in workflow contract without relying on a live Truthmark daemon, hidden runtime state, or off-repo packet.

## Capability Scope

This capability covers generated host-native workflow files, managed instruction blocks, bounded write rules, helper metadata, compact workflow status/impact guidance, and direct-checkout fallback behavior.

## Current Product Behavior

Supported surfaces include Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini CLI workflow files generated from the source templates and manifest. Agents may use `truthmark workflow status --workflow <workflow> [--base <ref>] --json` and `truthmark impact --base <ref> --json` as optional compact helpers for applicability, write boundaries, routing, affected tests, and diagnostics; these helpers do not provide file-content packets. Truth Sync status can authorize indexed canonical truth docs and truth routing files broadly so agents can correct stale repository truth beyond the initially affected documents when supported by checkout evidence.

## Acceptance Criteria

- Each configured platform receives host-native workflow entrypoints.
- Generated surfaces preserve workflow boundaries and direct-checkout fallback.
- Agents can classify product-lane, engineering-lane, both-lane, or ambiguous work before writing truth docs.

## Product Decisions

- Decision (2026-06-14): Workflow surfaces remain committed repository files; optional CLI helpers validate after relevant work and do not orchestrate workflow execution.
- Decision (2026-06-15): Agent-facing repository-intelligence handoff uses workflow status plus impact instead of a standalone ContextPack command.
- Decision (2026-06-16): Truth Sync write authorization is broad across indexed repository truth surfaces; affected docs remain a focus signal rather than a write ceiling.

## Engineering Realization Links

- `docs/truthmark/engineering/workflows/installed-workflow-runtime.md`
- `docs/truthmark/engineering/contracts/generated-host-surfaces.md`

## Non-Goals

- No mandatory helper payload or runtime packet before an agent can act.

## Source References

- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/generated-surfaces.ts
