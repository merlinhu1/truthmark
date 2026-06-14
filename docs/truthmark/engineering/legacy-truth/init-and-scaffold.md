---
status: archived
last_reviewed: 2026-06-01
---

# Init And Scaffold

## Purpose

This document protects the repository setup contract for `truthmark config` and `truthmark init`: how configuration is created, what init scaffolds or refreshes, and which generated surfaces are managed.

## Scope

This document owns the current setup and scaffold behavior for `truthmark config` and `truthmark init`: config-file creation, default docs and routes, editable typed templates, managed instruction blocks, generated platform surfaces, and migration-risk reporting. It hands ongoing truth-doc content maintenance to the routed truth docs and workflow surfaces.

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
9. reports each touched file as `created`, `updated`, or `unchanged`

## Core Rules

Current scaffold targets:

- `.truthmark/config.yml` via `truthmark config`
- [docs/truthmark/routes/areas.md](../routes/areas.md)
- configured child route files referenced by the root route index under `docs/truthmark/routes/areas/**/*.md`
- fixed lane README files such as `docs/truthmark/product/README.md` and `docs/truthmark/engineering/README.md`
- configured default-area index README files under the fixed engineering lane, such as `docs/truthmark/engineering/repository/README.md`
- [docs/truthmark/templates/engineering-behavior.md](../templates/engineering-behavior.md)
- [docs/truthmark/templates/engineering-contract.md](../templates/engineering-contract.md)
- [docs/truthmark/templates/engineering-architecture.md](../templates/engineering-architecture.md)
- [docs/truthmark/templates/engineering-workflow.md](../templates/engineering-workflow.md)
- [docs/truthmark/templates/engineering-operations.md](../templates/engineering-operations.md)
- [docs/truthmark/templates/engineering-test-behavior.md](../templates/engineering-test-behavior.md)
- [docs/truthmark/templates/product-capability.md](../templates/product-capability.md)
- configured default-area bounded leaf truth docs such as `docs/truthmark/engineering/repository/overview.md`
- the managed block inside [AGENTS.md](../../../AGENTS.md)
- [CLAUDE.md](../../../CLAUDE.md)
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
- `.agents/skills/truthmark-*/support/procedure.md`
- `.agents/skills/truthmark-*/support/report-template.md`
- `.agents/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.agents/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.agents/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.codex/agents/truth-route-auditor.toml`
- `.codex/agents/truth-claim-verifier.toml`
- `.codex/agents/truth-doc-reviewer.toml`
- `.opencode/skills/truthmark-structure/SKILL.md`
- `.opencode/skills/truthmark-document/SKILL.md`
- `.opencode/skills/truthmark-sync/SKILL.md`
- `.opencode/skills/truthmark-realize/SKILL.md`
- `.opencode/skills/truthmark-check/SKILL.md`
- `.opencode/skills/truthmark-preview/SKILL.md`
- `.opencode/skills/truthmark-*/support/procedure.md`
- `.opencode/skills/truthmark-*/support/report-template.md`
- `.opencode/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.opencode/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.opencode/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.opencode/agents/truth-route-auditor.md`
- `.opencode/agents/truth-claim-verifier.md`
- `.opencode/agents/truth-doc-reviewer.md`
- `.opencode/agents/truth-doc-writer.md`
- `.claude/skills/truthmark-structure/SKILL.md`
- `.claude/skills/truthmark-document/SKILL.md`
- `.claude/skills/truthmark-sync/SKILL.md`
- `.claude/skills/truthmark-realize/SKILL.md`
- `.claude/skills/truthmark-check/SKILL.md`
- `.claude/skills/truthmark-preview/SKILL.md`
- `.claude/skills/truthmark-*/support/procedure.md`
- `.claude/skills/truthmark-*/support/report-template.md`
- `.claude/skills/truthmark-*/support/subagents-and-leases.md` when the workflow has generated subagent guidance
- `.claude/skills/truthmark-*/helper-manifest.yml` when the workflow declares helpers
- `.claude/skills/truthmark-*/support/helper-policy.md` when the workflow declares helpers
- `.claude/agents/truth-route-auditor.md`
- `.claude/agents/truth-claim-verifier.md`
- `.claude/agents/truth-doc-reviewer.md`
- `.claude/agents/truth-doc-writer.md`
- `.github/copilot-instructions.md`
- `.github/skills/truthmark-structure/SKILL.md`
- `.github/skills/truthmark-document/SKILL.md`
- `.github/skills/truthmark-sync/SKILL.md`
- `.github/skills/truthmark-realize/SKILL.md`
- `.github/skills/truthmark-check/SKILL.md`
- `.github/skills/truthmark-preview/SKILL.md`
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

`instruction_targets` controls shared managed-instruction files such as `AGENTS.md`. These targets are written or refreshed whenever `truthmark init` runs with a valid config, independent of the configured platform list.
`platforms` controls which platform-specific surfaces are written or refreshed. Defaults include all supported platforms: `codex`, `opencode`, `claude-code`, `github-copilot`, and `gemini-cli`. Teams should remove unused platforms from `.truthmark/config.yml` before rerunning `truthmark init`. Claude Code installs `CLAUDE.md`, project skills under `.claude/skills/`, and verifier plus leased doc-writer subagents under `.claude/agents/`; skills surface as `/truthmark-structure`, `/truthmark-document`, `/truthmark-sync`, `/truthmark-preview`, `/truthmark-realize`, and `/truthmark-check`, plus `/truthmark-portal` when Portal is enabled, while the generated project subagents provide bounded evidence checks and parent-leased truth-doc writes. GitHub Copilot installs `.github/copilot-instructions.md`, agent skills under `.github/skills/`, prompt files under `.github/prompts/`, and verifier plus leased doc-writer custom agents under `.github/agents/`; prompts and skills surface as `/truthmark-structure`, `/truthmark-document`, `/truthmark-sync`, `/truthmark-preview`, `/truthmark-realize`, and `/truthmark-check`, plus `/truthmark-portal` when Portal is enabled, in supported Copilot IDEs, while Copilot CLI can dispatch the generated `@truth-*` custom agents for bounded evidence checks or parent-leased doc shards. Gemini installs `GEMINI.md`, Agent Skills under `.gemini/skills/`, project-scoped TOML commands under `.gemini/commands/truthmark/`, and project subagents under `.gemini/agents/`; commands surface as `/truthmark:structure`, `/truthmark:document`, `/truthmark:sync`, `/truthmark:preview`, `/truthmark:realize`, and `/truthmark:check`, plus `/truthmark:portal` when Portal is enabled, in Gemini CLI and append `User focus or arguments: {{args}}` near the end of each TOML prompt. Unknown platform names are config errors. Removing a platform stops future refreshes for that platform, but `init` does not delete previously generated files.

`ensureRepoFile` is intentionally conservative: existing non-empty scaffold files are left alone unless the file is one of Truthmark's managed update surfaces. Managed update surfaces include instruction blocks, generated workflow assets, and truth-doc templates under `docs/truthmark/templates/*.md`; template reruns refresh Truthmark-owned default sections while preserving project-specific custom sections and their authored order.

The generated Truth Structure, Truth Document, Truth Sync, Truth Preview, Truth Realize, and Truth Check explicit surfaces are also managed by Truthmark and may be refreshed on rerun so the Codex skills, metadata, Claude Code project skills, GitHub Copilot skills/prompts/custom agents, Gemini skills/commands/subagents, and OpenCode skills keep matching the installed workflow contract. Generated skill packages keep `SKILL.md` compact and write heavy procedure, report-template, and subagent or lease reference material into sibling `support/*.md` files. Optional helper manifests and helper policy files are emitted only for workflows that declare helpers and only for configured skill-package platforms; helper manifests invoke installed Truthmark CLI validators such as `truthmark validate sync-report <report-file> --json`, `truthmark validate document-report <report-file> --json`, and `truthmark validate write-lease <lease-or-report-file> <changed-files-file> --json`. Generated packages do not bundle repo-local `scripts/*.mjs` helper copies. GitHub Copilot prompts and Gemini commands remain standalone entrypoints; their report examples mark helper packages unavailable unless the matching generated skill package is being used. Generated skills, support files, Codex metadata, Copilot prompt files, Copilot custom-agent files, Gemini command files, Gemini subagent files, and managed instruction blocks include the Truthmark package version that rendered them; `package.json` is the single maintained version source. After upgrading Truthmark, rerun `truthmark init` and review generated workflow diffs.

Truthmark Portal surfaces are managed by the same renderer only when normalized `truthmark.generated.portal.enabled` is `true`. When disabled, init emits no Portal skills, prompts, commands, or managed-instruction mention.

The current managed-instruction update behavior is:

- replace an existing managed Truthmark block when it is well formed
- remove malformed or duplicated managed blocks when they use the current Truthmark markers or current managed-block content
- preserve manual text outside the managed block
- append the managed block when no block exists
- keep the generated workflow block as a compact automatic-Sync trigger and boundary index so it does not consume unnecessary model context in long legacy instruction files
- keep detailed report examples, platform-specific invocation strings, and long workflow procedure in explicit generated skill support files or standalone prompt and command files instead of host instruction blocks
- preserve repository instruction authority while clarifying that implementation code and canonical truth docs are behavior evidence, not a way to override workflow write boundaries

Repository-specific instructions should therefore live outside the managed block.

Truthmark does not create `OPENCODE.md` in V1. OpenCode-compatible behavior is installed through shared `AGENTS.md` guidance and project skill files under `.opencode/skills/`.

Hierarchy is derived from `.truthmark/config.yml`:

- `truthmark.workspace` is the workspace root for Truthmark-owned routing, truth, templates, and generated output
- routes are fixed at `<workspace>/routes/areas.md` and `<workspace>/routes/areas/`
- the default child route basename is the product invariant `repository`
- max route delegation depth is the product invariant `1`
- product truth always lives under `product/` and engineering truth under `engineering/` relative to the workspace
- truth-doc templates always live under `templates/` relative to the workspace

`truthmark init` creates missing structure for that hierarchy, but child route files stay governed by the root route index: if an authored non-empty root index no longer delegates the fixed default child route, rerunning init does not recreate that unreferenced child route. Init does not silently move, delete, reinterpret, or emit compatibility diagnostics for legacy truth-doc placement when teams move the workspace.
The default scaffold treats truth `README.md` files as indexes. Current behavior truth belongs in bounded leaf docs under the fixed engineering lane root, such as `<workspace>/engineering/<domain>/<behavior>.md`; product capability truth belongs under `<workspace>/product/`.
`truthmark init` creates [docs/truthmark/templates/engineering-behavior.md](../templates/engineering-behavior.md) when it is missing or empty and refreshes all eight templates under `docs/truthmark/templates/*.md` on rerun. Template refreshes replace Truthmark-owned default sections with the current professional guidance baseline, including evidence, boundary, capability, current-state, contract, operational, verification, decision, rationale, non-goal, and maintenance prompts. Existing template preambles/frontmatter are preserved so repository-owned metadata, custom titles, source-of-truth defaults, and local introductory guidance do not churn during section refresh. Project-specific custom `##` sections are preserved and reinserted before the next default section that followed them in the authored file; trailing custom sections remain trailing. Fenced code blocks are ignored while finding `##` template sections, so examples can contain Markdown headings without being split or mistaken for Truthmark-owned sections. The default child route references the seeded leaf truth doc with fenced YAML `truth_documents` metadata and `kind: engineering-behavior` rather than relying on path inference.
When creating the default bounded behavior truth doc, init reads the repository's merged behavior template and expands supported placeholders such as `{{title}}`, `{{area}}`, `{{purpose}}`, `{{scope}}`, `{{current_behavior}}`, `{{core_rules}}`, `{{flows_and_states}}`, `{{contracts}}`, `{{decision}}`, `{{rationale}}`, `{{non_goals}}`, `{{maintenance_notes}}`, `{{source_references}}`, and `{{template_path}}`. The seeded leaf uses compact frontmatter plus a final `## Source References` section for traceability. Existing non-empty truth docs are preserved; existing template files are merged rather than blindly overwritten so teams can keep local truth-doc standard sections while receiving updated default guidance.

Important current defaults:

- default authority includes the canonical doc classes under `docs/`
- default code surface in the scaffolded root and child route files starts as `src/**`
- default truth scaffolding creates indexes and bounded leaf truth docs under the fixed `product/` and `engineering/` lane roots, eight editable and refreshable templates under `docs/truthmark/templates/*.md`, and route entries through explicit `{ path, kind }` metadata
- default platforms are `codex`, `opencode`, `claude-code`, `github-copilot`, and `gemini-cli`
- shared instruction targets are refreshed independently of platform-specific surfaces
- explicit Truth Structure, Truth Document, Truth Sync, Truth Preview, Truth Realize, and Truth Check surfaces are installed only for configured platforms
- Truthmark Portal defaults to disabled; when enabled, Portal surfaces are installed only for configured platforms and use Truthmark-derived output/template paths in generated guidance
- installed workflows are agent-native; generated skills tell agents to inspect the checkout directly
- Codex platform generation includes `.codex/agents/*.toml`, Claude Code platform generation includes `.claude/agents/*.md`, GitHub Copilot platform generation includes `.github/agents/*.md`, Gemini CLI platform generation includes `.gemini/agents/*.md`, and OpenCode platform generation includes `.opencode/agents/*.md` read-only verifier agents plus `truth-doc-writer` for parent-leased Truth Sync and Truth Document shards; the acting parent agent may use them automatically when the host supports subagent dispatch, and read-only verifier agents are context-bounded so they do not preload repo-wide instruction or policy docs unless assigned as evidence
- managed instruction blocks include only compact hierarchy, decision-truth, automatic-Sync trigger, boundary reminders, and a pointer to explicit workflows; generated skill entrypoints carry invocation strings and link to support files for detailed workflow bodies
- generated workflow surfaces must not demote configured repository instruction docs or optional project-local policy docs when warning agents that product truth cannot override workflow write boundaries; project-local policy docs are not universal Truthmark product files and generated wording must stay generic and config-driven
- scaffolded default standards include AI-native topology repair guidance and an architecture-vs-behavior boundary so new repositories do not rely on human folder discipline
- Truth Sync is the only generated skill with implicit invocation enabled because it is the automatic finish-time workflow
- `truthmark check` is optional validation for agent workflows, not a required workflow preflight
- Truth Realize is always installed as an explicit manual surface for configured platforms; it has no separate config toggle and no dedicated CLI subcommand
- Gemini CLI support uses `GEMINI.md` for hierarchical memory, `.gemini/commands/truthmark/*.toml` for explicit workflow commands with `{{args}}` focus forwarding, `.gemini/skills/truthmark-*/` for Agent Skills, and `.gemini/agents/*.md` for project subagents instead of introducing Truthmark-specific top-level CLI verbs or Gemini extensions
- helper files are emitted only for workflows with declared helpers and configured skill-package platforms (`codex`, `opencode`, `claude-code`, `github-copilot`, and `gemini-cli`); helper manifests call installed Truthmark CLI validators and generated packages do not bundle repo-local `scripts/*.mjs` helper copies

- all generated paths must remain inside the active repository root
- generated path containment must reject symlinks that resolve outside the repository, including broken symlink leaves that would otherwise be created outside the worktree
- init must be idempotent for existing non-empty scaffold files except for managed update surfaces such as instruction blocks, generated workflow assets, and merged `docs/truthmark/templates/*.md` default sections
- the command should remain safe to run repeatedly in the same repository

## Flows And States

The setup flow is:

1. `truthmark config` writes or prints the repository configuration.
2. `truthmark init` requires an existing valid config and resolves the active Git worktree.
3. Init creates missing configured routing, truth-root, default-area, template, and generated workflow surfaces.
4. Init refreshes managed surfaces that Truthmark owns, including managed instruction blocks, generated host workflow assets, and default sections in `docs/truthmark/templates/*.md`.
5. Init preserves repository-authored content outside managed blocks and preserves template preambles/frontmatter plus custom template sections when refreshing default template sections.
6. Init reports every created, updated, or unchanged surface as an action diagnostic in the shared command envelope.

## Contracts

Current init JSON reporting uses:

- `truth-sync` for the managed `AGENTS.md` block and generated Truth Structure, Truth Document, Truth Sync, Truth Preview, and Truth Check assets
- `realization` for generated Truth Realize assets
- `area-index` for [docs/truthmark/routes/areas.md](../routes/areas.md)
- `config` for the remaining scaffolded files

`truthmark config --json` and `truthmark init --json` use the shared command-result envelope described in [contracts.md](contracts.md). `truthmark init` requires a valid config and does not silently migrate or compatibility-review legacy truth-doc placement.

## Product Decisions

- `truthmark config` owns the committed layout contract and must happen before `truthmark init`.
- Hierarchical routing is the only scaffold model, and route ownership stays in Markdown route files rather than config.
- Init uses the configured Truthmark hierarchy directly and does not run legacy hierarchy migration diagnostics.
- Decision (2026-05-31): Init no longer normalizes legacy instruction preambles or treats old managed-line fragments as Truthmark-owned cleanup input; only current managed markers and current managed-block content are eligible for automatic managed-block repair.
- V1 uses configured shared instruction targets such as `AGENTS.md` plus generated skill or command surfaces for host compatibility instead of creating host-specific top-level instruction files for every adapter.
- Managed instruction blocks are compact automatic-Sync indexes; generated skill support files, prompt files, and command files own explicit workflow procedure.
- Decision (2026-05-15): Repository instruction preambles make docs-map and onboarding reads conditional, and managed instruction blocks omit platform-specific workflow invocation strings so ordinary sessions load less context.
- Decision (2026-05-13): `.truthmark/config.yml` and route files are the committed hierarchy contract, so init no longer creates a low-value top-level note.
- Decision (2026-06-14): Truth-doc templates are kind-specific under `docs/truthmark/templates/*.md`; filenames match `truth_kind` values directly, with `docs/truthmark/templates/engineering-behavior.md` as the default bounded behavior template and `product-capability` as the only downstream product truth template.
- Decision (2026-05-30): `truthmark init` refreshes Truthmark-owned default sections in existing `docs/truthmark/templates/*.md` files while preserving project-specific custom `##` sections and their authored relative order.
- Decision (2026-05-14): Truth Realize stays manual-only through explicit generated surfaces and is no longer configurable with `realization.enabled`.
- Decision (2026-05-13): Default standards define architecture docs as structure and ownership truth, not a place for ordinary product behavior.

## Rationale

This split makes the hierarchy reviewable before generated workflow behavior lands in the repo. Keeping route ownership in Markdown preserves local editing ergonomics. Refusing silent migrations avoids accidental truth loss when a repository reshapes its canonical docs tree.

Keeping host-specific detail in generated skills and Gemini command files prevents the repository root from accumulating parallel instruction files that drift from the managed workflow contract. Keeping managed blocks terse protects ordinary agent context while preserving the automatic Sync gate, workflow boundaries, and branch-local authority. Conditional docs-map and onboarding reads keep routing guidance available without forcing every normal session to load it.

Keeping typed truth-doc templates in `docs/truthmark/templates/` gives repository owners one local standard surface per truth kind while keeping generated workflow text compact as more workflow surfaces are added. Refreshing default template sections on `truthmark init` keeps those local standard surfaces aligned with current professional guidance, while preserving custom sections prevents product-specific review gates from being erased by package upgrades.

## Non-Goals

- Init does not create `.truthmark/config.yml`; `truthmark config` owns that step.
- Init does not silently migrate existing truth docs to a new hierarchy.
- Init does not overwrite manual text outside managed instruction blocks.
- Init does not replace repository-authored template preambles/frontmatter or custom template sections during template refresh.
- Init does not delete generated files for platforms that were later removed from config.

## Maintenance Notes

Primary implementation files:

- `src/init/init.ts`
- `src/templates/init-files.ts`
- `src/templates/agents-block.ts`
- `src/templates/workflow-surfaces.ts`
- `src/fs/paths.ts`

Update this doc when scaffold targets, managed-surface categories, template refresh behavior, generated platform surfaces, config defaults, or init diagnostics change.

## Source References

- ../../../src/config/defaults.ts
- ../../../src/fs/paths.ts
- ../../../src/init/init.ts
- ../../../src/init/hierarchy.ts
- ../../../src/templates/init-files.ts
- ../../../src/templates/agents-block.ts
- ../../../src/agents/workflow-manifest.ts
- ../../../src/agents/workflow-helper-validation.ts
- ../../../src/cli/program.ts
- ../../../src/cli/handlers.ts
- ../../../src/templates/workflow-surfaces.ts
- ../../../src/templates/generated-surfaces.ts
