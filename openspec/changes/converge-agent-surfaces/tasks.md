## 1. Baseline and fixtures

- [x] 1.1 Add a fixture test that records the current workflow package inventory from `TRUTHMARK_WORKFLOW_IDS` in `src/agents/workflow-manifest.ts`; run `npm run test -- tests/agents/workflow-manifest.test.ts -t "lists every workflow"` and expect it to pass before refactoring.
- [x] 1.2 Add a failing generated-surface test in `tests/templates/generated-surfaces.test.ts` asserting `renderGeneratedSurfaces(defaultAgentConfig())` includes `.truthmark/agent/manifest.json`; run `npm run test -- tests/templates/generated-surfaces.test.ts -t "renders canonical agent package manifest"` and expect FAIL because the package is not generated yet.
- [x] 1.3 Add a failing generated-surface test asserting each workflow has `.truthmark/agent/workflows/<workflow>/SKILL.md`; run the same focused test file and expect FAIL.
- [x] 1.4 Add a failing disk-level init/check test in `tests/init/init.test.ts` asserting `runInit` writes `.truthmark/agent/manifest.json` and workflow package files; run `npm run test -- tests/init/init.test.ts -t "writes canonical agent package"` and expect FAIL.

## 2. Canonical package renderer

- [x] 2.1 Create canonical package types in `src/templates/workflow-surfaces.ts` or a new `src/templates/agent-package.ts`: package manifest entry, canonical package file, adapter mode, canonical hash input.
- [x] 2.2 Implement deterministic package path helpers for `.truthmark/agent/manifest.json`, `.truthmark/agent/workflows/<workflow>/SKILL.md`, `procedure.md`, `report-template.md`, `subagents.md`, and `helpers.json`.
- [x] 2.3 Reuse existing `renderTruthmarkSkillPackage` and `renderWorkflowSupportParts` logic to render canonical package files instead of duplicating renderer code.
- [x] 2.4 Implement canonical package hash calculation using repository-relative path plus file content; exclude absolute checkout paths and operational fields.
- [x] 2.5 Add `.truthmark/agent/manifest.json` rendering that lists version, schema version, workflows, canonical paths, support files, adapter modes, and hashes.
- [x] 2.6 Wire canonical package files into `renderGeneratedSurfaces(config)` in `src/templates/generated-surfaces.ts`.
- [x] 2.7 Run `npm run test -- tests/templates/generated-surfaces.test.ts tests/agents/workflow-manifest.test.ts` and expect the new package tests to pass.

## 3. Adapter rendering

- [x] 3.1 Add adapter rendering helpers that produce thin host files with canonical package references and host invocation metadata only.
- [x] 3.2 Add an `adapterMode` decision point per host/workflow with default `adapter` and explicit `expanded-adapter` override for hosts that still need inline prompt bodies.
- [x] 3.3 Convert one low-risk host package renderer, preferably `.agents` or `.opencode`, to adapter mode.
- [x] 3.4 Add tests asserting adapter-mode generated files contain canonical paths and do not contain full procedure markers such as `Parent workflow:`, `Evidence checklist:`, or `Report completion in this shape:`.
- [x] 3.5 Add tests asserting expanded-adapter mode includes provenance comments with adapter mode, canonical path, canonical hash, and generated hash.
- [x] 3.6 Run `npm run test -- tests/templates/generated-surfaces.test.ts tests/agents/truth-sync.test.ts tests/agents/truth-document.test.ts tests/agents/truth-structure.test.ts` and expect PASS.

## 4. Freshness and hygiene checks

- [x] 4.1 Extend `src/checks/generated-surfaces.ts` to validate canonical package existence and manifest hash consistency.
- [x] 4.2 Add adapter hygiene diagnostics for missing canonical file references, stale expanded-adapter hashes, and duplicated workflow prose in adapter-mode files.
- [x] 4.3 Add tests in `tests/checks/check.test.ts` for missing canonical package files, stale manifest hashes, stale expanded adapters, and unauthorized duplicated prompt bodies.
- [x] 4.4 Add a disk-level regression that initializes a temp repository, mutates a canonical package file, and verifies `truthmark check --json` reports generated-surface freshness diagnostics.
- [x] 4.5 Run `npm run test -- tests/checks/check.test.ts tests/integration/init-check-workflow.test.ts` and expect PASS.

## 5. Host migration pass

- [x] 5.1 Convert `.agents` generated workflow skills to adapter mode and run focused generated-surface tests.
- [x] 5.2 Convert `.opencode` generated workflow skills to adapter mode and run focused generated-surface tests.
- [x] 5.3 Convert `.claude` generated workflow skills to adapter mode if Claude reliably reads referenced repository files; otherwise mark as expanded-adapter with provenance.
- [x] 5.4 Convert `.github` Copilot prompts/skills to adapter or expanded-adapter mode based on host reliability; keep Copilot command/prompt metadata host-native.
- [x] 5.5 Convert `.gemini` generated workflow commands/skills to adapter or expanded-adapter mode based on host reliability.
- [x] 5.6 Keep top-level `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` as short managed routing blocks that point to `.truthmark/agent/` and avoid full workflow procedure prose.
- [x] 5.7 Run `npx tsx src/cli/main.ts init --json` in the repository and inspect generated deltas for unintended prompt-body churn.

## 6. Documentation and truth sync

- [x] 6.1 Update engineering truth docs that own generated workflow surfaces, especially `docs/truthmark/engineering/workflows/installed-workflow-runtime.md` and `docs/truthmark/engineering/repository/repository-intelligence.md`, to describe canonical package authority and adapter modes.
- [x] 6.2 Update route metadata under `docs/truthmark/routes/areas/installed-workflows.md` if ownership or sync triggers change.
- [x] 6.3 Update README guidance only if user-facing setup output changes; keep product promises separate from implementation details.
- [x] 6.4 Run `npx tsx src/cli/main.ts check --json` and expect no diagnostics.

## 7. Full verification

- [x] 7.1 Run exact stale-copy scans: `rg -n "Parent workflow:|Evidence checklist:|Report completion in this shape" .agents .claude .gemini .github .opencode AGENTS.md CLAUDE.md GEMINI.md` and verify only expanded-adapter files contain full bodies.
- [x] 7.2 Run exact retired-wording scans from the current workflow-surface hygiene suite and verify adapter migration did not reintroduce stale enforcement metaphors.
- [x] 7.3 Run `npm run typecheck` and expect PASS.
- [x] 7.4 Run `npm run lint` and expect PASS.
- [x] 7.5 Run `npm run test` and expect all tests to pass.
- [x] 7.6 Run `npm run build` and expect PASS.
- [x] 7.7 Run `git diff --check` and expect no whitespace errors.
- [x] 7.8 Run `openspec validate converge-agent-surfaces --strict --json` and expect the OpenSpec change to remain valid while implementation evolves.
