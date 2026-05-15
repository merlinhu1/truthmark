---
status: active
doc_type: standard
last_reviewed: 2026-05-16
source_of_truth:
  - ../../package.json
  - ../../package-lock.json
  - change-notes.md
  - https://semver.org/
---

# Versioning

## Trigger

Use this standard only when a task changes or asks whether to change:

- `package.json` version
- root package entries in `package-lock.json`
- release/version policy
- a `changes/` note with `Version action: patch`, `minor`, or `major`

Do not load this standard for ordinary docs, workflow text, generated-surface, or code changes unless a package version decision is in scope.

## Goal

Choose Truthmark's own package version using Semantic Versioning 2.0.0. Normal committed versions use `MAJOR.MINOR.PATCH`.

`package.json` is the maintained version source. `package-lock.json` follows it. Generated version markers follow the package version only after `truthmark init` is rerun.

This is an internal repository maintenance standard. It is not a user-facing feature, installed workflow feature, or generated workflow capability.

## First Gate

If the change does not alter published package behavior, do not bump the package version.

No bump examples:

- internal standards for this repository
- agent routing guidance for maintainers
- documentation corrections with no published behavior change
- tests, refactors, formatting, or cleanup with no published behavior change

## Decision Table

| Change | Version action |
| --- | --- |
| Backward-incompatible public API or shipped workflow change | `MAJOR + 1`, reset `MINOR` and `PATCH` to `0` |
| Backward-compatible public API addition, generated-surface capability, shipped workflow capability, deprecation, or substantial user-visible improvement | `MINOR + 1`, reset `PATCH` to `0` |
| Backward-compatible bug fix, diagnostic correction, packaging fix, or published documentation correction | `PATCH + 1` |
| Internal-only maintenance with no published package behavior change | no version change |

Do not use prerelease or build metadata in the committed package version unless the release task explicitly asks for it.

## Public API For Bump Decisions

Treat these as published package behavior:

- CLI command names, options, exit behavior, result envelopes, and diagnostics contracts
- `.truthmark/config.yml` schema and hierarchy behavior
- generated instruction blocks, skill metadata, prompt files, and version markers produced by the package
- installed workflow boundaries, trigger contracts, report shapes, and completion gates as shipped package behavior
- runtime compatibility and npm package contents

## Version Change Procedure

When changing a version number:

1. Decide the bump class before editing the version and state the rationale in the handoff, PR, or release note.
2. Create or update the matching `changes/` note from [change-notes.md](change-notes.md).
3. Update `package.json` and the root package entries in `package-lock.json` together.
4. Rerun `truthmark init` only when the package version actually changes, then inspect generated version-marker diffs.
5. Run the focused verification required by [testing-and-verification.md](testing-and-verification.md). For release-sensitive package version changes, `npm run release:check` is the default final gate.

## Agent Output

When reporting a package version decision, state only:

- chosen version action
- one-line SemVer rationale
- files changed or intentionally left unchanged
- matching change note path when a version changes
- verification run or explicitly skipped
