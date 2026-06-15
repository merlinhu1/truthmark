## 1. Contract Tests First

- [x] 1.1 Update `tests/cli/index-impact-context.test.ts` to stop treating ContextPack Markdown as the desired contract; add a failing test that `truthmark workflow status --workflow truthmark-sync --base main --json` exposes compact replacement data needed by agents: applicability, actionContext.allowedWritePaths, targetTruthDocs, changedFiles, affectedRoutes, checks/helpers, nextSteps, and diagnostics. Expected before implementation: FAIL only for fields not currently present, especially compact test guidance if absent.
- [x] 1.2 Extend `tests/cli/index-impact-context.test.ts` or create `tests/cli/context-deprecation.test.ts` for the chosen retirement path. If hard removal is chosen, assert `truthmark --help` no longer lists `context`. If shim is chosen, assert `truthmark context --workflow truth-sync --base main --json` returns deprecation guidance naming `workflow status` and `impact` and does not return `contextPack`, `truthDocs`, `sourceFiles`, or file `content`.
- [x] 1.3 Preserve and strengthen the no-content invariant in `tests/cli/index-impact-context.test.ts`: serialize both workflow status and impact outputs and assert they do not contain `"contextPack"`, `"sourceFiles"`, `"truthDocs":[{`, or `"content":`.
- [x] 1.4 Add or update `tests/workflow-state/build.test.ts` to assert `buildWorkflowState()` no longer accepts or consults ContextPack behavior, but still exposes compact allowed write paths, target truth docs, changed files, affected routes, diagnostics, and test guidance.
- [x] 1.5 Run `npx vitest run tests/cli/index-impact-context.test.ts tests/workflow-state/build.test.ts`; expected result after this task and before implementation is failing tests that describe the planned folded contract.

## 2. Fold Compact Data Into WorkflowState

- [x] 2.1 Inspect `src/workflow-state/types.ts` and decide whether existing fields already cover all replacement data. If affected test paths are not sufficient, add a compact field such as `checks.testCommands: string[]` or `checks.affectedTests: string[]`; do not add file contents.
- [x] 2.2 Modify `src/workflow-state/build.ts` so test guidance is derived from `impactSet?.affectedTests ?? []` without calling `buildContextPack()` or reading file bodies. If command strings are needed, extract a small helper equivalent to `npm test` / `npm test -- <affected tests>`.
- [x] 2.3 Verify `truthmark-sync` status with `--base` includes route-index/truth-doc allowed write paths via `actionContext.allowedWritePaths` and `targetTruthDocs`, using the existing `buildWorkflowActionContext()` path rather than ContextPack.
- [x] 2.4 Verify `truthmark-realize` status with `--base` includes compact code-write boundaries from affected routes and does not require ContextPack.
- [x] 2.5 Run `npx vitest run tests/workflow-state/build.test.ts`; expected result: workflow state tests pass and serialized state remains content-free.

## 3. Retire Public Context Command

- [x] 3.1 Choose the retirement mode from `openspec/changes/fold-contextpack-into-workflow-impact/design.md`: hard removal preferred if no compatibility window is needed; deprecation shim acceptable if command removal is too abrupt.
- [x] 3.2 Modify `src/cli/program.ts` to remove the `context` command from help for hard removal, or keep a minimal `context` parser only for deprecation guidance. Do not keep `--format json` as a hidden ContextPack data path.
- [x] 3.3 Modify `src/cli/handlers.ts` to remove `runContext()` and ContextPack format handling for hard removal, or replace it with a deprecation result that names exact replacement commands and never calls `buildContextPack()`.
- [x] 3.4 Update `tests/cli/help.test.ts` to match the chosen public command surface.
- [x] 3.5 Run `npx vitest run tests/cli/help.test.ts tests/cli/index-impact-context.test.ts`; expected result: context retirement/deprecation tests pass.

## 4. Remove or Shrink ContextPack Internals

- [x] 4.1 Search for imports/usages with `rg "context-pack|ContextPack|buildContextPack|renderContextPackMarkdown|runContext|truthmark context|context --workflow" src tests README*.md docs research changes`.
- [x] 4.2 Delete `src/context-pack/render.ts` and public ContextPack rendering tests if the command is hard-removed. If a temporary shim remains, ensure it does not depend on renderer code.
- [x] 4.3 Delete `src/context-pack/build.ts` and `src/context-pack/types.ts` if no internal compact helpers remain. If helper logic remains, move it to a name that reflects compact path/test/write derivation, for example `src/workflow-state/test-commands.ts` or `src/workflow-state/write-paths.ts`.
- [x] 4.4 Remove tests that assert Markdown ContextPack output is generated. Replace them with tests for workflow status and impact replacement commands.
- [x] 4.5 Run `npm run typecheck`; expected result: no missing ContextPack imports or type errors.

## 5. Documentation And Truth Updates

- [x] 5.1 Update `README.md` command tables and examples: replace `truthmark context --workflow ...` / ContextPack descriptions with `truthmark workflow status --workflow ... --json` and `truthmark impact --base ... --json` guidance.
- [x] 5.2 Update localized root READMEs (`README.zh.md`, `README.es.md`, `README.de.md`, `README.ru.md`) with equivalent natural-language changes.
- [x] 5.3 Update `docs/truthmark/engineering/repository/repository-intelligence.md` to describe the folded design: RepoIndex/RouteMap/ImpactSet/WorkflowState/action context are compact helpers; ContextPack is retired or deprecated; no helper emits file contents.
- [x] 5.4 Update `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md` with the public command contract decision for context retirement/deprecation and no-content replacement outputs.
- [x] 5.5 Update `docs/truthmark/product/capabilities/agent-native-workflow-injection.md` and `docs/truthmark/engineering/workflows/installed-workflow-runtime.md` only if generated workflow guidance or product capability text still tells agents to use ContextPack.
- [x] 5.6 Update `docs/truthmark/routes/areas/repository-intelligence.md` if route ownership or update triggers mention ContextPack as a current artifact.
- [x] 5.7 Run stale-term sweeps: `rg "ContextPack|truthmark context|context --workflow|src/context-pack|buildContextPack|renderContextPackMarkdown" README*.md docs src tests research changes`. Intentional historical mentions must explicitly say retired/deprecated and must not instruct agents to use ContextPack.

## 6. Verification

- [x] 6.1 Run focused tests: `npx vitest run tests/cli/index-impact-context.test.ts tests/cli/check-workflow.test.ts tests/workflow-state/build.test.ts tests/cli/help.test.ts`.
- [x] 6.2 Run `npm run typecheck`.
- [x] 6.3 Run `npm run build`.
- [x] 6.4 Run built-artifact verification: `node dist/main.js workflow status --workflow truthmark-check --json` from a temporary git repo, plus a configured temp repo workflow-status probe; verify `node dist/main.js context --workflow truth-sync --json` fails as an unknown command for hard removal.
- [x] 6.5 Run Truthmark validation from the source tree: `npx tsx src/cli/main.ts check --json` and `npx tsx src/cli/main.ts index --json`.
- [x] 6.6 Run OpenSpec validation: `/opt/data/node/bin/openspec validate fold-contextpack-into-workflow-impact --strict --json` and `/opt/data/node/bin/openspec status --change fold-contextpack-into-workflow-impact --json`.
- [x] 6.7 Run `git diff --check` before commit.

## 7. Commit Boundary

- [ ] 7.1 Commit the OpenSpec plan separately if requested, with message `docs: plan contextpack folding with openspec`.
- [ ] 7.2 Commit implementation separately from the plan unless Merlin explicitly asks for one combined commit.
