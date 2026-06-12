---
name: truthmark-structure
description: Use when routing or truth ownership is missing, stale, broad, overloaded, catch-all, unrouteable, mixed-owner, needs split/repair, or needs new area setup. Not for documenting implemented behavior, syncing a code diff, or realizing docs into code.
argument-hint: Optional area, directory, or routing concern
user-invocable: true
truthmark-version: 2.1.0
---

# Truthmark Structure

Use this skill to design or repair Truthmark area structure.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.

Invocations: OpenCode /skill truthmark-structure; Codex /truthmark-structure or $truthmark-structure; Claude Code /truthmark-structure; GitHub Copilot /truthmark-structure; Gemini CLI /truthmark:structure.

## Optional local CLI validation

This workflow is driven by committed generated files, direct checkout inspection, and progressive-disclosure support files. Do not run a live workflow preflight or load large workflow JSON before acting. In particular, do not run `truthmark workflow instructions --json` or `truthmark workflow status --json` as a workflow prerequisite.

When the local Truthmark CLI is available, use only focused validation commands that match work already performed:

- run `truthmark check --json` and `truthmark index --json` when repository-truth health or routing/index health needs verification
- treat CLI output as derived validation evidence; it never replaces direct checkout inspection, route files, truth docs, or workflow write boundaries

If the local Truthmark CLI is unavailable or too old, use the checked-in workflow files as the contract and continue with direct checkout evidence. If the CLI is available but irrelevant to the current step, do not run it preemptively. Report skipped optional CLI validation only when a check, index, or helper validator was relevant and not run. Follow the route-first procedure: read only the config, route files, truth docs, and source evidence needed for the current changed surface, and stop on missing or ambiguous ownership instead of broadening reads or writes.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect current docs and relevant code directly.
- Define areas by product or behavior ownership, not by mechanical directory mirroring.
- Do not edit functional code.
- Read support/procedure.md before writing route or starter truth-doc changes.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core quality gates
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
