---
name: truthmark-check
description: Audits repository truth health and reports findings without rewriting docs. Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
---

# Truthmark Check

Use this skill to audit repository truth health.

Use as a Cursor Agent Skill. Cursor discovers project skills under `.cursor/skills/`, selects them from the description when relevant, and supports manual `/` invocation.

Quick procedure:
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect canonical docs and relevant implementation directly.
- Report issues and suggested fixes; do not silently rewrite unrelated files.

Reference files:
- **Procedure**: core review questions; read before edits or detailed auditing. See [procedure.md](support/procedure.md).
- **Report template**: read before writing the final report. See [report-template.md](support/report-template.md).
