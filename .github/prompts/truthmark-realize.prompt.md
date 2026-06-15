---
agent: 'agent'
description: 'Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.'
---

This prompt is the GitHub Copilot entrypoint for Truthmark Realize.

Do not invoke another Truthmark command from here.

Read these host-local files in order only as needed:
- .github/skills/truthmark-realize/SKILL.md
- .github/skills/truthmark-realize/support/procedure.md
- .github/skills/truthmark-realize/support/report-template.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
