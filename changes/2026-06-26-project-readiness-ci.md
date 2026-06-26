# Project Readiness CI

Version action: none

## PR Summary

- Add a CodeQL workflow for TypeScript/JavaScript code scanning on pull requests, pushes to `main`, scheduled runs, and manual dispatch.
- Add an OpenSSF Scorecard workflow using `ossf/scorecard-action@v2.4.3` for repository-readiness/security heuristics.
- Add Dependabot monitoring for npm dependencies and GitHub Actions.
- Update release-automation truth docs and routing so repository-readiness automation is owned by the existing operations truth area.
- Do not add or change README badges in this pass.

## Release Note

- None; internal-only repository automation change.

## Verification

- Parsed `.github/workflows/codeql.yml`, `.github/workflows/scorecard.yml`, and `.github/dependabot.yml` with the repository `yaml` dependency.
- `/opt/data/bin/npm run package:check` passed: 4 tests.
- `/opt/data/bin/npm run test -- tests/product-boundary.test.ts tests/truth/docs.test.ts` passed: 2 tests.
- `/opt/data/bin/npx tsx src/cli/main.ts check --json` passed with no diagnostics.
- `/opt/data/bin/npx tsx src/cli/main.ts index --json` passed.
- `/opt/data/bin/npm run check` passed: lint, typecheck, 339 tests, and build.
- `git diff --check` passed.
