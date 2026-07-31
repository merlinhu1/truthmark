# Truthmark 2.2.4

Previous version: 2.2.3
New version: 2.2.4
Diff basis: release/2.2.3..HEAD plus working tree
Version action: patch
SemVer rationale: This release is a backward-compatible cleanup and correction of published guidance, generated-surface behavior, and locale packaging metadata.

Release payload:
- Renamed the Portuguese localized README from `README.pt-BR.md` to `README.pt.md` and updated all locale link references accordingly.
- Refreshed generated-surface templates and agent prompt/skill rendering by removing stale invocation text and aligning quick procedures with current repository standards.
- Updated Truthmark-generated host-surface contracts and workflow documentation to reflect retired preview surfaces and current host behavior.
- Updated generated-surface tests and agent behavior tests for the rendered template/document contract changes.
- Bumped package metadata to `2.2.4` and synced lockfile version fields.

User-facing release text:
- Published localizations now consistently use `docs/readmes/README.pt.md` for Portuguese content.
- Generated workflow surfaces were aligned with the current host-surface contract and the package patch version was incremented.

Verification:
- `npm run package:check`
- `npx vitest run tests/agents/prompts.test.ts tests/agents/truth-check.test.ts tests/agents/truth-document.test.ts tests/agents/truth-sync.test.ts tests/templates/generated-surfaces.test.ts`
- `npm run test`
- `npm run check`
