---
agent: 'agent'
description: 'Use automatically at finish-time after functional code changes, or explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or manual topology design.'
---

This prompt is the GitHub Copilot entrypoint for Truthmark Sync.

Do not invoke another Truthmark command from here.

Read these host-local files in order only as needed:
- .github/skills/truthmark-sync/SKILL.md
- .github/skills/truthmark-sync/support/procedure.md
- .github/skills/truthmark-sync/support/report-template.md
- .github/skills/truthmark-sync/support/subagents-and-leases.md
- .github/skills/truthmark-sync/helper-manifest.yml
- .github/skills/truthmark-sync/support/helper-policy.md

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.
