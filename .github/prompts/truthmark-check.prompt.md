---
agent: 'agent'
description: 'Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.'
---

This prompt is the GitHub Copilot entrypoint for Truthmark Check.

Do not invoke another Truthmark command from here.

Read these host-local files in order only as needed:
- .github/skills/truthmark-check/SKILL.md
- .github/skills/truthmark-check/support/procedure.md
- .github/skills/truthmark-check/support/report-template.md
- .github/skills/truthmark-check/support/subagents-and-leases.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
