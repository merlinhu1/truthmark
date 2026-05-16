---
name: truthmark-sync
description: Use automatically at finish-time after functional code changes, or explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or manual topology design.
argument-hint: Optional changed-code area, truth-doc area, or sync focus
user-invocable: true
truthmark-version: 1.4.0
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
OpenCode subagent mode:
- use automatically when this workflow runs in OpenCode and the parent agent chooses bounded subagent fan-out
- dispatch read-only project subagents only: @truth-route-auditor, @truth-claim-verifier
- workers inspect checkout evidence directly, return structured findings, and must not edit files
- Parent agent owns all Truth Sync writes
Topology quality gate:
- before updating truth docs, verify the changed code resolves to a specific behavior-owned area and bounded truth owner
- if routing is missing, stale, broad, overloaded, catch-all route only, or cannot map changed code to a bounded truth owner, do not create another generic truth doc
- run Truth Structure before syncing when topology repair is safe and in scope
- block and recommend Truth Structure when topology repair is unsafe, ambiguous, or outside the current task boundary
- report the route files and changed code paths that require structure repair
- README.md files are indexes, not Truth Sync targets
- must not append behavior details to a README.md index
- create or update a bounded leaf truth doc when behavior changes do not fit an existing leaf doc
Truth-doc ownership gate:
- before editing or relying on changed functional files and impacted truth docs, verify each target/source truth doc is a bounded owner for the behavior
- if a target/source doc mixes independent owners, spans unrelated behaviors, acts as an index, or needs cross-owner edits, do not patch or in-place repair it
- if an impacted doc is broad, mixed-owner, index-like, or the update spans independent behavior owners, run Truth Structure before syncing when safe and in scope; otherwise block and recommend Truth Structure
- report Ownership reviewed, Structure required, Truth docs split, Truth docs restructured, or Blocked reason as applicable
Product Decisions/Rationale preservation gate:
- before any truth-doc split, restructure, or shape repair, inventory existing Product Decisions and Rationale sections in every source or touched truth doc
- preserve each current decision and rationale in the bounded owner doc it governs; when splitting, move it to the new owner doc rather than deleting it or leaving it in an index
- remove or narrow a decision or rationale only when checkout evidence shows it is stale or unsupported, and report the exact claim, evidence, and result
- if ownership of a decision or rationale is unclear, block with manual-review files instead of deleting it or guessing
- after the edit, verify every touched truth doc still has Product Decisions and Rationale sections and every pre-existing entry is preserved, moved, narrowed, removed with evidence, or blocked
When creating or updating a truth doc, inspect the routed truth kind and use the matching `docs/templates/<kind>-doc.md` template.
Supported kinds: behavior, contract, architecture, workflow, operations, and test-behavior.
Align existing docs to that template while preserving accurate authored content.
If the template is missing, use Scope, Product Decisions, Rationale, and the kind-specific current-truth section.
Teams may edit the template files under docs/templates/ to define their local truth-doc standards.
Truth-doc shape repair gate:
- Truth Sync may restructure only truth docs impacted by the current functional-code change.
- repair shape in place only after the ownership gate confirms the doc is the right bounded owner
- use Truth Structure for ownership splits; do not treat broad or mixed-owner docs as in-place repair work
- repair shape when a narrow edit would make truth worse: missing template sections, stale evidence conflicts, cross-section updates within one owner, or wrong frontmatter/source/headings
- preserve supported claims; remove, narrow, or block unsupported or stale claims
- report docs restructured and why a narrow edit was not sufficient
Maintain architecture docs only for structure-level changes: system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.
Keep ordinary behavior, endpoints, UI copy, validation rules, and bug fixes in behavior or contract docs unless they change those boundaries.
Evidence Gate:
- route-first: map changed functional files to bounded route owners and primary canonical docs
- review new or changed behavior-bearing claims only in touched docs, route ownership, Product Decisions, and Rationale
- support claims with primary checkout evidence: implementation, config, routing, generated templates, schemas, or contract definitions
- tests/examples/canonical docs corroborate; they are not sole proof when implementation conflicts
- remove, narrow, or block unsupported claims
- if no impacted doc changed, report why truth was already current or why sync was skipped
Repository intelligence artifacts are optional derived context: RepoIndex, RouteMap, ImpactSet, and ContextPack may guide routing, context selection, and verification planning when available.
They do not override checkout evidence, canonical truth docs, route files, or workflow write boundaries.
If unavailable, inspect .truthmark/config.yml, route files, source files, truth docs, and tests directly, then report that repository-intelligence artifacts were not generated.
Optional validation tooling:
- you may run truthmark check when local tooling is available
- do not require the truthmark binary; direct checkout inspection is the canonical path
- optional validation must not replace agent judgment about docs and routing
- update Product Decisions and Rationale when a behavior change comes from a decision change
Truthmark hierarchy:
- Config: .truthmark/config.yml
- Root route index: docs/truthmark/areas.md
- Area route files: docs/truthmark/areas/**/*.md
- Truth docs: docs/truth/**/*.md
Decision truth lives in the canonical doc it governs; date active decisions inline when added or changed.
Do not create separate active-decision ADR/planning logs; replace the active decision and let Git history carry the audit trail.
Update Product Decisions and Rationale when a decision changes behavior.
Parent post-sync verification:
- verify only truth docs and docs/truthmark/areas.md changed during sync
- block on any unrelated diff caused by the sync step
- block if functional code changed during sync
- verify the worker report matches the required headings and sections
- validate the final report against the structured Truth Sync report contract, including Claim, Evidence, and Result entries under Evidence checked
- verify the updated docs correspond to the reviewed changed-code surface
- verify the final report records ownership review, structure requirement, split, restructure, or blocked reason when the ownership gate fired
- blocked outcomes must preserve the working tree as-is: no rollback, no post-block cleanup edits, and manual-review reporting of any remaining files
Report completion in this shape:
```md
Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Truth docs updated:
- docs/truth/repository/overview.md

Evidence checked:
- Claim: Session timeout behavior is documented in the mapped repository truth doc.
  Evidence: src/auth/session.ts:12 / docs/truthmark/areas.md:11
  Result: supported

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
