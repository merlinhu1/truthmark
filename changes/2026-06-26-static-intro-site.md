# Static Introduction Website

Version action: none

## PR Summary

- Add a static introduction website under `site/` for GitHub Pages with original CSS-only visual design rather than copied README poster artwork.
- Add a richer tabbed truth-doc storyboard that shows a new invariant, product-promise pressure, ownership splitting, and the final reviewer packet.
- Add product-positioning sections for checkout-native operation, claim-level review, explicit route ownership, topology repair, repository-file authority, host-shaped agent guidance, and Git-reviewable handoff.
- Remove copied poster assets from the site branch; the public page no longer depends on README banner images.
- Add a Pages deployment workflow that publishes `site/**` after relevant pushes to `main` or manual dispatch.
- Link the site from the root README and document that the site is presentation, not canonical repository truth.

## Release Note

- Truthmark now has a static GitHub Pages introduction site for public onboarding, with original visual design, a truth-doc curation storyboard, and broader repository-truth positioning.

## Verification

- Served `site/` locally with `python3 -m http.server`, captured Playwright screenshots, and validated the rendered HTML response with `curl` plus Python checks.
- `/opt/data/bin/npm run test -- tests/package-files.test.ts tests/product-boundary.test.ts tests/truth/docs.test.ts` passed: 6 tests.
- `/opt/data/bin/npm run check` passed: lint, typecheck, 337 tests, and build.
- `/opt/data/bin/npm run package:check` passed: 4 tests.
- `/opt/data/bin/npx tsx src/cli/main.ts check --json` passed with no diagnostics.
- `/opt/data/bin/npx tsx src/cli/main.ts index --json` passed with no diagnostics.
- `git diff --check` passed.
