# Fix Stale Documentation Links

Version action: none

## PR Summary

- Fixed all 12 relative links broken since before this branch, all inside `docs/repo/research/`: 11 in `2026-05-15-agent-skills-workflow-review.md` pointed at a defunct `docs/truth/workflows/` tree and `.codex/skills/` paths that moved to `.agents/skills/`; 1 in `2026-06-29-manual-agent-skill-quality-eval-framework.md` cited a `tests/evals/workflow-eval-framwork.test.ts` that was never created, replaced with the actual routing-case fixture file it should have pointed to.
- Corrected a stale generated-surfaces list in the same 2026-05-15 note (it still named `.codex/skills/`, `.github/prompts/`, `.github/agents/`, and a `.gemini/commands/truthmark/` path that never existed in the schema) to match what this repository actually installs.
- Removed the "Maintaining repository truth" link from the root README and all 15 localized READMEs. That guide's own text says "This guide is for humans maintaining Truthmark's own docs tree" — it is repo-local content (`docs/repo/standards/maintaining-repository-truth.md`, `scope: repo-local`), but the storefront "Learn more" section presented it alongside product-facing docs (User Guide, Architecture overview, Configuration contracts) as if it were guidance for people installing Truthmark. Removed the same mispositioned link from `docs/user-guide.md`'s documentation list for the same reason.

A full relative-link audit across every tracked Markdown file now reports zero broken links, down from a 12-link baseline that predates this branch.

## Release Note

- None; internal-only documentation fixes. No `src/` behavior changed.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test` (428 pass, 0 fail)
- `npm run dev -- check` (no diagnostics)
- Relative-link audit across all tracked Markdown: 0 broken (was 12).
