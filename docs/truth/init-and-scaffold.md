---
status: active
doc_type: behavior
truth_kind: behavior
last_reviewed: 2026-05-14
source_of_truth:
  - ../../src/config/defaults.ts
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
4. creates missing configured docs and routing structure such as the configured root route index, the configured default child route file with explicit truth kind metadata when the root route index delegates it, the configured truth-root README, a default area index README, six editable typed truth-doc templates, and a default bounded behavior truth doc
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
- configured child route files referenced by the root route index under `docs/truthmark/areas/**/*.md`
- configured truth-root README files such as `docs/truth/README.md`
- configured default-area index README files such as `docs/truth/repository/README.md`
- [docs/templates/behavior-doc.md](../templates/behavior-doc.md)
- [docs/templates/contract-doc.md](../templates/contract-doc.md)
- [docs/templates/architecture-doc.md](../templates/architecture-doc.md)
- [docs/templates/workflow-doc.md](../templates/workflow-doc.md)
- [docs/templates/operations-doc.md](../templates/operations-doc.md)
- [docs/templates/test-behavior-doc.md](../templates/test-behavior-doc.md)
- configured default-area bounded leaf truth docs such as `docs/truth/repository/overview.md`
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
- normalize legacy unconditional docs-map and onboarding preamble lines to conditional reads so normal sessions do not load routing docs before they are needed
- append the managed block when no block exists
- keep the generated workflow block as a compact automatic-Sync trigger and boundary index so it does not consume unnecessary model context in long legacy instruction files
- keep detailed report examples, platform-specific invocation strings, and long workflow procedure in explicit generated skill files instead of host instruction blocks
- preserve repository instruction authority while clarifying that implementation code and canonical truth docs are behavior evidence, not a way to override workflow write boundaries

Repository-specific instructions should therefore live outside the managed block.

Truthmark does not create `OPENCODE.md` in V1. OpenCode-compatible behavior is installed through shared `AGENTS.md` guidance and project skill files under `.opencode/skills/`.

## Hierarchy Behavior

Hierarchy is configured in `.truthmark/config.yml`:

- `docs.layout` is currently `hierarchical`
- `docs.roots` names the canonical doc roots and partial root maps are merged over current defaults
- `docs.routing.root_index` is the root route index path
- `docs.routing.area_files_root` is the directory for child route files
- `docs.routing.default_area` is the initial scaffolded child route basename
- `docs.routing.max_delegation_depth` must currently be `1`

`truthmark init` creates missing structure for that hierarchy, but child route files stay governed by the root route index: if an authored non-empty root index no longer delegates the configured default child route, rerunning init does not recreate that unreferenced child route. Init does not silently move, delete, or reinterpret existing truth docs when teams change the configured roots. Those cases produce review diagnostics for manual migration.
The default scaffold treats truth `README.md` files as indexes. Current behavior truth belongs in bounded leaf docs under the configured truth root, such as `<truth-root>/<domain>/<behavior>.md`.
`truthmark init` creates [docs/templates/behavior-doc.md](../templates/behavior-doc.md) when it is missing or empty and also seeds [docs/templates/contract-doc.md](../templates/contract-doc.md), [docs/templates/architecture-doc.md](../templates/architecture-doc.md), [docs/templates/workflow-doc.md](../templates/workflow-doc.md), [docs/templates/operations-doc.md](../templates/operations-doc.md), and [docs/templates/test-behavior-doc.md](../templates/test-behavior-doc.md) when they are missing or empty. The default behavior template includes Purpose, Scope, Current Behavior, Core Rules, Flows And States, Contracts, Product Decisions, Rationale, Non-Goals, and Maintenance Notes sections, with inline scope criteria for agents. Kind-specific templates add the required anchors for contract, architecture, workflow, operations, and test-behavior truth surfaces. The default child route references the seeded leaf truth doc with fenced YAML `truth_documents` metadata and `kind: behavior` rather than relying on path inference.
When creating the default bounded behavior truth doc, init reads the repository's behavior template and expands supported placeholders such as `{{title}}`, `{{area}}`, `{{source_of_truth}}`, `{{purpose}}`, `{{scope}}`, `{{current_behavior}}`, `{{core_rules}}`, `{{flows_and_states}}`, `{{contracts}}`, `{{decision}}`, `{{rationale}}`, `{{non_goals}}`, `{{maintenance_notes}}`, and `{{template_path}}`. The seeded leaf uses `doc_type: behavior` and `truth_kind: behavior`. Existing non-empty template files are preserved so teams can define local truth-doc standards.

## Current Defaults

Important current defaults:

- default authority includes the canonical doc classes under `docs/`
- default code surface in the scaffolded root and child route files starts as `src/**`
- default truth scaffolding creates an index at `<truth-root>/README.md`, an index at `<truth-root>/<default-area>/README.md`, six editable templates under `docs/templates/*.md`, and a bounded leaf truth doc at `<truth-root>/<default-area>/overview.md` routed through explicit `{ path, kind }` metadata
- default platforms are `codex`, `opencode`, `claude-code`, `github-copilot`, and `gemini-cli`
- shared instruction targets are refreshed independently of platform-specific surfaces
- explicit Truth Structure, Truth Document, Truth Sync, Truth Realize, and Truth Check surfaces are installed only for configured platforms
- installed workflows are agent-native; generated skills tell agents to inspect the checkout directly
- generated workflow surfaces leave Truth Sync subagent selection to the acting agent and host environment
- managed instruction blocks include only compact hierarchy, decision-truth, automatic-Sync trigger, boundary reminders, and a pointer to explicit workflows; generated skills carry invocation strings and detailed workflow bodies
- generated workflow surfaces must not demote repository instruction docs such as [docs/ai/repo-rules.md](../ai/repo-rules.md) when warning agents that product truth cannot override workflow write boundaries
- scaffolded default standards include AI-native topology repair guidance and an architecture-vs-behavior boundary so new repositories do not rely on human folder discipline
- Truth Sync is the only generated skill with implicit invocation enabled because it is the automatic finish-time workflow
- `truthmark check` is optional validation for agent workflows, not a required workflow preflight
- Truth Realize is always installed as an explicit manual surface for configured platforms; it has no separate config toggle and no dedicated CLI subcommand
- Gemini CLI support uses `GEMINI.md` for hierarchical memory and `.gemini/commands/truthmark/*.toml` for explicit workflow commands instead of introducing Truthmark-specific top-level CLI verbs

## Init Diagnostics

Current init JSON reporting uses:

- `truth-sync` for the managed `AGENTS.md` block and generated Truth Structure, Truth Document, Truth Sync, and Truth Check assets
- `realization` for generated Truth Realize assets
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
- Decision (2026-05-15): Repository instruction preambles make docs-map and onboarding reads conditional, and managed instruction blocks omit platform-specific workflow invocation strings so ordinary sessions load less context.
- Decision (2026-05-13): `.truthmark/config.yml` and route files are the committed hierarchy contract, so init no longer creates a low-value top-level note.
- Decision (2026-05-14): Truth-doc templates are kind-specific under `docs/templates/*.md`; `docs/templates/behavior-doc.md` is the default bounded behavior template and the other five typed templates carry kind-specific required sections.
- Decision (2026-05-14): Truth Realize stays manual-only through explicit generated surfaces and is no longer configurable with `realization.enabled`.
- Decision (2026-05-13): Default standards define architecture docs as structure and ownership truth, not a place for ordinary product behavior.

## Rationale

This split makes the hierarchy reviewable before generated workflow behavior lands in the repo. Keeping route ownership in Markdown preserves local editing ergonomics. Refusing silent migrations avoids accidental truth loss when a repository reshapes its canonical docs tree.

Keeping host-specific detail in generated skills and Gemini command files prevents the repository root from accumulating parallel instruction files that drift from the managed workflow contract. Keeping managed blocks terse protects ordinary agent context while preserving the automatic Sync gate, workflow boundaries, and branch-local authority. Conditional docs-map and onboarding reads keep routing guidance available without forcing every normal session to load it.

Keeping typed truth-doc templates in `docs/templates/` gives repository owners one local standard surface per truth kind while keeping generated workflow text compact as more workflow surfaces are added.

## Primary Code Files

- `src/init/init.ts`
- `src/templates/init-files.ts`
- `src/templates/agents-block.ts`
- `src/templates/codex-skills.ts`
- `src/fs/paths.ts`
