## Why

`truthmark context` no longer justifies its standalone surface. JSON ContextPack output was removed because content-rich packs are token-expensive, while the remaining Markdown output is mostly a path/test/write-boundary list that overlaps with `truthmark workflow status` and `truthmark impact`.

This change folds the useful compact ContextPack behavior into existing workflow and impact outputs, keeps agent payloads content-free, and removes the misleading expectation that Truthmark will prepack source/doc excerpts.

## What Changes

- **BREAKING**: Deprecate and then remove the standalone `truthmark context` command surface instead of expanding ContextPack back into a content-bearing artifact.
- Move workflow-scoped allowed-write-path and test-command hints into the `truthmark workflow status --json` contract.
- Keep changed-file, affected-route, affected-truth-doc, affected-test, diagnostic, and public-symbol information in `truthmark impact --json`.
- Remove public ContextPack Markdown/JSON rendering and stop reading truth/source file contents for ContextPack-only output.
- Keep internal shared helpers only if they compute compact paths, allowed writes, tests, or diagnostics without reading file contents.
- Update README/localized README, engineering/product truth docs, and generated/help surfaces so agents are directed to `workflow status` plus `impact`, not `context`.
- Preserve the explicit no-content invariant: no workflow/impact replacement output includes truth-doc or source-file contents.

## Capabilities

### New Capabilities
- `workflow-impact-context-folding`: Defines the compact replacement for ContextPack behavior using WorkflowState and ImpactSet without content-bearing context packs.

### Modified Capabilities
- None. This repository does not yet have archived OpenSpec specs; this change introduces the capability contract for the planned patch.

## Impact

Affected implementation and tests:

- `src/cli/program.ts`
- `src/cli/handlers.ts`
- `src/context-pack/**`
- `src/workflow-state/build.ts`
- `src/workflow-state/types.ts`
- `src/workflow-state/action-context.ts`
- `src/impact/build.ts` and `src/impact/types.ts` only if missing compact fields must move there
- `tests/cli/index-impact-context.test.ts`
- `tests/cli/check-workflow.test.ts`
- `tests/workflow-state/build.test.ts`
- `tests/workflow-state/action-context.test.ts` if action-context helpers move
- `tests/cli/help.test.ts`
- `tests/cli/build-artifact.test.ts`

Affected docs/truth surfaces:

- `README.md` and localized root READMEs
- `docs/truthmark/engineering/repository/repository-intelligence.md`
- `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md`
- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`
- `docs/truthmark/engineering/workflows/installed-workflow-runtime.md` if generated workflow guidance changes
- `docs/truthmark/routes/areas/repository-intelligence.md` if ownership text for context artifacts changes
