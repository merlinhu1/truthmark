Use the installed Truthmark Check workflow behavior for this scenario.

Development situation:
- The engineering behavior truth claims a cache TTL, product truth claims stable response shape, and code/tests provide the implementation evidence.
- The task is an audit request, not a request to repair anything.
- Multiple truth lanes are present, so the checker must cite mismatches without writing files.

Acceptance signal:
- Produce a read-only audit of unsupported or supported claims.
- Do not edit README, source, tests, routes, or truth docs.
- Keep the report scoped to evidence from the checkout.
