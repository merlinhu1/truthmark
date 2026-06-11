## 1. Contract And Failing Tests

- [x] 1.1 Add failing renderer tests in `tests/templates/generated-surfaces.test.ts` that inspect representative generated workflow skill packages for Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini and assert they contain `truthmark workflow status --workflow <full-id> --json`.
- [x] 1.2 Extend the same tests to assert representative workflow surfaces contain `truthmark workflow instructions --workflow <full-id> --json`.
- [x] 1.3 Assert generated workflow surfaces mention exact guardrail paths: `data.workflowState.applicability.state`, `data.workflowState.actionContext.allowedWritePaths`, `data.workflowState.actionContext.forbiddenWritePaths`, `data.workflowState.actionContext.stopConditions`, `data.instructions.stopConditions`, `data.instructions.helperValidationCommands`, `data.instructions.reportTemplate.sections`, and `data.instructions.finalReportShape`.
- [x] 1.4 Assert generated workflow surfaces tell agents to stop before writes when workflow status is blocked, not applicable, or ambiguous unless the user explicitly changes scope or selects a different workflow; current-scope continuation is read-only inspection/reporting only and must report `data.workflowState.nextSteps` / diagnostics.
- [x] 1.5 Assert generated workflow surfaces tell agents to run and report structured helper validator commands from `data.instructions.helperValidationCommands` when present, instead of assuming helper success.
- [x] 1.6 Add absence assertions that generated Truthmark workflow surfaces do not instruct agents to create OpenSpec-style proposal, spec, design, task, change, archive, apply, artifact DAG, or `truthmark/changes/*` lifecycle artifacts.

## 2. Shared Renderer Implementation

- [x] 2.1 Add a shared helper in `src/templates/workflow-surfaces.ts`, such as `renderWorkflowCliPreflight(workflowId: TruthmarkWorkflowId)`, that renders concrete full-ID `workflow status` and `workflow instructions` commands.
- [x] 2.2 Include optional `--base <ref>` guidance in prose without making any branch name implicit or required.
- [x] 2.3 Insert the preflight block before workflow-specific quick rules for every public generated workflow entrypoint path, including `renderWorkflowEntrypoint()` skill packages, standalone GitHub Copilot prompt renderers, standalone Gemini command renderers, and legacy exported renderer functions that still produce workflow instructions; support procedure files remain subordinate references rather than standalone preflight bypasses.
- [x] 2.4 Ensure the block says to parse the JSON command envelope, inspect `data.workflowState` / `data.instructions`, stop before writes on blocked/not-applicable/ambiguous applicability, and obey returned write boundaries and stop conditions.
- [x] 2.5 Ensure the block includes a safe CLI-unavailable fallback: continue direct checkout inspection using checked-in support files, do not broaden writes, and report the skipped preflight reason.
- [x] 2.6 Preserve platform-specific frontmatter, invocation syntax, support-file lists, helper manifests, helper-policy support files, subagent/lease support files, and report templates.

## 3. Cross-Platform Generated Surface Coverage

- [x] 3.1 Add or extend tests for Codex skill package output under `.codex/skills/truthmark-sync/SKILL.md` and at least one read-only workflow such as `.codex/skills/truthmark-check/SKILL.md`.
- [x] 3.2 Add or extend tests for OpenCode skill package output under `.opencode/skills/truthmark-sync/SKILL.md`.
- [x] 3.3 Add or extend tests for Claude Code skill package output under `.claude/skills/truthmark-sync/SKILL.md`.
- [x] 3.4 Add or extend tests for GitHub Copilot skill and prompt output under `.github/skills/truthmark-sync/SKILL.md` and `.github/prompts/truthmark-sync.prompt.md`.
- [x] 3.5 Add or extend tests for Gemini skill and command output under `.gemini/skills/truthmark-sync/SKILL.md` and `.gemini/commands/truthmark/sync.toml`.
- [x] 3.6 Add a generated-surface matrix assertion over `renderGeneratedSurfaces()` for default config and Portal-enabled config that verifies every emitted workflow entrypoint/prompt/command contains full-ID `workflow status` and `workflow instructions` commands.
- [x] 3.7 Add coverage for legacy exported renderers such as `renderTruthmark*Skill`, `renderTruthmark*LocalSkill`, and `renderTruthmark*ClaudeSkill` when they remain public workflow instruction surfaces; if any are intentionally out of scope, document the reason in the design before implementation.
- [x] 3.8 If implementation adds manifest metadata, add targeted tests in `tests/agents/instructions.test.ts`; otherwise keep manifest unchanged and document that the renderer composes from existing manifest data.

## 4. Init Refresh And Diff Hygiene

- [x] 4.1 Run focused renderer tests and confirm they fail before implementation and pass after implementation: `npx vitest run tests/templates/generated-surfaces.test.ts tests/agents/instructions.test.ts`.
- [x] 4.2 Refresh generated outputs through the normal generation path: `npx tsx src/cli/main.ts init --json`.
- [x] 4.3 Inspect generated diffs and verify they only add CLI-first workflow preflight/fallback guidance and do not hand-edit generated output as the source of truth.
- [x] 4.4 Verify generated outputs preserve managed blocks and platform-specific syntax by running `npx vitest run tests/init/init.test.ts tests/templates/generated-surfaces.test.ts`.
- [x] 4.5 Run built/source CLI spot checks from Pass 2 to ensure the generated commands point at working commands: `npx vitest run tests/cli/workflow.test.ts tests/cli/build-artifact.test.ts tests/workflow-state/build.test.ts`.

## 5. Documentation And Truth Sync

- [x] 5.1 Read `.truthmark/config.yml`, `docs/truthmark/routes/areas.md`, and relevant child route files to identify all routed owners for generated workflow surfaces and workflow contracts.
- [x] 5.2 Evaluate and update `docs/truthmark/truth/workflows/overview.md` for installed workflow behavior: generated surfaces prefer live CLI preflight, obey returned guardrails, stop on blocked/not-applicable/ambiguous states, and preserve safe fallback.
- [x] 5.3 Evaluate and update `docs/truthmark/truth/init-and-scaffold.md` for `truthmark init` generated-surface output changes, including skill packages, prompt files, command files, managed blocks, and Portal-enabled surfaces when applicable.
- [x] 5.4 Evaluate and update `docs/truthmark/truth/contracts.md` for generated-surface and CLI contract wording: canonical full manifest workflow IDs, exact JSON field paths, and no short-alias reliance.
- [x] 5.5 Evaluate and update `docs/truthmark/truth/repository/workflow-state.md` only if implementation changes or clarifies the Pass 2 workflow-state/instructions contract itself.
- [x] 5.6 Because this pass changes generated agent behavior, run the repository Truth Sync workflow after tests, write the sync report, and validate it with the installed helper command when applicable.

## 6. Boundary Review And Final Validation

- [x] 6.1 Search changed runtime/generated surface code for accidental OpenSpec lifecycle behavior: proposal, spec delta, changes, archive, apply, tasks, artifact DAG, and `truthmark/changes/*`.
- [x] 6.2 Run `npx openspec validate generated-playbooks-workflow-contract --strict --json`.
- [x] 6.3 Run `npx openspec validate --all --strict --json`.
- [x] 6.4 Run `npx openspec status --change generated-playbooks-workflow-contract --json` and confirm proposal, design, specs, and tasks are complete before implementation begins.
- [x] 6.5 Run `npm run typecheck` and focused tests listed above.
- [x] 6.6 Run `npm run check` when feasible.
- [x] 6.7 Run `git diff --check -- src/templates src/agents tests docs/truthmark openspec/changes/generated-playbooks-workflow-contract` and fix whitespace errors.
