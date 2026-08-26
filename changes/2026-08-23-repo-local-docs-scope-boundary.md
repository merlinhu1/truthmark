# Repo-Local Documentation Scope Boundary

Version action: none

## PR Summary

- Moved repo-local policy docs under `docs/repo/` (`docs/ai`, `docs/standards`, `docs/architecture`, `docs/research`) so the repo-local versus product-surface boundary is visible in every path rather than only in prose.
- Added `scope: repo-local` frontmatter to all 19 docs under `docs/repo/`, including six research notes that previously had no frontmatter.
- Added `tests/doc-scope.test.ts` enforcing four invariants: every doc under `docs/repo/` declares `scope: repo-local`; that scope never appears in published product docs; `truth_kind` never appears in repo-local docs; and `src/**` never references `docs/repo`.
- Replaced the near-uniform "Primary audience" column in the `docs/README.md` directory map with a `Scope` column, and regrouped the audience split by scope.
- Added a `Documentation Scope` section to `docs/repo/ai/repo-rules.md` generalizing the repo-local rule that previously applied only to `product-boundary.md`, and a one-line scope statement to the `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` preambles.
- Updated inbound references in `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, `docs/user-guide.md`, `tests/product-boundary.test.ts`, and the root plus 15 localized READMEs.

The enforcing check is a repo-local test rather than a `src/checks/` diagnostic because `truthmark check` runs in downstream repositories, which have no `docs/repo/` boundary and would see spurious findings.

## Release Note

- None; internal-only change. No `src/` behavior changed.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test` (428 pass, 0 fail)
- `npm run build`
- `npm run dev -- check` (no diagnostics)
- Relative-link audit across all tracked Markdown: 12 broken links before and after the move, all pre-existing in `docs/repo/research/` and unrelated to this change.
- Mutation-tested `tests/doc-scope.test.ts`: removing the scope field, leaking `scope: repo-local` into `docs/truthmark/`, and referencing `docs/repo` from `src/` each fail the suite.
