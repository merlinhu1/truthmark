---
name: truthmark-document
description: Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.

Use as a Gemini CLI Agent Skill; commands remain available under `/truthmark:*` for command-first invocation.

Invocations: OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Gemini CLI /truthmark:document.

## Optional local CLI validation

This workflow is driven by committed generated files, direct checkout inspection, and progressive-disclosure support files. Do not run a live workflow preflight or load large workflow JSON before acting. In particular, do not run `truthmark workflow instructions --json` or `truthmark workflow status --json` as a workflow prerequisite.

When the local Truthmark CLI is available, use only focused validation commands that match work already performed:

- run `truthmark check --json` and `truthmark index --json` when repository-truth health or routing/index health needs verification
- run optional helper validators from `helper-manifest.yml` only after producing their declared inputs
- treat CLI output as derived validation evidence; it never replaces direct checkout inspection, route files, truth docs, or workflow write boundaries

If the local Truthmark CLI is unavailable or too old, use the checked-in workflow files as the contract and continue with direct checkout evidence. If the CLI is available but irrelevant to the current step, do not run it preemptively. Report skipped optional CLI validation only when a check, index, or helper validator was relevant and not run. Follow the route-first procedure: read only the config, route files, truth docs, and source evidence needed for the current changed surface, and stop on missing or ambiguous ownership instead of broadening reads or writes.

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
