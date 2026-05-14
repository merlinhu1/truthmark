---
status: active
doc_type: routing
last_reviewed: 2026-05-14
source_of_truth:
  - ../areas.md
  - ../../README.md
  - ../../ai/repo-rules.md
---

# Installed Workflows Areas

## Installed Workflows

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/contracts.md
    kind: contract
  - path: docs/truth/installed-workflows.md
    kind: workflow
```

Code surface:
- src/agents/**
- src/generation/**
- src/realize/**
- src/sync/**
- src/templates/agents-block.ts
- src/templates/codex-skills.ts
- src/templates/generated-surfaces.ts
- src/truth/**
- src/version.ts

Update truth when:
- installed workflow boundaries or report shapes change
- generated instruction block or skill content changes
- workflow version markers or sync classification behavior changes
