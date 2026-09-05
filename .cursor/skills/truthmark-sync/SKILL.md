---
name: truthmark-sync
description: Syncs canonical truth docs and truth routing to match functional code changes. Use automatically at finish-time after functional code changes, or when the user invokes /truthmark-sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or hand-designing route ownership.
argument-hint: Optional changed-code area, truth-doc area, or sync focus
user-invocable: true
---

# Truthmark Sync

Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.

Use as a Cursor Agent Skill. Cursor discovers project skills under `.cursor/skills/`, selects them from the description when relevant, and supports manual `/` invocation.

Quick procedure:
- Skip docs-only, formatting-only, behavior-preserving renames with no truth impact, missing config, and no-code changes.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect relevant canonical docs directly.
- Direct checkout inspection is the canonical path; do not require the truthmark binary.
- May write canonical truth docs and truth routing files only; must not rewrite functional code.

Reference files:
- **Procedure**: core review questions; read before edits or detailed auditing. See [procedure.md](support/procedure.md).
- **Report template**: read before writing the final report. See [report-template.md](support/report-template.md).
