---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-06-29
---

# Widget API Contract

## Contract Surface

- `readWidgetForTenant(tenant)` returns `<value>:<tenant>`.
- `defaultCacheEntry(key, value)` owns the default freshness and stale-revalidation windows.
- Metrics names remain stable for dashboards and alert rules.

## Compatibility Notes

- Internal cache tuning may change `maxAgeSeconds`.
- The API response shape must not change during cache tuning.
