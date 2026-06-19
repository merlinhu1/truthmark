---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-19
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
- Host-specific workflow surfaces are generated only after maintainers explicitly list Codex, OpenCode, Claude Code, GitHub Copilot, or Gemini CLI.

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

`truthmark init` also removes retired generated-surface artifacts under host skill roots (for example `truthmark-preview` package files and legacy `helper-manifest.yml`/`support/helper-policy.md`) when those paths are no longer part of current generated output.

Generated truth-doc templates include diff-friendly authoring guidance:

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

## Product Truth Links

- `docs/truthmark/product/capabilities/lane-separated-truth.md`

## Engineering Decisions

- Decision (2026-06-14): New scaffold targets do not create `docs/truthmark/truth` as the canonical target root.
- Decision (2026-06-14): Editable template filenames match `truth_kind` values directly so generated docs do not point agents at legacy `*-doc.md` names.
- Decision (2026-06-14): Init scaffolds routes, templates, product truth, and engineering truth at fixed workspace-derived paths rather than accepting route or template roots from config.
- Decision (2026-06-17): The default broad `repository` route is provisional bootstrap state; init creates a compact `bootstrap-routing.md` workflow handoff instead of a catch-all behavior overview so agents run Truth Structure before normal Sync on real touched code.
- Decision (2026-06-18): Fresh configs omit `platforms` by default. Truthmark does not infer Codex, OpenCode, or any other host from a fresh checkout; host-native workflow surfaces require explicit platform configuration.

## Maintenance Notes

Update when init writes new files, changes default paths, changes template filenames, or changes template shape.

## Source References

- ../../../../src/config/defaults.ts
- ../../../../src/init/hierarchy.ts
- ../../../../src/templates/init-files.ts
- ../../../../tests/init/init-instructions.test.ts
- ../../../../tests/templates/init-files.test.ts
