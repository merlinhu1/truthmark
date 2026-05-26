# Blocked Report Manual Review Contract

Version action: none

## PR Summary
- Align Truth Sync blocked-report rendering with the documented validator contract by requiring at least one manual-review file before rendering `Files requiring manual review`.

## Release Note
- Truth Sync blocked-report rendering now rejects empty manual-review file lists instead of producing validator-invalid blocked reports.

## Verification
- `npx vitest run tests/sync/report.test.ts tests/agents/workflow-helper-scripts.test.ts tests/agents/truth-sync.test.ts`
- `npm run check`
- `node dist/main.js check --json`
- `node dist/main.js index --json`
- `git diff --check`
