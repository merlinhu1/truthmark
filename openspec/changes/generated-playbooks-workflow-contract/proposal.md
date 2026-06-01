## Why

Pass 2 exposed `truthmark workflow status` and `truthmark workflow instructions` as schema-versioned, read-only JSON contracts, but generated agent skills, prompts, commands, and support playbooks still primarily embed static prose. Pass 3 makes the generated surfaces consume that local workflow contract before acting, so agents inspect current applicability, diagnostics, write boundaries, helper commands, and report sections instead of relying only on stale generated text.

This change transfers OpenSpec's strongest agent-facing behavior — generated instructions that tell agents to query the local CLI for current state — while preserving Truthmark's narrower repository-truth mission.

## What Changes

- Update generated workflow entrypoints and support playbooks so every Truthmark workflow surface starts with `truthmark workflow status --workflow <full-id> --json` and `truthmark workflow instructions --workflow <full-id> --json` when the local CLI is available.
- Teach generated surfaces to stop on blocked/not-applicable workflow state unless the user explicitly changes scope.
- Teach generated surfaces to obey `actionContext.allowedWritePaths`, `actionContext.forbiddenWritePaths`, `stopConditions`, and structured helper validator commands from the returned instruction payload.
- Refresh generated host surfaces for Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini while preserving platform-specific frontmatter and command syntax.
- Add behavior-oriented renderer/init tests and routed truth documentation updates for the CLI-first generated playbook contract.
- Preserve Truthmark's product boundary: generated surfaces must not instruct agents to create OpenSpec-style change/spec/proposal/task artifacts, archive/apply changes, or treat Truthmark as a generic spec lifecycle engine.

## Capabilities

### New Capabilities

- `generated-playbooks-workflow-contract`: Generated agent workflow playbooks consume the Pass 2 workflow status/instructions CLI contract before acting.

### Modified Capabilities

- None.

## Impact

- Affected renderer modules: `src/templates/workflow-surfaces.ts` and `src/templates/generated-surfaces.ts`.
- Possible manifest impact: `src/agents/workflow-manifest.ts` only if a small explicit playbook metadata field is required; prefer renderer composition from existing manifest data and Pass 2 CLI spelling.
- Affected generated outputs: `.codex/skills/truthmark-*`, `.opencode/skills/truthmark-*`, `.claude/skills/truthmark-*`, `.github/skills/truthmark-*`, `.github/prompts/truthmark-*.prompt.md`, `.gemini/skills/truthmark-*`, and `.gemini/commands/truthmark/*.toml` after `truthmark init` refresh.
- Affected tests: `tests/templates/generated-surfaces.test.ts`, `tests/init/init.test.ts`, `tests/agents/instructions.test.ts`, and optionally `tests/integration/agent-workflow-contract.test.ts` if an end-to-end generated-surface assertion is the clearest coverage.
- Affected truth docs/routing: update routed generated-surface/workflow contract docs after implementation because generated agent behavior changes.
- No new runtime dependency is expected.
