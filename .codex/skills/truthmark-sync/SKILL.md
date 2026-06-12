---
name: truthmark-sync
description: Use automatically at finish-time after functional code changes, or explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or manual topology design.
argument-hint: Optional changed-code area, truth-doc area, or sync focus
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Sync

Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.

Invocations: OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Claude Code /truthmark-sync; GitHub Copilot /truthmark-sync; Gemini CLI /truthmark:sync.

## Live workflow preflight

When the local Truthmark CLI is available, run the live workflow contract before acting:

```bash
truthmark workflow status --workflow truthmark-sync --json
truthmark workflow instructions --workflow truthmark-sync --json
```

If a caller supplies a comparison ref, preserve it with `--base <ref>` on both commands. If not, the CLI performs cheap local base selection from existing Git refs (upstream, main, or master); do not stop solely because the caller omitted --base, and do not invent a remote branch that is not present locally.

Before writes, parse the JSON command envelopes:

- stop when `data.workflowState.applicability.state` is `blocked`, `not_applicable`, or `ambiguous`; current-scope continuation is read-only reporting of `nextSteps` or diagnostics
- obey `data.workflowState.actionContext.allowedWritePaths`, `forbiddenWritePaths`, and stop conditions
- run structured helpers from `data.instructions.helperValidationCommands` when present and report each helper as passed, failed, or skipped with reason
- shape the final report from `data.instructions.reportTemplate.sections` or `finalReportShape`; use checked-in report templates only when live instructions are unavailable
- continue direct checkout inspection for code, docs, routes, tests, and evidence; CLI output is guardrails, not proof by itself

If the workflow CLI is unavailable or too old, continue direct checkout inspection and checked-in support files without broadening writes. Include `workflow status/instructions: skipped` and the skip reason in the final report.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Skip docs-only, formatting-only, behavior-preserving renames with no truth impact, missing config, and no-code changes.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect relevant canonical docs directly.
- direct checkout inspection is the canonical path; do not require the truthmark binary.
- May write canonical truth docs and truth routing files only; must not rewrite functional code.
- Read support/procedure.md before editing truth docs.
- Read support/subagents-and-leases.md before dispatching or accepting worker output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
- helper-manifest.yml
- support/helper-policy.md
