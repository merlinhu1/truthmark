---
status: active
doc_type: feature
last_reviewed: 2026-05-13
source_of_truth:
  - ../../src/fs/paths.ts
  - ../../src/init/init.ts
  - ../../src/init/hierarchy.ts
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
4. creates missing configured docs and routing structure such as the configured root route index, the configured default child route file, the configured feature-root README, a default area index README, an editable feature-doc template, and a default bounded leaf truth doc
5. loads the configured `platforms` list
6. writes or refreshes configured instruction targets and configured platform surfaces
7. rewrites managed Truthmark instruction blocks while preserving manual content outside those blocks
8. writes generated skill surfaces for configured skill-based platforms
9. reports migration risks instead of moving existing truth docs when hierarchy changes imply manual migration
10. reports each touched file as `created`, `updated`, or `unchanged`

## Scaffolded Files

Current scaffold targets:

- `.truthmark/config.yml` via `truthmark config`
- [docs/truthmark/areas.md](../truthmark/areas.md)
- configured child route files under `docs/truthmark/areas/**/*.md`
- configured feature-root README files such as `docs/features/README.md`
- configured default-area index README files such as `docs/features/repository/README.md`
- [docs/templates/feature-doc.md](../templates/feature-doc.md)
- configured default-area bounded leaf truth docs such as `docs/features/repository/overview.md`
- [docs/standards/default-principles.md](../standards/default-principles.md)
- [docs/standards/documentation-governance.md](../standards/documentation-governance.md)
- the managed block inside [AGENTS.md](../../AGENTS.md)
- [CLAUDE.md](../../CLAUDE.md)
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
- `.opencode/skills/truthmark-structure/SKILL.md`
- `.opencode/skills/truthmark-document/SKILL.md`
- `.opencode/skills/truthmark-sync/SKILL.md`
- `.opencode/skills/truthmark-realize/SKILL.md`
- `.opencode/skills/truthmark-check/SKILL.md`
- `.claude/skills/truthmark-structure/SKILL.md`
- `.claude/skills/truthmark-document/SKILL.md`
- `.claude/skills/truthmark-sync/SKILL.md`
- `.claude/skills/truthmark-realize/SKILL.md`
- `.claude/skills/truthmark-check/SKILL.md`
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

`instruction_targets` controls shared managed-instruction files such as `AGENTS.md`. These targets are written or refreshed whenever `truthmark init` runs with a valid config, independent of the configured platform list.
`platforms` controls which platform-specific surfaces are written or refreshed. Defaults include all supported platforms: `codex`, `opencode`, `claude-code`, `github-copilot`, and `gemini-cli`. Teams should remove unused platforms from `.truthmark/config.yml` before rerunning `truthmark init`. Claude Code installs both `CLAUDE.md` and project skills under `.claude/skills/`, which surface as `/truthmark-structure`, `/truthmark-document`, `/truthmark-sync`, `/truthmark-realize`, and `/truthmark-check`. GitHub Copilot installs both `.github/copilot-instructions.md` and prompt files under `.github/prompts/`, which surface as `/truthmark-structure`, `/truthmark-document`, `/truthmark-sync`, `/truthmark-realize`, and `/truthmark-check` in supported Copilot IDEs. Gemini installs both `GEMINI.md` and project-scoped TOML commands under `.gemini/commands/truthmark/`, which surface as `/truthmark:structure`, `/truthmark:document`, `/truthmark:sync`, `/truthmark:realize`, and `/truthmark:check` in Gemini CLI. Unknown platform names are config errors. Removing a platform stops future refreshes for that platform, but `init` does not delete previously generated files.

`ensureRepoFile` is intentionally conservative: existing non-empty files are left alone. The AGENTS managed block is the exception because Truthmark owns that block and may refresh it to match current template behavior.

The generated Truth Structure, Truth Document, Truth Sync, Truth Realize, and Truth Check explicit surfaces are also managed by Truthmark and may be refreshed on rerun so the Codex skills, metadata, Claude Code project skills, GitHub Copilot prompt files, and OpenCode skills keep matching the installed workflow contract. Generated skills, Codex metadata, Copilot prompt files, and managed instruction blocks include the Truthmark package version that rendered them; `package.json` is the single maintained version source. After upgrading Truthmark, rerun `truthmark init` and review generated workflow diffs.

## AGENTS Management Rules

The current managed-instruction update behavior is:

- replace an existing managed Truthmark block when it is well formed
- remove older managed-looking chunks when possible
- preserve manual text outside the managed block
- normalize the known legacy `Codex` preamble wording to host-neutral agent wording when refreshing an instruction file
- append the managed block when no block exists
- keep the generated workflow block as a compact automatic-Sync trigger and boundary index so it does not consume unnecessary model context in long legacy instruction files
- keep detailed report examples and long workflow procedure in explicit generated skill files instead of host instruction blocks
- preserve repository instruction authority while clarifying that implementation code and canonical truth docs are behavior evidence, not a way to override workflow write boundaries

Repository-specific instructions should therefore live outside the managed block.

Truthmark does not create `OPENCODE.md` in V1. OpenCode-compatible behavior is installed through shared `AGENTS.md` guidance and project skill files under `.opencode/skills/`.

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
`truthmark init` creates [docs/templates/feature-doc.md](../templates/feature-doc.md) when it is missing or empty. The default template includes Purpose, Scope, Current Behavior, Core Rules, Flows And States, Contracts, Product Decisions, Rationale, Non-Goals, and Maintenance Notes sections, with inline scope criteria for agents. Its Scope guidance tells agents to split content into another bounded leaf doc when a change introduces a distinct outcome, lifecycle, rule family, external contract, or code owner.
When creating the default bounded leaf truth doc, init reads the repository's template and expands supported placeholders such as `{{title}}`, `{{area}}`, `{{source_of_truth}}`, `{{purpose}}`, `{{scope}}`, `{{current_behavior}}`, `{{core_rules}}`, `{{flows_and_states}}`, `{{contracts}}`, `{{decision}}`, `{{rationale}}`, `{{non_goals}}`, `{{maintenance_notes}}`, and `{{template_path}}`. Section placeholders such as `{{scope}}` expand to section body text; the template owns heading structure. Existing non-empty template files are preserved so teams can define a local feature-doc standard.

## Current Defaults

Important current defaults:

- default authority includes the canonical doc classes under `docs/`
- default code surface in the scaffolded root and child route files starts as `src/**`
- default feature scaffolding creates an index at `<feature-root>/README.md`, an index at `<feature-root>/<default-area>/README.md`, an editable template at `docs/templates/feature-doc.md`, and a bounded leaf truth doc at `<feature-root>/<default-area>/overview.md`
- default platforms are `codex`, `opencode`, `claude-code`, `github-copilot`, and `gemini-cli`
- shared instruction targets are refreshed independently of platform-specific surfaces
- explicit Truth Structure, Truth Document, Truth Sync, Truth Realize, and Truth Check surfaces are installed only for configured platforms
- installed workflows are agent-native; generated skills tell agents to inspect the checkout directly
- generated workflow surfaces leave Truth Sync subagent selection to the acting agent and host environment
- managed instruction blocks include only compact hierarchy, decision-truth, automatic-Sync trigger, boundary reminders, and a pointer to explicit workflows; generated skills carry the detailed workflow bodies
- generated workflow surfaces must not demote repository instruction docs such as [docs/ai/repo-rules.md](../ai/repo-rules.md) when warning agents that product truth cannot override workflow write boundaries
- scaffolded default standards include AI-native topology repair guidance and an architecture-vs-feature boundary so new repositories do not rely on human feature-folder discipline
- Truth Sync is the only generated skill with implicit invocation enabled because it is the automatic finish-time workflow
- `truthmark check` is optional validation for agent workflows, not a required workflow preflight
- realization is enabled as generated Codex and OpenCode explicit surfaces plus an installed instruction surface, not as a dedicated CLI subcommand
- Gemini CLI support uses `GEMINI.md` for hierarchical memory and `.gemini/commands/truthmark/*.toml` for explicit workflow commands instead of introducing Truthmark-specific top-level CLI verbs

## Init Diagnostics

Current init JSON reporting uses:

- `truth-sync` for the managed `AGENTS.md` block and generated Truth Structure, Truth Document, Truth Sync, and Truth Check skill assets
- `realization` for generated Truth Realize skill assets
- `authority` for [docs/truthmark/areas.md](../truthmark/areas.md)
- `config` for the remaining scaffolded files

## Invariants

- all generated paths must remain inside the active repository root
- generated path containment must reject symlinks that resolve outside the repository, including broken symlink leaves that would otherwise be created outside the worktree
- init must be idempotent for existing non-empty scaffold files except for the managed AGENTS block
- the command should remain safe to run repeatedly in the same repository

## Product Decisions

- `truthmark config` owns the committed layout contract and must happen before `truthmark init`.
- Hierarchical routing is the only scaffold model, and route ownership stays in Markdown route files rather than config.
- Init reports migration risk instead of rewriting existing truth doc placement on the user's behalf.
- V1 uses configured shared instruction targets such as `AGENTS.md` plus generated skill or command surfaces for host compatibility instead of creating host-specific top-level instruction files for every adapter.
- Managed instruction blocks are compact automatic-Sync indexes; generated skills and command files own explicit workflow procedure.
- Decision (2026-05-13): `.truthmark/config.yml` and route files are the committed hierarchy contract, so init no longer creates a low-value top-level note.
- Decision (2026-05-12): Feature-doc structure is centralized in `docs/templates/feature-doc.md`; generated workflow skills point agents to that file instead of embedding a full copy of the template.
- Decision (2026-05-13): Default standards define architecture docs as structure and ownership truth, not a place for ordinary feature behavior.

## Rationale

This split makes the hierarchy reviewable before generated workflow behavior lands in the repo. Keeping route ownership in Markdown preserves local editing ergonomics. Refusing silent migrations avoids accidental truth loss when a repository reshapes its canonical docs tree.

Keeping host-specific detail in generated skills and Gemini command files prevents the repository root from accumulating parallel instruction files that drift from the managed workflow contract. Keeping managed blocks terse protects ordinary agent context while preserving the automatic Sync gate, workflow boundaries, and branch-local authority.

Centralizing the feature-doc template gives repository owners one editable standard for future bounded leaf docs while keeping generated skills compact as more workflow surfaces are added.

## Primary Code Files

- `src/init/init.ts`
- `src/templates/init-files.ts`
- `src/templates/agents-block.ts`
- `src/templates/codex-skills.ts`
- `src/fs/paths.ts`
