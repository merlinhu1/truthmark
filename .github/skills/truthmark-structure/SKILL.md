---
name: truthmark-structure
description: Use when routing or truth ownership is missing, stale, broad, overloaded, catch-all, unrouteable, mixed-owner, needs split/repair, or needs new area setup. Not for documenting implemented behavior, syncing a code diff, or realizing docs into code.
argument-hint: Optional area, directory, or routing concern
user-invocable: true
---

# Truthmark Structure

Use this skill to design or repair Truthmark area structure.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Inspect .truthmark/config.yml and configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/) only when they exist; then inspect current docs and relevant code directly.
- Define areas by product or behavior ownership, not by mechanical directory mirroring.
- Do not edit functional code.

Progressive disclosure:
- support/procedure.md — read before edits or detailed auditing; contains core review questions
- support/report-template.md — read before the final report
- support/subagents-and-leases.md — read only when using subagents, leases, or accepting worker output
