---
status: active
doc_type: routing
last_reviewed: 2026-05-14
---

# Initialization And Scaffold Areas

## Initialization And Scaffold

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
  - path: docs/truthmark/engineering/architecture/overview.md
    kind: engineering-architecture
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/lane-separated-truth.md
  - path: docs/truthmark/engineering/behaviors/init-and-scaffold.md
    kind: engineering-behavior
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/lane-separated-truth.md
```

Code surface:

- src/fs/paths.ts
- src/init/\*\*
- src/templates/\*\*
- tests/init/\*\*

Update truth when:

- `truthmark init` scaffolds or refreshes files differently
- default canonical docs or generated surface lists change
- configured hierarchy scaffold behavior changes

## Source References

- ../areas.md
- ../../README.md
- ../../ai/repo-rules.md
