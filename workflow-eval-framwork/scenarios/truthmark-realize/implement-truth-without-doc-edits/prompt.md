Use the installed Truthmark Realize workflow behavior for this scenario.

Development situation:
- Product truth says the public response shape must stay stable.
- Engineering behavior truth asks for a 120 second cache freshness window.
- API contract and tests are present, so the implementation should be a bounded cache-owner code/test change, not a truth-doc rewrite.

Acceptance signal:
- Implement the behavior in `src/cache.ts` and update the cache behavior test in `tests/widget-cache.test.ts`.
- Preserve the public response shape and avoid artificial changes to unrelated source surfaces.
- Do not edit any `docs/truthmark/**` truth or route files.
- Report the implementation evidence and any checks run or skipped.
