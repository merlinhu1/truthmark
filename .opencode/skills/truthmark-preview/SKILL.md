---
name: truthmark-preview
description: Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Preview

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

## Live workflow preflight

When the local Truthmark CLI is available, run the canonical one-call live workflow preflight before acting:

```bash
truthmark workflow instructions --workflow truthmark-preview --json
```

If a caller supplies a comparison ref, preserve it with `--base <ref>` on this command; do not invent a default branch. Use `truthmark workflow status` only for status-only/debug inspection; `workflow instructions` already returns both `data.instructions` and the source `data.workflowState` in one JSON envelope.

Before writes, parse the JSON command envelope:

- stop when `data.workflowState.applicability.state` is `blocked`, `not_applicable`, or `ambiguous`; current-scope continuation is read-only reporting of `nextSteps` or diagnostics
- obey `data.workflowState.actionContext.allowedWritePaths`, `forbiddenWritePaths`, and stop conditions
- run structured helpers from `data.instructions.helperValidationCommands` when present and report each helper as passed, failed, or skipped with reason
- shape the final report from `data.instructions.reportTemplate.sections` or `finalReportShape`; use checked-in report templates only when live instructions are unavailable
- continue direct checkout inspection for code, docs, routes, tests, and evidence; CLI output is guardrails, not proof by itself

If the local Truthmark CLI is unavailable or too old, continue only with the committed generated entrypoint and focused direct checkout inspection needed for the requested read-only report; do not broaden into support-file or repo-wide scans solely to replace the CLI. Include `workflow instructions: skipped` and the skip reason in the final report.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect only the truth docs or implementation files needed to preview ownership.
- Truth Preview is read-only; this report is intended, not authorized.
- must not edit files and must not issue write leases; do not run Truth Sync automatically, replace Truth Check, claim final correctness, or mutate code.
- Use optional read-only route-auditor evidence only when it reduces context or clarifies ownership.
- Hand off to the selected workflow after user approval.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core quality gates
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
