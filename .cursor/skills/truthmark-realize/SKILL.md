---
name: truthmark-realize
description: Writes functional code from truth docs that already describe the intended behavior. Use when the user explicitly asks to realize Truthmark truth docs into code, including when they invoke /truthmark-realize. Not for syncing docs after code changes, documenting existing code, repairing route ownership, or truth audits.
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
---

# Truthmark Realize

Use this skill only when the user explicitly asks to realize truth docs into code.

Use as a Cursor Agent Skill. Cursor discovers project skills under `.cursor/skills/`, selects them from the description when relevant, and supports manual `/` invocation.

Quick procedure:
- Read the source truth docs, inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist, then inspect tests and relevant functional code directly.
- Truth docs lead; code follows.
- May write functional code only; must not edit truth docs or truth routing while realizing those docs.

Reference files:
- **Procedure**: core review questions; read before edits or detailed auditing. See [procedure.md](support/procedure.md).
- **Report template**: read before writing the final report. See [report-template.md](support/report-template.md).
