Use the installed Truthmark Sync workflow behavior for this scenario.

Development situation:
- A widget cache source change is present, but route ownership is still too broad/bootstrap-like for safe truth writes.
- Product, behavior, contract, operations, and test files are all nearby and plausible.
- The right outcome is to stop and hand off to Truth Structure instead of guessing a truth owner.

Acceptance signal:
- Report the routing/topology blocker.
- Do not edit source files or behavior truth.
- Recommend bounded Structure repair before Sync writes truth.
- Run `npx tsx src/cli/main.ts check --json`, or explicitly explain why that exact repository check command was skipped after the blocked decision.
