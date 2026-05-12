---
status: active
doc_type: guide
last_reviewed: 2026-05-09
source_of_truth:
  - ../README.md
  - documentation-governance.md
  - testing-and-verification.md
---

# Maintaining Repository Truth

## Purpose

This guide is for humans maintaining Truthmark's own docs tree.

## When To Update Which Docs

- Change to scaffolded files or AGENTS management: update [docs/features/init-and-scaffold.md](../features/init-and-scaffold.md)
- Change to diagnostics, routing, containment, or branch scope: update [docs/features/check-diagnostics.md](../features/check-diagnostics.md)
- Change to installed workflow text, skip reasons, or report shape: update [docs/features/installed-workflows.md](../features/installed-workflows.md)
- Change to repository-wide rules or completion policy: update [docs/ai/repo-rules.md](../ai/repo-rules.md) or the relevant standard

## Maintaining AGENTS.md

Treat [AGENTS.md](../../AGENTS.md) as two surfaces:

- manual repository-specific guidance outside the managed block
- the generated Truthmark block between `<!-- truthmark:start -->` and `<!-- truthmark:end -->`

Do not hand-edit the managed block for one-off wording changes. Change the template source instead, then refresh the block through the normal workflow.

Generated Truthmark skill files under `.codex/skills/` and `.opencode/skills/` follow the same rule. Edit the renderers in `src/agents/` and `src/templates/`, then refresh through `truthmark init`.

## Maintaining docs/truthmark/areas.md

When code boundaries or canonical docs change:

1. update the routed truth docs for the affected area
2. narrow overly broad truth-doc lists instead of adding more shadow docs
3. make sure every relevant `src/**` file still matches at least one area mapping

With hierarchical routing, treat [docs/truthmark/areas.md](../truthmark/areas.md) as the root route index and `docs/truthmark/areas/**/*.md` as the delegated child route files. Keep delegation to one level.

## Changing Hierarchy

When hierarchy changes:

1. edit `.truthmark/config.yml`
2. run `truthmark init`
3. review migration diagnostics
4. move docs and route files manually
5. run `truthmark check`
6. commit config, routing, and docs together

`truthmark init` creates missing structure but does not move or delete existing truth docs for you.

## Changing Decisions

When a product or architecture decision changes, edit the `Product Decisions` and `Rationale` sections in the owning canonical doc in the same change as code and routing updates.

Date active decisions inline when added or changed, for example `Decision (2026-05-09): ...`.

Do not preserve the old active decision in a parallel file. Git history preserves it.

## Historical Material

If a historical note becomes current truth, rewrite it into the correct canonical class under `docs/` instead of linking to old planning material as if it were the maintained source.

## Verification

Run [docs/standards/testing-and-verification.md](../standards/testing-and-verification.md) commands appropriate to the change. For docs-only routing work, `npm run dev -- check` is the default validation step.
