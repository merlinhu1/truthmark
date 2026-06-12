---
name: truthmark-preview
description: Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Preview

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Use as a Gemini CLI Agent Skill; commands remain available under `/truthmark:*` for command-first invocation.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

## Optional local CLI validation

This workflow is driven by committed generated files, direct checkout inspection, and progressive-disclosure support files. Do not run a live workflow preflight or load large workflow JSON before acting. In particular, do not run `truthmark workflow instructions --json` or `truthmark workflow status --json` as a workflow prerequisite.

When the local Truthmark CLI is available, use only focused validation commands that match work already performed:

- run `truthmark check --json` and `truthmark index --json` when repository-truth health or routing/index health needs verification
- treat CLI output as derived validation evidence; it never replaces direct checkout inspection, route files, truth docs, or workflow write boundaries

If the local Truthmark CLI is unavailable or too old, use the checked-in workflow files as the contract and continue with direct checkout evidence. If the CLI is available but irrelevant to the current step, do not run it preemptively. Report skipped optional CLI validation only when a check, index, or helper validator was relevant and not run. For read-only workflows, keep inspection focused on the requested report; do not broaden into support-file or repo-wide scans just because an optional CLI command is unavailable.

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
