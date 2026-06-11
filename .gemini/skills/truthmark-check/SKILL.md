---
name: truthmark-check
description: Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Check

Use this skill to audit repository truth health.

Use as a Gemini CLI Agent Skill; commands remain available under `/truthmark:*` for command-first invocation.

Invocations: OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.

## Live workflow preflight

When the local Truthmark CLI is available, run the live workflow contract before acting:

```bash
truthmark workflow status --workflow truthmark-check --json
truthmark workflow instructions --workflow truthmark-check --json
```

If a caller supplies a comparison ref, preserve it with `--base <ref>` on both commands; do not invent a default branch.

Before writes, parse the JSON command envelopes:

- stop when `data.workflowState.applicability.state` is `blocked`, `not_applicable`, or `ambiguous`; current-scope continuation is read-only reporting of `nextSteps` or diagnostics
- obey `data.workflowState.actionContext.allowedWritePaths`, `forbiddenWritePaths`, and stop conditions
- run structured helpers from `data.instructions.helperValidationCommands` when present and report each helper as passed, failed, or skipped with reason
- shape the final report from `data.instructions.reportTemplate.sections` or `finalReportShape`; use checked-in report templates only when live instructions are unavailable
- continue direct checkout inspection for code, docs, routes, tests, and evidence; CLI output is guardrails, not proof by itself

If the workflow CLI is unavailable or too old, continue direct checkout inspection and checked-in support files without broadening writes. Include `workflow status/instructions: skipped` and the skip reason in the final report.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect canonical docs and relevant implementation directly.
- Report issues and suggested fixes; do not silently rewrite unrelated files.
- Direct checkout inspection is valid even when local tooling is unavailable.
- Read support/procedure.md before auditing details.
- Read support/subagents-and-leases.md before dispatching verifier subagents.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
- support/subagents-and-leases.md
