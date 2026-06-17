<!-- truthmark:adapter-mode=expanded-adapter -->
<!-- truthmark:canonical=.truthmark/agent/workflows/truthmark-check/SKILL.md -->
<!-- truthmark:canonical-sha256=f6ccb4c9276a0eac2b4b37a458092e5dad832c6b9369bc0c277058a2f1925361 -->
<!-- truthmark:generated-sha256=8cdf133993f0c3188a1e9d66cbc7627a36a837efffb3ccf77142ce899c95809c -->
---
name: truthmark-check
description: Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: 2.3.0
---

# Truthmark Check

Use this skill to audit repository truth health.

Invocations: OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect canonical docs and relevant implementation directly.
- Report issues and suggested fixes; do not silently rewrite unrelated files.
- Read support/procedure.md before auditing details.
- Read support/subagents-and-leases.md only when dispatching verifier subagents.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core review questions
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
