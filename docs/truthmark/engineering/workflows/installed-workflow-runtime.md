---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-18
---

# Installed Workflow Runtime

## Purpose

This doc describes how the repository currently realizes host-native Truthmark workflow surfaces.

## Scope

It owns generated workflow runtime behavior, managed instruction blocks, optional validation commands, and direct-checkout fallback rules.

## Current Implementation Behavior

The source manifest and renderers are the package-generation authority; `truthmark init` projects that source into configured host-native workflow files. Fresh configs do not assume a host platform; host-specific surfaces are generated only when `.truthmark/config.yml` explicitly lists platforms such as Codex, OpenCode, Claude Code, GitHub Copilot, or Gemini CLI. Generated host skill directories are native skill packages for write-capable and audit workflows: their `SKILL.md` files keep package-local `support/procedure.md`, `support/report-template.md`, and subagent/lease guidance only when the workflow uses subagents, so hosts that package skill-directory resources do not depend on arbitrary cross-repository file reads. Generated helper manifests and helper policy support files are not emitted; optional validation commands stay in workflow metadata and report validation accepts manual fallback evidence. Truth Preview is read-only and explicit, so it is emitted as Copilot/Gemini prompt-command bodies instead of standalone skill packages. Truthmark does not emit a separate `.truthmark/agent/` workflow copy because host surfaces are the runtime surfaces agents actually load; duplicating them under `.truthmark/agent/` would add repository docs with no active host consumer. GitHub Copilot prompts, Gemini commands, and top-level managed instruction blocks stay thin and point to host-native workflow entrypoints when a host skill package exists rather than embedding full workflow bodies. Generated-surface checks report missing or stale configured host-native skill package files.

Workflow manifest entries use review-oriented questions that surface as a WorkflowState `reviewChecklist`, while evidence-oriented entries surface as `evidencePrompts`. Generated GitHub Copilot prompts and Gemini commands act as compact host entrypoint adapters: they direct the current invocation to host-local skill package files and explicitly avoid dispatching another Truthmark command rather than embedding duplicate workflow bodies or cross-host invocation lists. Truth Sync generated procedures use a product-truth decision before canonical truth writes: update or route product truth only when a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed; otherwise internal implementation changes default to engineering truth. Truth Sync also owns bounded topology repair before normal syncing: when changed functional code maps only to missing, stale, broad, overloaded, or catch-all routing, Sync runs or applies Truth Structure-style repair first when the repair is safe and in scope, limited to affected route/truth owners; only unsafe, ambiguous, or out-of-scope topology repair is handed off manually to Truth Structure. Truth Sync also performs decision context capture from the current task conversation: agents review user-provided decisions, rationale, constraints, tradeoffs, rejection reasons, and scope boundaries, carry that context into Sync Intent, place it in the correct product or engineering truth lane when supported, and report whether it was placed, skipped because none was provided, or needs manual handoff. Other write-capable truth workflows preserve lane-specific classification before canonical truth writes, while read-only Preview and Check surfaces classify lane ownership for reporting without write-authorizing phrasing. The manual Truth Realize prompt path uses Realize-specific lane guidance: read product truth as requirements, read engineering truth as implementation context, and do not write truth docs or truth routing while realizing docs into code. Truth Preview keeps route selection thin by reading the root route index first and then only child route files relevant to the selected scope or changed paths, and reports unresolved manual handoff questions rather than final correctness. Truth Check and read-only route auditors use route-first bounded inspection for lane and cross-lane relationship checks: narrow audits stay within the routed area plus directly linked counterpart docs, root-wide health first builds a route-map/index from route files, and missing product links for user-visible engineering docs are second-pass review diagnostics rather than default full-document reads. Truth Sync generated procedures and report templates include a transient Sync Intent checkpoint that records changed code reviewed, affected route/truth owner, target truth docs, intended update, evidence to verify, user-provided decisions/rationale, no-update-needed rationale, and blockers before canonical truth writes. Optional CLI repository-intelligence helpers are compact advisory cards: workflow status reports affected files, likely route owners, suggested truth docs, open questions, skipped helper status, and compact write-boundary suggestions; impact exposes branch-diff routing data; neither helper emits source-file or truth-doc body contents. Truth Sync workflow status separates impacted primary truth docs from candidate stale truth docs and route files so stale repository-truth correction remains available without making every indexed doc look like the starting scope.

## Triggers

- `truthmark init` refreshes configured workflow surfaces.
- Explicit host invocations run manual workflows.
- Truth Sync is the finish-time workflow when functional code changed.

## Execution Model

Committed workflow files are the runtime contract. The CLI installs and validates surfaces but does not act as daemon, database, or workflow orchestrator.

## Product Truth Links

- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`

## Engineering Decisions

- Decision (2026-06-14): Product and engineering truth remain separate generated-workflow lanes for truth creation, structure, audit, and cross-lane ownership checks.
- Decision (2026-06-17): Routine code-first Truth Sync uses a product-truth decision instead of a full lane-classification gate; product truth is opt-in for externally visible promises, product boundaries, APIs, acceptance criteria, or explicit user/product evidence.
- Decision (2026-06-15): Optional workflow handoff helpers use `workflow status --json` and `impact --json`; generated surfaces must not direct agents to a standalone ContextPack command.
- Decision (2026-06-16): `truthmark workflow instructions` is intentionally absent; committed host-native workflow files and direct checkout inspection are the runtime contract, while `workflow status` remains an optional compact helper.
- Decision (2026-06-17): Workflow status presents optional helper output as advisory workflow cards with review checklists, evidence prompts, open questions, and skipped-helper status; generated workflows still run from committed host-native files and direct checkout inspection when helpers are unavailable.
- Decision (2026-06-16): Truth Sync uses a transient Sync Intent checklist in generated procedures and report templates before truth writes; it is not a persistent plan object or lifecycle artifact.
- Decision (2026-06-18): Truth Sync treats user-provided decision rationale from the current task conversation as first-class sync input. The workflow records that context in Sync Intent, routes it to the correct product or engineering truth section when supported, and reports where it was placed, skipped because none was provided, or handed off for manual review.
- Decision (2026-06-17): Source manifest/renderers are the workflow-generation authority; configured host skill directories are native generated packages with colocated resources. Truthmark does not emit a separate `.truthmark/agent/` workflow copy when no host surface consumes it.
- Decision (2026-06-18): Fresh configs do not assume Codex, OpenCode, or any other host platform. Host-specific surfaces are generated only for explicit `platforms` entries.
- Decision (2026-06-18): Generated helper manifest and helper policy files are retired. Validation helpers remain as optional workflow metadata and explicit `truthmark validate ...` commands, not package support files.
- Decision (2026-06-18): Truth Preview is read-only and explicit, so it remains a compact Copilot/Gemini prompt-command body instead of a standalone native skill package.
- Decision (2026-06-18): Truth Sync retains bounded topology repair. Missing, stale, broad, overloaded, or catch-all route ownership is repaired inside Sync when safe and scoped to the changed functional code; only unsafe, ambiguous, or out-of-scope topology repair is handed off manually to Truth Structure.

## Maintenance Notes

Update this doc when workflow manifest fields, generated surface paths, optional validation metadata, or managed instruction behavior changes.

## Source References

- ../../../../src/agents/instructions.ts
- ../../../../src/agents/prompts.ts
- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/agents/truth-sync.ts
- ../../../../src/sync/report.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/generated-surfaces.ts
- ../../../../src/checks/generated-surfaces.ts
- `src/agents/workflow-manifest.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/generated-surfaces.ts`
