---
agent: 'agent'
description: 'Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.'
---

This prompt is the GitHub Copilot entrypoint for Truthmark Document.

Do not invoke another Truthmark command from here.

Read these host-local files in order only as needed:
- .github/skills/truthmark-document/SKILL.md
- .github/skills/truthmark-document/support/procedure.md
- .github/skills/truthmark-document/support/report-template.md
- .github/skills/truthmark-document/support/subagents-and-leases.md
- .github/skills/truthmark-document/helper-manifest.yml
- .github/skills/truthmark-document/support/helper-policy.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
