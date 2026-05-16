---
name: truthmark-structure
description: Use when routing or truth ownership is missing, stale, broad, overloaded, catch-all, unrouteable, mixed-owner, needs split/repair, or needs new area setup. Not for documenting implemented behavior, syncing a code diff, or realizing docs into code.
argument-hint: Optional area, directory, or routing concern
user-invocable: true
truthmark-version: 1.4.0
---

# Truthmark Structure

Use this skill to design or repair Truthmark area structure.

Invocations: OpenCode /skill truthmark-structure; Codex /truthmark-structure or $truthmark-structure; Claude Code /truthmark-structure; GitHub Copilot /truthmark-structure; Gemini CLI /truthmark:structure.

Quick procedure:
- Follow docs/ai/repo-rules.md as the repository instruction authority.
- Read .truthmark/config.yml, docs/truthmark/areas.md, relevant child route files under docs/truthmark/areas/, current docs, and relevant code directly.
- Define areas by product or behavior ownership, not by mechanical directory mirroring.
- Do not edit functional code.
- Read support/procedure.md before writing route or starter truth-doc changes.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
