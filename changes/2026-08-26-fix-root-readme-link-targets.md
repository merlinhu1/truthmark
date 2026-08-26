# Fix Root README Link Targets And Enforce Label Agreement

Version action: none

## PR Summary

- Fixed two links that named the root `README.md` but resolved to `docs/README.md` after the documentation move. `docs/repo/standards/pre-completion-checklist.md` pointed the rule-12 completion gate ("did you review the root README") at the docs index, so an agent following the checklist would review the wrong file and could skip the localized-README requirement. `docs/repo/ai/agent-onboarding.md` had the same defect in its "do not treat README.md as the final source of behavioral truth" entry.
- Added `tests/doc-links.test.ts` with two invariants over every tracked Markdown file: relative links resolve to a file in the checkout, and path-shaped link labels point at the file they name.

These two links survived the earlier `source_of_truth` rebase because they resolve to a file that exists. Existence checking cannot catch them; only comparing the label against the resolved target can. Link validation also lived in an ad-hoc local script rather than the test suite, so nothing in CI would have flagged them.

The label check compares only unambiguous labels: those spelling out a repository path, plus bare `README.md`, `AGENTS.md`, and `CLAUDE.md`, which always mean the repository-root copy. Bare sibling filenames such as `change-notes.md` stay exempt because they are shorthand rather than a path claim. The check also covers the generated `repo-rules` region in `AGENTS.md` and `CLAUDE.md`, so the renderer's link rewriting is now verified rather than assumed.

## Release Note

- None; internal-only change. No `src/` behavior changed.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm test` (428 pass, 0 fail)
- `npm run build`
- `npm run format:check`
- `npm run package:check`
- `npm audit --omit=dev` (0 vulnerabilities)
- `npm run dev -- check` (no diagnostics)
- `node --import tsx scripts/render-repo-rules.ts` reports both instruction files unchanged.
- Mutation-tested the new label check: it reports exactly the two defective links before the fix and nothing else, confirming no false positives across the repository.
