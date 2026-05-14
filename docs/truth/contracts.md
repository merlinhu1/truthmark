---
status: active
doc_type: contract
truth_kind: contract
last_reviewed: 2026-05-14
source_of_truth:
  - ../../src/config/schema.ts
  - ../../src/checks/check.ts
  - ../../src/templates/init-files.ts
  - ../../src/init/init.ts
  - ../../src/output/diagnostic.ts
  - ../../src/output/render.ts
---

# Contracts

## Scope

This document defines the current machine-facing contracts exposed by Truthmark: the config file shape and the CLI result envelope.

## Contract Surface

- The committed `.truthmark/config.yml` schema and defaults.
- Route metadata under `docs/truthmark/areas.md` and delegated child route files.
- The JSON result envelope emitted by `truthmark config`, `truthmark init`, and `truthmark check`.

## Inputs

- Committed config fields under `.truthmark/config.yml`.
- Routed truth-document metadata from `docs/truthmark/areas.md` and `docs/truthmark/areas/**/*.md`.
- CLI options such as `--json`, `--stdout`, and command-specific flags.

## Config Contract

Truthmark loads `.truthmark/config.yml` and validates it against the current schema.

Current fields:

- `version`: must be `1`
- `platforms`: optional list of agent harnesses to initialize; defaults to all supported platforms
- `docs.layout`: currently `hierarchical`
- `docs.roots`: named canonical doc roots; omitted root names are filled from current defaults
- `docs.routing.root_index`: root area index path
- `docs.routing.area_files_root`: child area route directory
- `docs.routing.default_area`: default child route file basename used by scaffold
- `docs.routing.max_delegation_depth`: currently must be `1`
- `authority`: ordered list of canonical doc paths or globs
- `instruction_targets`: files that receive installed instructions; defaults to `AGENTS.md`
- `frontmatter.required`: frontmatter fields that produce `error` diagnostics when missing
- `frontmatter.recommended`: frontmatter fields that produce `review` diagnostics when missing
- `ignore`: glob patterns excluded from relevant checks and routing logic

The default scaffolded authority list includes:

- `docs/truthmark/areas.md`
- `docs/truthmark/areas/**/*.md`
- `docs/ai/**/*.md`
- `docs/standards/**/*.md`
- `docs/architecture/**/*.md`
- `docs/truth/**/*.md`

## Route Metadata Contract

Route files may express `Truth documents` in either of these forms:

- a legacy Markdown list of document paths
- a fenced YAML block with a `truth_documents` array of `{ path, kind }` entries

New scaffolded child route files use the fenced YAML form so routed truth kind is explicit from the first generated route. The legacy list form remains a compatibility input for existing repositories.

Supported routed truth kinds are:

- `behavior`
- `contract`
- `architecture`
- `workflow`
- `operations`
- `test-behavior`

When explicit `kind` metadata is present, it is the authoritative routed kind and the fenced metadata block owns the `Truth documents` section. Legacy list lines in the same section are ignored. When route files use the legacy list form, Truthmark falls back to path-based kind inference such as `<configured truth root>/**` or `docs/truth/** -> behavior`, `docs/contracts/**` or `docs/api/** -> contract`, `docs/architecture/** -> architecture`, `docs/workflows/** -> workflow`, `docs/operations/** -> operations`, and `docs/testing/** -> test-behavior`.

Canonical truth docs may include optional `truth_kind` frontmatter. When present, it must match the routed kind.

Supported `platforms` values are:

- `codex`
- `opencode`
- `claude-code`
- `github-copilot`
- `gemini-cli`

There is no `.truthmark/local.yml` contract in the current implementation. User preferences that affect generated repository behavior must be expressed through committed config or the generated surfaces cannot be reproduced by another checkout.

## Command Result Envelope

`truthmark config`, `truthmark init`, and `truthmark check` return the same JSON envelope when run with `--json`.

Current shape:

- `command`: string command name
- `summary`: human-readable summary string
- `diagnostics`: array of diagnostic objects
- `data`: optional command-specific object

Diagnostic fields:

- `category`: one of `config`, `authority`, `frontmatter`, `links`, `area-index`, `coverage`, `truth-sync`, `realization`, `doc-structure`, or `generated-surface`
- `severity`: one of `info`, `action`, `review`, or `error`
- `message`: human-readable detail
- `file`: optional repository-relative file path
- `area`: optional area name from `docs/truthmark/areas.md`
- `data`: optional machine-readable extras

Human-rendered output is intended for people. JSON output is the machine-facing contract.

## Compatibility Rules

- `version` remains `1` in the committed config contract.
- `docs.roots.truth` is the configured root for behavior truth docs.
- Repositories refresh generated workflow surfaces through `truthmark init`; removing a platform from config stops future refreshes but does not delete previously generated files.
- Truth Realize has no config switch; selected platforms receive its explicit manual workflow surface.
- There is no `.truthmark/local.yml` compatibility surface in the current implementation.

## Config Result Data

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

## Init Result Data

`truthmark init --json` currently returns these data fields:

- `repositoryRoot`
- `worktreePath`
- `branchName`
- `isDetached`
- `isUnborn`

The command emits `action` diagnostics describing whether each scaffolded file was created, updated, or unchanged. Generated realization skill files use the `realization` diagnostic category.

`truthmark init` requires an existing valid `.truthmark/config.yml`. It does not create config; `truthmark config` is the required first step in a new repository.
Configured `instruction_targets` are generated or refreshed independently of platform-specific surfaces, so `AGENTS.md` remains managed even when `claude-code` is not in `platforms`.

Generated Truth Structure, Truth Document, Truth Sync, and Truth Check surfaces and the managed `AGENTS.md` block use the `truth-sync` diagnostic category.

Current agent-native scaffold targets include:

- `.codex/skills/truthmark-structure/SKILL.md`
- `.codex/skills/truthmark-structure/agents/openai.yaml`
- `.codex/skills/truthmark-document/SKILL.md`
- `.codex/skills/truthmark-document/agents/openai.yaml`
- `.codex/skills/truthmark-sync/SKILL.md`
- `.codex/skills/truthmark-sync/agents/openai.yaml`
- `.codex/skills/truthmark-realize/SKILL.md`
- `.codex/skills/truthmark-realize/agents/openai.yaml`
- `.codex/skills/truthmark-check/SKILL.md`
- `.codex/skills/truthmark-check/agents/openai.yaml`
- `.claude/skills/truthmark-structure/SKILL.md`
- `.claude/skills/truthmark-document/SKILL.md`
- `.claude/skills/truthmark-sync/SKILL.md`
- `.claude/skills/truthmark-realize/SKILL.md`
- `.claude/skills/truthmark-check/SKILL.md`
- `.opencode/skills/truthmark-structure/SKILL.md`
- `.opencode/skills/truthmark-document/SKILL.md`
- `.opencode/skills/truthmark-sync/SKILL.md`
- `.opencode/skills/truthmark-realize/SKILL.md`
- `.opencode/skills/truthmark-check/SKILL.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/prompts/truthmark-structure.prompt.md`
- `.github/prompts/truthmark-document.prompt.md`
- `.github/prompts/truthmark-sync.prompt.md`
- `.github/prompts/truthmark-realize.prompt.md`
- `.github/prompts/truthmark-check.prompt.md`
- `GEMINI.md`
- `.gemini/commands/truthmark/structure.toml`
- `.gemini/commands/truthmark/document.toml`
- `.gemini/commands/truthmark/sync.toml`
- `.gemini/commands/truthmark/realize.toml`
- `.gemini/commands/truthmark/check.toml`

Generated `SKILL.md` files use closed YAML frontmatter with `name`, `description`, `argument-hint`, `user-invocable`, and `truthmark-version` fields so Codex-style, Claude Code, and OpenCode-style skill indexers can parse every generated workflow surface. Generated Copilot prompt files use `.github/prompts/*.prompt.md` files with `agent` and `description` frontmatter so supported Copilot IDEs can expose `/truthmark-*` prompts. Generated Codex metadata includes a `truthmark.version` marker plus `truthmark.refresh_command: "truthmark init"`. Managed instruction blocks also render the Truthmark package version, and `package.json` is the single maintained version source for those markers. Generated Gemini command files use project-scoped TOML custom commands so `truthmark init` can install `/truthmark:structure`, `/truthmark:document`, `/truthmark:sync`, `/truthmark:realize`, and `/truthmark:check` alongside `GEMINI.md`. Re-running `truthmark init` after a package upgrade refreshes configured committed surfaces and exposes staleness through ordinary Git diffs. Removing a platform from config stops future refreshes for that platform; it does not delete previously generated files.

## Check Result Data

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

## Current Diagnostic Emission Notes

- ordinary `truthmark check` emits `config`, `authority`, `frontmatter`, `links`, `area-index`, `coverage`, `doc-structure`, and `generated-surface` diagnostics.
- `truth-sync` and `realization` categories exist for init and generated workflow reporting, but ordinary `check` does not emit workflow payloads.
- `truthmark check` does not support `--workflow truth-sync` in the current contract.
- Missing authority files are `error` diagnostics.
- Authority globs and code-surface globs that match nothing are `review` diagnostics.
- Coverage diagnostics discover unmapped functional code across common code roots with the same path classifier used by Truth Sync. V1 coverage must include Go, Python, C#, Java, JavaScript, TypeScript, frontend roots, monorepo app or package roots, Terraform, Kubernetes manifests, CI workflows, OpenAPI or Swagger, GraphQL, and protobuf surfaces within those roots.
- `frontmatter` emits `error` diagnostics when `truth_kind` is invalid or present and disagrees with routed truth-kind metadata.
- `doc-structure` emits `review` diagnostics when configured architecture or routed truth docs are missing `Scope`, active `Product Decisions`, active `Rationale`, or the kind-specific required headings for their routed truth kind.

## Product Decisions

- The committed config file owns the documentation hierarchy contract, while route files own domain-to-doc mappings.
- `truthmark config` and `truthmark init` are separate contracts so repositories can review hierarchy before workflow installation.
- Active decisions stay in the canonical doc they govern instead of in separate timestamped decision logs. Date active decisions inline when added or changed.
- The V1 user-facing CLI surface is limited to `config`, `init`, and `check`; workflow verbs such as `sync`, `realize`, `structure`, `audit`, `packet`, `review`, `scan`, `doctor`, `build`, and `context` are not top-level commands.
- `gemini-cli` installs both hierarchical `GEMINI.md` context and project-scoped `.gemini/commands/truthmark/*.toml` custom commands so Gemini users get the same explicit workflow entrypoints without adding top-level CLI verbs.
- Decision (2026-05-14): Truth Realize is manually invoked through installed workflow surfaces and is not controlled by `realization.enabled` or any other config key.

## Rationale

Separating config from init keeps repository layout reviewable and predictable. Keeping decisions with the owning behavior, contract, or architecture doc prevents agents from having to infer which historical note is still active.

Keeping workflow verbs out of the CLI preserves the agent-native model: installed skills and instruction blocks run the workflows, while the CLI installs and validates repository artifacts.
