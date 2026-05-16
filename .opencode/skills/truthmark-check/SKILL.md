---
name: truthmark-check
description: Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: 1.4.0
---

# Truthmark Check

Use this skill to audit repository truth health.

Invocations: OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.

Truth Check is agent-led:

- inspect .truthmark/config.yml, docs/truthmark/areas.md, canonical docs, and relevant implementation directly
- Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.
Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
- inspect the configured root route index at docs/truthmark/areas.md and relevant child route files under docs/truthmark/areas/
- check that current docs describe current code rather than historical plans
- check that docs/truthmark/areas.md routes code surfaces to canonical truth docs
- check for broad, catch-all, index-like, or mixed-owner truth docs and report them as topology issues requiring Truth Structure
- check that canonical behavior docs keep active Product Decisions and Rationale sections
- optionally run truthmark check when local tooling is available
- must not require the truthmark binary; direct inspection is always valid
- report issues and suggested fixes without silently rewriting unrelated files
- if follow-up docs edits are needed for mixed-owner docs, run or recommend Truth Structure before editing
Evidence Gate:
- support each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests
- canonical docs are context, not sole proof when implementation conflicts
- remove unsupported findings or mark open questions; validate changed claims if you edit docs

OpenCode subagent mode:
- use automatically when this workflow runs in OpenCode and the parent agent chooses bounded subagent fan-out
- dispatch read-only project subagents only: @truth-route-auditor, @truth-claim-verifier, @truth-doc-reviewer
- workers inspect checkout evidence directly, return structured findings, and must not edit files
- Parent agent owns the final Truth Check report

Truthmark hierarchy:
- Config: .truthmark/config.yml
- Root route index: docs/truthmark/areas.md
- Area route files: docs/truthmark/areas/**/*.md
- Truth docs: docs/truth/**/*.md
Decision truth lives in the canonical doc it governs; date active decisions inline when added or changed.
Do not create separate active-decision ADR/planning logs; replace the active decision and let Git history carry the audit trail.
Update Product Decisions and Rationale when a decision changes behavior.

Report completion in this shape:

```md
Truth Check: completed

Files reviewed:
- docs/truthmark/areas.md

Issues found:
- none

Fixes suggested:
- none

Evidence checked:
- Finding: The root route index is present and maps repository truth owners.
  Evidence: .truthmark/config.yml:1 / docs/truthmark/areas.md:1
  Suggested fix: none
  Confidence: high

Validation:
- truthmark check
```
