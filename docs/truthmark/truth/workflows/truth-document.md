---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-31
---

# Truth Document Workflow

## Purpose

Truth Document records existing implemented behavior when no functional-code change is required.

## Scope

Truth Document owns manual missing-truth generation for implemented behavior. It may write canonical truth docs and routing files only.

## Triggers

- explicit user request to document existing implemented behavior
- handoff from Truth Sync, Truth Check, or Truth Structure when implemented behavior lacks canonical truth docs

## Inputs

- implementation code and tests
- `.truthmark/config.yml`
- root and child route files
- existing canonical docs

## Execution Model

Truth Document is implementation-first and never writes functional code. It documents current implemented behavior only and does not invent future behavior or planned endpoints. In Codex, Claude Code, GitHub Copilot, Gemini CLI, or OpenCode, Truth Document may automatically use generated read-only verifier subagents and explicit-lease `truth-doc-writer` subagents when the host supports subagent dispatch and the parent agent chooses bounded fan-out.

## Steps

1. Confirm the user is asking to document existing implemented behavior rather than change functional code.
2. Inspect implementation, tests, config, route files, and existing canonical docs.
3. Apply the ownership gate and run Truth Structure first when routing or truth ownership is unsafe and repair is in scope.
4. Create or update only routed canonical truth docs and route files needed for the documented behavior, using the routed truth kind's template and its section-comment guidance for touched truth-doc content.
5. Preserve active Product Decisions and Rationale during bounded shape repair or Structure handoff.
6. Report evidence, written docs, routing changes, and blocked ambiguities.

Current behavior notes:

Truth Document applies the ownership gate before writing. If routing is missing, stale, broad, overloaded, catch-all, or cannot map behavior to a bounded truth owner, it runs Truth Structure first when repair is safe and in scope. If repair is unsafe, ambiguous, or outside the task boundary, it blocks and recommends Truth Structure.

If the candidate truth doc is broad, mixed-owner, index-like, or the documented behavior spans independent owners, Truth Document does not repair it in place. It switches to Truth Structure or blocks.

When ownership is bounded, Truth Document creates or updates leaf truth docs, keeps behavior truth docs behavior-oriented, keeps API endpoint details in the nearest contract truth doc when that doc owns the contract, and preserves unrelated authored content.

When creating or updating a truth doc, Truth Document uses the routed `truth_kind` to select `docs/truthmark/templates/<kind>-doc.md`. The HTML comments under each selected template section are normative authoring guidance for that section; Document must write content that satisfies the comment guidance while preserving supported existing claims.

When Truth Document restructures a bounded truth doc or runs Structure first, it inventories Product Decisions and Rationale before editing. Existing entries must be preserved in or moved to their bounded owner docs, narrowed or removed only with checkout evidence, or blocked for manual review when ownership is unclear.

ContextPack may be used to gather bounded source context when available. It does not replace checkout inspection, does not create write permission, and cannot be cited as evidence unless it points to real checkout files, tests, route files, truth docs, schemas, or explicit evidence blocks. If ContextPack is unavailable, Truth Document proceeds manually and reports that repository-intelligence artifacts were not generated.

When the installed `truthmark` CLI is available at the declared version, Truth Document surfaces expose optional read-only `truthmark validate document-report` and `truthmark validate write-lease` helper commands through helper manifests. Agents may use those CLI validators as accelerators, but must visibly skip them and continue manual validation when the CLI is unavailable, too old, or a helper cannot run. The document-report validator validates the report body before its own helper status is appended; after it returns `data.validation.ok: true`, the workflow appends or updates `validate-document-report: ran, passed` in the final report. Helper output is derived evidence; parent validation against checkout evidence, report requirements, lease boundaries, and actual diffs remains authoritative. Completed reports must not record `ran, failed` for helper statuses; required helper statuses other than the report validator's own pending status must be reported as `ran, passed` or `skipped, <reason>` for the completed report validator to accept them. The write-lease helper rejects absolute paths, Windows drive-letter paths, and any `..` path segment in lease patterns or changed-file inputs instead of normalizing them back under an allowed prefix.

When subagent mode is available, the parent agent may dispatch read-only route and claim verifier workers to gather route and evidence findings. Codex exposes `truth_route_auditor` and `truth_claim_verifier`; Claude Code exposes `truth-route-auditor` and `truth-claim-verifier` project subagents; GitHub Copilot, Gemini CLI, and OpenCode expose `@truth-route-auditor` and `@truth-claim-verifier`. Read-only verifier workers inspect only the parent-assigned shard plus required checkout evidence files and do not preload repo-wide instruction or policy docs unless the parent assigns those files as evidence. The same hosts expose `truth_doc_writer` or `@truth-doc-writer` for leased truth-doc shards. The parent agent creates each lease, requires allowedWrites and forbiddenWrites, validates the actual checkout diff against the lease, and owns repo-policy interpretation, final acceptance, routing decisions, shape repair scope, and the final report.

Completed reports include `Implementation reviewed`, `Ownership reviewed`, `Structure required` when applicable, `Truth docs created`, `Truth docs updated`, `Truth docs restructured`, `Routing updated`, `Evidence checked`, `Helper scripts`, and `Notes`. Required completed-report sections must contain at least one bullet entry, `Evidence checked` must use structured `Claim`, indented `Evidence`, and `Result` entries, and blocked reports must include `Reason` for helper validation to accept them.
When write workers are used, each worker report must include `status`, `worker`, `workflow`, `shard`, `filesChanged`, `claimsChecked`, `evidenceChecked`, `offLeaseChanges`, `blockers`, and `notes`. The parent accepts a completed worker report only after validating the parsed report against the lease identity, required report fields, actual worker diff, `allowedWrites`, `forbiddenWrites`, reported `filesChanged`, reported `offLeaseChanges`, and reported `blockers`. Blocked worker reports remain blocked outcomes and must include blockers; off-lease or forbidden actual diffs are rejected rather than trusted from self-report.

## State, Retry, And Failure Behavior

If routing is missing, stale, broad, overloaded, catch-all, or cannot map behavior to a bounded owner, Truth Document either runs Truth Structure when safe and in scope or blocks and recommends it. If helper/subagent support is unavailable, the parent agent performs the same checks manually.

## Outputs

Truth Document outputs canonical truth-doc and route-file changes plus a completion report. It does not output functional-code changes or planned-behavior docs.

## Product Decisions

- Decision (2026-05-15): Truth Document exists because documenting existing implemented behavior without code changes is not a Truth Sync run.
- Decision (2026-05-15): Truth Document must switch to Truth Structure rather than patching mixed-owner truth docs.
- Decision (2026-05-15): Truth Document must not lose Product Decisions or Rationale during bounded shape repair or Structure handoff.
- Decision (2026-05-16): Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode subagents may gather bounded read-only evidence for Document without preloading repo-wide policy by default. Document may also dispatch `truth-doc-writer` only with an explicit write lease, while parent agents retain policy, acceptance, and diff-validation ownership.
- Decision (2026-05-31): Truth Document treats template section comments as the section-level content standard for authored or repaired truth-doc prose.

## Rationale

Documentation-only work can still damage repository truth if it appends implemented behavior to the wrong owner. The ownership gate keeps Document from turning broad docs into larger broad docs.

## Non-Goals

- no functional-code edits or generated code changes
- no planned behavior documentation, speculative endpoints, or roadmap prose
- no in-place ownership repair for mixed-owner docs; hand off to Truth Structure instead

## Maintenance Notes

Update this doc when Truth Document triggers, write boundaries, template-authoring guidance, ownership handoff behavior, or report shape changes.

## Source References

- ../../../../src/agents/truth-document.ts
- ../../../../src/agents/write-lease.ts
- ../../../../src/agents/shared.ts
- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/agents/workflow-helper-validation.ts
- ../../../../src/cli/program.ts
- ../../../../src/cli/handlers.ts
- ../../../../src/templates/workflow-surfaces.ts
