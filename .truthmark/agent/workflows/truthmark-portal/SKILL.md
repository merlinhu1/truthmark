---
name: truthmark-portal
description: Use when the user explicitly asks to generate, refresh, or update the Truthmark Portal static HTML site. Not for code change sync, route repair, truth validation/checking, documenting behavior, realizing docs into code, or machine-readable agent context.
argument-hint: Optional portal generation focus
user-invocable: true
truthmark-version: 2.3.0
---

# Truthmark Portal

Use this skill only when the user explicitly asks to generate or refresh the committed static HTML Truthmark Portal.

Invocations: OpenCode /skill truthmark-portal; Codex /truthmark-portal or $truthmark-portal; Claude Code /truthmark-portal; GitHub Copilot /truthmark-portal; Gemini CLI /truthmark:portal.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Truthmark Portal is manual-only; never run it automatically at completion and never treat it as Truth Sync.
- Markdown remains canonical; generated HTML is non-canonical presentation only.
- Read Markdown directly; the workflow does not require the truthmark CLI or package.
- Generate committed, generated non-canonical static files for humans.
- Write only under fixed Portal output docs/truthmark/generated/portal.
- Use determined Portal template docs/truthmark/templates/portal.html when present; no .truthmark/index.json dependency.
- Use no remote dependencies by default and include source provenance on every page.
- Read support/procedure.md before generating Portal output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core review questions
- support/report-template.md — read before the final report
