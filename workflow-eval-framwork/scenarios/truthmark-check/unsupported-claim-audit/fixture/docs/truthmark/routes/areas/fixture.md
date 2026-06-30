---
status: active
doc_type: routing
---

# Widget Cache Area

Truth documents:
```yaml
truth_documents:
  - path: docs/truthmark/product/capabilities/widget-cache.md
    kind: product-capability
    lane: product
  - path: docs/truthmark/engineering/behaviors/widget-cache.md
    kind: engineering-behavior
    lane: engineering
  - path: docs/truthmark/engineering/contracts/widget-api.md
    kind: engineering-contract
    lane: engineering
  - path: docs/truthmark/engineering/operations/widget-observability.md
    kind: engineering-operations
    lane: engineering
```

Code surface:

- src/widget.ts
- src/cache.ts
- src/api.ts
- src/metrics.ts
- tests/widget-cache.test.ts
