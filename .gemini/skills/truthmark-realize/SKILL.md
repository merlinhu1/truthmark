<!-- truthmark:adapter-mode=expanded-adapter -->
<!-- truthmark:canonical=.truthmark/agent/workflows/truthmark-realize/SKILL.md -->
<!-- truthmark:canonical-sha256=5c805371df048f8e8da1e56e9835b8d07753d60a9d25a67a73dad6a19ad7d8dd -->
<!-- truthmark:generated-sha256=3ceb6f08f0eb09b5cd41841ef97c0e65ac91a013b0c511b1a46b7ad20fd8c5a5 -->
---
name: truthmark-realize
description: Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
truthmark-version: 2.3.0
---

# Truthmark Realize

Use this skill only when the user explicitly asks to realize truth docs into code.

Use as a Gemini CLI Agent Skill; commands remain available under `/truthmark:*` for command-first invocation.

Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Read the source truth docs, inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist, then inspect tests and relevant functional code directly.
- Truth docs lead; code follows.
- may write functional code only; must not edit truth docs or truth routing while realizing those docs.
- Read support/procedure.md before changing code.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core review questions
- support/report-template.md — read before the final report
