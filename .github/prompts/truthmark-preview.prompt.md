---
agent: 'agent'
description: 'Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.'
---

---
name: truthmark-preview
description: Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.
argument-hint: Optional requested outcome, code area, doc path, or routing question
user-invocable: true
truthmark-version: 1.4.0
---

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

Truth Preview is read-only. Its report is intended, not authorized.

Purpose:
- preview the likely Truthmark workflow, route owner, target files, expected write classes, suggested subagent use, and blocking ambiguity before edits happen
- hand off to the selected workflow after user approval
- keep the selector thin so agents can avoid loading or acting through heavier workflows prematurely

Read:
- .truthmark/config.yml
- docs/truthmark/areas.md
- relevant child route files under docs/truthmark/areas/
- relevant truth docs and implementation files needed to preview ownership
- Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.
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

Truthmark hierarchy:
- Config: .truthmark/config.yml
- Root route index: docs/truthmark/areas.md
- Area route files: docs/truthmark/areas/**/*.md
- Truth docs: docs/truth/**/*.md

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
- route file: docs/truthmark/areas.md
- truth doc: docs/truth/example.md
- confidence: medium

Expected write classes:
- truth docs

Expected target files:
- docs/truth/example.md

Suggested subagent use:
- read-only verifiers: truth_route_auditor
- write workers: none in Preview
- leases needed: none in Preview

Blocking ambiguity:
- none identified in preview

Handoff:
- Run the selected Truthmark workflow after user approval.
```
