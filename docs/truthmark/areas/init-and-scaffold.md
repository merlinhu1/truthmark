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
  - path: docs/architecture/overview.md
    kind: architecture
  - path: docs/architecture/module-map.md
    kind: architecture
  - path: docs/truth/init-and-scaffold.md
    kind: behavior
  - path: docs/truth/repository/overview.md
    kind: behavior
```

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
