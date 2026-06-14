---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-06-12
---

# Check Diagnostics

## Purpose

This document protects the user-facing truth-health contract for `truthmark check`: what it validates, what its diagnostics mean, and how maintainers should interpret command output.

## Scope

This document owns the current behavior of `truthmark check`: config-aware validation of authority files, route areas, frontmatter, links, decision structure, generated surfaces, coverage, and optional branch-impact freshness diagnostics. Installed agent workflow behavior is covered by the workflow truth docs instead of this CLI diagnostics surface.

## Current Behavior

`truthmark check` is validation tooling. It is not the runtime for Truth Sync, Truth Preview, Truth Realize, Truth Structure, or Truth Check skills, and it is not a CI-style merge gate by default.

The command:

1. resolves the active repository and worktree
2. computes branch-scope metadata
3. loads `.truthmark/config.yml`
4. runs authority, area, decision-structure, frontmatter, internal-link, generated-surface, and coverage diagnostics when config is valid
5. runs source-traceability diagnostics for configured truth docs independently of `--base <ref>`; when `--base <ref>` is supplied, builds an ImpactSet and adds branch-freshness diagnostics for changed code without route ownership, invalid base comparisons, and changed public API without docs sync
6. builds the compact `data.scorecard` summary from the final raw diagnostics array and explicit run context
7. returns a human summary or the shared JSON envelope

There is no supported `--workflow` helper mode. Agent workflows inspect the checkout directly and may run `truthmark check` only as optional validation.

The command reports repository truth health for the active checkout. It does not prepare mandatory workflow context, choose verification commands, or decide whether a coding task can finish.

`truthmark check` without `--base` keeps the existing checkout-health behavior and does not compute ImpactSet. `truthmark check --base <ref>` adds branch-impact freshness diagnostics and includes `data.impactSet` in JSON output.

Topology repair remains an installed workflow responsibility. `truthmark check` may expose routing or coverage symptoms, but AI agents must be able to perform Truth Structure directly from committed config, route files, docs, and implementation when the Truthmark binary is unavailable.

## Core Rules

### Authority

Authority checks validate that configured files and globs stay inside the repository root and that explicit files exist.

Current severity behavior:

- missing explicit authority file: `error`
- out-of-repository authority path: `error`
- authority glob with no matches: `review`

### Area Index

Area checks resolve the configured root route index and, in V1, one level of child route files under the configured area-files root.

Delegated child-surface validation follows the parent glob semantics rather than accepting broad shared path prefixes.

Each resolved leaf area must define:

- `Truth documents`
- `Code surface`
- `Update truth when`

`Truth documents` may be expressed either as a Markdown list of document paths or as a fenced YAML block with a `truth_documents` array of `{ path, kind }` entries. Explicit route metadata is authoritative and owns the section, so list lines in the same section are ignored. List entries under the configured truth root default to behavior; clean workspace truth docs under `docs/truthmark/truth/**` are valid behavior truth docs even when explicit kind metadata is absent. List entries outside the configured truth root default to behavior with a review diagnostic instead of using removed project-doc path conventions such as `docs/api/**` or `docs/architecture/**`. When an explicit route entry is a glob, Truthmark expands it to concrete truth document entries before frontmatter and doc-structure checks so the routed kind applies to every matched file.

Current severity behavior:

- malformed or incomplete root or child area block: `error`
- missing truth document: `error`
- out-of-repository truth document or code surface: `error`
- conflicting routed kinds for the same truth document path: `error`
- child route file outside the configured area-files root: `error`
- nested delegation inside a child route file: `error`
- duplicate resolved leaf area key: `error`
- duplicate child route-file reference: `error`
- child code surface outside its delegated parent code surface: `review`
- unreferenced child route file under the configured area-files root: `review`
- code-surface glob with no matches: `review`

### Coverage

Coverage diagnostics are emitted when a code file under the current checked surface is not matched by any valid area mapping.

Coverage scanning uses Truth Sync's functional-code classifier across common code roots:

- `app/**`
- `api/**`
- `apps/**`
- `bin/**`
- `client/**`
- `cmd/**`
- `frontend/**`
- `infra/**`
- `infrastructure/**`
- `internal/**`
- `k8s/**`
- `kubernetes/**`
- `lib/**`
- `packages/**`
- `pkg/**`
- `proto/**`
- `schema/**`
- `schemas/**`
- `scripts/**`
- `server/**`
- `services/**`
- `src/**`
- `terraform/**`
- `web/**`
- `.github/workflows/**`

The V1 minimum language requirement is explicit support for Go, Python, C#, and Java, in addition to JavaScript and TypeScript. Coverage also treats Terraform, Kubernetes manifests, API schemas, GraphQL schemas, protobuf schemas, CI workflows, frontend app paths, and monorepo app or package paths as functional surfaces when they sit under the checked roots.

### Frontmatter

Frontmatter checks parse only the Markdown files that are in the authority set or referenced as routed truth docs.

Current severity behavior:

- invalid frontmatter: `error`
- missing configured required field: `error`
- invalid `truth_kind`: `error`
- present `truth_kind` that disagrees with routed truth kind metadata: `error`
- missing configured recommended field: `review`

### Internal Links

Internal-link checks also run only on the authority and routed truth docs.

Current severity behavior:

- internal link that resolves outside the repository root: `error`
- internal link to a missing file: `error`

### Decision Structure

Decision-structure checks review configured architecture docs and routed truth docs that are part of the current truth surface.

Current severity behavior:

- canonical doc missing `Scope`: `review`
- canonical doc missing active `Product Decisions`: `review`
- canonical doc missing active `Rationale`: `review`
- behavior doc missing `Current Behavior`: `review`
- contract doc missing `Contract Surface` or all contract-detail sections: `review`
- architecture doc missing both `Boundaries` and `Components`: `review`
- workflow doc missing `Triggers` or `Execution Model`: `review`
- operations doc missing both `Runtime Topology` and `Configuration`: `review`
- test-behavior doc missing `Execution Model` or both `Fixtures And Data Model` and `Assertions And Invariants`: `review`

### Generated Surfaces

Generated-surface checks compare configured installed workflow files against the current renderer output.

For managed instruction files such as `AGENTS.md` and `CLAUDE.md`, content comparison and version-marker checks are scoped to the Truthmark-managed block. Manual text outside that block is preserved and ignored by the generated-surface validator.

Current severity behavior:

- configured generated surface missing: `review`
- configured generated surface content stale: `review`
- generated Truthmark version marker differs from the current package version: `review`

### Freshness

Freshness checks run only when `--base <ref>` is supplied.

Current severity behavior:

- changed functional code with no route owner: `review`
- changed public API with no affected truth document: `review`
- changed public API with affected truth docs that were not changed in the impact set: `review`
- invalid base ref or failed base comparison: `error`

### Source Traceability

Source traceability checks run whenever configured truth docs can be loaded; they are not gated on `--base <ref>`. They verify that truth-doc final `Source References` entries and optional evidence blocks still point at live checkout material. Fenced YAML is treated as an evidence block only when it contains a top-level `evidence:` marker, so illustrative non-evidence YAML examples are ignored even when malformed. They do not prove claim semantics.

Current severity behavior:

- deleted `Source References` or evidence reference: `error`
- `Source References` glob reference with no matching files: `error`
- evidence reference outside the repository root: `error`
- missing evidence symbol, invalid evidence span, or stale evidence hash: `error`
- evidence line spans are validated even when the evidence block does not include a content hash

## Flows And States

`truthmark check` follows this validation flow:

1. Resolve the active repository and worktree.
2. Load `.truthmark/config.yml` and configured authority roots.
3. Build branch-scope metadata and relevant-file hashes for the current checkout.
4. Run configured authority, area, frontmatter, link, generated-surface, source-traceability, coverage, decision-structure, and topology diagnostics.
5. Render either human-readable output or the shared JSON command envelope.

The command does not run Truth Sync, Truth Preview, Truth Realize, Truth Structure, or Truth Check workflows. It only reports the current repository-truth health it can derive from local checkout state.

## Contracts

- human output reports the number of `error` and `review` diagnostics
- JSON output returns the shared command envelope
- JSON output includes `data.branchScope`
- JSON output includes `data.truthVisibility`
- JSON output includes `data.scorecard` with `schemaVersion: truthmark-scorecard/v0`
- JSON output includes `data.impactSet` only when `--base <ref>` is supplied
- JSON output does not include workflow payloads

`data.scorecard` is a compact Truth Health Scorecard over the same raw diagnostics returned at top level. It includes seven dimensions: `routing-coverage`, `ownership-clarity`, `source-traceability`, `branch-freshness`, `generated-surface-freshness`, `truth-doc-structure`, and `decision-rationale-preservation`. Each dimension contains `id`, categorical `status`, and `diagnosticIndexes`; non-pass dimensions may include capped short `evidence`. `diagnosticIndexes` always point into the final returned `diagnostics` array, so raw diagnostics remain the source of full messages, files, severities, and machine data.

Status derivation is deterministic: any mapped `error` diagnostic makes the dimension `fail`, mapped non-error diagnostics make it `warn`, no mapped diagnostics after the relevant checker ran makes it `pass`, and unavailable or skipped context makes it `not-run`. `branch-freshness` is `not-run` when `--base` is omitted. Missing or invalid config still returns a parseable check envelope with `data.scorecard`; dimensions affected by config errors fail or report not-run instead of being omitted.

Pass 4 keeps workflow-state scorecard exposure deferred: `truthmark check --json` has the scorecard, but `workflow status` and generated playbooks do not receive `data.workflowState.scorecard` in this change.

Branch scope identifies the active checkout:

- normal branches use branch name plus HEAD SHA
- detached checkouts use the commit SHA
- worktree path is reported separately for parallel worktrees
- relevant file hashes track `.truthmark/config.yml`, the configured root route index, and configured child route files

- `error` means the current routing or contract is invalid and should be fixed before relying on the docs tree.
- `review` means the tree is usable, but maintainers should decide whether the reported gap is intentional.

## Product Decisions

- `truthmark check` validates current truth health, but installed workflows remain agent-led and do not depend on the binary.
- Area resolution follows the configured hierarchy contract instead of assuming a flat current-behavior-doc tree.
- Decision-bearing canonical docs are part of truth health because missing rationale weakens future reconstruction.
- Topology pressure is handled by Truth Structure rather than by asking teams to manually maintain truth-folder shape.
- Branch-scope data is advisory metadata for the current checkout; it is not a cache, packet, or off-repo memory layer.
- Decision (2026-05-13): Branch-scope hashes follow the committed config and route files rather than a separate root workflow note.

## Rationale

Keeping check config-aware makes the validator match the installed workflow model. Treating decision sections as review-level diagnostics improves doc quality without blocking routine work on every missing explanation in one step.

Keeping check non-orchestrating means repositories can use it in local audits or CI without turning Truthmark into the workflow runner.

Keeping topology repair in generated agent workflows preserves portability: a repository with committed Truthmark surfaces remains usable in AI environments that cannot run the Truthmark CLI.

## Non-Goals

- `truthmark check` is not a workflow orchestrator.
- `truthmark check` is not the runtime for installed agent skills, prompts, or commands.
- `truthmark check` does not rewrite truth docs, route files, generated surfaces, or functional code.
- Passing `truthmark check` does not prove every truth doc already matches the latest template taxonomy.

## Maintenance Notes

Primary implementation files:

- `src/checks/check.ts`
- `src/checks/scorecard.ts`
- `src/checks/authority.ts`
- `src/checks/areas.ts`
- `src/checks/frontmatter.ts`
- `src/checks/links.ts`
- `src/checks/branch-scope.ts`

Update this doc when check diagnostics, JSON data shape, branch-scope behavior, generated-surface diagnostics, topology diagnostics, or severity rules change.

## Source References

- ../../../src/config/load.ts
- ../../../src/checks/check.ts
- ../../../src/checks/scorecard.ts
- ../../../src/checks/authority.ts
- ../../../src/checks/areas.ts
- ../../../src/checks/branch-scope.ts
- ../../../src/freshness/check.ts
- ../../../src/impact/build.ts
- ../../../src/evidence/validate.ts
- ../../../src/evidence/parse.ts
- ../../../src/checks/frontmatter.ts
- ../../../src/checks/links.ts
- ../../../src/markdown/discovery.ts
- ../../../src/routing/areas.ts
