---
agent: 'agent'
description: 'Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.'
---

---
name: truthmark-document
description: Use when the user asks to document existing implemented behavior, or Sync, Check, or Structure finds implemented behavior missing canonical truth. Not for functional-code changes, doc-first implementation, or topology repair that needs Structure.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 1.4.0
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
Truth-doc ownership gate:
- before editing or relying on the implemented behavior and candidate truth docs, verify each target/source truth doc is a bounded owner for the behavior
- if a target/source doc mixes independent owners, spans unrelated behaviors, acts as an index, or needs cross-owner edits, do not patch or in-place repair it
- if the target doc is broad, mixed-owner, index-like, or the documented behavior spans independent owners, run Truth Structure first when safe and in scope; otherwise block and recommend Truth Structure
- report Ownership reviewed, Structure required, Truth docs split, Truth docs restructured, or Blocked reason as applicable
Product Decisions/Rationale preservation gate:
- before any truth-doc split, restructure, or shape repair, inventory existing Product Decisions and Rationale sections in every source or touched truth doc
- preserve each current decision and rationale in the bounded owner doc it governs; when splitting, move it to the new owner doc rather than deleting it or leaving it in an index
- remove or narrow a decision or rationale only when checkout evidence shows it is stale or unsupported, and report the exact claim, evidence, and result
- if ownership of a decision or rationale is unclear, block with manual-review files instead of deleting it or guessing
- after the edit, verify every touched truth doc still has Product Decisions and Rationale sections and every pre-existing entry is preserved, moved, narrowed, removed with evidence, or blocked
Evidence Gate:
- route-first: map the documented behavior to bounded route owners and primary canonical docs
- review new or changed behavior-bearing claims only in touched docs, route ownership, Product Decisions, and Rationale
- support claims with primary checkout evidence: implementation, config, routing, generated templates, schemas, or contract definitions
- tests/examples/canonical docs corroborate; they are not sole proof when implementation conflicts
- remove, narrow, or block unsupported claims
- if no truth doc changed, report why current truth was already sufficient or why documentation was blocked
Copilot custom-agent mode:
- use automatically when this workflow runs in Copilot and the parent agent chooses bounded custom-agent fan-out
- dispatch read-only project custom agents only: @truth-route-auditor, @truth-claim-verifier
- custom agents inspect checkout evidence directly, return structured findings, and must not edit files
- Parent agent owns all Truth Document writes
Repository intelligence artifacts are optional derived context: RepoIndex, RouteMap, ImpactSet, and ContextPack may guide routing, context selection, and verification planning when available.
They do not override checkout evidence, canonical truth docs, route files, or workflow write boundaries.
If unavailable, inspect .truthmark/config.yml, route files, source files, truth docs, and tests directly, then report that repository-intelligence artifacts were not generated.
When creating or updating a truth doc, inspect the routed truth kind and use the matching `docs/templates/<kind>-doc.md` template.
Supported kinds: behavior, contract, architecture, workflow, operations, and test-behavior.
Align existing docs to that template while preserving accurate authored content.
If the template is missing, use Scope, Product Decisions, Rationale, and the kind-specific current-truth section.
Teams may edit the template files under docs/templates/ to define their local truth-doc standards.
Truth-doc shape repair gate:
- Truth Document may restructure only truth docs for the implemented behavior being documented.
- repair shape in place only after the ownership gate confirms the doc is the right bounded owner
- use Truth Structure for ownership splits; do not treat broad or mixed-owner docs as in-place repair work
- repair shape when a narrow edit would make truth worse: missing template sections, stale evidence conflicts, cross-section updates within one owner, or wrong frontmatter/source/headings
- preserve supported claims; remove, narrow, or block unsupported or stale claims
- report docs restructured and why a narrow edit was not sufficient
Maintain architecture docs only for structure-level changes: system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.
Keep ordinary behavior, endpoints, UI copy, validation rules, and bug fixes in behavior or contract docs unless they change those boundaries.
Truthmark hierarchy:
- Config: .truthmark/config.yml
- Root route index: docs/truthmark/areas.md
- Area route files: docs/truthmark/areas/**/*.md
- Truth docs: docs/truth/**/*.md
Decision truth lives in the canonical doc it governs; date active decisions inline when added or changed.
Do not create separate active-decision ADR/planning logs; replace the active decision and let Git history carry the audit trail.
Update Product Decisions and Rationale when a decision changes behavior.

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
