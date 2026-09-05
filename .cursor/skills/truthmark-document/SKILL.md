---
name: truthmark-document
description: Writes canonical truth docs for behavior that is already implemented. Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or route-ownership repair that needs Structure.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.

Use as a Cursor Agent Skill. Cursor discovers project skills under `.cursor/skills/`, selects them from the description when relevant, and supports manual `/` invocation.

Quick procedure:
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect existing canonical docs, implementation code, and tests directly.
- Document current implemented behavior; do not invent future behavior.
- May write canonical truth docs and truth routing files only; must not write functional code.

Reference files:
- **Procedure**: core review questions; read before edits or detailed auditing. See [procedure.md](support/procedure.md).
- **Report template**: read before writing the final report. See [report-template.md](support/report-template.md).
