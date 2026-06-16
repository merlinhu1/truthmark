---
status: active
doc_type: routing
last_reviewed: 2026-05-16
---

# Truthmark Areas

The root route index delegates Truthmark's main behavior surfaces to smaller area files.

## Contracts And Commands

Area files:

- docs/truthmark/routes/areas/contracts-and-commands.md

Code surface:

- src/cli/\*\*
- src/config/command.ts
- src/config/defaults.ts
- src/config/load.ts
- src/config/schema.ts
- src/output/\*\*

Update truth when:

- config file or command contracts change
- supported platforms or generated surface contract fields change
- user-visible result envelopes, diagnostics, or command options change

## Initialization And Scaffold

Area files:

- docs/truthmark/routes/areas/init-and-scaffold.md

Code surface:

- src/fs/paths.ts
- src/init/\*\*
- src/templates/\*\*
- tests/init/\*\*

Update truth when:

- `truthmark init` scaffolds or refreshes files differently
- default canonical docs or generated surface lists change
- configured hierarchy scaffold behavior changes

## Check And Routing

Area files:

- docs/truthmark/routes/areas/check-and-routing.md

Code surface:

- src/checks/\*\*
- src/config/load.ts
- src/git/\*\*
- src/markdown/\*\*
- src/routing/\*\*
- src/types/\*\*

Update truth when:

- validation or area-resolution behavior changes
- branch-scope or repository discovery behavior changes
- routed code coverage expectations change

## Installed Workflows

Area files:

- docs/truthmark/routes/areas/installed-workflows.md

Code surface:

- src/agents/\*\*
- src/generation/\*\*
- src/realize/\*\*
- src/sync/\*\*
- src/templates/agents-block.ts
- src/templates/workflow-surfaces.ts
- src/templates/generated-surfaces.ts
- src/truth/\*\*
- src/version.ts
- tests/evals/\*\*
- tests/templates/\*\*

Update truth when:

- installed workflow boundaries or report shapes change
- generated instruction block or skill content changes
- workflow version markers or sync classification behavior changes

## Release Automation

Area files:

- docs/truthmark/routes/areas/release-automation.md

Code surface:

- .github/workflows/\*\*
- src/templates/github-action.ts

Update truth when:

- CI verification steps or triggers change
- release publishing prerequisites or publish steps change

## Repository Intelligence

Area files:

- docs/truthmark/routes/areas/repository-intelligence.md

Code surface:

- src/repo-index/\*\*
- src/impact/\*\*
- src/evidence/\*\*
- src/freshness/\*\*
- src/workflow-state/\*\*

Update truth when:

- workflow indexing, route-map, route-first impact analysis, evidence validation, freshness checks, or workflow-state/action-context behavior changes
- `truthmark index`, `truthmark impact`, or `truthmark workflow status` result shapes change

## Source References

- ../../README.md
- ../../ai/repo-rules.md
- ../../../.truthmark/config.yml
