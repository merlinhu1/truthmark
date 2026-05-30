---
name: truthmark-check
description: Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: 1.6.1
---

# Truthmark Check

Use this skill to audit repository truth health.


Invocations: OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/areas.md; docs/truthmark/areas/) only when they exist; then inspect canonical docs and relevant implementation directly.
- Report issues and suggested fixes; do not silently rewrite unrelated files.
- Direct checkout inspection is valid even when local tooling is unavailable.
- Read support/procedure.md before auditing details.
- Read support/subagents-and-leases.md before dispatching verifier subagents.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
