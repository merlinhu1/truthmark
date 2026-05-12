---
name: truthmark-document
description: Use when the user explicitly asks to document existing implemented behavior, or when Truth Sync, Truth Check, or Truth Structure reports implemented behavior that lacks canonical truth docs. Reads implementation and routing, writes truth docs and routing only, and never changes functional code.
argument-hint: Optional implemented behavior, API endpoint, route, controller, package, or truth-doc area to document
user-invocable: true
truthmark-version: 1.2.3
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
- keep feature docs behavior-oriented, not endpoint-oriented, unless the endpoint itself is the behavior boundary
- keep API endpoint details in the nearest contract truth doc when such a doc owns the API contract
- preserve unrelated authored content
When creating or updating a feature doc, read docs/templates/feature-doc.md and follow its frontmatter, heading order, and section intent.
When updating an existing feature doc, align existing feature docs to the template standard while preserving authored content that remains accurate.
If docs/templates/feature-doc.md is missing, use the built-in minimal feature-doc structure with Current Behavior, Product Decisions, and Rationale sections.
Teams may edit docs/templates/feature-doc.md to define their local feature-doc standard.
Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.
Do not put ordinary feature behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.
Keep architecture docs focused on structure and ownership; keep current product behavior in feature or contract docs.
Truthmark hierarchy:
- Config: .truthmark/config.yml
- Root route index: docs/truthmark/areas.md
- Area route files: docs/truthmark/areas/**/*.md
- Feature docs: docs/features/**/*.md
Decision truth lives in the canonical doc it governs.
Date active decisions inline when added or changed, for example `Decision (2026-05-09): ...`.
Do not create separate timestamped ADR logs or planning tickets for active decisions.
Replace old active decisions instead of appending separate timestamped decision logs; Git history is the audit trail.
Update Product Decisions and Rationale when a behavior change comes from a decision change.

Report completion in this shape:
```md
Truth Document: completed

Implementation reviewed:
- src/api/orders/**

Truth docs created:
- docs/features/orders/order-submission.md

Truth docs updated:
- docs/features/contracts.md

Routing updated:
- docs/truthmark/areas/orders.md

Notes:
- Documented existing order submission behavior from route handlers and tests.
```
