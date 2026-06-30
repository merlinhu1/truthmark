---
status: active
truth_kind: engineering-operations
last_reviewed: 2026-06-29
---

# Widget Observability

## Operational Signals

- Cache hit counters use the `widget.cache.hit` metric name.
- Tenant tags identify cache behavior by tenant without logging raw widget values.

## Review Notes

- Workflow agents should distinguish operational truth from API contract truth.
