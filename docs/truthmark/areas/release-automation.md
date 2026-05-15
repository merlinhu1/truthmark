---
status: active
doc_type: routing
last_reviewed: 2026-05-14
source_of_truth:
  - ../areas.md
  - ../../README.md
  - ../../ai/repo-rules.md
---

# Release Automation Areas

## Release Automation

Truth documents:
```yaml
truth_documents:
  - path: docs/truth/release/automation.md
    kind: workflow
```

Code surface:
- .github/workflows/**
- src/templates/github-action.ts

Update truth when:
- CI verification steps or triggers change
- release publishing prerequisites or publish steps change
- GitHub Action examples or action template rendering changes
