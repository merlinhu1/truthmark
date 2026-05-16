---
name: truthmark-preview
description: Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: 1.4.0
---

# Truthmark Preview

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

Quick procedure:
- Follow docs/ai/repo-rules.md as the repository instruction authority.
- Read .truthmark/config.yml, docs/truthmark/areas.md, relevant child route files under docs/truthmark/areas/, and only the truth docs or implementation files needed to preview ownership.
- Truth Preview is read-only; this report is intended, not authorized.
- must not edit files and must not issue write leases; do not run Truth Sync automatically, replace Truth Check, claim final correctness, or mutate code.
- Use optional read-only route-auditor evidence only when it reduces context or clarifies ownership.
- Hand off to the selected workflow after user approval.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
