# Fix npm provenance publish trigger

Version action: patch

## PR Summary

- Switch npm publishing from GitHub `release` events to `release/**` tag push events, with manual dispatch retained as an operator fallback.
- Document that tag-triggered publishing keeps GitHub Actions OIDC provenance tied to a concrete source ref.

## Release Note

- Fix npm publishing provenance failures caused by release-event OIDC certificates missing `SourceRepositoryRef`.

## Verification

- `npm run release:check`
- `node dist/main.js check --json`
