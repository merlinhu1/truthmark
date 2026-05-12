---
status: active
doc_type: routing
last_reviewed: 2026-05-13
source_of_truth:
  - ../README.md
  - ../ai/repo-rules.md
  - ../../.truthmark/config.yml
---

# Truthmark Areas

The root route index delegates Truthmark's main behavior surfaces to smaller area files.

## Contracts And Commands

Area files:
- docs/truthmark/areas/contracts-and-commands.md

Code surface:
- src/cli/**
- src/config/command.ts
- src/config/defaults.ts
- src/config/schema.ts
- src/output/**

Update truth when:
- config file or command contracts change
- supported platforms or generated surface contract fields change
- user-visible result envelopes, diagnostics, or command options change

## Initialization And Scaffold

Area files:
- docs/truthmark/areas/init-and-scaffold.md

Code surface:
- src/fs/paths.ts
- src/init/**
- src/templates/default-standards.ts
- src/templates/generated-surfaces.ts
- src/templates/init-files.ts

Update truth when:
- `truthmark init` scaffolds or refreshes files differently
- default canonical docs or generated surface lists change
- hierarchy migration review behavior changes

## Check And Routing

Area files:
- docs/truthmark/areas/check-and-routing.md

Code surface:
- src/checks/**
- src/config/load.ts
- src/git/**
- src/markdown/**
- src/routing/**
- src/types/**

Update truth when:
- validation or area-resolution behavior changes
- branch-scope or repository discovery behavior changes
- routed code coverage expectations change

## Installed Workflows

Area files:
- docs/truthmark/areas/installed-workflows.md

Code surface:
- src/agents/**
- src/realize/**
- src/sync/**
- src/templates/agents-block.ts
- src/templates/codex-skills.ts
- src/templates/generated-surfaces.ts
- src/version.ts

Update truth when:
- installed workflow boundaries or report shapes change
- generated instruction block or skill content changes
- workflow version markers or sync classification behavior changes

## Release Automation

Area files:
- docs/truthmark/areas/release-automation.md

Code surface:
- .github/workflows/**

Update truth when:
- CI verification steps or triggers change
- release publishing prerequisites or publish steps change
