---
status: active
doc_type: routing
last_reviewed: 2026-05-16
---

# Repository Intelligence Areas

## Repository Intelligence

Truth documents:

```yaml
truth_documents:
  - path: docs/truthmark/product/capabilities/lane-separated-truth.md
    kind: product-capability
    lane: product
    realized_by:
      - docs/truthmark/engineering/architecture/overview.md
      - docs/truthmark/engineering/behaviors/check-diagnostics.md
      - docs/truthmark/engineering/behaviors/init-and-scaffold.md
      - docs/truthmark/engineering/contracts/config-route-and-check-contracts.md
      - docs/truthmark/engineering/repository/repository-intelligence.md
  - path: docs/truthmark/engineering/repository/repository-intelligence.md
    kind: engineering-behavior
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/lane-separated-truth.md
```

Code surface:

- src/repo-index/\*\*
- src/impact/\*\*
- src/evidence/\*\*
- src/freshness/\*\*
- src/workflow-state/\*\*

Update truth when:

- RepoIndex, RouteMap, ImpactSet, evidence validation, freshness diagnostics, or WorkflowState/action-context behavior changes
- repository-intelligence command output changes

## Source References

- ../areas.md
- ../../README.md
- ../../ai/repo-rules.md
