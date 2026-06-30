Use the installed Truthmark Sync workflow behavior for this scenario.

Development situation:
- The fixture starts with a functional cache-tuning diff in `src/cache.ts`.
- The product capability and API contract remain stable, while engineering behavior truth is stale.
- Operations truth is adjacent but not the owner of the cache freshness behavior.

Acceptance signal:
- Update only the bounded engineering behavior truth for widget cache freshness.
- Do not change source, product capability, API contract, operations truth, or README files.
- Run or specifically explain `npx tsx src/cli/main.ts check --json`.
