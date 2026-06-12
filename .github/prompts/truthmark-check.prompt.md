---
agent: 'agent'
description: 'Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.'
---

---
name: truthmark-check
description: Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: 2.1.0
---

## Optional local CLI validation

Use this checked-in workflow text as the contract. Inspect the checkout directly and open progressive-disclosure support files only when needed. Use the local Truthmark CLI only for focused validation after relevant work has been performed.

When the local Truthmark CLI is available, use only focused validation commands that match work already performed:

- run `truthmark check --json` and `truthmark index --json` when repository-truth health or routing/index health needs verification
- treat CLI output as derived validation evidence; it never replaces direct checkout inspection, route files, truth docs, or workflow write boundaries

If the local Truthmark CLI is unavailable or too old, use the checked-in workflow files as the contract and continue with direct checkout evidence. If the CLI is available but irrelevant to the current step, do not run it preemptively. Report skipped optional CLI validation only when a check, index, or helper validator was relevant and not run. For read-only workflows, keep inspection focused on the requested report; do not broaden into support-file or repo-wide scans just because an optional CLI command is unavailable.

# Truthmark Check

Use this skill to audit repository truth health.

Invocations: OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Gemini CLI /truthmark:check.

Truth Check is agent-led:

- inspect .truthmark/config.yml and configured route files only when they exist; then inspect canonical docs and relevant implementation directly
- Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.
Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
- inspect the configured root route index at docs/truthmark/routes/areas.md and relevant child route files under docs/truthmark/routes/areas/ when they exist
- check that current docs describe current code rather than historical plans
- check that route files map code surfaces to canonical truth docs when route files exist
- check for broad, catch-all, index-like, or mixed-owner truth docs and report them as topology issues requiring Truth Structure
- check that canonical behavior docs keep active Product Decisions and Rationale sections
- optionally run truthmark check when local tooling is available
- must not require the truthmark binary; direct inspection is always valid
- report issues and suggested fixes without silently rewriting unrelated files
- if follow-up docs edits are needed for mixed-owner docs, run or recommend Truth Structure before editing
Evidence Gate:
- support each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests
- canonical docs are context, not sole proof when implementation conflicts
- remove unsupported findings or mark open questions; validate changed claims if you edit docs

Copilot custom-agent mode:
- use automatically when this workflow runs in Copilot and the parent agent chooses bounded custom-agent fan-out
- dispatch read-only project custom agents only: @truth-route-auditor, @truth-claim-verifier, @truth-doc-reviewer
- custom agents inspect checkout evidence directly, return structured findings, and must not edit files
- parent supplies bounded evidence shards; custom agents must not preload host instruction files or repo-wide policy docs unless assigned as evidence
- Parent agent owns the final Truth Check report

Truthmark hierarchy hints:
- Config, when present: .truthmark/config.yml
- Root route index, when present: docs/truthmark/routes/areas.md
- Area route files, when present: docs/truthmark/routes/areas/**/*.md
- Truth docs, when present: docs/truthmark/truth/**/*.md
Decision truth lives in the canonical doc it governs; date active decisions inline when added or changed.
Do not create separate active-decision ADR/planning logs; replace the active decision and let Git history carry the audit trail.
Update Product Decisions and Rationale when a decision changes behavior.

Report completion in this shape:

```md
Truth Check: completed

Files reviewed:
- docs/truthmark/routes/areas.md

Issues found:
- none

Fixes suggested:
- none

Evidence checked:
- Finding: The root route index is present and maps repository truth owners.
  Evidence: docs/truthmark/routes/areas.md:1
  Suggested fix: none
  Confidence: high

Validation:
- truthmark check
```
