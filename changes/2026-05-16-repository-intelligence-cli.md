# Repository Intelligence CLI

Version action: minor

## PR Summary

- Public `truthmark index`, `truthmark impact`, and `truthmark workflow status` commands expose RepoIndex, RouteMap, ImpactSet, and WorkflowState JSON contracts.
- Freshness diagnostics and workflow-facing repository-intelligence guidance preserve direct checkout inspection as the source of authority.

## Release Note

- Repository-intelligence commands provide derived index, impact, and bounded workflow-state output: `truthmark index`, `truthmark impact --base <ref>`, and `truthmark workflow status --workflow <workflow>`.

## Verification

- `npm test -- tests/repo-index/build.test.ts tests/impact/build.test.ts tests/workflow-state/build.test.ts tests/cli/index-impact-context.test.ts`
