---
name: truthmark-document
description: Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 1.6.0
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.


Invocations: OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Gemini CLI /truthmark:document.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/areas.md; docs/truthmark/areas/) only when they exist; then inspect existing canonical docs, implementation code, and tests directly.
- Document current implemented behavior; do not invent future behavior.
- May write canonical truth docs and truth routing files only; must not write functional code.
- Read support/procedure.md before editing truth docs.
- Read support/subagents-and-leases.md before dispatching or accepting worker output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
- helper-manifest.yml
- support/helper-policy.md
