# Truthmark Sync

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

This rule is the Antigravity entrypoint for Truthmark Sync.

Do not invoke another Truthmark command from here.

Manual invocation: @truthmark-sync

If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.

Description: Use automatically at finish-time after functional code changes, or explicit /truthmark-sync, $truthmark-sync, or /truthmark:sync. Skip docs-only, formatting-only, behavior-preserving renames, missing config, and no-code changes. Not for doc-first realization or manual topology design.

## Procedure

Use this skill automatically before finishing when functional code changed since the last successful Truth Sync. Also run it immediately when the user explicitly invokes Truth Sync.
Explicit invocation runs immediately when the user directly requests this workflow. Later functional-code changes need a fresh finish-time review, and an earlier explicit run satisfies the finish-time review only if no later functional-code changes occur.
Skip when changes are documentation-only, formatting-only, clearly behavior-preserving renames with no truth impact, when no Truthmark config exists yet, or when there are no functional code changes.
Parent workflow:
1. Inspect git status, staged changes, unstaged changes, and untracked files directly.
2. Inspect .truthmark/config.yml and configured route files only when they exist; then inspect relevant canonical docs.
3. Identify functional-code changes and the nearest truth docs or routing repairs.
4. Evidence authority:
  - Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.
  - Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
5. Product truth decision:
  - ask whether a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed
  - if yes, update or route product truth under docs/truthmark/product as well as engineering truth under docs/truthmark/engineering
  - if no, default to engineering truth under docs/truthmark/engineering for internal implementation changes
  - when both lanes change, keep separate product and engineering docs cross-linked through route YAML with realized_by and realizes
  - when ownership is ambiguous, stop or route to Truth Structure instead of writing a mixed document
6. Capture decision context from the task conversation: ask whether the user provided a product or technical decision, rationale, constraint, tradeoff, rejection reason, or scope boundary. Preserve concise user-provided decision rationale in Sync Intent before truth edits, route it to Product Decisions, Engineering Decisions, Rationale, Capability Scope, Non-Goals, Maintenance Notes, or the relevant workflow/contract section, and report whether it was placed, skipped because none was provided, or needs manual handoff.
7. Update engineering truth first after code changes. Product truth is opt-in for externally visible promises, product boundaries, APIs, acceptance criteria, or explicit user/product evidence.
8. Code verification is parent-owned: follow repository instructions and task context, and report what ran or why it did not run.
9. Dispatch bounded Truth Sync workers only when the host supports subagent dispatch and the acting agent chooses that path; otherwise execute the same sync task inline.
10. Fill Sync Intent before editing truth docs or truth routing files:
   - Changed code reviewed: functional files, tests, configs, generated outputs, or other implementation evidence inspected
   - Affected route/truth owner: bounded route area or canonical truth owner that maps the change
   - Target truth docs: docs expected to change, or docs reviewed and left unchanged
   - Intended update: claim/doc/routing update planned before writing
   - Evidence to verify: checkout evidence that will support, narrow, remove, or record each claim for manual handoff
   - User-provided decisions/rationale: decisions, rationale, constraints, tradeoffs, rejection reasons, or scope boundaries from the current task conversation, or "none provided"
   - No-update-needed rationale: why mapped truth is already current when no truth doc should change
   - Blockers: missing routing, ambiguous ownership, failed verification, unavailable evidence, or off-boundary write needs
11. Only edit allowed truth docs/routes after Sync Intent is clear; if ownership is ambiguous, repair topology first when the repair is safe and in scope, otherwise stop and recommend Truth Structure instead of guessing.
Truth-doc prose style:
- Use professional, plain technical prose. Prefer specific current-state claims over promotional, symbolic, or generic significance language.
- Avoid common AI-writing tells: pivotal, crucial, underscores, serves as, stands as, showcases, landscape, vague expert attributions, and generic upbeat conclusions.
- Keep claims evidence-backed and diff-friendly: one durable claim per bullet or short paragraph.
- Do not add personality, rhetorical flourish, first-person commentary, or marketing tone.
- Rewrite dense or formulaic prose only when it improves readability without removing scope, evidence, decisions, or source references.
Topology review and repair:
- before updating truth docs, verify the changed code resolves to a specific behavior-owned area and bounded truth owner
- if routing is missing, stale, broad, overloaded, catch-all route only, or cannot map changed code to a bounded truth owner, run Truth Structure before syncing when topology repair is safe and in scope
- safe in-scope topology repair may update truth routing files and create or update bounded leaf truth docs needed to map the changed functional code; keep the repair limited to the affected route owner
- stop and recommend Truth Structure only when topology repair is unsafe, ambiguous, or outside the current task boundary
- report the route files and changed code paths that required structure repair
- do not create another generic truth doc
- README.md files are indexes, not Truth Sync targets
- must not append behavior details to a README.md index
- write engineering truth under docs/truthmark/engineering; product truth updates under docs/truthmark/product are allowed only for explicit current product behavior changes
Optional validation tooling:
- you may run truthmark check when local tooling is available
- you may validate the final report with `truthmark validate sync-report <report-file> --json` when available
- do not require the truthmark binary; direct checkout inspection is the canonical path
- optional validation must not replace agent judgment about docs and routing
- update Product Decisions only in product truth and Engineering Decisions only in engineering truth when evidence supports the lane-specific decision change
Truthmark hierarchy hints:
- Config, when present: .truthmark/config.yml
- Root route index, when present: docs/truthmark/routes/areas.md
- Area route files, when present: docs/truthmark/routes/areas/**/*.md
- Product truth docs, when present: docs/truthmark/product/**/*.md
- Engineering truth docs, when present: docs/truthmark/engineering/**/*.md
Parent post-sync verification:
- verify only truth docs and leased truth routing files changed during sync
- stop on any unrelated diff caused by the sync step
- stop if functional code changed during sync
- validate the final report against the structured Truth Sync report contract, including Claim, indented Evidence, and Result values supported, narrowed, removed, or blocked under Evidence checked
- verify the updated docs correspond to reviewed checkout evidence, changed-code impact, or a recorded stale-truth correction made within the sync write lease
- verify the final report records ownership review, structure requirement, split, restructure, or manual handoff reason when the ownership review applies
- manual handoff outcomes must preserve the working tree as-is: no rollback, no post-block cleanup edits, and manual-review reporting of any remaining files

## Report Template

Report completion in this shape:
```md
Truth Sync: completed

Changed code reviewed:
- src/auth/session.ts

Sync Intent:
- Changed code reviewed: src/auth/session.ts
- Affected route/truth owner: docs/truthmark/routes/areas/authentication.md
- Target truth docs: docs/truthmark/engineering/behaviors/session-timeout.md
- Intended update: Update session timeout behavior.
- Evidence to verify: src/auth/session.ts:12 / docs/truthmark/routes/areas/authentication.md:11
- User-provided decisions/rationale: User rationale: session timeout behavior changed for internal implementation consistency
- No-update-needed rationale: not applicable; mapped truth is stale
- Blockers: none

Ownership reviewed:
- docs/truthmark/routes/areas/authentication.md

Truth docs updated:
- docs/truthmark/engineering/behaviors/session-timeout.md

Decision/rationale captured:
- Placed user rationale in the bounded authentication behavior truth doc under Engineering Decisions/Rationale.

Evidence checked:
- Claim: Session timeout behavior is documented in the bounded authentication behavior truth doc.
  Evidence: src/auth/session.ts:12 / docs/truthmark/routes/areas/authentication.md:11
  Result: supported

Notes:
- Updated session timeout behavior.
```
Blocked report example:
```md
Truth Sync: blocked

Reason:
- Changed code maps only to the provisional bootstrap route.

Files requiring manual review:
- src/auth/**
- docs/truthmark/routes/areas/repository.md

Next action:
- Run Truth Structure for src/auth/** before updating behavior truth.
```
