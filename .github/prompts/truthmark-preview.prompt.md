---
agent: 'agent'
description: 'Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.'
---

Use this prompt as a light-weight adapter for Truthmark Preview.

To run the full workflow, use the installed skill surface:
OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

For the canonical workflow procedure, report template, and workflow-specific support files, read:
- .github/skills/truthmark-preview/SKILL.md
- .github/skills/truthmark-preview/support/procedure.md
- .github/skills/truthmark-preview/support/report-template.md
- .github/skills/truthmark-preview/support/subagents-and-leases.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
