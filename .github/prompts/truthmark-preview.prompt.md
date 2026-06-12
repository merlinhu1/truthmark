---
agent: 'agent'
description: 'Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.'
---

---
name: truthmark-preview
description: Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: 2.1.0
---

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

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

Truth Preview is read-only. Its report is intended, not authorized.

Purpose:
- preview the likely Truthmark workflow, route owner, target files, expected write classes, suggested subagent use, and blocking ambiguity before edits happen
- hand off to the selected workflow after user approval
- keep the selector thin so agents can avoid loading or acting through heavier workflows prematurely

Read:
- .truthmark/config.yml, only when present
- docs/truthmark/routes/areas.md, only when present
- relevant child route files under docs/truthmark/routes/areas/, only when present
- relevant truth docs and implementation files needed to preview ownership
- Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.
Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.

Do not:
- must not edit files
- must not create truth docs
- must not update routing
- must not run Truth Sync automatically
- must not replace Truth Check
- must not claim final correctness
- must not issue write leases
- must not mutate code

Suggested subagent use:
- optional read-only verifier: truth_route_auditor
- write workers: none
- leases needed: none

Truthmark hierarchy hints:
- Config, when present: .truthmark/config.yml
- Root route index, when present: docs/truthmark/routes/areas.md
- Area route files, when present: docs/truthmark/routes/areas/**/*.md
- Truth docs, when present: docs/truthmark/truth/**/*.md

Report completion in this shape:
```md
Truth Preview: completed

Requested outcome:
- preview likely Truthmark workflow routing before edits

Likely workflow:
- truthmark-document

Why this workflow:
- positive trigger: document existing implemented behavior
- negative triggers considered: functional-code change, doc-first implementation, topology repair, truth audit
- forbidden adjacency considered: must not edit functional code

Likely route owner:
- route file: docs/truthmark/routes/areas.md
- truth doc: docs/truthmark/truth/example.md
- confidence: medium

Expected write classes:
- truth docs

Expected target files:
- docs/truthmark/truth/example.md

Suggested subagent use:
- read-only verifiers: truth_route_auditor
- write workers: none in Preview
- leases needed: none in Preview

Blocking ambiguity:
- none identified in preview

Handoff:
- Run the selected Truthmark workflow after user approval.
```
