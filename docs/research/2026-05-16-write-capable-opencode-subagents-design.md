# Write-Capable OpenCode Subagents Design

Status: proposed review draft
Date: 2026-05-16
Scope: OpenCode-first workflow subagent expansion for Truthmark

This is a research design, not canonical repository truth. If accepted, the
behavior-bearing parts should move into the owning truth docs, manifest, renderers,
and tests.

## Summary

Truthmark should support write-capable OpenCode subagents for bounded workflow
shards, but not as free-form helper agents. The parent workflow should remain the
orchestrator and final acceptor. Each write-capable subagent should receive a
task-specific write lease that names its objective, allowed reads, allowed writes,
forbidden writes, evidence requirements, and report shape.

This gives us the context benefit the user called out: the parent can fan out
large Sync, Document, Structure, or Realize work without loading every file and
intermediate thought into the parent context. The tradeoff is that write fan-out
must be treated as a merge protocol, not just "let another agent edit files".

## OpenCode Basis

OpenCode supports project-local Markdown agents under `.opencode/agents/`, with
`mode: subagent`, descriptions for automatic routing, and manual invocation by
`@agent-name`. It also supports per-agent permissions, including `edit`, `bash`,
`read`, `grep`, `glob`, `list`, `task`, `skill`, and pattern-based permission
objects. Skills are discovered from `.opencode/skills/*/SKILL.md`.

Relevant docs:

- <https://opencode.ai/docs/agents/>
- <https://opencode.ai/docs/skills/>
- <https://opencode.ai/docs/permissions/>

Implication: OpenCode can enforce coarse static boundaries for a worker agent,
but task-specific exact ownership still needs to live in the prompt/lease and be
validated by the parent after the child session returns.

## Current Truthmark Baseline

Current Truthmark workflow generation now has OpenCode read-only verifier
subagents:

- `@truth-route-auditor`
- `@truth-claim-verifier`
- `@truth-doc-reviewer`

The current canonical workflow model keeps writes parent-owned. That is correct
for the first subagent step because it avoids merge risk while proving that
OpenCode subagents can reduce verification context load.

The next improvement should add write-capable workers behind stricter contracts,
not by relaxing the existing verifier agents.

## Problem

Large Truthmark workflows create context pressure in two places:

- The parent agent must inspect implementation, routing, truth docs, generated
  surfaces, test output, and report requirements.
- The parent agent often must perform repetitive localized writes after the
  ownership decision is already clear.

Read-only subagents help the first problem, but not the second. If all edits stay
in the parent, Sync and Document can still accumulate unnecessary context when
multiple truth docs or code areas need independent updates.

Write-capable subagents can fix this, but only if they do not weaken Truthmark's
core invariants:

- Workflow write boundaries remain enforceable.
- Canonical truth ownership remains explicit.
- Generated surfaces remain source-derived.
- Parent reports remain coherent and evidence-backed.
- Overlapping edits do not silently race.

## Goals

- Reduce parent context growth during large workflow runs.
- Allow bounded OpenCode worker sessions to write isolated shards.
- Preserve workflow-specific allowed write boundaries.
- Keep the parent workflow responsible for acceptance, validation, and final
  reporting.
- Make worker failures visible and recoverable.
- Keep generated surfaces deterministic from the typed manifest and templates.

## Non-Goals

- Do not create unrestricted "developer" subagents for Truthmark workflows.
- Do not let workers expand their own write scope.
- Do not make OpenCode subagents a daemon, background queue, database, or
  required runtime service.
- Do not let workers run `truthmark init` as part of ordinary shard edits.
- Do not make generated host surfaces the authority.
- Do not require cross-host parity before proving the OpenCode model.

## Design Principle: Write Leases

A write-capable subagent receives a write lease from the parent. The lease is the
unit of delegation and the unit of validation.

The lease should contain:

- `workflow`: the active Truthmark workflow.
- `worker`: the worker agent id.
- `shard`: a stable shard id for reporting.
- `objective`: the concrete edit outcome.
- `requiredReads`: files the worker must inspect before editing.
- `allowedReads`: optional broader read patterns.
- `allowedWrites`: exact files or narrow globs the worker may edit.
- `forbiddenWrites`: explicit deny list for adjacent surfaces.
- `evidenceRequired`: checkout evidence the worker must cite in its report.
- `verification`: focused command or inspection expected from the worker, if any.
- `report`: required report fields.

If the task requires writing outside the lease, the worker must stop and report
`blocked`. It must not infer a wider scope.

Example:

```yaml
workflow: truthmark-sync
worker: truth-doc-writer
shard: workflows-sync-doc
objective: Update the routed Sync truth doc for the implemented OpenCode subagent behavior.
requiredReads:
  - .truthmark/config.yml
  - docs/truthmark/areas.md
  - docs/truth/workflows/truth-sync.md
  - src/agents/workflow-manifest.ts
allowedWrites:
  - docs/truth/workflows/truth-sync.md
forbiddenWrites:
  - src/**
  - .opencode/**
  - .codex/**
evidenceRequired:
  - implemented source or generated surface proving each behavior claim
verification:
  - inspect final diff for off-lease writes
report:
  status: completed | blocked
  filesChanged: []
  claimsChecked: []
  evidenceChecked: []
  blockers: []
```

## Proposed Worker Agents

### `truth-doc-writer`

Purpose: write bounded canonical truth doc updates for Truth Sync and Truth
Document after ownership is already known.

Static OpenCode permission shape:

- `mode: subagent`
- allow reads/search/list
- allow edit only for `docs/truth/**` and the specific routing locations needed
  by the workflow
- deny or ask for bash by default
- deny external directories

Runtime lease:

- usually one canonical truth doc per worker
- optional routing file only when parent already identified the owning route
- no functional code
- no generated host surfaces

### `truth-route-structurer`

Purpose: repair or split routing topology under Truth Structure.

This should be introduced after `truth-doc-writer`, because topology edits have
more coupling. Parallelism should be conservative:

- one worker per independent route subtree
- parent serializes root route index changes
- parent rejects overlapping route ownership claims

Allowed writes:

- `docs/truthmark/areas.md`
- `docs/truthmark/areas/**/*.md`
- starter canonical truth docs when the lease explicitly includes them

Forbidden writes:

- functional code
- generated host workflow surfaces
- unrelated truth docs

### `truth-realize-writer`

Purpose: implement a bounded code shard from accepted truth docs during Truth
Realize.

This is valuable for context control but higher risk than doc writes. It should
arrive after lease validation exists.

Runtime lease:

- one implementation area or module per worker
- exact source/test paths where possible
- required source truth docs
- no truth docs
- no routing docs
- no generated host surfaces

Parent responsibility:

- run focused tests
- run Truth Sync afterward if functional behavior changed
- reject any truth doc edits from this worker

### No Initial Generated-Surface Writer

Do not create a worker that edits `.opencode/skills`, `.opencode/agents`,
`.codex/skills`, `.codex/agents`, Gemini commands, Copilot prompts, or generated
instruction blocks. Generated surfaces should remain parent/refreshed outputs of
source templates and `truthmark init`.

## Workflow Mapping

### Truth Sync

Recommended flow:

1. Parent inspects code diff and changed behavior.
2. Parent dispatches read-only route and claim verifier subagents as useful.
3. Parent maps changed behavior to owned truth docs.
4. Parent creates non-overlapping `truth-doc-writer` leases.
5. Workers edit only leased docs.
6. Parent checks actual diffs against leases.
7. Parent runs focused validation and `truthmark check` when appropriate.
8. Parent writes the final Sync report.

Truth Sync should be the first workflow to use write workers because its write
boundary is narrow: canonical truth docs and routing only.

### Truth Document

Recommended flow:

1. Parent establishes that behavior is already implemented.
2. Parent verifies route ownership.
3. Parent dispatches one doc writer per missing or stale canonical doc.
4. Parent accepts only docs/routing writes permitted by the workflow.

Truth Document is the second-best rollout target. It has the same doc-writing
shape as Sync but is explicit rather than finish-time automatic.

### Truth Structure

Recommended flow:

1. Parent uses read-only route auditing to find broad, stale, missing, or
   mixed-owner routing.
2. Parent produces a topology plan.
3. Parent serializes or narrowly shards route writes.
4. Parent rejects write leases that overlap root ownership files unless there is
   exactly one route structurer.

Structure should not start with broad parallel writes. Routing topology is too
easy to corrupt with independent partial fixes.

### Truth Realize

Recommended flow:

1. Parent reads accepted truth docs and identifies implementation shards.
2. Parent dispatches `truth-realize-writer` workers with exact source/test write
   leases.
3. Workers return implementation diffs and focused verification notes.
4. Parent runs authoritative tests.
5. Parent invokes Truth Sync after functional code changes.

Realize is where write fan-out may save the most context, but it must not be
allowed to edit truth docs. Code leads after realization; Sync follows.

### Truth Check

Truth Check should stay read-only by default. It may recommend Structure,
Document, Sync, or Realize, but it should not silently dispatch write workers.

## Parent Orchestration Algorithm

The parent workflow should follow a deterministic merge protocol:

1. Inspect checkout, config, routing, manifest, and relevant docs.
2. Build a work-unit graph with expected write sets.
3. Reject or serialize overlapping write sets before dispatch.
4. Dispatch OpenCode workers with explicit write leases.
5. Require each worker to report status, changed files, evidence, and blockers.
6. Inspect actual diff after each worker returns.
7. Reject or flag any off-lease file changes.
8. Merge worker reports into the parent report.
9. Run focused validation, generated-surface refresh, or `truthmark check` as
   required by the changed surface.
10. Keep final user-facing completion parent-owned.

The parent should never trust a worker report without checking the actual diff.

## Permission Model

OpenCode permissions should provide coarse static fencing:

```yaml
---
description: Writes one leased Truthmark truth-document shard. Use only when a parent workflow provides an explicit write lease.
mode: subagent
permission:
  read: allow
  list: allow
  grep: allow
  glob: allow
  edit:
    "*": deny
    "docs/truth/**": allow
    "docs/truthmark/areas.md": allow
    "docs/truthmark/areas/**/*.md": allow
  bash:
    "*": ask
    "git diff*": allow
  external_directory: deny
---
```

This is necessary but not sufficient. Static permissions cannot express the exact
per-task file list. The lease and parent diff validation provide the precise
boundary.

## Report Contract

Each write worker should return a compact, machine-checkable report:

```yaml
status: completed | blocked
worker: truth-doc-writer
workflow: truthmark-sync
shard: workflows-sync-doc
filesChanged:
  - docs/truth/workflows/truth-sync.md
claimsChecked:
  - claim: OpenCode installs read-only verifier subagents for workflow-owned verification.
    evidence:
      - src/templates/generated-surfaces.ts
      - .opencode/agents/truth-route-auditor.md
evidenceChecked:
  - docs/truthmark/areas.md mapped the doc owner before writing.
offLeaseChanges: []
blockers: []
```

The parent can parse this lightly, but the source of truth remains the actual
checkout diff.

## Conflict Handling

Workers must block when:

- ownership is missing or ambiguous
- the required edit needs an off-lease file
- another worker changed the same leased file
- generated surfaces appear stale and require parent refresh
- evidence does not support the requested truth claim

The parent should handle conflicts by:

- serializing overlapping route/doc writes
- narrowing leases and retrying only when safe
- reporting blocked ownership rather than broadening scope
- preserving unrelated user changes
- refusing to accept off-lease edits as workflow output

## Test Strategy

The implementation should have tests before enabling write workers by default:

- Manifest tests for worker metadata, write boundaries, and workflow mapping.
- Renderer tests for generated OpenCode worker agent files.
- Init tests proving `.opencode/agents/*.md` outputs are deterministic.
- Contract tests that worker prompts require leases and block on off-lease writes.
- Permission tests or snapshots for OpenCode `permission` frontmatter.
- Report parser tests for `completed`, `blocked`, `offLeaseChanges`, and
  evidence fields.
- Integration fixture for two non-overlapping doc writers.
- Negative fixture for overlapping write leases rejected by the parent.

## Rollout Plan

### Phase 1: Lease Schema and Prompt Contract

Add a source-level representation of write leases and tests for rendered worker
instructions. Do not enable write workers yet.

### Phase 2: OpenCode `truth-doc-writer`

Generate one OpenCode doc writer subagent. Wire Sync and Document instructions to
permit parent-dispatched doc write fan-out only after route ownership is known.

### Phase 3: Parent Diff Acceptance

Add deterministic parent guidance and tests for checking actual changed files
against the lease. This is the gate before any worker is considered successful.

### Phase 4: Realize Code Worker

Add `truth-realize-writer` only after doc writers prove the lease model. Require
tests and post-realization Sync.

### Phase 5: Structure Worker

Add `truth-route-structurer` with conservative serialization. Structure writes
should remain parent-planned because routing topology is coupled.

### Phase 6: Cross-Host Parity

Only after the OpenCode shape is stable, evaluate Codex and other host-specific
subagent equivalents. Do not force parity early if it weakens OpenCode quality.

## Open Questions

- Should write leases be only prompt text at first, or also generated as a
  machine-readable payload? Recommendation: prompt text first, typed source model
  next, sidecar payload only if the prompt contract proves insufficient.
- Should write workers run validation commands? Recommendation: allow focused
  commands, but keep authoritative validation parent-owned.
- Should generated worker agents be installed by default? Recommendation: not
  until lease validation and negative tests exist.
- Should route writes ever run in parallel? Recommendation: only by independent
  route subtree, never against the root route index in parallel.

## Recommendation

Proceed with OpenCode write-capable subagents, but start with `truth-doc-writer`
and a strict write-lease protocol. This directly addresses parent context
explosion while preserving Truthmark's workflow boundaries.

The important boundary is not "read-only versus write-capable". The boundary is
"parent-owned acceptance versus unreviewed child edits". Write-capable subagents
are safe enough for Truthmark only when the parent grants narrow leases, validates
actual diffs, and owns the final workflow report.
