# Static Introduction Website

Version action: none

## PR Summary

- Add a self-contained static introduction website under `site/` for GitHub Pages.
- Add a Pages deployment workflow that publishes `site/**` after relevant pushes to `main` or manual dispatch.
- Link the site from the root README and document that the site is presentation, not canonical repository truth.

## Release Note

- Truthmark now has a static GitHub Pages introduction site for concise public onboarding.

## Verification

- Served `site/` locally with `python3 -m http.server` and validated the rendered HTML response with `curl` plus Python `HTMLParser`.
- `/opt/data/bin/npm run test -- tests/package-files.test.ts tests/product-boundary.test.ts tests/truth/docs.test.ts` passed: 6 tests.
- `/opt/data/bin/npm run check` passed: lint, typecheck, 337 tests, and build.
- `/opt/data/bin/npm run package:check` passed: 4 tests.
- `/opt/data/bin/npx tsx src/cli/main.ts check --json` passed with no diagnostics.
- `/opt/data/bin/npx tsx src/cli/main.ts index --json` passed with no diagnostics.
- `git diff --check` passed.
