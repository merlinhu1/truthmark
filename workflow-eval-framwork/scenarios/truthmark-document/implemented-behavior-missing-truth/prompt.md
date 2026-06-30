Use the installed Truthmark Document workflow behavior for this scenario.

Development situation:
- The TypeScript widget cache behavior exists in code and tests.
- Product, API contract, and operations truth are present, but the bounded engineering behavior truth file is missing.
- The correct work is documentation of implemented behavior, not code edits.

Acceptance signal:
- Create the missing engineering behavior truth doc for widget cache behavior.
- Preserve source files and existing product/contract/operations docs.
- Include source-backed current-state claims, not future requirements.
- Run `npx tsx src/cli/main.ts check --json`, or explicitly explain why that exact repository verification command was skipped for this docs-only fixture.
