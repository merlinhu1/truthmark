---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-31
source_of_truth:
  - ../../../src/agents/truth-check.ts
  - ../../../src/checks/**
  - ../../../src/agents/shared.ts
  - ../../../src/templates/workflow-surfaces.ts
---

# Truth Check Workflow

## Purpose

Truth Check protects repository-truth health by auditing configured routes, canonical docs, implementation evidence, and optional CLI diagnostics without becoming a code verifier or silent repair workflow.

## Scope

Truth Check owns agent-led truth-health review. It reports issues and suggested fixes without silently rewriting unrelated files.

## Triggers

- explicit user invocation through an installed host surface such as `/truthmark-check`, `$truthmark-check`, `/skill truthmark-check`, or `/truthmark:check`
- a user request to audit an area, document path, route owner, stale claim, topology concern, or overall truth-health state

## Inputs

- `.truthmark/config.yml`
- root and child route files
- canonical docs
- relevant implementation code
- optional local `truthmark check` output

## Execution Model

Truth Check inspects the checkout directly and may optionally run `truthmark check` when local tooling is available. Installed workflows must not depend on the binary being present. In Codex, Claude Code, GitHub Copilot, Gemini CLI, or OpenCode, Truth Check may automatically use generated read-only verifier subagents when the host supports subagent dispatch and the parent agent chooses bounded fan-out.

## Steps

1. Inspect configured Truthmark config, route files, canonical docs, implementation, and tests.
2. Optionally run local `truthmark check` when available.
3. Identify stale claims, weak route ownership, missing decision/rationale coverage, topology issues, and unsupported truth-doc content.
4. Support each finding and suggested fix with checkout evidence.
5. Report issues without silently rewriting unrelated files.

Current behavior notes:

Truth Check verifies that current docs describe current code rather than historical plans, route files map code surfaces to canonical truth docs, canonical behavior docs keep active Product Decisions and Rationale sections, and broad, catch-all, index-like, or mixed-owner truth docs are reported as topology issues requiring Truth Structure.

Truth Check supports each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests. Unsupported findings are removed or marked as open questions with confidence.

If follow-up docs edits are needed for mixed-owner docs, Truth Check runs or recommends Truth Structure before editing.

When subagent mode is available, the parent agent may dispatch read-only route, claim, and doc-shape verifier workers across bounded shards. Codex exposes `truth_route_auditor`, `truth_claim_verifier`, and `truth_doc_reviewer`; Claude Code exposes `truth-route-auditor`, `truth-claim-verifier`, and `truth-doc-reviewer` project subagents; GitHub Copilot, Gemini CLI, and OpenCode expose `@truth-route-auditor`, `@truth-claim-verifier`, and `@truth-doc-reviewer`. Workers return structured findings only and must not edit files. They inspect only the parent-assigned shard plus required checkout evidence files and do not preload repo-wide instruction or policy docs unless the parent assigns those files as evidence. The parent agent deduplicates findings, spot-checks evidence, optionally runs validation, and owns repo-policy interpretation and the final Truth Check report.

Completed reports include `Files reviewed`, `Issues found`, `Fixes suggested`, `Evidence checked`, and `Validation`.

## State, Retry, And Failure Behavior

Truth Check is read-only by default. If local CLI tooling is unavailable, it proceeds by direct checkout inspection and reports that optional CLI diagnostics were not generated. Mixed-owner docs are reported as topology issues instead of silently repaired.

## Outputs

Truth Check outputs an audit report with findings, evidence, severity or priority, and suggested fixes. It does not replace lint, tests, typecheck, code review, or Truth Sync.

## Product Decisions

- Decision (2026-05-15): Truth Check is an audit workflow, not a substitute for lint, tests, typecheck, code review, or Truth Sync.
- Decision (2026-05-15): Truth Check reports mixed-owner truth docs as topology issues and does not silently repair them outside the proper workflow.
- Decision (2026-05-16): Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode subagent mode is read-only, automatic when host-supported, parent-owned, and context-bounded; verifier agents may gather evidence but never write docs, preload repo-wide policy unless assigned, or replace the final audit report.

## Rationale

Audits must identify ownership drift, not only stale claims. Reporting mixed-owner docs pushes repair into Truth Structure, where routing and split decisions are allowed.

## Non-Goals

- no silent rewrite of unrelated files, functional code, route files, or truth docs
- no replacement for normal lint, tests, typecheck, build checks, or code review
- no topology repair in place when findings require Truth Structure ownership

## Maintenance Notes

Update this doc when Check audit scope, evidence requirements, topology finding behavior, or report shape changes.
