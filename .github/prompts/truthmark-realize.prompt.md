---
agent: 'agent'
description: 'Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.'
---

Use this prompt as a light-weight adapter for Truthmark Realize.

To run the full workflow, use the installed skill surface:
OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.

For the canonical workflow procedure, report template, and workflow-specific support files, read:
- .github/skills/truthmark-realize/SKILL.md
- .github/skills/truthmark-realize/support/procedure.md
- .github/skills/truthmark-realize/support/report-template.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
