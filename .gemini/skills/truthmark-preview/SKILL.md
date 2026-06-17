<!-- truthmark:adapter-mode=expanded-adapter -->
<!-- truthmark:canonical=.truthmark/agent/workflows/truthmark-preview/SKILL.md -->
<!-- truthmark:canonical-sha256=288d3ab94630d80e0d13985d6074239b32b683acd19482b90e7517609a6d971d -->
<!-- truthmark:generated-sha256=4dead63fa513491857e1cec3b94785d9796afd51f538cbc97a77b7619d1e74f9 -->
---
name: truthmark-preview
description: Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: 2.3.0
---

# Truthmark Preview

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Use as a Gemini CLI Agent Skill; commands remain available under `/truthmark:*` for command-first invocation.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and the root route index (docs/truthmark/routes/areas.md) first when present; then inspect only child route files under docs/truthmark/routes/areas/ that are relevant to the selected scope or changed paths, plus the truth docs or implementation files needed to preview ownership.
- Truth Preview is read-only; this report is intended, not authorized.
- must not edit files and must not issue write leases; do not run Truth Sync automatically, replace Truth Check, claim final correctness, or mutate code.
- Use optional read-only route-auditor evidence only when it reduces context or clarifies ownership.
- Hand off to the selected workflow after user approval.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core review questions
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
