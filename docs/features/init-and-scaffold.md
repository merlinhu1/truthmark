---
status: active
doc_type: feature
last_reviewed: 2026-05-09
source_of_truth:
  - ../../src/init/init.ts
  - ../../src/templates/init-files.ts
  - ../../src/templates/agents-block.ts
  - ../../src/templates/codex-skills.ts
  - ../../src/templates/generated-surfaces.ts
---

# Init And Scaffold

## Scope

This document describes the current behavior of `truthmark config` and `truthmark init`.

## Current Behavior

`truthmark config` is the required first step in a new repository. It writes only `.truthmark/config.yml` unless `--stdout` is used.

`truthmark init` operates on the active Git worktree and does all of the following in one pass:

1. resolves the active repository and worktree
2. requires an existing valid `.truthmark/config.yml`
3. creates default standards only when they are missing or empty
4. creates missing configured docs and routing structure such as [TRUTHMARK.md](../../TRUTHMARK.md), the configured root route index, the configured default child route file, the configured feature-root README, a default area index README, and a default bounded leaf truth doc
5. loads the configured `platforms` list
6. writes or refreshes only the configured platform surfaces
7. rewrites managed Truthmark instruction blocks while preserving manual content outside those blocks
8. writes generated skill surfaces for configured skill-based platforms
9. reports migration risks instead of moving existing truth docs when hierarchy changes imply manual migration
10. reports each touched file as `created`, `updated`, or `unchanged`

## Scaffolded Files

Current scaffold targets:

- `.truthmark/config.yml` via `truthmark config`
- [TRUTHMARK.md](../../TRUTHMARK.md)
- [docs/truthmark/areas.md](../truthmark/areas.md)
- configured child route files under `docs/truthmark/areas/**/*.md`
- configured feature-root README files such as `docs/features/README.md`
- configured default-area index README files such as `docs/features/repository/README.md`
- configured default-area bounded leaf truth docs such as `docs/features/repository/overview.md`
- [docs/standards/default-principles.md](../standards/default-principles.md)
- [docs/standards/documentation-governance.md](../standards/documentation-governance.md)
- the managed block inside [AGENTS.md](../../AGENTS.md)
- [CLAUDE.md](../../CLAUDE.md)
- `.codex/skills/truthmark-structure/SKILL.md`
- `.codex/skills/truthmark-structure/agents/openai.yaml`
- `skills/truthmark-structure/SKILL.md`
- `.codex/skills/truthmark-sync/SKILL.md`
- `.codex/skills/truthmark-sync/agents/openai.yaml`
- `skills/truthmark-sync/SKILL.md`
- `.codex/skills/truthmark-realize/SKILL.md`
- `.codex/skills/truthmark-realize/agents/openai.yaml`
- `skills/truthmark-realize/SKILL.md`
- `.codex/skills/truthmark-check/SKILL.md`
- `.codex/skills/truthmark-check/agents/openai.yaml`
- `.opencode/skills/truthmark-structure/SKILL.md`
- `.opencode/skills/truthmark-sync/SKILL.md`
- `.opencode/skills/truthmark-realize/SKILL.md`
- `.opencode/skills/truthmark-check/SKILL.md`
- `skills/truthmark-check/SKILL.md`
- `.cursor/rules/truthmark.mdc`
- `.github/copilot-instructions.md`
- `GEMINI.md`
- `.gemini/commands/truthmark/structure.toml`
- `.gemini/commands/truthmark/sync.toml`
- `.gemini/commands/truthmark/realize.toml`
- `.gemini/commands/truthmark/check.toml`

`platforms` controls which platform surfaces are written or refreshed. Defaults are `codex`, `opencode`, and `claude-code`. Teams may add `cursor`, `github-copilot`, or `gemini-cli` and rerun `truthmark init` to add those files. Gemini installs both `GEMINI.md` and project-scoped TOML commands under `.gemini/commands/truthmark/`, which surface as `/truthmark:structure`, `/truthmark:sync`, `/truthmark:realize`, and `/truthmark:check` in Gemini CLI. Unknown platform names are config errors. Removing a platform stops future refreshes for that platform, but `init` does not delete previously generated files.

`ensureRepoFile` is intentionally conservative: existing non-empty files are left alone. The AGENTS managed block is the exception because Truthmark owns that block and may refresh it to match current template behavior.

The generated Truth Structure, Truth Sync, Truth Realize, and Truth Check explicit surfaces are also managed by Truthmark and may be refreshed on rerun so the Codex skills, metadata, and repo-local skills keep matching the installed workflow contract. Generated skills and Codex metadata include the Truthmark package version that rendered them; after upgrading Truthmark, rerun `truthmark init` and review generated workflow diffs.

## AGENTS Management Rules

The current managed-instruction update behavior is:

- replace an existing managed Truthmark block when it is well formed
- remove older managed-looking chunks when possible
- preserve manual text outside the managed block
- append the managed block when no block exists
- keep the generated workflow block compact and front-loaded so it does not consume unnecessary model context in long legacy instruction files
- keep detailed report examples and long workflow procedure in explicit generated skill files instead of host instruction blocks

Repository-specific instructions should therefore live outside the managed block.

Truthmark does not create `OPENCODE.md` in V1. OpenCode-compatible behavior is installed through shared `AGENTS.md` guidance and repo-local skill files under `skills/` and `.opencode/skills/`.

## Hierarchy Behavior

Hierarchy is configured in `.truthmark/config.yml`:

- `docs.layout` is currently `hierarchical`
- `docs.roots` names the canonical doc roots
- `docs.routing.root_index` is the root route index path
- `docs.routing.area_files_root` is the directory for child route files
- `docs.routing.default_area` is the scaffolded child route basename
- `docs.routing.max_delegation_depth` must currently be `1`

`truthmark init` creates missing structure for that hierarchy, but it does not silently move, delete, or reinterpret existing truth docs when teams change the configured roots. Those cases produce review diagnostics for manual migration.
The default scaffold treats feature `README.md` files as indexes. Current behavior truth belongs in bounded leaf docs under the configured feature root, such as `<feature-root>/<domain>/<behavior>.md`.

## Current Defaults

Important current defaults:

- default authority includes the canonical doc classes under `docs/`
- default code surface in the scaffolded root and child route files starts as `src/**`
- default feature scaffolding creates an index at `<feature-root>/README.md`, an index at `<feature-root>/<default-area>/README.md`, and a bounded leaf truth doc at `<feature-root>/<default-area>/overview.md`
- default platforms are `codex`, `opencode`, and `claude-code`
- explicit Truth Structure, Truth Sync, Truth Realize, and Truth Check surfaces are installed only for configured platforms
- installed workflows are agent-native; generated skills tell agents to inspect the checkout directly
- generated workflow surfaces leave Truth Sync subagent selection to the acting agent and host environment
- generated workflow surfaces include a configured hierarchy summary and decision-truth guidance
- scaffolded default standards include AI-native topology repair guidance so new repositories do not rely on human feature-folder discipline
- Truth Sync is the only generated skill with implicit invocation enabled because it is the automatic finish-time workflow
- `truthmark check` is optional validation for agent workflows, not a required workflow preflight
- realization is enabled as generated Codex and OpenCode explicit surfaces plus an installed instruction surface, not as a dedicated CLI subcommand
- Gemini CLI support uses `GEMINI.md` for hierarchical memory and `.gemini/commands/truthmark/*.toml` for explicit workflow commands instead of introducing Truthmark-specific top-level CLI verbs

## Init Diagnostics

Current init JSON reporting uses:

- `truth-sync` for the managed `AGENTS.md` block and generated Truth Structure, Truth Sync, and Truth Check skill assets
- `realization` for generated Truth Realize skill assets
- `authority` for [TRUTHMARK.md](../../TRUTHMARK.md) and [docs/truthmark/areas.md](../truthmark/areas.md)
- `config` for the remaining scaffolded files

## Invariants

- all generated paths must remain inside the active repository root
- init must be idempotent for existing non-empty scaffold files except for the managed AGENTS block
- the command should remain safe to run repeatedly in the same repository

## Product Decisions

- `truthmark config` owns the committed layout contract and must happen before `truthmark init`.
- Hierarchical routing is the only scaffold model, and route ownership stays in Markdown route files rather than config.
- Init reports migration risk instead of rewriting existing truth doc placement on the user's behalf.
- V1 uses shared `AGENTS.md` plus generated skill or command surfaces for host compatibility instead of creating host-specific top-level instruction files for every adapter.

## Rationale

This split makes the hierarchy reviewable before generated workflow behavior lands in the repo. Keeping route ownership in Markdown preserves local editing ergonomics. Refusing silent migrations avoids accidental truth loss when a repository reshapes its canonical docs tree.

Keeping host-specific detail in generated skills and Gemini command files prevents the repository root from accumulating parallel instruction files that drift from the managed workflow contract.

## Primary Code Files

- `src/init/init.ts`
- `src/templates/init-files.ts`
- `src/templates/agents-block.ts`
- `src/templates/codex-skills.ts`
- `src/fs/paths.ts`
