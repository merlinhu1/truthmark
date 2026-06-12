---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-06-12
source_of_truth:
  - ../../../../.truthmark/config.yml
  - ../../../../src/agents/instructions.ts
  - ../../../../src/agents/workflow-manifest.ts
  - ../../../../src/agents/workflow-helper-validation.ts
  - ../../../../src/cli/program.ts
  - ../../../../src/cli/handlers.ts
  - ../../../../src/templates/workflow-surfaces.ts
  - ../../../../src/templates/generated-surfaces.ts
  - ../../../../tests/evals/workflow-routing-cases.ts
  - ../../../../tests/evals/no-cli-fallback-cases.ts
---

# Installed Workflow Overview

## Purpose

Truthmark installs agent-native workflow surfaces into configured AI hosts. Those surfaces define invocation, write boundaries, report shapes, and where agents must read before acting.

## Scope

This document owns the shared installed-workflow runtime model and generated host surface inventory. Individual workflow behavior lives in sibling workflow docs.

## Triggers

- `truthmark init` refreshes managed instruction blocks and explicit workflow surfaces after configuration or renderer changes.
- Explicit host invocations run manual workflows.
- Truth Sync is the only automatic finish-time workflow trigger.
- Truth Preview is an explicit read-only selector for likely workflow routing before edits; it is intended, not authorized.
- Truthmark Portal is an opt-in manual-only presentation workflow; it is not a completion gate or Sync/check substitute.

## Inputs

- `.truthmark/config.yml`
- generated host surfaces under configured platform directories
- the package version from `package.json`

## Execution Model

Installed skills, prompts, commands, and managed instruction blocks are the workflow runtime. The `truthmark` CLI installs and refreshes those surfaces and may validate artifacts afterward, but it does not orchestrate workflow execution or prepare required workflow payloads before an agent can act.

Generated workflow entrypoints, prompts, and commands use checked-in generated prose, progressive-disclosure support files, route files, truth docs, and direct checkout inspection as the normal workflow contract. The local CLI remains an optional focused validation tool for commands such as `truthmark check --json`, `truthmark index --json`, and declared helper validators.

No CLI command or helper output is a required prerequisite before an agent can act. Agents inspect the checkout directly, apply workflow boundaries from committed surfaces and support files, update only workflow-allowed files, and report what changed. Sync, Document, Structure, and Realize use checked-in workflow files as the contract: follow the route-first procedure, read only the config, route files, truth docs, and source evidence needed for the current changed surface, and stop on missing or ambiguous ownership instead of broadening reads or writes.

## Steps

1. `truthmark init` reads `.truthmark/config.yml` and refreshes managed instruction blocks plus configured host surfaces.
2. Generated host surfaces expose explicit manual workflows and the automatic finish-time Truth Sync guidance.
3. An agent invokes or follows a generated workflow entrypoint, prompt, or command and reads progressive-disclosure support files only as needed for the current workflow step.
4. The agent reads the checkout directly, applies committed workflow write boundaries, and reports the outcome.
5. Optional CLI helpers may validate reports, build context, or index the repository, but they do not orchestrate workflow execution and are never required before the agent can act.

Current behavior notes:

The default platform list includes every supported platform. Teams should remove unused platforms from `.truthmark/config.yml` before rerunning `truthmark init`.

| Platform         | Generated surface                                                                                                                                                | Invocation shape                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `codex`          | `.agents/skills/truthmark-*/SKILL.md`, `.agents/skills/truthmark-*/support/*.md`, Codex metadata, and `.codex/agents/*.toml` verifier and leased doc-writer agents | `/truthmark-*` or `$truthmark-*`                                                  |
| `opencode`       | `.opencode/skills/truthmark-*/SKILL.md`, `.opencode/skills/truthmark-*/support/*.md`, and `.opencode/agents/*.md` verifier and leased doc-writer subagents       | `/skill truthmark-*`                                                              |
| `claude-code`    | `.claude/skills/truthmark-*/SKILL.md`, `.claude/skills/truthmark-*/support/*.md`, and `.claude/agents/*.md` verifier and leased doc-writer subagents             | `/truthmark-*`; named subagents such as `truth-route-auditor`                     |
| `github-copilot` | `.github/skills/truthmark-*/SKILL.md`, `.github/skills/truthmark-*/support/*.md`, `.github/prompts/truthmark-*.prompt.md`, and `.github/agents/*.md` verifier and leased doc-writer agents | `/truthmark-*` in supported Copilot IDEs; `@truth-*` custom agents in Copilot CLI |
| `gemini-cli`     | `.gemini/skills/truthmark-*/SKILL.md`, `.gemini/skills/truthmark-*/support/*.md`, `.gemini/commands/truthmark/*.toml`, and `.gemini/agents/*.md` verifier and leased doc-writer agents | `/truthmark:*`                                                                    |

Official host documentation checked for these paths:

| Platform | Official documentation | Path contract used by Truthmark |
| -------- | ---------------------- | -------------------------------- |
| `codex` | OpenAI Codex Skills: <https://developers.openai.com/codex/skills>; OpenAI Codex Subagents: <https://developers.openai.com/codex/subagents> | Codex scans repository skills from `.agents/skills` up to the repository root; project custom agents are standalone TOML files under `.codex/agents/`. |
| `opencode` | OpenCode Agent Skills: <https://opencode.ai/docs/skills/>; OpenCode Agents: <https://opencode.ai/docs/agents/> | OpenCode supports project skills under `.opencode/skills/<name>/SKILL.md` and project markdown agents under `.opencode/agents/`. |
| `claude-code` | Anthropic Claude Code Skills: <https://docs.anthropic.com/en/docs/claude-code/skills>; Anthropic Claude Code Subagents: <https://docs.anthropic.com/en/docs/claude-code/sub-agents> | Claude Code project skills load from `.claude/skills/`; project subagents use `.claude/agents/`. |
| `github-copilot` | GitHub Copilot agent skills: <https://docs.github.com/en/copilot/concepts/agents/about-agent-skills>; GitHub Copilot prompt files: <https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file>; GitHub Copilot custom agents: <https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-custom-agents>; GitHub Copilot repository instructions: <https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot> | Copilot supports project skills under `.github/skills`, `.claude/skills`, or `.agents/skills`; prompt files live in `.github/prompts/*.prompt.md`; repository custom agents live in `.github/agents/CUSTOM-AGENT-NAME.md`; repository instructions live in `.github/copilot-instructions.md`. |
| `gemini-cli` | Gemini CLI skills: <https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md>; Gemini CLI custom commands: <https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md>; Gemini CLI subagents: <https://github.com/google-gemini/gemini-cli/blob/main/docs/core/subagents.md>; Gemini CLI context files: <https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md> | Gemini CLI supports workspace skills under `.gemini/skills/` or `.agents/skills/`, project commands under `.gemini/commands/`, project subagents under `.gemini/agents/*.md`, and repository context through `GEMINI.md`. |

Generated skill files, Gemini command files, Codex metadata, Codex custom-agent files, Claude Code subagent files, GitHub Copilot custom-agent files, Gemini subagent files, OpenCode subagent files, and managed instruction blocks include the package version from `package.json`. After upgrading Truthmark, rerun `truthmark init` and review generated workflow diffs.

Skill-package hosts (`codex`, `opencode`, `claude-code`, `github-copilot`, and `gemini-cli`) may also include parseable YAML `helper-manifest.yml` and `support/helper-policy.md` when a workflow declares optional helper commands. Helpers are CLI-owned read-only accelerators invoked through argv-style `truthmark validate ... --json` commands and never workflow prerequisites. If the declared `truthmark` runner is unavailable or version-mismatched, the workflow reports a visible helper skip and continues with the generated manual fallback. Helper output is derived evidence; direct checkout inspection, workflow write boundaries, and parent workflow validation remain authoritative. Standalone Copilot prompt files and Gemini TOML command files use the same installed-CLI validator contract even though their helper manifests live in matching generated skill packages; when the runner is unavailable or skipped, their reports must show a visible skipped helper status plus manual validation.

Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode platform generation include project-scoped read-only verifier agents for workflow-owned subagent dispatch plus a write-capable `truth-doc-writer` for parent-leased Truth Sync and Truth Document shards. Codex exposes `truth_route_auditor`, `truth_claim_verifier`, `truth_doc_reviewer`, and `truth_doc_writer`. Claude Code exposes `truth-route-auditor`, `truth-claim-verifier`, `truth-doc-reviewer`, and `truth-doc-writer` project subagents. GitHub Copilot, Gemini CLI, and OpenCode expose `@truth-route-auditor`, `@truth-claim-verifier`, `@truth-doc-reviewer`, and `@truth-doc-writer`. The parent workflow may use them automatically when the host supports subagents and bounded fan-out is useful; read-only verifier agents keep context bounded by avoiding host instruction files and repo-wide policy docs unless assigned as evidence, write workers require explicit leases, and the parent workflow owns final reports, repo-policy interpretation, diff validation, and acceptance.
Read-only verifier agents include an explicit context boundary: they inspect only the parent-assigned shard plus required checkout evidence files and do not preload repo-wide instruction or policy docs unless the parent assigns those files as evidence.

Generated workflow descriptions are routing triggers. They use short positive trigger language plus adjacent-workflow exclusions. Skill-package hosts keep `SKILL.md` as the compact routing and quick-procedure entrypoint, then put detailed procedure, report templates, and subagent or lease instructions in generated `support/*.md` files. Standalone prompt and command hosts keep the full workflow body inline because they do not load skill-package support files.

Every public generated workflow entrypoint, GitHub Copilot prompt, and Gemini command includes a short Optional local CLI validation section. That section keeps workflow execution on committed generated files, direct checkout inspection, and progressive-disclosure support files, while reserving CLI checks for focused validation after relevant work has been performed. For Sync, Document, Structure, and Realize, direct checkout fallback remains route-first and bounded to the current changed surface: agents may read only the needed config, route files, truth docs, and source evidence, and they must block on missing or ambiguous ownership instead of broadening reads or writes. Skill-package entrypoints list all available progressive-disclosure files, but only `support/procedure.md` is mandatory before write-capable edits; subagent, lease, helper-policy, and helper-manifest files are conditional on actually using subagents, leases, or helper validators.

The typed workflow manifest owns generated description text, Codex-facing short descriptions and default prompts, implicit-invocation policy, positive and negative routing examples, forbidden-adjacent cases, required gates, write boundaries, and report-section expectations. Generated host surfaces and deterministic routing tests should consume that manifest rather than duplicating workflow metadata in renderer code.

Truthmark Portal surfaces are generated only when `truthmark.generated.portal.enabled` normalizes to `true`. When enabled, configured platforms receive the `truthmark-portal` skill package, GitHub Copilot receives `.github/prompts/truthmark-portal.prompt.md`, Gemini receives `.gemini/commands/truthmark/portal.toml`, and managed instruction blocks mention Portal with manual-only wording. Portal installs no dedicated subagents in V1.

Truthmark-owned workflow surfaces are generated under host-specific directories. Repo-root `skills/` files are not generated V1 workflow surfaces.

Managed instruction blocks are compact automatic-Sync trigger and boundary indexes. They intentionally omit platform-specific invocation strings, non-automatic workflow procedures, report examples, and long checklists. Detailed invocations and procedures live in generated skills, skill support files, prompts, and command files.

## State, Retry, And Failure Behavior

Generated workflow surfaces are committed repository files. If the Truthmark package is unavailable at workflow-execution time, agents still follow the committed surfaces manually and use direct checkout evidence. Unavailable, stale, or failing read-only CLI helpers degrade to visible skipped helper status only when a relevant check, index, or helper validator was expected; they do not block agent action when committed workflow surfaces and direct checkout evidence are sufficient. Manual fallback for write workflows remains route-first and bounded to the current changed surface; if needed config, route files, truth docs, and source evidence cannot determine the safe owner or write boundary, the workflow blocks and reports ambiguity instead of broadening reads or writes. Removing a platform from config stops future refreshes for that platform but does not delete already committed surfaces.

## Outputs

The installed runtime outputs managed instruction blocks, host-native skills/prompts/commands/agents, optional helper validation reports, and agent completion reports. Canonical truth remains in Markdown docs and route files.

## Product Decisions

- Decision (2026-05-15): Installed skills, prompts, commands, and managed instruction blocks are the workflow runtime. The CLI installs and validates those surfaces but does not orchestrate Truth Sync or require helper payloads before agents can act.
- Decision (2026-05-15): Managed instruction blocks stay compact enough for ordinary agent context. Non-automatic workflow procedure belongs in generated skills, prompts, and command files.
- Decision (2026-05-15): Managed instruction blocks omit platform-specific invocation strings; host-specific generated workflow files remain the canonical place for invocation detail.
- Decision (2026-05-15, updated 2026-06-12): Truthmark follows official host discovery paths for generated workflow files: Codex uses `.agents/skills/` plus `.codex/agents/`, Claude Code uses `.claude/skills/` and `.claude/agents/`, GitHub Copilot uses `.github/skills/`, `.github/prompts/`, and `.github/agents/`, OpenCode uses `.opencode/skills/` and `.opencode/agents/`, Gemini CLI uses `.gemini/skills/`, `.gemini/commands/`, and `.gemini/agents/`, and repo-root `skills/` is not a generated V1 target.
- Decision (2026-05-15): Workflow descriptions are routing triggers rather than workflow summaries; adjacent-workflow exclusions belong in metadata when they prevent wrong workflow loading.
- Decision (2026-05-15): Workflow metadata and routing-eval expectations live in a typed manifest so generated descriptions, host metadata, and deterministic routing tests share one structural source.
- Decision (2026-05-16): Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode may install project-scoped read-only verifier agents plus a leased `truth-doc-writer`; parent workflows keep acceptance and diff validation ownership and do not require users to request subagents per task.
- Decision (2026-05-16): Read-only verifier agents do not preload host instruction files or repo-wide policy docs by default; parent workflows keep that policy context and pass only bounded evidence shards to verifier agents.
- Decision (2026-05-16): Coding and document-writing speed is not a priority over workflow simplicity and agent stability. Truthmark must not make document writing faster by adding project complexity, weaker leases, broader write authority, or less stable agent behavior.
- Decision (2026-05-16): Truth Preview is generated as an explicit read-only workflow surface, not an automatic gate, validator, or Truth Check replacement.
- Decision (2026-05-16): Generated skill packages use progressive disclosure: `SKILL.md` stays compact for routing and first-step execution, while heavy procedure detail, report examples, and subagent or lease reference material move to generated support files beside the skill.
- Decision (2026-05-18): Workflow helpers are optional read-only accelerators declared in generated helper manifests; current helpers are owned by the installed `truthmark` CLI and use argv-style `truthmark validate ... --json` commands rather than packaged script copies.
- Decision (2026-05-25): Truthmark Portal is opt-in and manual-only; generated Portal HTML is a non-canonical human presentation surface and Markdown remains canonical.
- Decision (2026-06-12): Generated public workflow entrypoints, GitHub Copilot prompts, and Gemini commands no longer consume `workflow instructions --json`; they use committed surfaces, progressive-disclosure support files, and direct checkout inspection first, with optional focused CLI validation after relevant work is performed.
- Decision (2026-06-12): Read-only CLI helper surfaces such as `workflow status`, `context`, and `impact` must remain optional coordination aids; no CLI command becomes required before an agent can act from committed workflow surfaces and direct checkout evidence.

## Rationale

Keeping workflow execution agent-native makes installed repositories usable even when the Truthmark package is unavailable at execution time. Agents can read committed surfaces, inspect the checkout, and act without depending on a daemon, database, or mandatory generated payload.

Optional CLI-owned helpers fit that model by accelerating deterministic validation without requiring generated repositories to carry executable helper-script copies.

Compact managed instruction blocks and compact skill entrypoints protect ordinary model context while explicit support files, prompt files, and command files remain available when the agent needs a full procedure.

## Non-Goals

- no autonomous background workflow execution
- no required helper payload, packet helper, cache file, daemon, database, or remote service
- no generated repo-root `skills/` workflow surface

## Maintenance Notes

Update this doc when supported platforms, generated surface locations, invocation shapes, description routing behavior, or the installed runtime model change.
