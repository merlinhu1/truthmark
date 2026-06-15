---
status: active
doc_type: routing
last_reviewed: 2026-05-14
---

# Check And Routing Areas

## Check And Routing

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
  - path: docs/truthmark/engineering/contracts/config-route-and-check-contracts.md
    kind: engineering-contract
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/lane-separated-truth.md
  - path: docs/truthmark/engineering/architecture/overview.md
    kind: engineering-architecture
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/lane-separated-truth.md
  - path: docs/truthmark/engineering/behaviors/check-diagnostics.md
    kind: engineering-behavior
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/lane-separated-truth.md
```

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

## Source References

- ../areas.md
- ../../README.md
- ../../ai/repo-rules.md
