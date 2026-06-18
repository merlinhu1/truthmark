# Truthmark Preview Report Template

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

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
