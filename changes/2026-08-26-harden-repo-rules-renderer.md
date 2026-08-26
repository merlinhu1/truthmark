# Harden Repo-Rules Renderer Against ReDoS And Substitution Patterns

Version action: none

## PR Summary

- Replaced `/(?:\r\n|\r|\n)+$/u` with `/[\r\n]+$/u` in `scripts/repo-rules-block.ts`. CodeQL reported two high-severity `js/redos` alerts against the original pattern: the alternation is ambiguous because `\r\n` also matches as `\r` followed by `\n`, so a run of CRLF that fails to reach end-of-string backtracks exponentially. The character class is unambiguous, trims the same trailing line-break runs, and is verified equivalent across CR, LF, CRLF, mixed, and empty inputs.
- Switched the managed-region replacement in `upsertRepoRulesBlock` to a function replacer. A string replacement argument interprets `$&`, `` $` ``, `$'`, `$1`-`$9`, and `$$`, so any rules text containing those sequences would have been silently corrupted on render. The block contains no `$` today, which is why the defect was latent rather than visible.
- Added a regression test asserting the rendered region is written literally when it contains `$` substitution patterns.

Both defects were introduced by the CRLF handling added for the line-ending review finding, not by the original migration.

## Release Note

- None; internal-only change. `scripts/` is repo-local tooling and is not part of the published package.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test` (426 pass, 0 fail)
- `npm run build`
- `npm run format:check`
- `npm run package:check`
- `npm run dev -- check` (no diagnostics)
- `node --import tsx scripts/render-repo-rules.ts` reports both instruction files unchanged, confirming the rendered region is in sync.
- Mutation-tested both fixes: reverting the function replacer fails the new escaping test, and the previous regex measurably backtracks (178ms at 22 CRLF pairs, roughly quadrupling per two added pairs) where the replacement is immediate.
