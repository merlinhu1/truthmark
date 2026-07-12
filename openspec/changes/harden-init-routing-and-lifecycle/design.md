## Context

Truthmark installs repository-local documentation workflows and derives routing health from the active checkout. Three current implementation shortcuts violate the intended fail-closed behavior:

1. `instruction_targets` is an unrestricted string array. `renderGeneratedSurfaces` turns every configured value into a managed-block destination even though the selected platform already determines the appropriate instruction surface.
2. `checkAreas` discovers coverage candidates from `COVERAGE_SCAN_PATTERNS`. Functional code outside those conventional roots is invisible even though `classifyPath` would recognize it.
3. Generated-surface cleanup knows historical retired paths but not current paths owned by a platform that was later disabled. Init leaves those instructions active, and the product has no deterministic uninstall journey.

The implementation is a TypeScript/Node CLI. Repository files remain the runtime authority. The design must preserve the existing dirty checkout, including the unrelated deletion of `tests/package-files.test.ts`, and must not broaden Truthmark into a daemon, service, package-centered workflow runtime, topology engine, or lifecycle database.

## Goals / Non-Goals

**Goals:**

- Make platform selection the sole authority for managed instruction destinations so arbitrary config paths can never become write targets.
- Discover routing coverage candidates across the actual Git-visible checkout without parsing source bodies.
- Give Check, Init, and Uninstall one exact generated-surface ownership model.
- Make platform removal observable and safely reconcilable.
- Provide dry-run-first host integration uninstall while preserving authored repository truth and unrelated user files.
- Keep diagnostics, plans, and mutations deterministic and Git-reviewable.

**Non-Goals:**

- Semantic verification that documentation content matches implementation.
- A configurable source-root taxonomy or repository topology engine.
- Recursive deletion of host directories.
- Automatic deletion of authored truth, routes, templates, config, Portal presentation output, or retired Gemini files.
- Global npm package removal.
- A persistent generated-file ownership manifest, database, daemon, hosted service, plugin, or new workflow runtime.
- A breaking config migration for existing repositories that still contain `instruction_targets`.

## Decisions

### 1. Derive instruction files from platform selection

Remove `instruction_targets` from write routing. The generated-surface renderer derives managed instruction blocks from the selected hosts:

- `claude-code` owns `CLAUDE.md`;
- platforms whose repository-level contract uses the shared instruction file own `AGENTS.md`;
- existing host-specific canonical instruction surfaces, such as GitHub Copilot's repository instruction file, remain owned by their platform renderer;
- exact-path deduplication ensures several selected platforms sharing `AGENTS.md` produce one managed block;
- no selected platform means no generic managed instruction file.

The raw schema continues accepting `instruction_targets` for compatibility with existing version-2 configs, but loading never turns its values into destinations. Config, Check, or Init emits a review diagnostic that the field is ignored and platform selection controls placement. Newly generated configs omit the field. The resolved `TruthmarkConfig` no longer exposes arbitrary instruction target paths.

This fixes the corruption path at its source without introducing alias rules, filesystem identity checks, or a new allowlist. Existing managed-block logic still preserves user content outside Truthmark markers.

**Alternatives considered:**

- Restricting `instruction_targets` to an allowlist keeps a redundant user-facing routing choice and creates migration work.
- Rejecting the legacy field would make every generated version-2 config require a breaking migration.
- Continuing to honor custom paths preserves the arbitrary write defect.

### 2. Extract lightweight shared repository file discovery

Add `src/git/files.ts` with a narrow contract:

```ts
export const discoverRepositoryFilePaths = async (
  rootDir: string,
  ignorePatterns: string[],
): Promise<string[]>;
```

It reuses the current RepoIndex strategy:

- one NUL-delimited `git ls-files -z --cached --others --exclude-standard --deduplicate` process parsed without trimming legal filename bytes;
- existing full-tree `fast-glob` fallback when Git enumeration fails; the fallback applies Truthmark default/config ignores and may conservatively include paths excluded only by `.gitignore` because Git ignore semantics are unavailable;
- repository-relative `/` normalization;
- default and configured Truthmark ignores;
- containment, current-file existence, sorting, and deduplication;
- no file-body parsing.

`src/repo-index/file-tree.ts` consumes this primitive instead of owning duplicate discovery. `src/checks/areas.ts` removes `COVERAGE_SCAN_PATTERNS`, discovers all paths, and filters candidates with `classifyPath(path, config.ignore) === "functional-code"` plus an exported `isTestPath` predicate from `src/sync/classify.ts`.

The existing coverage diagnostic shape and review severity remain unchanged. Newly visible diagnostics naturally change `truthVisibility.unmappedSurfaceCount`, `routing-coverage`, and `ownership-clarity` through existing aggregation.

**Alternatives considered:**

- Calling `buildRepoIndex` from Check would reparse Markdown and package metadata and duplicate route work.
- Expanding the conventional-root list would leave the same blind-spot class.
- Adding a `test` path classification would alter Sync semantics beyond this fix; an exported predicate is narrower.

### 3. Derive lifecycle ownership from renderers, not broad directories

Extend generated-surface metadata so every current output can aggregate all claims that make the exact path desired:

```ts
type GeneratedSurfaceOwnerClaim =
  | { kind: "platform"; platform: TruthmarkPlatform }
  | { kind: "portal"; platform: TruthmarkPlatform }
  | { kind: "retired"; manualCleanupOnly: boolean };

type GeneratedSurfaceOwnership = {
  path: string;
  kind: "whole-file" | "managed-block";
  owners: readonly GeneratedSurfaceOwnerClaim[];
  content: string;
};
```

Exact-path deduplication merges owner claims rather than replacing earlier entries. A platform claim is active when that platform is configured; a Portal claim is active only when both its platform is configured and Portal is enabled; retired claims are never desired. Managed instruction blocks carry the claims of the platforms that derive them.

`src/templates/generated-surfaces.ts` remains the current-output authority and exposes:

- desired surfaces for the active config;
- an all-supported-platform catalog for the same workspace/config roots;
- Portal-enabled variants;
- platform-derived managed instruction surfaces.

`src/checks/generated-surfaces.ts` combines this catalog with the historical retired registry. It must never infer ownership from `.claude/**`, `.github/**`, or any other directory prefix.

No persistent manifest is added. Older or edited files that cannot be proven to match recognized generated content remain in place and receive manual-cleanup diagnostics.

**Alternatives considered:**

- A checked-in ownership manifest adds another lifecycle artifact that can become stale.
- Recursive host-directory deletion risks user data.
- Deleting every exact catalog path regardless of content is simpler but unsafe when users repurpose or edit a generated file.

### 4. Plan lifecycle mutations before applying any of them

Introduce shared lifecycle plan types in the generated-surface check/lifecycle module or a focused new module if size requires it:

```ts
type LifecyclePlanEntry = {
  path: string;
  action: "remove-file" | "remove-managed-block" | "preserve" | "manual-review";
  reason: string;
};

type LifecyclePlan = {
  schemaVersion: "truthmark-lifecycle/v0";
  mode: "dry-run" | "apply";
  entries: LifecyclePlanEntry[];
  diagnostics: Diagnostic[];
  applicable: boolean;
  applied: boolean;
};
```

Entries are sorted deterministically by path and action. Missing/invalid config, malformed markers, unsafe paths, or alias uncertainty produce an error plan with the requested valid mode, `applicable: false`, `applied: false`, a nonzero exit, and no writes. Supplying neither mode or both modes is rejected by CLI option validation before lifecycle planning, returns no `data.lifecyclePlan`, exits nonzero, and performs no writes. Diverged catalogued whole files produce `preserve` or `manual-review` entries but do not make the plan inapplicable; Apply removes other safe entries, leaves diverged files unchanged, returns review diagnostics, and exits successfully. Dry-run and Apply for the same checkout expose identical entries; only `mode` and `applied` differ.

Planning rules:

- Whole files are removable only when the exact path is catalogued and content matches a recognized generated rendering.
- A structurally valid managed block may be removed regardless of block freshness because the markers delimit Truthmark-owned content.
- One structural marker parser governs desired managed-block updates, inactive-block removal, Check diagnostics, and Uninstall; malformed markers in desired or inactive targets make the complete plan inapplicable before any mutation.
- If only whitespace remains after block removal, the file may be removed; otherwise surrounding bytes are preserved.
- Duplicate, nested, reversed, or unmatched markers are manual-review errors.
- Gemini paths are always preserved/manual.
- All paths pass worktree containment and symlink checks.
- The complete plan is preflighted before Init or Uninstall applies any lifecycle mutation.

Init ordering is:

1. load and validate config;
2. derive desired instruction and host surfaces from configured platforms;
3. render the lifecycle plan;
4. fail without writes if lifecycle planning has errors;
5. create/update desired scaffold and surfaces;
6. remove only safe inactive surfaces;
7. emit deterministic action/review diagnostics.

This preserves the current behavior where desired generated surfaces are refreshed while making disabled integrations convergent and idempotent.

### 5. Use Check as reconciliation preview and add explicit Uninstall modes

`truthmark check` reports inactive current surfaces, disabled Portal host outputs, historical retired paths, ambiguous blocks, diverged generated files, and Gemini manual-cleanup paths. Review diagnostics remain non-destructive.

Add a public command:

```text
truthmark uninstall --dry-run [--json]
truthmark uninstall --apply [--json]
```

Exactly one mode is required. Both modes build the same sorted plan. Dry-run emits it without changing bytes, modes, or Git status. Apply first preflights the full plan and then executes only safe host-surface removals.

Uninstall deliberately preserves:

- `.truthmark/config.yml`;
- configured route files;
- product and engineering truth;
- editable templates;
- Portal presentation output;
- `GEMINI.md` and `.gemini/**`;
- unrelated files beneath host directories;
- content outside Truthmark markers.

It does not remove a globally installed npm package. The user guide explains the separate package-manager step and manual deletion choices for repositories that also want to remove preserved truth/config after review.

Missing or invalid config prevents automatic uninstall because current workspace roots and generated renderings cannot be proven. The command returns a deterministic manual-cleanup inventory instead of guessing.

**Alternatives considered:**

- Separate `clean`, `prune`, and `uninstall` commands create overlapping lifecycle semantics.
- `init --uninstall` hides a distinct destructive intent.
- Defaulting uninstall to mutation is too risky; explicit dry-run/apply modes are scriptable and reviewable.

### 6. Documentation and release behavior follow current owners

Implementation updates the nearest routed current-truth owners for Init, Check, generated host surfaces, repository intelligence, and the public CLI. Adding `uninstall` also updates the root README and all localized storefront READMEs under repository policy.

The instruction-routing correction is compatibility-preserving at the config-schema level: existing `instruction_targets` fields continue to parse but no longer authorize writes. It therefore does not force a major release. Final version selection follows the repository's normal release policy for the complete pending payload. The versioned change note describes platform-derived instruction placement, the ignored legacy field, routing discovery, lifecycle reconciliation, and uninstall. Release verification remains blocked until the unrelated deleted `tests/package-files.test.ts` is resolved by its owner; this change must not restore or rewrite it silently.

## Product Boundary Check

- **North Star improved:** agent instructions cannot overwrite unrelated repository files, routing health sees actual functional code, and disabled host guidance no longer silently remains active.
- **In-scope surfaces changed:** local config validation, Init, Check, RepoIndex discovery, generated host outputs, managed instruction blocks, and an optional maintenance CLI command.
- **Adjacent drift avoided:** no topology engine, requirements system, daemon, database, hosted service, plugin, MCP server, hidden memory, workflow executor, or persistent lifecycle manifest.
- **Required runtime:** none is added. Installed agent workflows continue operating from repository files when the CLI is unavailable. Check, Init, and Uninstall remain optional local maintenance helpers.
- **Allowed writes:** exact platform-derived generated surfaces, their managed instruction blocks, and exact safely proven inactive generated files or blocks.
- **Forbidden writes:** any path sourced from `instruction_targets`; source/package/config files through instruction injection; authored routes/truth/templates; Portal presentation output; Gemini files; unrelated host-directory files; content outside markers; paths outside the active worktree.
- **Fail-closed states:** invalid config, ambiguous routing ownership, malformed managed markers, diverged generated content, lifecycle containment uncertainty, or incomplete uninstall mode selection.
- **Boundary regression evidence:** config/init platform-routing tests, repository-wide coverage fixtures, generated-surface inventory tests, dry-run/apply parity tests, CLI parser/help tests, canonical truth docs, and product-boundary assertions.

## Risks / Trade-offs

- **Existing configs retain a now-ignored field** → keep parsing it, emit actionable guidance, never use it as a destination, and omit it from newly generated configs.
- **Repository-wide discovery exposes many previously hidden unmapped files** → retain review severity and existing ignore controls; document that tracked generated/example code needs explicit ignore or routing.
- **Git-visible scanning increases work on large repositories** → enumerate once, avoid body parsing, share discovery with RepoIndex, keep deterministic linear filtering, and avoid wall-clock tests.
- **Exact-content deletion leaves stale edited host files active** → preserve data and emit manual-cleanup diagnostics rather than choosing destructive convenience.
- **Lifecycle catalog can drift from renderer entrypoints** → derive catalog entries from renderer functions and add a matrix test proving every emitted platform/Portal path is represented.
- **Preflight followed by mutation has a filesystem race window** → recheck containment and destination type immediately at each write/removal sink; fail on changed assumptions.
- **Localized README scope is large** → keep the storefront addition to a short uninstall pointer and place detailed procedure in `docs/user-guide.md`.

## Migration Plan

1. Ship platform-derived instruction routing before any legacy target can reach a write path.
2. Existing repositories may remove `instruction_targets` after reviewing the compatibility diagnostic; no immediate config rewrite is required.
3. Existing repositories that disable a platform run Check to preview inactive paths, then Init to remove safely recognized generated surfaces.
4. Repositories leaving Truthmark run Uninstall dry-run, inspect preserved/manual entries, then run apply. Authored truth and config remain until the maintainer explicitly removes them.
5. Rollback of routing discovery or lifecycle behavior MUST NOT reintroduce `instruction_targets` as write destinations.

## Open Questions

None.