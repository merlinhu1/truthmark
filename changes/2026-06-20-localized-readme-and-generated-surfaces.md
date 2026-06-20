# Localized README and generated-surface refresh

Previous version: 2.2.3
New version: 2.2.4
Diff basis: release/2.2.3..HEAD plus working tree
Version action: patch
SemVer rationale: This is a backward-compatible cleanup and correction of published guidance, generated-surface behavior, and locale packaging metadata.

Release payload:
- Rename the Portuguese localized README from `README.pt-BR.md` to `README.pt.md` and update all locale link references accordingly.
- Refresh generated-surface templates and agent prompt/skill rendering by removing stale invocation text and aligning Quick procedure content with repository standards.
- Update Truthmark-generated host surface contracts and workflow documentation to reflect retired preview surfaces and current host behavior.
- Update generated-surface tests and affected agent behavior tests for the rendered template/doc contract changes.
- Bump package version to `2.2.4` and synchronize lockfile package version fields.

User-facing release text:
- Improved localized README indexing by normalizing the Portuguese locale filename and synchronized generated workflow surfaces so hosted agent outputs reflect current Truthmark surface contracts; also bumped package patch version.

Verification:
- `npm run package:check`
- `npx vitest run tests/agents/prompts.test.ts tests/agents/truth-check.test.ts tests/agents/truth-document.test.ts tests/agents/truth-sync.test.ts tests/templates/generated-surfaces.test.ts`
