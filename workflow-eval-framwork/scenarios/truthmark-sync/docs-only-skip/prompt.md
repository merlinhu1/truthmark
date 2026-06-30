Use the installed Truthmark Sync workflow behavior for this scenario.

Development situation:
- A maintainer only changed README release-note prose.
- The checkout also contains a realistic widget cache service, product truth, engineering behavior truth, API contract truth, operations truth, and tests.
- There is no functional source diff for the agent to reconcile.

Acceptance signal:
- Identify this as docs-only/no-code work.
- Do not edit source or canonical truth docs.
- If reporting, explain why no write workflow should launch.
- Run `npx tsx src/cli/main.ts check --json`, or explicitly explain why that exact repository check command was skipped for docs-only/no-code work.
