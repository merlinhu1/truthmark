---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-16
source_of_truth:
  - ../../../.truthmark/config.yml
  - ../../../src/agents/instructions.ts
  - ../../../src/agents/workflow-manifest.ts
  - ../../../src/templates/workflow-surfaces.ts
  - ../../../src/templates/generated-surfaces.ts
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

## Inputs

- `.truthmark/config.yml`
- generated host surfaces under configured platform directories
- the package version from `package.json`

## Execution Model

Installed skills, prompts, commands, and managed instruction blocks are the workflow runtime. The `truthmark` CLI installs and refreshes those surfaces and may validate artifacts afterward, but it does not orchestrate workflow execution or prepare required workflow payloads before an agent can act.

Agents inspect the checkout directly, apply workflow boundaries from committed surfaces, update only workflow-allowed files, and report what changed.

## Current Behavior

The default platform list includes every supported platform. Teams should remove unused platforms from `.truthmark/config.yml` before rerunning `truthmark init`.

| Platform | Generated surface | Invocation shape |
| --- | --- | --- |
| `codex` | `.codex/skills/truthmark-*/SKILL.md`, Codex metadata, and `.codex/agents/*.toml` read-only verifier agents | `/truthmark-*` or `$truthmark-*` |
| `opencode` | `.opencode/skills/truthmark-*/SKILL.md` and `.opencode/agents/*.md` read-only verifier subagents | `/skill truthmark-*` |
| `claude-code` | `.claude/skills/truthmark-*/SKILL.md` and `.claude/agents/*.md` read-only verifier subagents | `/truthmark-*`; named subagents such as `truth-route-auditor` |
| `github-copilot` | `.github/prompts/truthmark-*.prompt.md` and `.github/agents/*.agent.md` read-only verifier agents | `/truthmark-*` in supported Copilot IDEs; `@truth-*` custom agents in Copilot CLI |
| `gemini-cli` | `.gemini/commands/truthmark/*.toml` | `/truthmark:*` |

Generated skill files, Gemini command files, Codex metadata, Codex custom-agent files, Claude Code subagent files, GitHub Copilot custom-agent files, OpenCode subagent files, and managed instruction blocks include the package version from `package.json`. After upgrading Truthmark, rerun `truthmark init` and review generated workflow diffs.

Codex, Claude Code, GitHub Copilot, and OpenCode platform generation include project-scoped read-only verifier agents for workflow-owned subagent dispatch. Codex exposes `truth_route_auditor`, `truth_claim_verifier`, and `truth_doc_reviewer`. Claude Code exposes `truth-route-auditor`, `truth-claim-verifier`, and `truth-doc-reviewer` project subagents. GitHub Copilot and OpenCode expose `@truth-route-auditor`, `@truth-claim-verifier`, and `@truth-doc-reviewer`. The parent workflow may use them automatically when the host supports subagents and bounded fan-out is useful; the parent workflow still owns final reports and all writes.

Generated workflow descriptions are routing triggers. They use short positive trigger language plus adjacent-workflow exclusions, and they leave detailed procedure, write boundaries, and report shape to the workflow body.

The typed workflow manifest owns generated description text, Codex-facing short descriptions and default prompts, implicit-invocation policy, positive and negative routing examples, forbidden-adjacent cases, required gates, write boundaries, and report-section expectations. Generated host surfaces and deterministic routing tests should consume that manifest rather than duplicating workflow metadata in renderer code.

Truthmark-owned workflow surfaces are generated under host-specific directories. Repo-root `skills/` files are not generated V1 workflow surfaces.

Managed instruction blocks are compact automatic-Sync trigger and boundary indexes. They intentionally omit platform-specific invocation strings, non-automatic workflow procedures, report examples, and long checklists. Detailed invocations and procedures live in generated skills, prompts, and command files.

## Product Decisions

- Decision (2026-05-15): Installed skills, prompts, commands, and managed instruction blocks are the workflow runtime. The CLI installs and validates those surfaces but does not orchestrate Truth Sync or require helper payloads before agents can act.
- Decision (2026-05-15): Managed instruction blocks stay compact enough for ordinary agent context. Non-automatic workflow procedure belongs in generated skills, prompts, and command files.
- Decision (2026-05-15): Managed instruction blocks omit platform-specific invocation strings; host-specific generated workflow files remain the canonical place for invocation detail.
- Decision (2026-05-15): Truthmark follows current host discovery paths for generated workflow files: Codex uses `.codex/skills/`, Claude Code uses `.claude/skills/` and `.claude/agents/`, GitHub Copilot uses `.github/prompts/` and `.github/agents/`, OpenCode uses `.opencode/skills/`, Gemini CLI uses `.gemini/commands/`, and repo-root `skills/` is not a generated V1 target.
- Decision (2026-05-15): Workflow descriptions are routing triggers rather than workflow summaries; adjacent-workflow exclusions belong in metadata when they prevent wrong workflow loading.
- Decision (2026-05-15): Workflow metadata and routing-eval expectations live in a typed manifest so generated descriptions, host metadata, and deterministic routing tests share one structural source.
- Decision (2026-05-16): Codex, Claude Code, GitHub Copilot, and OpenCode may install project-scoped read-only verifier agents for workflow-owned verification; parent workflows keep write ownership and do not require users to request subagents per task.

## Rationale

Keeping workflow execution agent-native makes installed repositories usable even when the Truthmark package is unavailable at execution time. Agents can read committed surfaces, inspect the checkout, and act without depending on a daemon, database, or mandatory generated payload.

Compact managed instruction blocks protect ordinary model context while explicit workflow surfaces remain available when the agent needs a full procedure.

## Non-Goals

- no autonomous background workflow execution
- no required helper payload, packet helper, cache file, daemon, database, or remote service
- no generated repo-root `skills/` workflow surface

## Maintenance Notes

Update this doc when supported platforms, generated surface locations, invocation shapes, description routing behavior, or the installed runtime model change.
