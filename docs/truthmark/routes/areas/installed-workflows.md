---
status: active
doc_type: routing
last_reviewed: 2026-05-16
---

# Installed Workflows Areas

## Installed Workflows

Truth documents:

```yaml
truth_documents:
  - path: docs/truthmark/product/capabilities/agent-native-workflow-injection.md
    kind: product-capability
    lane: product
    realized_by:
      - docs/truthmark/engineering/workflows/installed-workflow-runtime.md
      - docs/truthmark/engineering/contracts/generated-host-surfaces.md
  - path: docs/truthmark/engineering/workflows/installed-workflow-runtime.md
    kind: engineering-workflow
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/agent-native-workflow-injection.md
  - path: docs/truthmark/engineering/contracts/generated-host-surfaces.md
    kind: engineering-contract
    lane: engineering
    realizes:
      - docs/truthmark/product/capabilities/agent-native-workflow-injection.md
```

Code surface:

- src/agents/\*\*
- src/generation/\*\*
- src/realize/\*\*
- src/sync/\*\*
- src/templates/agents-block.ts
- src/templates/workflow-surfaces.ts
- src/templates/generated-surfaces.ts
- src/truth/\*\*
- src/version.ts
- tests/evals/\*\*
- tests/templates/\*\*

Update truth when:

- installed workflow boundaries or report shapes change
- generated instruction block or skill content changes
- workflow version markers or sync classification behavior changes
- ownership gates, evidence gates, lane classification gates, decision/rationale preservation gates, or truth-doc split behavior changes

## Source References

- ../areas.md
- ../../README.md
- ../../ai/repo-rules.md
