---
name: truthmark-document
description: Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 1.4.0
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.

Invocations: OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Gemini CLI /truthmark:document.

Quick procedure:
- Follow docs/ai/repo-rules.md as the repository instruction authority.
- Read .truthmark/config.yml, docs/truthmark/areas.md, relevant child route files under docs/truthmark/areas/, existing canonical docs, implementation code, and tests directly.
- Document current implemented behavior; do not invent future behavior.
- May write canonical truth docs and truth routing files only; must not write functional code.
- Read support/procedure.md before editing truth docs.
- Read support/subagents-and-leases.md before dispatching or accepting worker output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
