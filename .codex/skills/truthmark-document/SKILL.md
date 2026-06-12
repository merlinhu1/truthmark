---
name: truthmark-document
description: Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.

Invocations: OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Gemini CLI /truthmark:document.

## Live workflow preflight

When the local Truthmark CLI is available, run the canonical one-call live workflow preflight before acting:

```bash
truthmark workflow instructions --workflow truthmark-document --json
```

If a caller supplies a comparison ref, preserve it with `--base <ref>` on this command; do not invent a default branch. Use `truthmark workflow status` only for status-only/debug inspection; `workflow instructions` already returns both `data.instructions` and the source `data.workflowState` in one JSON envelope.

Before writes, parse the JSON command envelope:

- stop when `data.workflowState.applicability.state` is `blocked`, `not_applicable`, or `ambiguous`; current-scope continuation is read-only reporting of `nextSteps` or diagnostics
- obey `data.workflowState.actionContext.allowedWritePaths`, `forbiddenWritePaths`, and stop conditions
- run structured helpers from `data.instructions.helperValidationCommands` when present and report each helper as passed, failed, or skipped with reason
- shape the final report from `data.instructions.reportTemplate.sections` or `finalReportShape`; use checked-in report templates only when live instructions are unavailable
- continue direct checkout inspection for code, docs, routes, tests, and evidence; CLI output is guardrails, not proof by itself

If the local Truthmark CLI is unavailable or too old, use the checked-in workflow files as the contract. Follow the route-first procedure, read only the config, route files, truth docs, and source evidence needed for the current changed surface, and stop on missing or ambiguous ownership instead of broadening reads or writes. Include `workflow instructions: skipped` and the skip reason in the final report.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect existing canonical docs, implementation code, and tests directly.
- Document current implemented behavior; do not invent future behavior.
- May write canonical truth docs and truth routing files only; must not write functional code.
- Read support/procedure.md before editing truth docs.
- Read support/subagents-and-leases.md only when dispatching or accepting worker output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core quality gates
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
- helper-manifest.yml — read only when invoking helper validators or validating helper registration
- support/helper-policy.md — read only when invoking helper validators or reporting helper status
