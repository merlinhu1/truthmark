---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-07-30
---

# Init And Scaffold

## Purpose

This doc owns current scaffold behavior for Truthmark hierarchy, templates, and default route files.

## Scope

It covers config defaults, lane root creation, template files, and starter route metadata.

## Current Implementation Behavior

Scaffold paths derive from `truthmark.workspace`:

- Routes live at `<workspace>/routes/areas.md` and `<workspace>/routes/areas/`.
- Product truth lives at `<workspace>/product`.
- Engineering truth lives at `<workspace>/engineering`.
- Editable truth templates live at `<workspace>/templates`.
- The default scaffolded route area is `repository`.
- Max route delegation depth is `1`.

`truthmark init` is the only setup command:

- In an interactive TTY, init renders the supported platform catalog as a numbered, comma-separated multi-select.
- Selection is zero or more; `none` preserves host-neutral CLI-only initialization, and cancellation writes nothing.
- Existing saved platforms are preselected, and an empty response keeps them.
- Repeatable `--platform <id>` values replace the selected set for automation; `--clear-platforms` explicitly selects an empty set.
- `--json` never prompts.
- A first noninteractive run with neither saved config nor explicit platform values remains host-neutral.
- A noninteractive rerun with no explicit values keeps the saved platform set.
- Host detection never selects a platform.

Init creates `.truthmark/config.yml` when absent. Existing valid version-2 configs remain valid; when platform ownership changes, init updates only the top-level `platforms` node while preserving other supported values and YAML comments. An empty selection omits `platforms`.

Editable truth template filenames match `truth_kind` values directly:

- `product-capability.md`
- `engineering-behavior.md`
- `engineering-contract.md`
- `engineering-architecture.md`
- `engineering-workflow.md`
- `engineering-operations.md`
- `engineering-test-behavior.md`

Generated truth-doc frontmatter includes `truth_kind`.

Generated truth-doc frontmatter does not include `doc_type` or `truth_lane`.

`truthmark init` reconciles generated surfaces to the selected platform set. It removes a whole file only when its bytes prove renderer ownership, preserves authored content outside valid managed blocks, and reports unsafe or mixed-ownership paths for manual review.

Configured platforms select exact instruction surfaces. Shared-contract hosts aggregate `AGENTS.md` ownership, Claude Code owns `CLAUDE.md`, and host-neutral configuration emits no generic instruction file. Lifecycle diagnostics expose planned removals, preserved diverged files, and preflight failures to human and JSON callers.

Generated truth-doc templates keep kind-specific and section-specific authoring comments in the template files. Non-Goals guidance stays limited to current ownership boundaries, while accepted scope decisions belong in the owning decisions section.

Engineering behavior templates include a `Behavior Scenarios` section after `Core Rules`:

- Scenario blocks are optional and clarify normal, fallback, or compatibility-critical behavior.
- Scenario bullets use `GIVEN`, `WHEN`, `THEN`, and optional `AND` labels.
- Scenario guidance frames entries as current implemented truth rather than future requirements.
- Scenario bullets do not replace source-backed behavior claims or Source References.

Global diff-friendly authoring style lives in the Truth Document workflow procedure rather than in every template preamble:

- Prefer one durable claim per bullet or line.
- Keep paragraphs to one or two short sentences.
- Use bullets or tables for rules, criteria, fields, files, and lists.

Init seeds the broad default `repository` route as provisional bootstrap routing, not as normal behavior ownership:

- The route still maps `src/**` so a fresh repository is routeable.
- The route points at `engineering/repository/bootstrap-routing.md` as an `engineering-workflow` handoff.
- The handoff tells agents to run Truth Structure before normal Truth Sync when real code touches only the broad default route.
- Init does not create `engineering/repository/overview.md` from `engineering-behavior.md`.
- Behavior truth should be created in bounded areas after ownership is known.

Downstream product truth uses the `product-capability` template only.

Capability docs own:

- a single user-visible capability promise
- users and value
- scope including boundary constraints and adjacent systems
- current product behavior
- acceptance criteria
- decisions
- realization links
- non-goals

## Core Rules

- Scaffolded paths derive from `truthmark.workspace`.
- Template filenames match `truth_kind` values.
- Engineering behavior templates provide optional current-state scenario blocks for normal, fallback, or compatibility-critical behavior.
- Setup and platform selection are owned by `truthmark init`.
- Platform selection is zero or more and never assumes an AI host.
- Global prose style guidance belongs in writer-facing workflow procedures, not every truth-doc template preamble.

## Behavior Scenarios

#### Scenario: Interactive init selects zero or more platforms

- **GIVEN** `truthmark init` runs in an interactive TTY without explicit platform flags
- **WHEN** the maintainer submits numbered choices, `none`, or the preselected defaults
- **THEN** init persists that complete platform set and generates only the selected host surfaces
- **AND** selecting none omits `platforms` and generates no host-specific surfaces

#### Scenario: Noninteractive init remains deterministic

- **GIVEN** init runs noninteractively or with `--json`
- **WHEN** repeatable `--platform <id>` values or `--clear-platforms` are present
- **THEN** those values replace the complete selected platform set without prompting
- **AND** a first no-flag run remains host-neutral while a later no-flag rerun keeps saved platforms

#### Scenario: Existing version-2 config preserves authored YAML

- **GIVEN** a valid version-2 `.truthmark/config.yml` contains comments and supported non-platform values
- **WHEN** init changes the selected platforms
- **THEN** only top-level platform ownership changes
- **AND** other supported values and comments are preserved

#### Scenario: Engineering behavior templates support compact scenarios

- **GIVEN** Truthmark renders the editable `engineering-behavior.md` template
- **WHEN** maintainers create or refresh truth-doc templates
- **THEN** the template includes an optional `Behavior Scenarios` section after `Core Rules`
- **AND** the guidance frames scenarios as current implemented truth rather than `SHALL`-style future requirements

## Flows And States

- `truthmark init` creates or refreshes workspace scaffold files.
- It resolves platform choice from explicit flags, interactive selection, saved values, or the empty first-run default, in that order.
- It prepares a version-2 config update, preflighting the config path and lifecycle mutations before writing scaffold and generated-surface files; lifecycle removals are applied last so a failed write does not delete existing generated surfaces, and invalid existing config still fails closed.
- It renders current templates and generated host surfaces from source renderers.
- Before any scaffold or generated-surface write, it rejects aliased, non-regular, or hard-linked managed instruction destinations and preflights every planned lifecycle mutation.
- It revalidates every planned mutation before applying the first removal, so a changed or unsafe later target prevents partial cleanup; earlier scaffold writes remain visible for retry if lifecycle application is blocked.
- It removes only renderer-owned generated artifacts that are outside the selected surface set.
- It preserves user bytes outside a removed managed block, including surrounding whitespace and line-ending convention.
- It leaves unsafe or mixed-ownership paths for manual review.

## Contracts

- Config normalization and route metadata contracts are owned by `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md`.
- Generated host-surface contracts are owned by `docs/truthmark/engineering/contracts/generated-host-surfaces.md`.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): New scaffold targets use separate product and engineering truth roots.
- Decision (2026-06-14): Editable template filenames match `truth_kind` values directly.
- Decision (2026-06-14): Init scaffolds routes, templates, product truth, and engineering truth at fixed workspace-derived paths rather than accepting route or template roots from config.
- Decision (2026-06-17): The default broad `repository` route is provisional bootstrap state.
  - Init creates a compact `bootstrap-routing.md` workflow handoff instead of a catch-all behavior overview so agents run Truth Structure before normal Sync on real touched code.
- Decision (2026-06-18): Fresh configs omit `platforms` by default.
  - Truthmark does not infer Codex, OpenCode, or any other host from a fresh checkout; host-native workflow surfaces require explicit platform configuration.
- Decision (2026-06-21): Init does not delete retired Gemini surfaces automatically; users remove stale injected Gemini guidance manually after reviewing `GEMINI.md` and `.gemini/**`.
- Decision (2026-06-26): Engineering behavior templates may use compact scenario blocks for behavior clarity.
  - Scenario guidance adopts the useful requirement/scenario shape from specification formats while preserving Truthmark's current-state, evidence-backed truth-doc role.
  - The template avoids `SHALL`-style future requirements and does not require a scenario for every rule.
- Decision (2026-07-10): Configured platforms select exact instruction ownership, and deterministic lifecycle diagnostics expose reconciliation without transferring ownership of authored files.
- Decision (2026-07-30): Non-Goals template guidance records current ownership boundaries; accepted scope decisions stay in the owning decisions section.
- Decision (2026-07-30): Truthmark 2.3 uses `truthmark init` for repository setup and platform selection.
  - Interactive selection is zero-or-more, while repeatable `--platform` values provide deterministic automation and `--json` never prompts.
  - Existing version-2 configs do not require migration; platform updates preserve other values and comments.

## Rationale

Fixed workspace-derived scaffold paths keep Truthmark predictable while route files provide the semantic ownership layer.

Optional scenario blocks make normal and fallback behavior easier to review in Git without turning truth docs into future-looking requirement specs.

Keeping templates kind-specific and moving global prose style into workflow guidance reduces generated-template bloat.

## Non-Goals

- Init does not create behavior truth for unknown code ownership beyond the provisional bootstrap routing handoff.

## Maintenance Notes

Update when init writes new files, changes default paths, changes template filenames, or changes template shape.

## Source References

- ../../../../src/config/defaults.ts
- ../../../../src/config/render.ts
- ../../../../src/cli/platform-selection.ts
- ../../../../src/cli/program.ts
- ../../../../src/init/init.ts
- ../../../../src/init/hierarchy.ts
- ../../../../src/templates/init-files.ts
- ../../../../tests/lifecycle/uninstall.test.ts
- ../../../../tests/init/truth-doc-templates.test.ts
- ../../../../tests/cli/platform-selection.test.ts
- ../../../../tests/init/interactive-platform-selection.test.ts
