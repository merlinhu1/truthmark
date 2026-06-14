---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-31
---

# Truth Sync Workflow

## Purpose

Truth Sync protects the completion-time contract that changed functional code is reflected in bounded canonical truth docs and truth routing without letting documentation-only updates or topology repair blur workflow ownership.

## Scope

Truth Sync is code-first. Code leads, truth docs follow, and functional code must not be rewritten during sync.

## Triggers

- automatic finish-time trigger after functional code changes since the last successful Truth Sync
- explicit user invocation through the installed host surface

## Inputs

- staged, unstaged, and untracked functional-code changes
- `.truthmark/config.yml`
- root and child route files
- relevant canonical docs and nearby implementation

## Execution Model

Truth Sync may update routed truth docs and routing when routing repair is needed. It may create missing canonical truth docs when routeable implementation would otherwise remain undocumented. In Codex, Claude Code, GitHub Copilot, Gemini CLI, or OpenCode, Truth Sync may automatically use generated read-only verifier subagents and explicit-lease `truth-doc-writer` subagents when the host supports subagent dispatch and the parent agent chooses bounded fan-out.

## Steps

1. Determine whether functional code changed since the last successful Sync or whether the user explicitly invoked Sync.
2. Inspect changed code, config, route files, impacted truth docs, nearby implementation, and tests.
3. Apply topology and ownership gates before changing truth docs.
4. Update only routed truth docs and routing needed to keep canonical truth aligned with changed code, using the routed truth kind's template and its section-comment guidance for touched truth-doc content.
5. Preserve active Product Decisions and Rationale during bounded shape repair or Structure handoff.
6. Report changed truth files, evidence, skipped cases, verification, and any blocked topology repair.

Current behavior notes:

Before updating truth docs, Truth Sync applies the topology and ownership gates. If routing is missing, stale, broad, overloaded, catch-all, or cannot map changed code to a bounded truth owner, it must not create another generic truth doc. It runs Truth Structure first when repair is safe and in scope, or blocks and recommends Truth Structure when topology repair is unsafe, ambiguous, or outside the task boundary.

If an impacted truth doc is broad, mixed-owner, index-like, or the code change spans independent behavior owners, Truth Sync switches to Truth Structure when safe and in scope. Otherwise it blocks and reports manual-review files.

Truth Sync updates active decisions and rationale in the routed canonical doc when implementation changes are driven by a decision change. It dates active decisions inline when added or changed and replaces stale active decisions rather than appending separate timestamped decision notes.

When Truth Sync restructures a bounded truth doc or runs Structure inline, it inventories Product Decisions and Rationale before editing. Existing entries must be preserved in or moved to their bounded owner docs, narrowed or removed only with checkout evidence, or blocked for manual review when ownership is unclear.

When Truth Sync creates, updates, or repairs a truth doc, it uses the routed `truth_kind` to select `docs/truthmark/templates/<kind>-doc.md`. The HTML comments under that template's section headings are part of the authoring contract: Sync must satisfy the section intent for changed content, not just preserve or copy the headings.

Truth Sync updates architecture docs in the same sync when changed code alters architecture-level structure or ownership.

ContextPack may be used to accelerate Truth Sync when available. It does not replace checkout inspection, does not create write permission, and cannot be cited as evidence unless it points to real checkout files, tests, route files, truth docs, schemas, or explicit evidence blocks. If ContextPack or ImpactSet is unavailable, Truth Sync proceeds manually and reports that repository-intelligence artifacts were not generated.

When the installed `truthmark` CLI is available at the declared version, Truth Sync surfaces expose optional read-only `truthmark validate sync-report` and `truthmark validate write-lease` helper commands through helper manifests. Agents may use those CLI validators as accelerators, but must visibly skip them and continue manual validation when the CLI is unavailable, too old, or a helper cannot run. The sync-report validator validates the report body before its own helper status is appended; after it returns `data.validation.ok: true`, the workflow appends or updates `validate-sync-report: ran, passed` in the final report. Helper output is derived evidence; parent validation against checkout evidence, report requirements, lease boundaries, and actual diffs remains authoritative. Completed reports must not record `ran, failed` for helper statuses; required helper statuses other than the report validator's own pending status must be reported as `ran, passed` or `skipped, <reason>` for the completed report validator to accept them. The write-lease helper rejects absolute paths, Windows drive-letter paths, and any `..` path segment in lease patterns or changed-file inputs instead of normalizing them back under an allowed prefix.

Completed reports include `Changed code reviewed`, `Ownership reviewed`, `Structure required` when applicable, `Truth docs updated`, `Truth docs split` when Structure is run inline, `Evidence checked`, `Helper scripts`, and `Notes`. Required completed-report sections must contain at least one bullet entry, and `Evidence checked` must use structured `Claim`, indented `Evidence`, and `Result` entries. The structured completed-report parser preserves optional `Helper scripts` statuses when that section is present. Skipped reports include `Reason`. Blocked reports include `Reason`, `Files requiring manual review`, and `Next action`; helper validation rejects skipped or blocked reports with missing required body sections.
When write workers are used, each worker report must include `status`, `worker`, `workflow`, `shard`, `filesChanged`, `claimsChecked`, `evidenceChecked`, `offLeaseChanges`, `blockers`, and `notes`. The parent accepts a completed worker report only after validating the parsed report against the lease identity, required report fields, actual worker diff, `allowedWrites`, `forbiddenWrites`, reported `filesChanged`, reported `offLeaseChanges`, and reported `blockers`. Blocked worker reports remain blocked outcomes and must include blockers; off-lease or forbidden actual diffs are rejected rather than trusted from self-report.

Current skip reasons are:

- documentation-only change
- formatting-only change
- clearly behavior-preserving rename with no truth impact
- no Truthmark config exists yet
- no functional code changes

Truth Sync's generated frontmatter description and Codex metadata carry those skip cases because skill metadata is the host-visible routing boundary before the full workflow body is loaded.

Truth Sync delegation is host-owned. Generated workflow surfaces may describe when delegation is allowed, but must not create unrestricted writable helpers or a project-local subagent preference file. Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode generated surfaces may name project-scoped read-only verifier agents for workflow-owned automatic verification and `truth-doc-writer` for leased truth-doc shards. Read-only verifier agents inspect only the parent-assigned shard plus required checkout evidence files and do not preload repo-wide instruction or policy docs unless the parent assigns those files as evidence. The parent workflow creates each lease, requires allowedWrites and forbiddenWrites, validates the actual checkout diff against the lease, and owns repo-policy interpretation and final acceptance.

## State, Retry, And Failure Behavior

Truth Sync is skipped for docs-only, formatting-only, behavior-preserving rename, missing-config, or no-code changes. It blocks or hands off to Truth Structure when routing is missing, stale, broad, overloaded, catch-all, or unrouteable. It must not rewrite functional code during sync.

## Outputs

Truth Sync outputs truth-doc and route-file updates plus a completion report. It does not output functional-code rewrites or generic docs behind weak routing.

## Product Decisions

- Decision (2026-05-15): Truth Sync metadata carries skip cases because docs-only, formatting-only, behavior-preserving rename, missing-config, and no-code changes should not trigger the finish-time sync path.
- Decision (2026-05-15): Truth Sync must not worsen weak topology by adding generic truth docs behind missing, stale, broad, overloaded, catch-all, or unrouteable routing.
- Decision (2026-05-15): Truth Sync must switch to Truth Structure or block when impacted truth docs are mixed-owner or broad.
- Decision (2026-05-15): Truth Sync must not lose Product Decisions or Rationale during bounded shape repair or inline Structure handoff.
- Decision (2026-05-16): Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode subagents may automatically gather bounded read-only route and claim evidence for Sync when host-supported without preloading repo-wide policy by default. Sync may also dispatch `truth-doc-writer` only with an explicit write lease, while parent agents retain policy, acceptance, and diff-validation ownership.
- Decision (2026-05-16): Truth Sync write authority is bounded by file class and route ownership, not by the root route index alone. It may write canonical truth docs and truth routing files, while functional code remains outside Sync authority.
- Decision (2026-05-31): Truth Sync follows the selected truth-doc template's section comments as content guidance for touched sections, because template compliance requires useful section content as well as matching headings.

## Rationale

Truth Sync is the finish-time bridge from code to truth, so it must protect route ownership before claim evidence. Otherwise it can accurately document behavior in the wrong place. Routing repair can require child route-file edits as well as root index edits, so Sync's safe boundary is leased truth routing files rather than one hard-coded route file.

## Non-Goals

- no functional-code rewrites during sync
- no generic docs behind weak routing
- no unleased writable subagent ownership baked into generated surfaces

## Maintenance Notes

Update this doc when Sync triggers, skip reasons, report shape, delegation language, template-authoring guidance, or ownership handoff behavior changes.

## Source References

- ../../../../src/agents/truth-sync.ts
- ../../../../src/agents/write-lease.ts
- ../../../../src/sync/report.ts
- ../../../../src/agents/shared.ts
- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/agents/workflow-helper-validation.ts
- ../../../../src/cli/program.ts
- ../../../../src/cli/handlers.ts
- ../../../../src/templates/workflow-surfaces.ts
