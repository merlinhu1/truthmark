---
status: active
doc_type: routing
last_reviewed: 2026-05-14
source_of_truth:
  - ../areas.md
  - ../../README.md
  - ../../ai/repo-rules.md
---

# Check And Routing Areas

## Check And Routing

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/contracts.md
    kind: contract
  - path: docs/architecture/overview.md
    kind: architecture
  - path: docs/architecture/module-map.md
    kind: architecture
  - path: docs/truth/check-diagnostics.md
    kind: behavior
  - path: docs/truth/routing-examples.md
    kind: behavior
```

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
