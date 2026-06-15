---
name: truthmark-preview
description: Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: 2.2.0
---

# Truthmark Preview

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and the root route index (docs/truthmark/routes/areas.md) first when present; then inspect only child route files under docs/truthmark/routes/areas/ that are relevant to the selected scope or changed paths, plus the truth docs or implementation files needed to preview ownership.
- Truth Preview is read-only; this report is intended, not authorized.
- must not edit files and must not issue write leases; do not run Truth Sync automatically, replace Truth Check, claim final correctness, or mutate code.
- Use optional read-only route-auditor evidence only when it reduces context or clarifies ownership.
- Hand off to the selected workflow after user approval.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core quality gates
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
