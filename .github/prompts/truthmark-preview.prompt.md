---
agent: 'agent'
description: 'Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.'
---

This prompt is the GitHub Copilot entrypoint for Truthmark Preview.

Do not invoke another Truthmark command from here.

Read these host-local files in order only as needed:
- .github/skills/truthmark-preview/SKILL.md
- .github/skills/truthmark-preview/support/procedure.md
- .github/skills/truthmark-preview/support/report-template.md
- .github/skills/truthmark-preview/support/subagents-and-leases.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
