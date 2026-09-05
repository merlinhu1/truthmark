---
name: truthmark-structure
description: Designs and repairs Truthmark area routing and truth ownership. Use when route or truth ownership is missing, stale, too broad, overloaded, catch-all, matched by no route, split across several owners, or needs a new area. Not for documenting implemented behavior, syncing a code diff, or realizing docs into code.
argument-hint: Optional area, directory, or routing concern
user-invocable: true
---

# Truthmark Structure

Use this skill to design or repair Truthmark area structure.

Use as a Cursor Agent Skill. Cursor discovers project skills under `.cursor/skills/`, selects them from the description when relevant, and supports manual `/` invocation.

Quick procedure:
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect current docs and relevant code directly.
- Define areas by product or behavior ownership, not by mechanical directory mirroring.
- Do not edit functional code.

Reference files:
- **Procedure**: core review questions; read before edits or detailed auditing. See [procedure.md](support/procedure.md).
- **Report template**: read before writing the final report. See [report-template.md](support/report-template.md).
