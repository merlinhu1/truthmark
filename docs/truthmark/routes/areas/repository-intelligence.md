---
status: active
doc_type: routing
last_reviewed: 2026-05-16
source_of_truth:
  - ../areas.md
  - ../../README.md
  - ../../ai/repo-rules.md
---

# Repository Intelligence Areas

## Repository Intelligence

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/truth/repository/repo-index.md
    kind: behavior
  - path: docs/truthmark/truth/repository/impact-set.md
    kind: behavior
  - path: docs/truthmark/truth/repository/context-pack.md
    kind: behavior
  - path: docs/truthmark/truth/repository/workflow-state.md
    kind: behavior
```

Code surface:
- src/repo-index/**
- src/impact/**
- src/evidence/**
- src/freshness/**
- src/context-pack/**
- src/workflow-state/**

Update truth when:
- RepoIndex, RouteMap, ImpactSet, evidence validation, freshness diagnostics, ContextPack behavior, or WorkflowState behavior changes
- repository-intelligence command output changes
