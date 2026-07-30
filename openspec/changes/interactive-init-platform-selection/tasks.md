## 1. Platform selection contract

- [x] 1.1 Add failing unit cases in `tests/cli/platform-selection.test.ts` for catalog-order numbering, comma-separated multi-select, duplicate inputs, `none`, default retention, unsupported tokens, and cancellation.
- [x] 1.2 Create `src/cli/platform-selection.ts` using `node:readline/promises`, injected input/output streams, the existing `SUPPORTED_PLATFORMS` catalog, and no external dependency.
- [x] 1.3 Run `node --import tsx --test tests/cli/platform-selection.test.ts` and require all prompt/parser cases to pass.

## 2. Config rendering and preservation

- [x] 2.1 Replace `tests/config/config-command.test.ts` with failing `tests/config/render.test.ts` cases for host-neutral version-2 rendering, selected-platform rendering, supported-value and comment preservation, platform removal, and byte-identical unchanged selection.
- [x] 2.2 Create `src/config/render.ts` to render `createDefaultRawConfig()` with an optional platform set and to update only the YAML document's top-level `platforms` node for valid existing source.
- [x] 2.3 Remove `renderConfigTemplate` from `src/templates/init-files.ts` after all config rendering callers use `src/config/render.ts`.
- [x] 2.4 Run `node --import tsx --test tests/config/render.test.ts tests/config/load.test.ts` and require version-2 schema and preservation cases to pass.

## 3. Init orchestration

- [x] 3.1 Add failing cases in `tests/init/interactive-platform-selection.test.ts` for explicit platforms, prompted first run, saved defaults, `none`, cancellation, unsupported values, invalid existing config, host-neutral noninteractive first run, duplicate normalization, and no implicit host selection.
- [x] 3.2 Extend `runInit` in `src/init/init.ts` with typed init options for explicit values and an optional selector callback; resolve explicit, interactive, saved, and host-neutral inputs in that order.
- [x] 3.3 Build the normalized renderer config and proposed config bytes in memory, then run existing generated-surface preflight before any config, scaffold, lifecycle, or surface write.
- [x] 3.4 Write or update `.truthmark/config.yml` only after applicable lifecycle preflight, preserve invalid configs unchanged, and include the config write result in normal init diagnostics.
- [x] 3.5 Add rerun cases proving selected platforms generate only their existing surfaces and platform removal uses current ownership rules without deleting divergent, user-owned, or retired Gemini content.
- [x] 3.6 Run `node --import tsx --test tests/init/interactive-platform-selection.test.ts tests/init/init-instructions.test.ts tests/integration/init-check-workflow.test.ts` and require all init and runtime-regression cases to pass.

## 4. CLI surface and command removal

- [x] 4.1 Add failing CLI tests in `tests/cli/help.test.ts` and `tests/cli/program.test.ts` for repeatable `init --platform`, no prompt under `--json`, absence of `config` from help, and nonzero unknown-command behavior for `truthmark config`.
- [x] 4.2 Modify `src/cli/program.ts` to collect repeatable raw platform values, pass JSON and TTY context to the handler, and remove `ConfigOptions` plus the `config` command registration.
- [x] 4.3 Modify `src/cli/handlers.ts` to remove `runConfig` and to pass explicit platforms plus the interactive selector into repository init only when stdin and stdout are TTYs and JSON output is disabled.
- [x] 4.4 Delete `src/config/command.ts` and remove all production exports and imports of `runConfig` and `ConfigCommandOptions`.
- [x] 4.5 Run `node --import tsx --test tests/cli/platform-selection.test.ts tests/cli/help.test.ts tests/cli/program.test.ts` and require parser, help, JSON, cancellation, and removed-command cases to pass.

## 5. Test fixture migration and package smoke

- [x] 5.1 Add `tests/helpers/truthmark-config.ts` with a deterministic test-only writer backed by `src/config/render.ts`; do not recreate a production config command.
- [x] 5.2 Replace `runConfig` setup imports and retired CLI setup calls in `tests/integration/branch-scope.test.ts`, `tests/integration/agent-workflow-contract.test.ts`, `tests/integration/init-check-workflow.test.ts`, `tests/checks/check.test.ts`, `tests/checks/check-truth-kinds.test.ts`, `tests/cli/index-impact-context.test.ts`, `tests/checks/branch-scope.test.ts`, `tests/cli/program.test.ts`, `tests/cli/build-artifact.test.ts`, `tests/config/load.test.ts`, `tests/freshness/check.test.ts`, `tests/workflow-state/build.test.ts`, `tests/init/uninstall.test.ts`, `tests/init/init-instructions.test.ts`, `tests/lifecycle/uninstall.test.ts`, `tests/impact/build.test.ts`, `tests/repo-index/route-map.test.ts`, and `tests/repo-index/build.test.ts` with the helper or explicit `runInit`/CLI platform input as appropriate.
- [x] 5.3 Extend `tests/cli/build-artifact.test.ts` to build first, initialize a fresh external repository through `dist/main.js init --platform codex --json`, verify version-2 config and Codex surfaces, and verify the built artifact rejects `config`.
- [x] 5.4 Run `node --import tsx --test tests/cli/build-artifact.test.ts tests/package-files.test.ts` after `npm run build` and require source-independent CLI behavior to pass.

## 6. Canonical truth and active documentation

- [x] 6.1 Update `docs/truthmark/engineering/behaviors/init-and-scaffold.md` with one-command init, interactive and explicit platform selection, host-neutral empty selection, config preservation, and unchanged finish-time Sync behavior.
- [x] 6.2 Update `docs/truthmark/engineering/contracts/config-route-and-check-contracts.md` with platform-resolution precedence, version-2 persistence, invalid-config fail-closed behavior, and removal of the config command.
- [x] 6.3 Update `docs/truthmark/routes/areas/contracts-and-commands.md` and `docs/truthmark/routes/areas.md` to replace deleted `src/config/command.ts` ownership with `src/config/render.ts`; retain existing `src/cli/**` and init ownership without introducing overlapping routes.
- [x] 6.4 Update active setup instructions in `README.md`, `docs/README.md`, `docs/user-guide.md`, and every `docs/readmes/README.*.md` so setup begins with `truthmark init`, explains platform selection and `--platform`, and no longer requires manual platform YAML editing.
- [x] 6.5 Run `rg -n "truthmark config|runConfig|ConfigCommandOptions" src tests README.md docs/README.md docs/user-guide.md docs/readmes` and require zero active matches; allow canonical truth, OpenSpec, research, and historical change notes to name removed surfaces only as removal rationale or history.

## 7. Minor-version metadata and final verification

- [x] 7.1 Run `npm version 2.3.0 --no-git-tag-version` and verify only `package.json` and `package-lock.json` receive the package-version change; keep `.truthmark/config.yml` at schema version 2.
- [x] 7.2 Add `changes/2026-07-30-version-2-3-0.md` documenting the non-breaking config-command simplification, the `truthmark init` replacement, version-2 config continuity, and deferred Personal installation without publishing the package.
- [x] 7.3 Run `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run package:check`, and `npm pack --dry-run`; require every command to exit zero.
- [x] 7.4 Run `node --import tsx src/cli/main.ts check --json` and `node --import tsx src/cli/main.ts index --json`; require no error diagnostics and clean generated-surface freshness.
- [x] 7.5 Run `/opt/data/node/bin/openspec validate interactive-init-platform-selection --strict --json`, `/opt/data/node/bin/openspec status --change interactive-init-platform-selection --json`, `git diff --check`, `git status --short --branch`, and a deleted-test review; require valid OpenSpec artifacts, no accidental test deletion, and only intended implementation, generated, truth, documentation, release, and plan files.
