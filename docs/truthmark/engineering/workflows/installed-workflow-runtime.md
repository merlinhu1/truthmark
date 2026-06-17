---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-17
---

# Installed Workflow Runtime

## Purpose

This doc describes how the repository currently realizes host-native Truthmark workflow surfaces.

## Scope

It owns generated workflow runtime behavior, managed instruction blocks, helper metadata, and direct-checkout fallback rules.

## Current Implementation Behavior

The source manifest and renderers are the package-generation authority; `truthmark init` projects that source into host-native workflow files. Generated host skill directories are native skill packages: their `SKILL.md` files keep package-local `support/procedure.md`, `support/report-template.md`, subagent/lease guidance, helper manifests, and helper policy files so hosts that package skill-directory resources do not depend on arbitrary cross-repository file reads. Truthmark does not emit a separate `.truthmark/agent/` workflow copy because host skill packages are the runtime surfaces agents actually load; duplicating them under `.truthmark/agent/` would add repository docs with no active host consumer. GitHub Copilot prompts, Gemini commands, and top-level managed instruction blocks stay thin and point to host-native workflow entrypoints rather than embedding full workflow bodies. Generated-surface checks report missing or stale host-native skill package files.

Workflow manifest entries use review-oriented questions that surface as a WorkflowState `reviewChecklist`, while evidence-oriented entries surface as `evidencePrompts`. Generated GitHub Copilot prompts and Gemini commands act as compact host entrypoint adapters: they direct the current invocation to host-local skill package files and explicitly avoid dispatching another Truthmark command rather than embedding duplicate workflow bodies or cross-host invocation lists. Truth Sync generated procedures use a product-truth decision before canonical truth writes: update or route product truth only when a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed; otherwise internal implementation changes default to engineering truth. Other write-capable truth workflows preserve lane-specific classification before canonical truth writes, while read-only Preview and Check surfaces classify lane ownership for reporting without write-authorizing phrasing. The manual Truth Realize prompt path uses Realize-specific lane guidance: read product truth as requirements, read engineering truth as implementation context, and do not write truth docs or truth routing while realizing docs into code. Truth Preview keeps route selection thin by reading the root route index first and then only child route files relevant to the selected scope or changed paths, and reports unresolved manual handoff questions rather than final correctness. Truth Check and read-only route auditors use route-first bounded inspection for lane and cross-lane relationship checks: narrow audits stay within the routed area plus directly linked counterpart docs, root-wide health first builds a route-map/index from route files, and missing product links for user-visible engineering docs are second-pass review diagnostics rather than default full-document reads. Truth Sync generated procedures and report templates include a transient Sync Intent checkpoint that records changed code reviewed, affected route/truth owner, target truth docs, intended update, evidence to verify, no-update-needed rationale, and blockers before canonical truth writes. Optional CLI repository-intelligence helpers are compact advisory cards: workflow status reports affected files, likely route owners, suggested truth docs, open questions, skipped helper status, and compact write-boundary suggestions; impact exposes branch-diff routing data; neither helper emits source-file or truth-doc body contents. Truth Sync workflow status separates impacted primary truth docs from candidate stale truth docs and route files so stale repository-truth correction remains available without making every indexed doc look like the starting scope.

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
- Decision (2026-06-17): Source manifest/renderers are the workflow-generation authority; configured host skill directories are native generated packages with colocated resources. Truthmark does not emit a separate `.truthmark/agent/` workflow copy when no host surface consumes it.

## Maintenance Notes

Update this doc when workflow manifest fields, generated surface paths, helper metadata, or managed instruction behavior changes.

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
