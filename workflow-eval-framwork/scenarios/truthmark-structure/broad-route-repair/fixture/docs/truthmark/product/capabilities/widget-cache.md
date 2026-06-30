---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-29
---

# Widget Cache Capability

## Current Product Behavior

- Widget reads return cached values per tenant.
- Users should not see cache implementation details in response text.
- Operators expect cache behavior changes to remain invisible unless a documented user-facing freshness promise changes.

## Acceptance Signals

- Tenant-specific widget reads continue to return the same value shape.
- Cache tuning work should preserve the public response contract.
