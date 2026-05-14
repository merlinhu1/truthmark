---
status: active
doc_type: routing
last_reviewed: 2026-05-14
source_of_truth:
  - ../areas.md
  - ../../README.md
  - ../../ai/repo-rules.md
---

# Contracts And Commands Areas

## Contracts And Commands

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/contracts.md
    kind: contract
```

Code surface:
- src/cli/**
- src/config/command.ts
- src/config/defaults.ts
- src/config/schema.ts
- src/output/**

Update truth when:
- config file shape or defaults change
- command names, options, or JSON envelope contracts change
- diagnostic categories or severities exposed to users change
