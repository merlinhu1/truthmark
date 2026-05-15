---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-05-14
source_of_truth:
  - ../../src/checks/check.ts
  - ../../src/checks/authority.ts
  - ../../src/checks/areas.ts
  - ../../src/checks/branch-scope.ts
  - ../../src/freshness/check.ts
  - ../../src/impact/build.ts
  - ../../src/evidence/validate.ts
  - ../../src/checks/frontmatter.ts
  - ../../src/checks/links.ts
  - ../../src/markdown/discovery.ts
---

# Check Diagnostics

## Scope

This document describes the current behavior of `truthmark check`.

## Current Behavior

`truthmark check` is validation tooling. It is not the runtime for Truth Sync, Truth Realize, Truth Structure, or Truth Check skills, and it is not a CI-style merge gate by default.

The command:

1. resolves the active repository and worktree
2. computes branch-scope metadata
3. loads `.truthmark/config.yml`
4. runs authority, area, decision-structure, frontmatter, internal-link, generated-surface, and coverage diagnostics when config is valid
5. when `--base <ref>` is supplied, builds an ImpactSet and adds freshness diagnostics for changed code without route ownership, stale evidence, invalid base comparisons, and changed public API without docs sync
6. returns a human summary or the shared JSON envelope

There is no supported `--workflow` helper mode. Agent workflows inspect the checkout directly and may run `truthmark check` only as optional validation.

The command reports repository truth health for the active checkout. It does not prepare mandatory workflow context, choose verification commands, or decide whether a coding task can finish.

`truthmark check` without `--base` keeps the existing checkout-health behavior and does not compute ImpactSet. `truthmark check --base <ref>` adds branch-impact freshness diagnostics and includes `data.impactSet` in JSON output.

Topology repair remains an installed workflow responsibility. `truthmark check` may expose routing or coverage symptoms, but AI agents must be able to perform Truth Structure directly from committed config, route files, docs, and implementation when the Truthmark binary is unavailable.

## Validation Passes

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

`Truth documents` may be expressed either as a legacy Markdown list of document paths or as a fenced YAML block with a `truth_documents` array of `{ path, kind }` entries. Explicit route metadata is authoritative and owns the section, so legacy list lines in the same section are ignored. Legacy lists fall back to path-based kind inference such as the configured truth root, `docs/truth/** -> behavior`, `docs/contracts/**` or `docs/api/** -> contract`, `docs/architecture/** -> architecture`, `docs/workflows/** -> workflow`, `docs/operations/** -> operations`, and `docs/testing/** -> test-behavior`. When an explicit route entry is a glob, Truthmark expands it to concrete truth document entries before frontmatter and doc-structure checks so the routed kind applies to every matched file.

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
- deleted `source_of_truth` or evidence reference: `error`
- `source_of_truth` glob reference with no matching files: `error`
- evidence reference outside the repository root: `error`
- missing evidence symbol, invalid evidence span, or stale evidence hash: `error`
- evidence line spans are validated even when the evidence block does not include a content hash

## Result Shape

- human output reports the number of `error` and `review` diagnostics
- JSON output returns the shared command envelope
- JSON output includes `data.branchScope`
- JSON output includes `data.truthVisibility`
- JSON output includes `data.impactSet` only when `--base <ref>` is supplied
- JSON output does not include workflow payloads

Branch scope identifies the active checkout:

- normal branches use branch name plus HEAD SHA
- detached checkouts use the commit SHA
- worktree path is reported separately for parallel worktrees
- relevant file hashes track `.truthmark/config.yml`, the configured root route index, and configured child route files

## Practical Meaning

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

## Primary Code Files

- `src/checks/check.ts`
- `src/checks/authority.ts`
- `src/checks/areas.ts`
- `src/checks/frontmatter.ts`
- `src/checks/links.ts`
- `src/checks/branch-scope.ts`
