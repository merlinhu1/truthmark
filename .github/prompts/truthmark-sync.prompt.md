---
agent: 'agent'
description: 'Use automatically at finish-time after functional code changes, or explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or manual topology design.'
---

Use this prompt as a light-weight adapter for Truthmark Sync.

To run the full workflow, use the installed skill surface:
OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Claude Code /truthmark-sync; GitHub Copilot /truthmark-sync; Gemini CLI /truthmark:sync.

For the canonical workflow procedure, report template, and workflow-specific support files, read:
- .github/skills/truthmark-sync/SKILL.md
- .github/skills/truthmark-sync/support/procedure.md
- .github/skills/truthmark-sync/support/report-template.md
- .github/skills/truthmark-sync/support/subagents-and-leases.md
- .github/skills/truthmark-sync/helper-manifest.yml
- .github/skills/truthmark-sync/support/helper-policy.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
