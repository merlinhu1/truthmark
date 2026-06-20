---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-20
---

# Agent-Native Workflow Injection

## Capability Promise

Truthmark gives configured AI hosts explicit, committed workflow surfaces for Structure, Document, Sync, Realize, and Check. Portal surfaces are generated only when Portal is enabled. Truth Preview generated host surfaces are retired; preview-like route/workflow selection remains internal advisory behavior rather than an installed workflow surface.

## Users And Value

Repository maintainers and agents can follow the checked-in workflow contract without relying on a live Truthmark daemon, hidden runtime state, or off-repo packet.

## Capability Scope

This capability covers generated host-native workflow files, managed instruction blocks, bounded write rules, compact optional validation commands, workflow status/impact guidance, and direct-checkout fallback behavior.

## Current Product Behavior

Supported surfaces include Codex, OpenCode, Claude Code, GitHub Copilot, Antigravity, and Cursor workflow files generated from the source templates and manifest when those platforms are configured. Fresh configs do not assume a host platform; host-specific surfaces are opt-in through `.truthmark/config.yml` `platforms`. Host skill directories are generated as native skill packages for Structure, Document, Sync, Realize, Check, and Portal when enabled: `SKILL.md` plus colocated procedure/report support files and subagent or lease guidance where the workflow uses them. Antigravity and Cursor rule files are flat host rule surfaces that inline the procedure and report template, omit duplicate quick-procedure summaries, and do not reference package-local support files those hosts do not consume. Generated helper manifests and helper policy files are intentionally not emitted; validation helpers remain optional commands and report validators allow manual fallback evidence. Compact prompt, command, and top-level instruction surfaces may point into host-native packages, but configured skill directories are not adapter-only pointer folders because some hosts package and progressively disclose resources from the skill directory itself. Truth Preview is not generated as a skill package, prompt file, or command file for any host. Truthmark does not add a separate `.truthmark/agent/` workflow copy unless a host surface actually consumes it; the checked-in host-native packages are the runtime workflow surfaces. Agents may use `truthmark workflow status --workflow <workflow> [--base <ref>] --json` and `truthmark impact --base <ref> --json` as optional compact helpers for advisory workflow cards, affected files, likely route owners, suggested truth docs, review checklists, evidence prompts, open questions, skipped helper status, and diagnostics; these helpers do not provide file-content packets and are not sources of truth. Truth Sync status separates impacted `primaryTruthDocs`, `candidateStaleTruthDocs`, and `routeFiles` so agents start with affected route owners while preserving evidence-backed stale repository-truth correction beyond the initially affected route set.

## Acceptance Criteria

- Each configured platform receives host-native workflow entrypoints.
- Fresh config defaults do not generate host-specific surfaces unless platforms are explicitly configured.
- Each configured host skill directory receives the workflow support files needed for native skill resource packaging, without generated helper manifests or helper policy files.
- Flat Antigravity and Cursor rule surfaces inline procedure/report content without duplicate quick-procedure summaries, nonexistent support-file references, or cross-host invocation matrices.
- Generated surfaces preserve workflow boundaries, direct-checkout fallback, and bounded Sync-owned topology repair.
- Truth Preview generated host surfaces are retired; preview-like routing selection remains internal, read-only advisory behavior rather than an installed workflow package, prompt, or command.
- Routine code-first Truth Sync defaults internal implementation changes to engineering truth unless a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed.
- Truth Sync carries user-provided decision rationale, constraints, tradeoffs, rejection reasons, and scope boundaries from the current task conversation into Sync Intent, routes them to the correct truth lane when supported, and reports placement, skip, or manual handoff.
- Workflows that create, structure, or audit truth docs still preserve product and engineering truth as separate lanes.

## Product Decisions

- Decision (2026-06-14): Workflow surfaces remain committed repository files; optional CLI helpers validate after relevant work and do not orchestrate workflow execution.
- Decision (2026-06-15): Agent-facing repository-intelligence handoff uses workflow status plus impact instead of a standalone ContextPack command.
- Decision (2026-06-17): Optional workflow status presents helper output as advisory workflow cards with review checklists, evidence prompts, open questions, and skipped-helper status; direct checkout inspection remains the fallback when helpers are skipped, unavailable, or unnecessary.
- Decision (2026-06-17): Host skill directories are product-owned native packages, not adapter-only pointers. Justification: agent skill systems may discover and package the skill directory as the resource boundary, so `SKILL.md` must be colocated with procedure, report-template, and lease resources needed for progressive disclosure. Compact adapters may point to host-native packages, but removing those colocated resources from configured skill folders would make workflow behavior depend on manual cross-repository reads and could fail in hosts or sandboxes that package only the skill directory. A separate `.truthmark/agent/` workflow copy is not generated unless a host surface actually consumes it, because otherwise it is duplicate repository documentation rather than runtime surface.
- Decision (2026-06-18): Truth Sync exposes conversation-provided decision rationale as a visible workflow input and report outcome, without transcript ingestion, hidden memory, required hooks, persistent inbox files, mandatory ADRs, or extra proposal artifacts.
- Decision (2026-06-18): Fresh installs do not assume Codex, OpenCode, or any other host platform; maintainers opt into Codex, OpenCode, Claude Code, GitHub Copilot, Antigravity, or Cursor surfaces by listing them in `platforms`.
- Decision (2026-06-18): Generated helper manifest and helper policy files are removed from skill packages; optional validation remains available through explicit CLI validation commands and manual fallback checks.
- Decision (2026-06-20): Truth Preview generated host surfaces are retired. Truthmark no longer emits Preview skill packages, Copilot prompts, Antigravity rules, or Cursor rules; preview-like route/workflow selection remains internal advisory behavior rather than an installed workflow surface.
- Decision (2026-06-18): Finish-time Truth Sync retains bounded topology repair. Safe repairs happen inside Sync before normal truth syncing; manual Truth Structure handoff is only for unsafe, ambiguous, or out-of-scope topology changes.

## Engineering Realization Links

- `docs/truthmark/engineering/workflows/installed-workflow-runtime.md`
- `docs/truthmark/engineering/contracts/generated-host-surfaces.md`

## Non-Goals

- No mandatory helper payload or runtime packet before an agent can act.

## Source References

- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/generated-surfaces.ts
