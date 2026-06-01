## 1. Contract And Failing Tests

- [ ] 1.1 Add failing renderer tests in `tests/templates/generated-surfaces.test.ts` that inspect representative generated workflow skill packages for Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini and assert they contain `truthmark workflow status --workflow <full-id> --json`.
- [ ] 1.2 Extend the same tests to assert representative workflow surfaces contain `truthmark workflow instructions --workflow <full-id> --json`.
- [ ] 1.3 Assert generated workflow surfaces mention `data.workflowState`, `data.instructions`, `actionContext.allowedWritePaths`, `actionContext.forbiddenWritePaths`, and stop conditions as operational guardrails.
- [ ] 1.4 Assert generated workflow surfaces tell agents to stop when workflow status is blocked or not applicable unless the user explicitly changes scope.
- [ ] 1.5 Assert generated workflow surfaces tell agents to run and report structured helper validator commands when present, instead of assuming helper success.
- [ ] 1.6 Add absence assertions that generated Truthmark workflow surfaces do not instruct agents to create OpenSpec-style proposal, spec, design, task, change, archive, apply, artifact DAG, or `truthmark/changes/*` lifecycle artifacts.

## 2. Shared Renderer Implementation

- [ ] 2.1 Add a shared helper in `src/templates/workflow-surfaces.ts`, such as `renderWorkflowCliPreflight(workflowId: TruthmarkWorkflowId)`, that renders concrete full-ID `workflow status` and `workflow instructions` commands.
- [ ] 2.2 Include optional `--base <ref>` guidance in prose without making any branch name implicit or required.
- [ ] 2.3 Insert the preflight block in `renderWorkflowEntrypoint()` before workflow-specific quick rules so generated skills/prompts see live-state instructions before embedded procedure text.
- [ ] 2.4 Ensure the block says to parse the JSON command envelope, inspect `data.workflowState` / `data.instructions`, stop on blocked/not-applicable applicability, and obey returned write boundaries and stop conditions.
- [ ] 2.5 Ensure the block includes a safe CLI-unavailable fallback: continue direct checkout inspection using checked-in support files, do not broaden writes, and report the skipped preflight reason.
- [ ] 2.6 Preserve platform-specific frontmatter, invocation syntax, support-file lists, helper manifests, helper-policy support files, subagent/lease support files, and report templates.

## 3. Cross-Platform Generated Surface Coverage

- [ ] 3.1 Add or extend tests for Codex skill package output under `.codex/skills/truthmark-sync/SKILL.md` and at least one read-only workflow such as `.codex/skills/truthmark-check/SKILL.md`.
- [ ] 3.2 Add or extend tests for OpenCode skill package output under `.opencode/skills/truthmark-sync/SKILL.md`.
- [ ] 3.3 Add or extend tests for Claude Code skill package output under `.claude/skills/truthmark-sync/SKILL.md`.
- [ ] 3.4 Add or extend tests for GitHub Copilot skill and prompt output under `.github/skills/truthmark-sync/SKILL.md` and `.github/prompts/truthmark-sync.prompt.md`.
- [ ] 3.5 Add or extend tests for Gemini skill and command output under `.gemini/skills/truthmark-sync/SKILL.md` and `.gemini/commands/truthmark/sync.toml`.
- [ ] 3.6 If implementation adds manifest metadata, add targeted tests in `tests/agents/instructions.test.ts`; otherwise keep manifest unchanged and document that the renderer composes from existing manifest data.

## 4. Init Refresh And Diff Hygiene

- [ ] 4.1 Run focused renderer tests and confirm they fail before implementation and pass after implementation: `npx vitest run tests/templates/generated-surfaces.test.ts tests/agents/instructions.test.ts`.
- [ ] 4.2 Refresh generated outputs through the normal generation path: `npx tsx src/cli/main.ts init --json`.
- [ ] 4.3 Inspect generated diffs and verify they only add CLI-first workflow preflight/fallback guidance and do not hand-edit generated output as the source of truth.
- [ ] 4.4 Verify generated outputs preserve managed blocks and platform-specific syntax by running `npx vitest run tests/init/init.test.ts tests/templates/generated-surfaces.test.ts`.
- [ ] 4.5 Run built/source CLI spot checks from Pass 2 to ensure the generated commands point at working commands: `npx vitest run tests/cli/workflow.test.ts tests/cli/build-artifact.test.ts`.

## 5. Documentation And Truth Sync

- [ ] 5.1 Read `.truthmark/config.yml`, `docs/truthmark/routes/areas.md`, and relevant child route files to identify the routed owner for generated workflow surfaces and workflow contracts.
- [ ] 5.2 Update the routed truth doc to state that generated workflow surfaces prefer live CLI preflight through `workflow status` and `workflow instructions` before acting.
- [ ] 5.3 Document the safe fallback when the CLI is unavailable or too old: direct checkout inspection continues, write boundaries remain narrow, and final reports must note the skipped preflight.
- [ ] 5.4 Document that generated surfaces use canonical full manifest workflow IDs and do not rely on short aliases.
- [ ] 5.5 Because this pass changes generated agent behavior, run the repository Truth Sync workflow after tests, write the sync report, and validate it with the installed helper command when applicable.

## 6. Boundary Review And Final Validation

- [ ] 6.1 Search changed runtime/generated surface code for accidental OpenSpec lifecycle behavior: proposal, spec delta, changes, archive, apply, tasks, artifact DAG, and `truthmark/changes/*`.
- [ ] 6.2 Run `npx openspec validate generated-playbooks-workflow-contract --strict --json`.
- [ ] 6.3 Run `npx openspec validate --all --strict --json`.
- [ ] 6.4 Run `npx openspec status --change generated-playbooks-workflow-contract --json` and confirm proposal, design, specs, and tasks are complete before implementation begins.
- [ ] 6.5 Run `npm run typecheck` and focused tests listed above.
- [ ] 6.6 Run `npm run check` when feasible.
- [ ] 6.7 Run `git diff --check -- src/templates src/agents tests docs/truthmark openspec/changes/generated-playbooks-workflow-contract` and fix whitespace errors.
