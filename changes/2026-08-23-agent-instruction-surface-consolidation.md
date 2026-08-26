# Agent Instruction Surface Consolidation

Version action: none

## PR Summary

- Removed `github-copilot` from `.truthmark/config.yml`, let the init lifecycle prune the 29 generated surfaces it owned, and deleted the leftover `.github/copilot-instructions.md`. Copilot remains a supported platform of the product; only this repository's installation changed.
- Narrowed the checked-in path lists in `tests/templates/generated-surfaces.test.ts` to the platforms this repository installs. The `allPlatforms` render assertions keep full Copilot coverage.
- Added a generated `repo-rules:start` / `repo-rules:end` region to `AGENTS.md` and `CLAUDE.md`, rendered from the always-on section of `docs/repo/ai/repo-rules.md` by the local `node --import tsx scripts/render-repo-rules.ts` command, so repository authority, documentation scope, product boundary, the numbered rules, and the completion gate survive context compaction.
- Added `scripts/repo-rules-block.ts` and `scripts/render-repo-rules.ts`, plus `tests/repo-rules-block.test.ts` covering source sync, cross-file equality, marker ordering, link rewriting, malformed-marker rejection, managed-block round-trip, and idempotence.
- Rewrote the Instruction Surface Boundary rule to describe the two-region model, since the previous wording forbade the preamble duplication this change introduces.
- Included `scripts/**/*.ts` in `tsconfig.json` so the new repo-local tooling is typechecked.

`docs/repo/ai/repo-rules.md` remains the authority. The region in each instruction file is generated output under rule 8, so no second document claims authority over repository policy. `agent-onboarding.md` deliberately stays a file: it is conditional routing, and inlining it would cost every session for guidance most tasks do not need.

The two new scripts are excluded in `.truthmark/config.yml` rather than routed. They are repo-local tooling implementing repo-local policy, so mapping them to a product truth doc would reintroduce the boundary confusion this work removes.

## Release Note

- None; internal-only change. No `src/` behavior changed.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test` (428 pass, 0 fail)
- `npm run build`
- `npm run dev -- init` followed by `npm run dev -- check` (no diagnostics; the managed-block refresh leaves the repo-local region intact and preserves config comments)
- Relative-link audit across all tracked Markdown: 12 broken links, unchanged from before this work and all pre-existing in `docs/repo/research/`.
