---
status: active
doc_type: standard
last_reviewed: 2026-05-06
source_of_truth:
  - ../../package.json
  - ../features/contracts.md
---

# Testing And Verification

## Scope

This standard defines the canonical verification commands for Truthmark.

## Command Sources

Repository-level verification commands live in [package.json](../../package.json).

Current commands:

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run check`
- `npm run dev -- check`

If a linked `truthmark` binary points at this checkout's `dist/main.js`, `truthmark check` validates the built artifact. It is only equivalent to `npm run dev -- check` when the build output is current.

## Verification Rules

- Prefer the narrowest command that can falsify the change.
- If a single test file or focused slice exists, run that before broad repo-wide verification.
- Run `npm run typecheck` when TypeScript source changes.
- Run `npm run build` when CLI entrypoints, templates, or packaging behavior changes.
- Run `npm run dev -- check` when canonical docs, authority order, or areas routing changes.
- Run `npm run check` before closing out broader code changes unless a narrower command is the only relevant one.

## Documentation-Only Changes

For documentation-only changes:

- run `npm run dev -- check` when links, frontmatter, or routing changed
- code-level verification is optional unless executable commands or contract examples changed
- state any skipped checks explicitly

## Packaging And Artifact Checks

When CLI packaging or entrypoint behavior changes, also verify the built artifact directly after `npm run build`, for example with `node dist/main.js --help`.

## Review Threshold

- `error` diagnostics from `truthmark check` should be fixed before considering the docs tree healthy.
