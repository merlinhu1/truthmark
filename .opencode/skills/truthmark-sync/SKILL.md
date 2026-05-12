---
name: truthmark-sync
description: Use automatically before finishing when functional code changed since the last successful Truth Sync, and when the user explicitly invokes /truthmark-sync, $truthmark-sync, or /truthmark:sync. Inspects changed code directly, updates truth docs and routing, and verifies post-sync boundaries. Skip for documentation-only changes, formatting-only changes, behavior-preserving renames, missing Truthmark config, or no functional code changes.
argument-hint: Optional changed-code area, truth-doc area, or sync focus
user-invocable: true
truthmark-version: 1.2.3
---

Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.
Invocations: OpenCode /skill truthmark-sync; Codex /truthmark-sync or $truthmark-sync; Claude Code /truthmark-sync; GitHub Copilot /truthmark-sync; Gemini CLI /truthmark:sync.
Explicit invocation runs immediately. Later functional-code changes reopen the finish-time requirement, and an earlier explicit run satisfies the finish gate only if no later functional-code changes occur.
Skip when changes are documentation-only, formatting-only, clearly behavior-preserving renames with no truth impact, when no Truthmark config exists yet, or when there are no functional code changes.
Parent workflow:
1. Inspect git status, staged changes, unstaged changes, and untracked files directly.
2. Read .truthmark/config.yml, the configured root route index at docs/truthmark/areas.md, relevant child route files under docs/truthmark/areas/, and relevant canonical docs.
3. Identify functional-code changes and the nearest truth docs or routing repairs.
4. Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.
Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
5. Code verification is parent-owned: follow repository instructions and task context, and report what ran or why it did not run.
6. Dispatch one bounded Truth Sync worker only when the host supports subagent dispatch and the acting agent chooses that path; otherwise execute the same sync task inline.
Topology quality gate:
- before updating truth docs, verify the changed code resolves to a specific behavior-owned area and bounded truth owner
- if routing is missing, stale, broad, overloaded, catch-all route only, or cannot map changed code to a bounded truth owner, do not create another generic feature doc
- run Truth Structure before syncing when topology repair is safe and in scope
- block and recommend Truth Structure when topology repair is unsafe, ambiguous, or outside the current task boundary
- report the route files and changed code paths that require structure repair
- README.md files are indexes, not Truth Sync targets
- must not append behavior details to a feature README
- create or update a bounded leaf truth doc when behavior changes do not fit an existing leaf doc
When creating or updating a feature doc, read docs/templates/feature-doc.md and follow its frontmatter, heading order, and section intent.
When updating an existing feature doc, align existing feature docs to the template standard while preserving authored content that remains accurate.
If docs/templates/feature-doc.md is missing, use the built-in minimal feature-doc structure with Current Behavior, Product Decisions, and Rationale sections.
Teams may edit docs/templates/feature-doc.md to define their local feature-doc standard.
Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.
Do not put ordinary feature behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.
Keep architecture docs focused on structure and ownership; keep current product behavior in feature or contract docs.
Optional validation tooling:
- you may run truthmark check when local tooling is available
- do not require the truthmark binary; direct checkout inspection is the canonical path
- optional validation must not replace agent judgment about docs and routing
- update Product Decisions and Rationale when a behavior change comes from a decision change
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
### Truth Sync Worker
The parent provides the task focus and any repository context already gathered.
Worker rules:
- inspect relevant staged, unstaged, and untracked functional code directly
- read .truthmark/config.yml, docs/truthmark/areas.md, and canonical truth docs directly
- Code verification is parent-owned; report what was run or why it was not run
- may write truth docs and docs/truthmark/areas.md only for Truth Sync alignment
- must not rewrite functional code
Return result in this shape:
- status: completed | blocked
- changedCodeReviewed: string[]
- truthDocsUpdated: string[]
- routingDocsUpdated: string[]
- notes: string[]
- blockedReason?: string
- manualReviewFiles?: string[]
Parent post-sync verification:
- verify only truth docs and docs/truthmark/areas.md changed during sync
- block on any unrelated diff caused by the sync step
- block if functional code changed during sync
- verify the worker report matches the required headings and sections
- verify the updated docs correspond to the reviewed changed-code surface
- blocked outcomes must preserve the working tree as-is: no rollback, no post-block cleanup edits, and manual-review reporting of any remaining files
Report completion in this shape:
```md
Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/features/repository/overview.md

Notes:
- Updated session timeout behavior.
```
Blocked report example:
```md
Truth Sync: blocked

Reason:
- routing repair is not allowed

Files requiring manual review:
- docs/truthmark/areas.md

Next action:
- update routing metadata and rerun Truth Sync
```
