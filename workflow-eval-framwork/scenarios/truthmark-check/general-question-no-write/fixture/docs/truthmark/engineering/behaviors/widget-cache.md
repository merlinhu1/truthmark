---
status: active
truth_kind: engineering-behavior
last_reviewed: 2026-06-29
---

# Widget Cache

## Current Implementation Behavior

- Widget cache entries use a 60 second freshness window.
- Widget cache entries use a 30 second stale-while-revalidate window.
- Tenant widget reads preserve the `<value>:<tenant>` API response shape.

## Behavior Scenarios

- GIVEN a default cache entry
  WHEN its age is 45 seconds
  THEN the entry is still treated as fresh.
