---
status: active
doc_type: contract
truth_kind: contract
last_reviewed: 2026-06-01
source_of_truth:
  - ../../../src/config/schema.ts
  - ../../../src/checks/check.ts
  - ../../../src/checks/scorecard.ts
  - ../../../src/templates/init-files.ts
  - ../../../src/templates/generated-surfaces.ts
  - ../../../src/init/init.ts
  - ../../../src/output/diagnostic.ts
  - ../../../src/output/render.ts
  - ../../../src/cli/handlers.ts
  - ../../../src/cli/program.ts
  - ../../../src/agents/workflow-helper-validation.ts
---

# Contracts

## Purpose

This document protects Truthmark machine-facing contracts: configuration, route metadata, CLI JSON envelopes, command result data, diagnostics, compatibility, and migration behavior.

## Scope

This document defines the current machine-facing contracts exposed by Truthmark: the config file shape, route metadata, repository-intelligence artifacts, and the CLI result envelope.

## Contract Surface

- The committed `.truthmark/config.yml` schema and defaults.
- Route metadata under `docs/truthmark/routes/areas.md` and delegated child route files.
- The JSON result envelope emitted by human/setup commands such as `truthmark config` and `truthmark init`, agent/context commands such as `truthmark check`, `truthmark index`, `truthmark impact`, `truthmark context`, and `truthmark workflow status`, and workflow helper validator commands under `truthmark validate`.

## Inputs

- Committed config fields under `.truthmark/config.yml`.
- Routed truth-document metadata from `docs/truthmark/routes/areas.md` and `docs/truthmark/routes/areas/**/*.md`.
- CLI options such as `--json`, `--stdout`, and command-specific flags.

Truthmark loads `.truthmark/config.yml` and validates it against the current schema.

Current fields:

- `version`: must be `2`
- `platforms`: optional list of agent harnesses to initialize; defaults to all supported platforms
- `truthmark.workspace`: workspace root for Truthmark-owned routing, truth, templates, and generated output
- `truthmark.routes.index`: root area index path relative to `truthmark.workspace`
- `truthmark.routes.areas`: child route directory relative to `truthmark.workspace`
- `truthmark.routes.default_area`: default child route file basename used by scaffold
- `truthmark.routes.max_delegation_depth`: currently must be `1`
- fixed truth lanes: product truth lives under `product/` and engineering truth under `engineering/` relative to `truthmark.workspace`
- `truthmark.templates.root`: template root relative to `truthmark.workspace`
- `truthmark.generated.portal.enabled`: whether `truthmark init` renders optional Portal workflow surfaces
- `instruction_targets`: files that receive installed instructions; defaults to `AGENTS.md`
- `frontmatter.required`: frontmatter fields that produce `error` diagnostics when missing
- `frontmatter.recommended`: frontmatter fields that produce `review` diagnostics when missing
- `ignore`: glob patterns excluded from relevant checks and routing logic

The default derived controlled paths include:

- `docs/truthmark/routes/areas.md`
- `docs/truthmark/routes/areas/**/*.md`
- `docs/truthmark/product/**/*.md`
- `docs/truthmark/engineering/**/*.md`
- `docs/truthmark/templates/*.md`

Route files may express `Truth documents` in either of these forms:

- a legacy Markdown list of document paths
- a fenced YAML block with a `truth_documents` array of `{ path, kind }` entries

New scaffolded child route files use the fenced YAML form so routed truth kind is explicit from the first generated route. The legacy list form remains a compatibility input for existing repositories.

Markdown list values normalize Prettier-escaped glob stars before route matching, so formatted entries such as `src/example/\*\*` are treated as `src/example/**`.

Supported routed truth kinds are:

- `behavior`
- `contract`
- `architecture`
- `workflow`
- `operations`
- `test-behavior`

When explicit `kind` metadata is present, it is the authoritative routed kind and the fenced metadata block owns the `Truth documents` section. Legacy list lines in the same section are ignored. When route files use the legacy list form, Truthmark falls back to path-based kind inference such as `docs/truthmark/product/** -> product-capability`, `docs/truthmark/engineering/** -> engineering-behavior`, `docs/truthmark/engineering/contracts/** -> engineering-contract`, `docs/truthmark/engineering/architecture/** -> engineering-architecture`, `docs/truthmark/engineering/workflows/** -> engineering-workflow`, `docs/truthmark/engineering/operations/** -> engineering-operations`, and `docs/truthmark/engineering/tests/** -> engineering-test-behavior`.

Canonical truth docs may include optional `truth_kind` frontmatter. When present, it must match the routed kind.

Supported `platforms` values are:

- `codex`
- `opencode`
- `claude-code`
- `github-copilot`
- `gemini-cli`

There is no `.truthmark/local.yml` contract in the current implementation. User preferences that affect generated repository behavior must be expressed through committed config or the generated surfaces cannot be reproduced by another checkout.

## Outputs

`truthmark config`, `truthmark init`, `truthmark check`, and `truthmark validate ...` commands return the same JSON envelope when run with `--json`.

Current shape:

- `command`: string command name
- `summary`: human-readable summary string
- `diagnostics`: array of diagnostic objects
- `data`: optional command-specific object

Diagnostic fields:

- `category`: one of `config`, `authority`, `frontmatter`, `links`, `area-index`, `coverage`, `truth-sync`, `realization`, `doc-structure`, `generated-surface`, `repo-index`, `impact`, `freshness`, `context-pack`, or `workflow-state`
- `severity`: one of `info`, `action`, `review`, or `error`
- `message`: human-readable detail
- `file`: optional repository-relative file path
- `area`: optional area name from `docs/truthmark/routes/areas.md`
- `data`: optional machine-readable extras

Human-rendered output is intended for people. JSON output is the machine-facing contract. CLI invocations that render a `CommandResult` set a non-zero process exit code when any diagnostic has `severity: "error"`; `info`, `action`, and `review` diagnostics do not make the process fail.

`truthmark index --json` returns `data.repoIndex` with `schemaVersion: repo-index/v0` and `data.routeMap` with `schemaVersion: route-map/v0`.

`truthmark check --json` returns `data.branchScope`, the compatibility `data.truthVisibility` summary, and `data.scorecard` with `schemaVersion: truthmark-scorecard/v0`. The scorecard is additive triage over the same top-level `diagnostics` array; raw diagnostics remain authoritative and keep their existing shape. `data.impactSet` is included only when `--base <ref>` is supplied.

The Truth Health Scorecard dimensions are compact runtime objects:

- `id`: one of `routing-coverage`, `ownership-clarity`, `source-traceability`, `branch-freshness`, `generated-surface-freshness`, `truth-doc-structure`, or `decision-rationale-preservation`
- `status`: `pass`, `warn`, `fail`, or `not-run`
- `diagnosticIndexes`: indexes into the same raw `diagnostics` array returned by the command
- `evidence`: optional, capped short snippets for non-pass states only

Scorecard statuses are categorical: mapped `error` diagnostics produce `fail`; mapped non-error diagnostics produce `warn`; a dimension whose relevant checker ran with no mapped diagnostics produces `pass`; and unavailable or intentionally skipped context produces `not-run`. `branch-freshness` is `not-run` when `truthmark check` runs without `--base`, rather than `pass` just because freshness diagnostics did not run. Pass 4 does not add a scorecard command, numeric health grade, generated-playbook payload, or `data.workflowState.scorecard`.

`truthmark impact --base <ref> --json` returns `data.impactSet` with `schemaVersion: impact-set/v0`.

`truthmark context --workflow <workflow> [--base <ref>] --json` returns a shared command envelope with `data.markdown` and `data.summary`; it never returns `data.contextPack`, `truthDocs[*].content`, or `sourceFiles[*].content`. `--workflow` accepts `truth-sync`, `truth-document`, and `truth-realize`. The default format is `markdown`, and `--format markdown` renders a deterministic Markdown ContextPack for human review when `--json` is not used. `--format json` returns a `context-pack` error diagnostic because JSON ContextPack output was removed in v2.

`truthmark workflow status --workflow <workflow-id> [--base <ref>] --json` returns `command: "workflow status"`, `data.request`, and manifest-only `data.workflowState` with nested `schemaVersion: truthmark-workflow/v0`. It is retained for status-only/debug inspection. `data.request.workflow` records the caller-supplied canonical workflow ID, and `data.request.base` records the caller-supplied comparison ref when present. The WorkflowState schema is not extended for request metadata unless a later explicit schema change does so.

Workflow status accepts full manifest workflow IDs such as `truthmark-sync` and `truthmark-check`. Short ContextPack aliases such as `truth-sync` are rejected and are not mapped to full manifest IDs. Missing `--workflow` or unknown workflow IDs return a parseable `CommandResult` JSON envelope with a `workflow-state` error diagnostic, a non-zero exit code, and no workflow state or permissive write-boundary payload.

`workflow status` is an agent-facing repository-intelligence command for status-only/debug inspection. Default JSON preserves schema version, workflow ID, applicability, action context and write boundaries, changed files, affected routes, target truth docs, diagnostics, checks, next steps, report sections, and helper validation command metadata. WorkflowState does not include `workflowState.contextPack`, truth document content, source file content, or a full route map.

Workflow helper validators are optional CLI-owned accelerators used by generated skill `helper-manifest.yml` files. They validate report text or lease/path inputs that agents provide after doing checkout inspection; they do not grant workflow write authority and do not replace route files, source files, truth docs, or parent workflow validation.

Current helper validator commands:

- `truthmark validate sync-report <report-file> --json`
- `truthmark validate document-report <report-file> --json`
- `truthmark validate write-lease <lease-or-report-file> <changed-files-file> --json`

`truthmark validate write-lease` parses the lease/report file as YAML before validation. The accepted YAML shape is either a top-level write-lease object or a worker report with a nested `writeLease` or `lease` object. The selected object must provide `allowedWrites` and `forbiddenWrites` as arrays of strings. After structural parsing, the validator applies the same path-safety, supported-pattern, allowed-write, and forbidden-write checks to parsed values and changed files.

Each validator returns `data.validation` as one of:

- `{ ok: true, helper: string, checks: string[] }`
- `{ ok: false, helper: string, errors: string[] }`

The command summary is `Validation passed` when `ok` is true and `Validation failed` when `ok` is false. Missing input files return `ok: false` validation data for the requested helper instead of a generated surface payload. Human output renders the same pass/fail summary and helper checks/errors.

RepoIndex, RouteMap, ImpactSet, and ContextPack are derived from the active checkout. They do not override route files, source files, truth docs, or installed workflow write boundaries.

`truthmark config --json` writes only `.truthmark/config.yml` unless `--stdout` is used.

Current config result data fields include:

- `repositoryRoot`
- `worktreePath`
- `branchName`
- `isDetached`
- `isUnborn`

When `--stdout` is used, `data` also includes:

- `path`
- `content`

`truthmark init --json` currently returns these data fields:

- `repositoryRoot`
- `worktreePath`
- `branchName`
- `isDetached`
- `isUnborn`

The command emits `action` diagnostics describing whether each scaffolded file was created, updated, or unchanged. Generated realization skill files use the `realization` diagnostic category.

`truthmark init` requires an existing valid `.truthmark/config.yml`. It does not create config; `truthmark config` is the required first step in a new repository.
Configured `instruction_targets` are generated or refreshed independently of platform-specific surfaces, so `AGENTS.md` remains managed even when `claude-code` is not in `platforms`.

Generated Truth Structure, Truth Document, Truth Sync, Truth Preview, Truth Check, Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode verifier or leased doc-writer agent surfaces, and the managed `AGENTS.md` block use the `truth-sync` diagnostic category.

Current agent-native scaffold targets include:

- `.agents/skills/truthmark-structure/SKILL.md`
- `.agents/skills/truthmark-structure/agents/openai.yaml`
- `.agents/skills/truthmark-document/SKILL.md`
- `.agents/skills/truthmark-document/agents/openai.yaml`
- `.agents/skills/truthmark-sync/SKILL.md`
- `.agents/skills/truthmark-sync/agents/openai.yaml`
- `.agents/skills/truthmark-realize/SKILL.md`
- `.agents/skills/truthmark-realize/agents/openai.yaml`
- `.agents/skills/truthmark-check/SKILL.md`
- `.agents/skills/truthmark-check/agents/openai.yaml`
- `.agents/skills/truthmark-preview/SKILL.md`
- `.agents/skills/truthmark-preview/agents/openai.yaml`
- `.agents/skills/truthmark-portal/SKILL.md` when Truthmark Portal is enabled
- `.agents/skills/truthmark-portal/agents/openai.yaml` when Truthmark Portal is enabled
- `.agents/skills/truthmark-*/support/procedure.md`
- `.agents/skills/truthmark-*/support/report-template.md`
- `.agents/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.agents/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.agents/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.codex/agents/truth-route-auditor.toml`
- `.codex/agents/truth-claim-verifier.toml`
- `.codex/agents/truth-doc-reviewer.toml`
- `.codex/agents/truth-doc-writer.toml`
- `.claude/skills/truthmark-structure/SKILL.md`
- `.claude/skills/truthmark-document/SKILL.md`
- `.claude/skills/truthmark-sync/SKILL.md`
- `.claude/skills/truthmark-realize/SKILL.md`
- `.claude/skills/truthmark-check/SKILL.md`
- `.claude/skills/truthmark-preview/SKILL.md`
- `.claude/skills/truthmark-portal/SKILL.md` when Truthmark Portal is enabled
- `.claude/skills/truthmark-*/support/procedure.md`
- `.claude/skills/truthmark-*/support/report-template.md`
- `.claude/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.claude/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.claude/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.claude/agents/truth-route-auditor.md`
- `.claude/agents/truth-claim-verifier.md`
- `.claude/agents/truth-doc-reviewer.md`
- `.claude/agents/truth-doc-writer.md`
- `.opencode/skills/truthmark-structure/SKILL.md`
- `.opencode/skills/truthmark-document/SKILL.md`
- `.opencode/skills/truthmark-sync/SKILL.md`
- `.opencode/skills/truthmark-realize/SKILL.md`
- `.opencode/skills/truthmark-check/SKILL.md`
- `.opencode/skills/truthmark-preview/SKILL.md`
- `.opencode/skills/truthmark-portal/SKILL.md` when Truthmark Portal is enabled
- `.opencode/skills/truthmark-*/support/procedure.md`
- `.opencode/skills/truthmark-*/support/report-template.md`
- `.opencode/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.opencode/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.opencode/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.opencode/agents/truth-route-auditor.md`
- `.opencode/agents/truth-claim-verifier.md`
- `.opencode/agents/truth-doc-reviewer.md`
- `.opencode/agents/truth-doc-writer.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/skills/truthmark-structure/SKILL.md`
- `.github/skills/truthmark-document/SKILL.md`
- `.github/skills/truthmark-sync/SKILL.md`
- `.github/skills/truthmark-realize/SKILL.md`
- `.github/skills/truthmark-check/SKILL.md`
- `.github/skills/truthmark-preview/SKILL.md`
- `.github/skills/truthmark-portal/SKILL.md` when Truthmark Portal is enabled
- `.github/skills/truthmark-*/support/procedure.md`
- `.github/skills/truthmark-*/support/report-template.md`
- `.github/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.github/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.github/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.github/prompts/truthmark-structure.prompt.md`
- `.github/prompts/truthmark-document.prompt.md`
- `.github/prompts/truthmark-sync.prompt.md`
- `.github/prompts/truthmark-realize.prompt.md`
- `.github/prompts/truthmark-check.prompt.md`
- `.github/prompts/truthmark-preview.prompt.md`
- `.github/prompts/truthmark-portal.prompt.md` when Truthmark Portal is enabled
- `.github/agents/truth-route-auditor.md`
- `.github/agents/truth-claim-verifier.md`
- `.github/agents/truth-doc-reviewer.md`
- `.github/agents/truth-doc-writer.md`
- `GEMINI.md`
- `.gemini/skills/truthmark-structure/SKILL.md`
- `.gemini/skills/truthmark-document/SKILL.md`
- `.gemini/skills/truthmark-sync/SKILL.md`
- `.gemini/skills/truthmark-realize/SKILL.md`
- `.gemini/skills/truthmark-check/SKILL.md`
- `.gemini/skills/truthmark-preview/SKILL.md`
- `.gemini/skills/truthmark-portal/SKILL.md` when Truthmark Portal is enabled
- `.gemini/skills/truthmark-*/support/procedure.md`
- `.gemini/skills/truthmark-*/support/report-template.md`
- `.gemini/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.gemini/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.gemini/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.gemini/commands/truthmark/structure.toml`
- `.gemini/commands/truthmark/document.toml`
- `.gemini/commands/truthmark/sync.toml`
- `.gemini/commands/truthmark/realize.toml`
- `.gemini/commands/truthmark/check.toml`
- `.gemini/commands/truthmark/preview.toml`
- `.gemini/commands/truthmark/portal.toml` when Truthmark Portal is enabled
- `.gemini/agents/truth-route-auditor.md`
- `.gemini/agents/truth-claim-verifier.md`
- `.gemini/agents/truth-doc-reviewer.md`
- `.gemini/agents/truth-doc-writer.md`

Generated `SKILL.md` files use closed YAML frontmatter with `name`, `description`, `argument-hint`, `user-invocable`, and `truthmark-version` fields so Codex-style, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode-style skill indexers can parse every generated workflow surface. For those skill-package hosts, `SKILL.md` is the compact routing and quick-procedure entrypoint; detailed procedure text, report templates, and subagent or lease reference material live in generated sibling `support/*.md` files. Public workflow entrypoints, generated GitHub Copilot prompt files, and generated Gemini command files use checked-in workflow text as the execution contract: agents inspect the checkout directly, open progressive-disclosure support files only when needed, and use local CLI checks only as focused validation after relevant work has been performed. Helper-capable workflows also emit `helper-manifest.yml` and `support/helper-policy.md` files that call installed `truthmark validate ... --json` CLI validators; generated packages do not bundle repo-local helper scripts. Generated Copilot prompt files use `.github/prompts/*.prompt.md` files with `agent` and `description` frontmatter so supported Copilot IDEs can expose `/truthmark-*` prompts. Generated verifier agents are read-only and context-bounded to parent-assigned shards, while generated `truth-doc-writer` agents are write-capable only through parent-provided leases and parent diff validation. Generated Codex metadata includes a `truthmark.version` marker plus `truthmark.refresh_command: "truthmark init"`. Managed instruction blocks also render the Truthmark package version, and `package.json` is the single maintained version source for those markers. Generated Gemini command files use project-scoped TOML custom commands so `truthmark init` can install `/truthmark:structure`, `/truthmark:document`, `/truthmark:sync`, `/truthmark:preview`, `/truthmark:realize`, and `/truthmark:check` alongside `GEMINI.md`; each command prompt ends with an explicit `User focus or arguments: {{args}}` handoff. Re-running `truthmark init` after a package upgrade refreshes configured committed surfaces and exposes staleness through ordinary Git diffs. Removing a platform from config stops future refreshes for that platform; it does not delete previously generated files.

The OpenCode `truth-doc-writer` edit allow-list is rendered from the active `truthmark.workspace`, fixed product and engineering truth lanes, `truthmark.routes.index`, and `truthmark.routes.areas` config paths so valid leases remain writable when the Truthmark workspace moves.

`truthmark check --json` returns:

- `branchScope`
- `truthVisibility`

`branchScope` contains:

- `repositoryRoot`
- `worktreePath`
- `branchName`
- `headSha`
- `identity`
- `relevantFileHashes`

For normal branches, `identity` is branch name plus HEAD SHA. For detached checkouts, `identity` is the commit SHA. `worktreePath` remains separate so callers can distinguish parallel worktrees for the same repository.

`relevantFileHashes` currently tracks hashes for:

- `.truthmark/config.yml`
- the configured root route index
- configured child route files under the configured area-files root

`truthVisibility` contains:

- `routePrecision.leafAreaCount`
- `routePrecision.broadAreaCount`
- `unmappedSurfaceCount`
- `staleGeneratedSurfaceCount`
- `syncCompletenessIssueCount`
- `topologyPressureCount`

## Errors And Diagnostics

- ordinary `truthmark check` emits `config`, `authority`, `frontmatter`, `links`, `area-index`, `coverage`, `doc-structure`, and `generated-surface` diagnostics.
- `truth-sync` and `realization` categories exist for init and generated workflow reporting, but ordinary `check` does not emit workflow payloads.
- `truthmark check` does not support `--workflow truth-sync` in the current contract.
- Missing authority files are `error` diagnostics.
- Authority globs and code-surface globs that match nothing are `review` diagnostics.
- Coverage diagnostics discover unmapped functional code across common code roots with the same path classifier used by Truth Sync. V1 coverage must include Go, Python, C#, Java, JavaScript, TypeScript, frontend roots, monorepo app or package roots, Terraform, Kubernetes manifests, CI workflows, OpenAPI or Swagger, GraphQL, and protobuf surfaces within those roots.
- `frontmatter` emits `error` diagnostics when `truth_kind` is invalid or present and disagrees with routed truth-kind metadata.
- `doc-structure` emits `review` diagnostics when configured architecture or routed truth docs are missing `Scope`, active `Product Decisions`, active `Rationale`, or the kind-specific required headings for their routed truth kind.

## Compatibility Rules

- `version` remains `2` in the committed config contract.
- Product and engineering truth lane names are fixed as `product/` and `engineering/` under `truthmark.workspace`; custom truth lane roots are unsupported config.
- Repositories refresh generated workflow surfaces through `truthmark init`; removing a platform from config stops future refreshes but does not delete previously generated files.
- Truth Realize has no config switch; selected platforms receive its explicit manual workflow surface.
- Portal config lives at `truthmark.generated.portal`. Generated defaults include only `enabled: false`; Portal output is derived as `${truthmark.workspace}/generated/portal`, and the Portal template path is derived as `${truthmark.workspace}/templates/portal.html`.
- Custom Portal output and template properties are unsupported. Portal output and template paths are fixed by Truthmark and are not configurable.
- There is no `.truthmark/local.yml` compatibility surface in the current implementation.

## Versioning And Migration

- The committed config contract is `version: 2` with a required `truthmark.workspace` hierarchy.
- Route metadata accepts both legacy Markdown truth-document lists and fenced YAML `truth_documents` arrays for compatibility with existing repositories.
- Repositories refresh generated workflow surfaces and templates through `truthmark init`; removing a platform from config stops future refreshes but does not delete previously generated files.
- New command data fields should be additive where possible and remain nested under the shared command envelope.
- Helper validators must keep helper-specific data under `data.validation` rather than returning raw validator payloads at the top level.

## Product Decisions

- The committed config file owns the documentation hierarchy contract, while route files own domain-to-doc mappings.
- `truthmark config` and `truthmark init` are separate contracts so repositories can review hierarchy before workflow installation.
- Active decisions stay in the canonical doc they govern instead of in separate timestamped decision logs. Date active decisions inline when added or changed.
- The V1 user-facing CLI surface is `config`, `init`, `check`, `index`, `impact`, `context`, agent-facing `workflow status`, and optional helper `validate` subcommands; workflow execution verbs such as `sync`, `realize`, `structure`, `audit`, `packet`, `review`, `scan`, `doctor`, and `build` are not top-level commands.
- `gemini-cli` installs hierarchical `GEMINI.md` context, Agent Skills under `.gemini/skills/`, project-scoped `.gemini/commands/truthmark/*.toml` custom commands, and project subagents under `.gemini/agents/` so Gemini users get explicit workflow entrypoints and bounded delegation without adding top-level CLI verbs.
- Generated public workflow entrypoints, GitHub Copilot prompts, and Gemini commands do not consume a live workflow-instructions contract before acting; `workflow status` is retained for status-only/debug inspection, and support files remain progressive-disclosure fallback references.
- Decision (2026-05-14): Truth Realize is manually invoked through installed workflow surfaces and is not controlled by `realization.enabled` or any other config key.

## Rationale

Separating config from init keeps repository layout reviewable and predictable. Keeping decisions with the owning behavior, contract, or architecture doc prevents agents from having to infer which historical note is still active.

Keeping workflow execution verbs out of the CLI preserves the agent-native model: installed skills and instruction blocks run the workflows, while the CLI installs, validates, and exposes bounded machine-readable state/instruction contracts for agents.

## Non-Goals

- This doc does not define human prose style for truth docs; templates and standards own that.
- This doc does not make installed agent workflows CLI subcommands.
- This doc does not define every generated host file path except where those paths are part of command, validator, or generated-surface contracts.

## Maintenance Notes

Update this doc when `.truthmark/config.yml` schema, route metadata forms, command names/options, JSON envelopes, command-specific `data` payloads, diagnostic categories/severities, helper validator envelopes, or compatibility guarantees change.
