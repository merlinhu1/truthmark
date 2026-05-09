---
status: active
doc_type: routing
last_reviewed: 2026-05-09
source_of_truth:
  - ../areas.md
  - ../../README.md
  - ../../ai/repo-rules.md
---

# Repository Areas

## CLI And Scaffold Surface

Truth documents:
- docs/README.md
- TRUTHMARK.md
- docs/features/contracts.md
- docs/features/init-and-scaffold.md

Code surface:
- src/cli/**
- src/fs/**
- src/init/**
- src/templates/**
- src/output/**

Update truth when:
- command surface or scaffold behavior changes
- generated AGENTS block behavior changes
- human or JSON command output shape changes

## Diagnostics And Routing Surface

Truth documents:
- docs/README.md
- docs/features/contracts.md
- docs/architecture/overview.md
- docs/architecture/module-map.md
- docs/features/check-diagnostics.md
- docs/features/routing-examples.md
- docs/standards/documentation-governance.md

Code surface:
- src/checks/**
- src/config/**
- src/fs/**
- src/git/**
- src/markdown/**
- src/output/**
- src/routing/**
- src/types/**

Update truth when:
- authority, frontmatter, internal-link, or area-validation rules change
- branch-scope, repository-detection, or containment behavior changes
- routed code coverage expectations change

## Installed Workflow Surface

Truth documents:
- docs/README.md
- TRUTHMARK.md
- docs/features/contracts.md
- docs/features/installed-workflows.md

Code surface:
- src/agents/**
- src/realize/**
- src/sync/**
- src/templates/codex-skills.ts
- src/version.ts

Update truth when:
- Truth Sync or Truth Realize boundaries change
- changed-file classification or changed-surface collection changes
- installed report shape, generated skill content, or skip reasons change
- generated workflow version markers change
