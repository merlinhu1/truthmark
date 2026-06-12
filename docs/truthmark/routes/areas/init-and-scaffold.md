---
status: active
doc_type: routing
last_reviewed: 2026-05-14
source_of_truth:
  - ../areas.md
  - ../../README.md
  - ../../ai/repo-rules.md
---

# Initialization And Scaffold Areas

## Initialization And Scaffold

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/truth/architecture/overview.md
    kind: architecture
  - path: docs/truthmark/truth/architecture/module-map.md
    kind: architecture
  - path: docs/truthmark/truth/init-and-scaffold.md
    kind: behavior
  - path: docs/truthmark/truth/repository/overview.md
    kind: behavior
```

Code surface:
- src/fs/paths.ts
- src/init/**
- src/templates/**
- tests/init/**

Update truth when:
- `truthmark init` scaffolds or refreshes files differently
- default canonical docs or generated surface lists change
- configured hierarchy scaffold behavior changes
