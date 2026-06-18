---
agent: 'agent'
description: 'Use when the user explicitly asks to preview likely workflow routing, target files, writes, or subagent use before edits. Not for validation, automatic gates, final correctness, or replacing Truth Check.'
---

This prompt is the GitHub Copilot entrypoint for Truthmark Preview.

Truth Preview is read-only and explicit. Do not invoke another Truthmark command from here.

Use this skill only when the user explicitly asks to preview Truthmark routing or workflow choice before edits.

Invocations: OpenCode /skill truthmark-preview; Codex /truthmark-preview or $truthmark-preview; Claude Code /truthmark-preview; GitHub Copilot /truthmark-preview; Gemini CLI /truthmark:preview.

Truth Preview is read-only. Its report is intended, not authorized.

Purpose:
- preview the likely Truthmark workflow, route owner, target files, expected write classes, suggested subagent use, and manual handoff questions before edits happen
- report likely product lane impact, engineering lane impact, target docs, and ambiguity before edits
- hand off to the selected workflow after user approval
- keep the selector thin so agents can avoid loading or acting through heavier workflows prematurely

Read:
- .truthmark/config.yml, only when present
- docs/truthmark/routes/areas.md, first, only when present
- relevant child route files under docs/truthmark/routes/areas/ for the selected scope or changed paths, only when present
- relevant truth docs and implementation files needed to preview ownership
- Evidence authority:
  - Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.
  - Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
- Lane classification:
  - classify the request or changed surface as product-lane, engineering-lane, both-lane, or ambiguous for reporting only
  - product-lane ownership belongs under docs/truthmark/product and describes product promises, boundaries, rationale, decisions, and success criteria
  - engineering-lane ownership belongs under docs/truthmark/engineering and describes source-backed current realization, contracts, architecture, workflows, operations, or tests
  - both-lane ownership uses separate product and engineering docs cross-linked in route YAML with realized_by and realizes, not in doc frontmatter
  - ambiguous lane ownership should be reported for manual handoff or routed to Truth Structure
  - Do not make product docs a summary of engineering docs. Do not make engineering docs a detailed version of product docs. Product truth says what must be true and why. Engineering truth says how the repository currently realizes it.

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
- Product truth docs, when present: docs/truthmark/product/**/*.md
- Engineering truth docs, when present: docs/truthmark/engineering/**/*.md
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
- likely lane impact: engineering-lane
- product target docs: none identified
- engineering target docs: docs/truthmark/engineering/behaviors/example.md
- confidence: medium

Expected write classes:
- truth docs

Expected target files:
- docs/truthmark/engineering/behaviors/example.md

Suggested subagent use:
- read-only verifiers: truth_route_auditor
- write workers: none in Preview
- leases needed: none in Preview

Manual handoff questions:
- none identified in preview

Handoff:
- Run the selected Truthmark workflow after user approval.
```
