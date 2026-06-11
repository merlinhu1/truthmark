---
name: truthmark-realize
description: Use when the user explicitly asks to realize Truthmark truth docs into code, including /truthmark-realize, $truthmark-realize, or /truthmark:realize. Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.
argument-hint: Optional truth doc path, area, or desired code behavior to realize
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Realize

Use this skill only when the user explicitly asks to realize truth docs into code.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.

Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.

## Live workflow preflight

When the local Truthmark CLI is available, run the live workflow contract before acting:

```bash
truthmark workflow status --workflow truthmark-realize --json
truthmark workflow instructions --workflow truthmark-realize --json
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
- Read the source truth docs, inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist, then inspect tests and relevant functional code directly.
- Truth docs lead; code follows.
- may write functional code only; must not edit truth docs or truth routing while realizing those docs.
- Read support/procedure.md before changing code.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
