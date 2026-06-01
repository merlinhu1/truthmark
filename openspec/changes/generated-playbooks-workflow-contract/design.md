## Context

Pass 1 introduced a typed `WorkflowState` builder under `src/workflow-state/` with schema version `truthmark-workflow/v0`. Pass 2 exposed that state and a derived `truthmark-workflow-instructions/v0` playbook through read-only JSON CLI commands:

```bash
truthmark workflow status --workflow truthmark-sync --json
truthmark workflow instructions --workflow truthmark-sync --json
```

Current generated workflow surfaces are produced mostly from `src/templates/workflow-surfaces.ts`, `src/templates/generated-surfaces.ts`, and workflow body renderers under `src/agents/truth-*.ts`. They already generate host-specific skill packages and command/prompt files for Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini, with shared support files such as `support/procedure.md`, `support/report-template.md`, `support/subagents-and-leases.md`, and optional `helper-manifest.yml` / `support/helper-policy.md`.

Pass 3 should keep that renderer structure but add a shared CLI-first preflight block so every workflow package points agents at the live local contract before interpreting embedded procedure text.

## Goals / Non-Goals

**Goals:**

- Add a shared generated playbook preflight that calls `truthmark workflow status` and `truthmark workflow instructions` for the full manifest workflow ID.
- Ensure generated surfaces preserve and obey `actionContext`, write boundaries, stop conditions, helper validator commands, and report sections from the returned instructions.
- Apply the behavior consistently across all host workflow surfaces without duplicating platform-specific prose.
- Keep generated playbooks usable when the CLI is unavailable or too old by falling back to direct checkout inspection and existing support procedures, while requiring the final report to say the CLI preflight was skipped.
- Refresh generated surfaces through the normal init path and verify managed outputs match renderer expectations.
- Update routed truth docs after implementation because generated agent behavior changes.

**Non-Goals:**

- Do not change the Pass 2 CLI command spelling or JSON schemas.
- Do not add workflow execution verbs, mutation commands, archive/apply semantics, arbitrary workflow DAGs, or `truthmark/changes/*` lifecycle artifacts.
- Do not replace existing support procedures, helper manifests, subagent lease rules, or report templates with a new workflow engine.
- Do not require agents to use the CLI as their only evidence source; direct checkout inspection remains canonical and the CLI is an agent-facing context source.
- Do not add rich human CLI rendering in this pass.

## Decisions

### Decision 1: Generate a shared CLI-first preflight block

Add a shared renderer helper in `src/templates/workflow-surfaces.ts`, for example `renderWorkflowCliPreflight(workflowId)`, and include it in `renderWorkflowEntrypoint()` before workflow-specific quick rules.

The block should render concrete full-ID commands, for example:

```bash
truthmark workflow status --workflow truthmark-sync --json
truthmark workflow instructions --workflow truthmark-sync --json
```

If a caller knows the target comparison ref, generated prose may show the optional shape:

```bash
truthmark workflow status --workflow truthmark-sync --base <ref> --json
truthmark workflow instructions --workflow truthmark-sync --base <ref> --json
```

Rationale: one shared helper prevents platform drift and makes the generated contract easy to test. Full manifest IDs match Pass 2 and avoid accidental short-alias compatibility.

### Decision 2: Treat CLI output as operational guardrails, not implementation evidence by itself

Generated surfaces MUST tell agents to inspect the returned `data.workflowState` / `data.instructions` and then:

- stop when applicability is `blocked` or `not_applicable`, unless the user explicitly changes scope;
- obey `actionContext.allowedWritePaths` and `actionContext.forbiddenWritePaths`;
- treat `actionContext.stopConditions` and instruction `stopConditions` as hard boundaries;
- run structured helper validator commands when present and report pass/fail/skip status;
- continue direct checkout inspection for code, docs, routes, tests, and evidence.

Rationale: the CLI gives current state and boundaries; it does not replace evidence review or parent-agent responsibility.

### Decision 3: Preserve a safe fallback when the CLI is unavailable

Generated surfaces should not hard-fail solely because a repository has not installed a new enough `truthmark` binary. The preflight block should say:

- if the command is unavailable or too old, continue with the checked-in support procedure and direct checkout inspection;
- do not broaden writes because the CLI could not run;
- include `workflow status/instructions: skipped` with the reason in the final report.

Rationale: generated surfaces are checked into repositories and may outlive installed tooling. Fallback keeps existing workflows operational while making skipped live-state preflight visible.

### Decision 4: Keep host-specific syntax, centralize policy text

Codex/OpenCode/Claude/GitHub Copilot/Gemini surfaces may use different frontmatter, command files, prompt files, and invocation syntax, but the core preflight policy should be rendered from shared text. Tests should inspect representative generated files across all configured host families rather than asserting every single generated file line-by-line.

Rationale: broad generated surfaces are high-churn; centralizing text reduces maintenance while behavior-oriented tests prevent regressions.

### Decision 5: Refresh generated outputs through init and document truth impact

After implementation, run the normal generation path (`npx tsx src/cli/main.ts init --json` or the built equivalent if tests require it), inspect generated diffs, and update routed truth docs that own generated surfaces/workflow contracts. Do not manually edit generated output as the primary implementation path.

Rationale: generated files should remain renderer products. Truth docs must follow code once behavior changes.

## Risks / Trade-offs

- **Risk:** Generated prose becomes too CLI-dependent and blocks older checkouts.  
  **Mitigation:** Make CLI preflight preferred and reportable, not the only allowed route; fallback must preserve existing support procedures and write boundaries.
- **Risk:** Platform-specific prompt files drift.  
  **Mitigation:** Use one shared renderer helper and representative cross-platform tests.
- **Risk:** Agents treat `allowedWritePaths` examples as permission to over-write.  
  **Mitigation:** Generated prose must say writes remain bounded by the returned `actionContext`, current user task, and parent/lease rules.
- **Risk:** Generated output refresh creates noisy diffs.  
  **Mitigation:** Change renderer first, refresh through init once, then inspect generated diffs for only intended CLI-first playbook changes.
- **Risk:** OpenSpec wording leaks into generated runtime behavior.  
  **Mitigation:** Add absence tests for proposal/spec/task/change/archive/apply lifecycle artifacts in generated workflow surfaces.

## Migration Plan

1. Add failing renderer tests for the generated CLI-first preflight and product-boundary absence checks.
2. Add the shared workflow CLI preflight renderer and include it in workflow entrypoints/support where agents will see it before acting.
3. Extend tests to cover representative Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini generated workflow surfaces.
4. Refresh generated surfaces with the normal init path and verify expected diffs.
5. Update routed truth docs and run Truth Sync because generated agent behavior changes.
6. Validate with focused tests, typecheck, OpenSpec validation, `npm run check` when feasible, and diff hygiene.

Rollback is straightforward before generated outputs are published: remove the preflight renderer, restore generated surfaces via `truthmark init`, and keep the Pass 2 CLI contract intact.

## Open Questions

None for Pass 3. Generated surfaces should consume the full-ID-only Pass 2 CLI contract and defer alias compatibility or additional workflow state schema fields to later explicit changes.
