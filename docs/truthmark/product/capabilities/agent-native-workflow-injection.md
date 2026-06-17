---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-17
---

# Agent-Native Workflow Injection

## Capability Promise

Truthmark gives supported AI hosts explicit, committed workflow surfaces for Structure, Document, Sync, Preview, Realize, Check, and Portal.

## Users And Value

Repository maintainers and agents can follow the checked-in workflow contract without relying on a live Truthmark daemon, hidden runtime state, or off-repo packet.

## Capability Scope

This capability covers generated host-native workflow files, managed instruction blocks, bounded write rules, helper metadata, compact workflow status/impact guidance, and direct-checkout fallback behavior.

## Current Product Behavior

Supported surfaces include Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini CLI workflow files generated from the source templates and manifest. Host skill directories are generated as native skill packages: `SKILL.md` plus colocated support files, helper manifests, helper policies, and subagent or lease guidance where the workflow uses them. Compact prompt, command, and top-level instruction surfaces may point into those host-native packages, but configured skill directories are not adapter-only pointer folders because some hosts package and progressively disclose resources from the skill directory itself. Truthmark does not add a separate `.truthmark/agent/` workflow copy unless a host surface actually consumes it; the checked-in host-native packages are the runtime workflow surfaces. Agents may use `truthmark workflow status --workflow <workflow> [--base <ref>] --json` and `truthmark impact --base <ref> --json` as optional compact helpers for advisory workflow cards, affected files, likely route owners, suggested truth docs, review checklists, evidence prompts, open questions, skipped helper status, and diagnostics; these helpers do not provide file-content packets and are not sources of truth. Truth Sync status separates impacted `primaryTruthDocs`, `candidateStaleTruthDocs`, and `routeFiles` so agents start with affected route owners while preserving evidence-backed stale repository-truth correction beyond the initially affected documents.

## Acceptance Criteria

- Each configured platform receives host-native workflow entrypoints.
- Each configured host skill directory receives the workflow support files needed for native skill resource packaging.
- Generated surfaces preserve workflow boundaries and direct-checkout fallback.
- Routine code-first Truth Sync defaults internal implementation changes to engineering truth unless a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed.
- Workflows that create, structure, or audit truth docs still preserve product and engineering truth as separate lanes.

## Product Decisions

- Decision (2026-06-14): Workflow surfaces remain committed repository files; optional CLI helpers validate after relevant work and do not orchestrate workflow execution.
- Decision (2026-06-15): Agent-facing repository-intelligence handoff uses workflow status plus impact instead of a standalone ContextPack command.
- Decision (2026-06-17): Optional workflow status presents helper output as advisory workflow cards with review checklists, evidence prompts, open questions, and skipped-helper status; direct checkout inspection remains the fallback when helpers are skipped, unavailable, or unnecessary.
- Decision (2026-06-17): Host skill directories are product-owned native packages, not adapter-only pointers. Justification: agent skill systems may discover and package the skill directory as the resource boundary, so `SKILL.md` must be colocated with procedure, report-template, helper, and lease resources needed for progressive disclosure. Compact adapters may point to host-native packages, but removing those colocated resources from configured skill folders would make workflow behavior depend on manual cross-repository reads and could fail in hosts or sandboxes that package only the skill directory. A separate `.truthmark/agent/` workflow copy is not generated unless a host surface actually consumes it, because otherwise it is duplicate repository documentation rather than runtime surface.

## Engineering Realization Links

- `docs/truthmark/engineering/workflows/installed-workflow-runtime.md`
- `docs/truthmark/engineering/contracts/generated-host-surfaces.md`

## Non-Goals

- No mandatory helper payload or runtime packet before an agent can act.

## Source References

- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/generated-surfaces.ts
