---
name: truthmark-sync
description: Use automatically at finish-time after functional code changes, or explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or manual topology design.
argument-hint: Optional changed-code area, truth-doc area, or sync focus
user-invocable: true
truthmark-version: 1.4.0
---

# Truthmark Sync

Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.

Invocations: OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Claude Code /truthmark-sync; GitHub Copilot /truthmark-sync; Gemini CLI /truthmark:sync.

Quick procedure:
- Follow docs/ai/repo-rules.md as the repository instruction authority.
- Skip docs-only, formatting-only, behavior-preserving renames with no truth impact, missing config, and no-code changes.
- Read .truthmark/config.yml, the configured root route index at docs/truthmark/areas.md, relevant child route files under docs/truthmark/areas/, and relevant canonical docs.
- direct checkout inspection is the canonical path; do not require the truthmark binary.
- May write canonical truth docs and truth routing files only; must not rewrite functional code.
- Read support/procedure.md before editing truth docs.
- Read support/subagents-and-leases.md before dispatching or accepting worker output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
