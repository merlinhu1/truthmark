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

## Optional local CLI validation

Use this checked-in workflow text as the contract. Inspect the checkout directly and open progressive-disclosure support files only when needed. Use the local Truthmark CLI only for focused validation after relevant work has been performed.

When the local Truthmark CLI is available, use only focused validation commands that match work already performed:

- run `truthmark check --json` and `truthmark index --json` when repository-truth health or routing/index health needs verification
- treat CLI output as derived validation evidence; it never replaces direct checkout inspection, route files, truth docs, or workflow write boundaries

If the local Truthmark CLI is unavailable or too old, use the checked-in workflow files as the contract and continue with direct checkout evidence. If the CLI is available but irrelevant to the current step, do not run it preemptively. Report skipped optional CLI validation only when a check, index, or helper validator was relevant and not run. Follow the route-first procedure: read only the config, route files, truth docs, and source evidence needed for the current changed surface, and stop on missing or ambiguous ownership instead of broadening reads or writes.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Read the source truth docs, inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist, then inspect tests and relevant functional code directly.
- Truth docs lead; code follows.
- may write functional code only; must not edit truth docs or truth routing while realizing those docs.
- Read support/procedure.md before changing code.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core quality gates
- support/report-template.md — read before the final report
