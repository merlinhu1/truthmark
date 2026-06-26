---
status: active
doc_type: routing
last_reviewed: 2026-05-14
---

# Release Automation Areas

## Release Automation

Truth documents:

```yaml
truth_documents:
  - path: docs/truthmark/engineering/operations/release-automation.md
    kind: engineering-operations
    lane: engineering
```

Code surface:

- .github/workflows/\*\*
- site/\*\*
- src/templates/github-action.ts

Update truth when:

- CI verification steps or triggers change
- release publishing prerequisites or publish steps change
- CodeQL or other checked-in repository-readiness automation changes
- GitHub Pages deployment or static introduction site behavior changes
- GitHub Action examples or action template rendering changes

## Source References

- ../areas.md
- ../../README.md
- ../../ai/repo-rules.md
