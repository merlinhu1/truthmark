---
name: truthmark-realize
description: Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
---

# Truthmark Realize

Use this skill only when the user explicitly asks to realize truth docs into code.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Read the source truth docs, inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist, then inspect tests and relevant functional code directly.
- Truth docs lead; code follows.
- may write functional code only; must not edit truth docs or truth routing while realizing those docs.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core review questions
- support/report-template.md — read before the final report
