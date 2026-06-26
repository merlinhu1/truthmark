---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-26
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

Fresh configs do not assume a host platform:

- `platforms` is omitted by default.
- Host-specific workflow surfaces are generated only after maintainers explicitly list Codex, OpenCode, Claude Code, GitHub Copilot, Antigravity, or Cursor.

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

`truthmark init` removes auto-removable retired generated-surface artifacts when those paths are no longer part of current generated output.

Auto-removable retired artifacts include:

- `truthmark-preview` package files
- retired non-Gemini Preview adapters
- legacy `helper-manifest.yml` and `support/helper-policy.md` files

Init leaves retired Gemini surfaces in place for manual cleanup:

- `GEMINI.md`
- `.gemini/**`

Those files may contain user-owned instructions alongside old Truthmark injections.

Generated truth-doc templates keep kind-specific and section-specific authoring comments in the template files.

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
- Fresh configs do not assume any AI host platform.
- Global prose style guidance belongs in writer-facing workflow procedures, not every truth-doc template preamble.

## Behavior Scenarios

#### Scenario: Fresh config does not assume a host platform

- **GIVEN** a repository uses the default generated Truthmark config
- **WHEN** `truthmark init` creates or refreshes the scaffold
- **THEN** `platforms` remains omitted by default
- **AND** host-specific workflow surfaces require explicit platform configuration

#### Scenario: Retired Gemini surfaces are preserved for manual cleanup

- **GIVEN** a repository contains retired Gemini instruction or command surfaces
- **WHEN** `truthmark init` removes auto-removable retired generated artifacts
- **THEN** it leaves `GEMINI.md` and `.gemini/**` in place
- **AND** check diagnostics tell maintainers to review stale Gemini guidance manually

#### Scenario: Engineering behavior templates support compact scenarios

- **GIVEN** Truthmark renders the editable `engineering-behavior.md` template
- **WHEN** maintainers create or refresh truth-doc templates
- **THEN** the template includes an optional `Behavior Scenarios` section after `Core Rules`
- **AND** the guidance frames scenarios as current implemented truth rather than `SHALL`-style future requirements

## Flows And States

- `truthmark init` creates or refreshes workspace scaffold files.
- It renders current templates and generated host surfaces from source renderers.
- It removes retired non-Gemini generated-surface artifacts that are no longer part of current generated output.
- It leaves retired Gemini surfaces for manual cleanup.

## Contracts

- Config normalization and route metadata contracts are owned by `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md`.
- Generated host-surface contracts are owned by `docs/truthmark/engineering/contracts/generated-host-surfaces.md`.

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): New scaffold targets do not create `docs/truthmark/truth` as the canonical target root.
- Decision (2026-06-14): Editable template filenames match `truth_kind` values directly so generated docs do not point agents at legacy `*-doc.md` names.
- Decision (2026-06-14): Init scaffolds routes, templates, product truth, and engineering truth at fixed workspace-derived paths rather than accepting route or template roots from config.
- Decision (2026-06-17): The default broad `repository` route is provisional bootstrap state.
  - Init creates a compact `bootstrap-routing.md` workflow handoff instead of a catch-all behavior overview so agents run Truth Structure before normal Sync on real touched code.
- Decision (2026-06-18): Fresh configs omit `platforms` by default.
  - Truthmark does not infer Codex, OpenCode, or any other host from a fresh checkout; host-native workflow surfaces require explicit platform configuration.
- Decision (2026-06-21): Init does not delete retired Gemini surfaces automatically; users remove stale injected Gemini guidance manually after reviewing `GEMINI.md` and `.gemini/**`.
- Decision (2026-06-26): Engineering behavior templates may use compact scenario blocks for behavior clarity.
  - Scenario guidance adopts the useful requirement/scenario shape from specification formats while preserving Truthmark's current-state, evidence-backed truth-doc role.
  - The template avoids `SHALL`-style future requirements and does not require a scenario for every rule.

## Rationale

Fixed workspace-derived scaffold paths keep Truthmark predictable while route files provide the semantic ownership layer.

Optional scenario blocks make normal and fallback behavior easier to review in Git without turning truth docs into future-looking requirement specs.

Keeping templates kind-specific and moving global prose style into workflow guidance reduces generated-template bloat.

## Non-Goals

- Init does not infer a preferred agent host.
- Init does not create behavior truth for unknown code ownership beyond the provisional bootstrap routing handoff.
- Init does not maintain a legacy `docs/truthmark/truth` tree.
- Init does not delete retired Gemini instruction files automatically.

## Maintenance Notes

Update when init writes new files, changes default paths, changes template filenames, or changes template shape.

## Source References

- ../../../../src/config/defaults.ts
- ../../../../src/init/hierarchy.ts
- ../../../../src/templates/init-files.ts
- ../../../../tests/init/init-instructions.test.ts
- ../../../../tests/init/truth-doc-templates.test.ts
