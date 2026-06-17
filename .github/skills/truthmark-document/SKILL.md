<!-- truthmark:adapter-mode=expanded-adapter -->
<!-- truthmark:canonical=.truthmark/agent/workflows/truthmark-document/SKILL.md -->
<!-- truthmark:canonical-sha256=e504ba6e14813248c87f7907fe0fc38a13f79b8cb52541c1c38aafe8ae517446 -->
<!-- truthmark:generated-sha256=3b6d2532ec304906665d30af0d0c6ecc219c644473ac67ab4c4be923685910f6 -->
---
name: truthmark-document
description: Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 2.3.0
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.

Invocations: OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Gemini CLI /truthmark:document.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect existing canonical docs, implementation code, and tests directly.
- Document current implemented behavior; do not invent future behavior.
- May write canonical truth docs and truth routing files only; must not write functional code.
- Read support/procedure.md before editing truth docs.
- Read support/subagents-and-leases.md only when dispatching or accepting worker output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core review questions
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
- helper-manifest.yml — read only when invoking helper validators or validating helper registration
- support/helper-policy.md — read only when invoking helper validators or reporting helper status
