# Repository Intelligence CLI

Version action: minor

## PR Summary

- Added public `truthmark index`, `truthmark impact`, and `truthmark context` commands with RepoIndex, RouteMap, ImpactSet, and ContextPack JSON contracts.
- Added freshness diagnostics and workflow-facing repository-intelligence guidance while preserving direct checkout inspection as the source of authority.

## Release Note

- Added repository-intelligence commands for derived index, impact, and context-pack output: `truthmark index`, `truthmark impact --base <ref>`, and `truthmark context --workflow <workflow>`.

## Verification

- `npm test -- tests/context-pack/build.test.ts tests/repo-index/build.test.ts tests/impact/build.test.ts tests/cli/index-impact-context.test.ts`
