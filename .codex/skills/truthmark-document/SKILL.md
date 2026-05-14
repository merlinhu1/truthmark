---
name: truthmark-document
description: Use when the user explicitly asks to document existing implemented behavior, or when Truth Sync, Truth Check, or Truth Structure reports implemented behavior that lacks canonical truth docs. Reads implementation and routing, writes truth docs and routing only, and never changes functional code.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 1.2.4
---

# Truthmark Document

Use this skill to document existing implemented behavior when no functional-code changes are required for the task.
Invocations: OpenCode /skill truthmark-document; Codex /truthmark-document or $truthmark-document; Claude Code /truthmark-document; GitHub Copilot /truthmark-document; Gemini CLI /truthmark:document.

Truth Document is manual and implementation-first:

- run only when the user explicitly asks to generate or update truth docs for existing behavior, or when Truth Sync, Truth Check, or Truth Structure reports implemented behavior that lacks canonical truth docs
- inspect .truthmark/config.yml, docs/truthmark/areas.md, relevant child route files under docs/truthmark/areas/, existing canonical docs, implementation code, and tests directly
- Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.
Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
- document current implemented behavior; do not invent future behavior or planned endpoints
- may write canonical truth docs and docs/truthmark/areas.md or relevant child route files only
- must not write functional code
- when routing is missing, stale, broad, overloaded, catch-all, or cannot map the behavior to a bounded truth owner, run Truth Structure first when routing repair is safe and in scope
- block and recommend Truth Structure when routing repair is unsafe, ambiguous, or outside the task boundary
- keep feature README.md files as indexes rather than truth-document targets
- create or update bounded leaf truth docs when behavior does not fit an existing leaf doc
- keep behavior truth docs behavior-oriented, not endpoint-oriented, unless the endpoint itself is the behavior boundary
- keep API endpoint details in the nearest contract truth doc when such a doc owns the API contract
- preserve unrelated authored content
Evidence Gate:
- before finishing, perform a route-first impacted-doc check
- map the documented behavior to bounded route owners and primary canonical docs
- use source_of_truth entries, nearby tests, architecture docs, contract docs, and generated-surface templates as secondary impacted-doc signals when they govern the behavior
- review each new or changed behavior-bearing claim in touched truth docs, route ownership, Product Decisions, and Rationale
- support each claim with primary evidence from implementation code, config files, routing files, generated surface templates, schemas, or contract definitions in the active checkout
- use tests, examples, snapshots, and existing canonical docs as corroborating evidence, not as the sole source when implementation says otherwise
- remove, narrow, or block unsupported claims instead of leaving unsupported truth behind
- if no truth doc changed, report why current truth was already sufficient or why documentation was blocked
When creating or updating a truth doc, inspect the routed truth kind and use the matching template under docs/templates/.
Use docs/templates/behavior-doc.md for behavior truth docs, docs/templates/contract-doc.md for contract docs, docs/templates/architecture-doc.md for architecture docs, docs/templates/workflow-doc.md for workflow docs, docs/templates/operations-doc.md for operations docs, and docs/templates/test-behavior-doc.md for test-behavior docs.
When updating an existing truth doc, align it to the selected template standard while preserving authored content that remains accurate.
If the selected template is missing, use a minimal structure with Scope, Product Decisions, Rationale, and the kind-specific current-truth section.
Teams may edit the template files under docs/templates/ to define their local truth-doc standards.
Truth-doc restructure gate:
- Truth Document may restructure only truth docs for the implemented behavior being documented.
- before editing a truth doc, check whether the target doc is still a good fit for a narrow update
- restructure only if a narrow append or section replacement would make truth worse
- restructure when required template sections are missing, one doc mixes multiple owners or behaviors, stale sections conflict with implementation evidence, the update spans unrelated sections, an index-like summary is being used as a bounded behavior doc, or frontmatter/source evidence/headings no longer match the routed truth kind or template
- prefer the smallest restructure that restores a maintainable truth shape
- preserve supported existing claims; remove, narrow, or block unsupported or stale claims instead of carrying them forward silently
- prefer bounded leaf docs and routing updates for large ownership splits
- report which truth docs were restructured and why a narrow edit was not sufficient
Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.
Do not put ordinary product behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.
Keep architecture docs focused on structure and ownership; keep current product behavior in behavior or contract docs.
Truthmark hierarchy:
- Config: .truthmark/config.yml
- Root route index: docs/truthmark/areas.md
- Area route files: docs/truthmark/areas/**/*.md
- Truth docs: docs/truth/**/*.md
Decision truth lives in the canonical doc it governs.
Date active decisions inline when added or changed, for example `Decision (2026-05-09): ...`.
Do not create separate timestamped ADR logs or planning tickets for active decisions.
Replace old active decisions instead of appending separate timestamped decision logs; Git history is the audit trail.
Update Product Decisions and Rationale when a behavior change comes from a decision change.

Report completion in this shape:
```md
Truth Document: completed

Implementation reviewed:
- src/routing/area-resolver.ts

Truth docs created:
- docs/truth/contracts.md

Truth docs updated:
- docs/truth/check-diagnostics.md

Truth docs restructured:
- docs/truth/check-diagnostics.md

Routing updated:
- docs/truthmark/areas.md

Evidence checked:
- Claim: Route resolution behavior is documented in the contracts truth doc.
  Evidence: src/routing/area-resolver.ts:14 / docs/truthmark/areas.md:9
  Result: supported

Notes:
- Documented routing and behavior from route handlers and tests.
```
