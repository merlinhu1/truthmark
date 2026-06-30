The fixture has a broad catch-all route covering a widget cache service with code, tests, product truth, behavior truth, API contract truth, and operations truth.

Development situation:
- Route ownership is too broad for safe future Sync or Document writes.
- The behavior owner should be narrowed without changing functional code or rewriting behavior truth.
- Nearby product, contract, and operations docs should remain available but not be used as a catch-all owner.

Acceptance signal:
- Run Truth Structure to create or propose bounded ownership for widget cache behavior.
- Keep source files and existing truth docs unchanged.
- Run or specifically explain `npx tsx src/cli/main.ts check --json`.
