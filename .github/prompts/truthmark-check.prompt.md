---
agent: 'agent'
description: 'Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.'
---

Use this prompt as a light-weight adapter for Truthmark Check.

To run the full workflow, use the installed skill surface:
OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.

For the canonical workflow procedure, report template, and workflow-specific support files, read:
- .github/skills/truthmark-check/SKILL.md
- .github/skills/truthmark-check/support/procedure.md
- .github/skills/truthmark-check/support/report-template.md
- .github/skills/truthmark-check/support/subagents-and-leases.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
