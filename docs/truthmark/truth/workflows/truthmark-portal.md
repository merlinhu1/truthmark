---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-06-01
source_of_truth:
  - ../../../../src/agents/truthmark-portal.ts
  - ../../../../src/agents/workflow-manifest.ts
  - ../../../../src/templates/generated-surfaces.ts
  - ../../../../src/templates/workflow-surfaces.ts
  - ../../../../src/templates/agents-block.ts
  - ../../../../src/config/schema.ts
  - ../../../../src/config/load.ts
---

# Truthmark Portal Workflow

## Purpose

Truthmark Portal is an opt-in installed workflow for generating a committed, human-facing, multi-page static HTML presentation site from repository Markdown truth sources.

## Scope

This document owns the installed Portal workflow boundary, config toggle, generated surface behavior, and generated-site safety rules. It does not define a deterministic Portal renderer CLI or make generated HTML canonical truth.

## Triggers

Portal runs only from an explicit user request to generate, refresh, or update the committed static HTML presentation site. It is not triggered by Truth Sync, `truthmark check`, `truthmark init`, repository indexing, or normal completion workflows.

## Inputs

- `.truthmark/config.yml`, especially `truthmark.generated.portal.enabled`
- configured route docs and Markdown truth sources selected for presentation
- repository instruction, architecture, and standards Markdown when they are part of the requested Portal source set
- determined Portal template at `${truthmark.workspace}/templates/portal.html` when present
- optional local `truthmark check` or `truthmark index` output used only as supporting evidence, never as required infrastructure

## Execution Model

Portal is an agent-executed workflow that reads Markdown truth sources from the checkout and writes presentation output under the fixed Truthmark-derived Portal output directory. The generated HTML, assets, and metadata are non-canonical; Markdown truth documents remain authoritative.

## Steps

1. Confirm the user explicitly requested Portal generation or refresh.
2. Read `truthmark.generated.portal.enabled` and normalize Truthmark-derived Portal paths.
3. Inspect Markdown truth sources from the checkout.
4. Write presentation output only under the fixed Portal output directory.
5. Keep generated HTML, assets, and metadata non-canonical and report what was refreshed.

Current behavior notes:

`.truthmark/config.yml` contains Portal enablement under the required v2 `truthmark.generated.portal` block. Normalized config exposes only `truthmark.generated.portal.enabled`; Portal output is derived as `${truthmark.workspace}/generated/portal`, and the Portal template path is derived as `${truthmark.workspace}/templates/portal.html`.

When the block is omitted, normalized config defaults to:

```yaml
enabled: false
```

The generated default config includes the block with `enabled: false`. Portal remains disabled unless `truthmark.generated.portal.enabled` is set to `true`.

The config schema rejects non-object Portal blocks and rejects extra custom `output` or `template` properties under `truthmark.generated.portal`.

`truthmark init` renders Portal surfaces only when `truthmark.generated.portal.enabled` is `true`. Enabled platform surfaces include Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini skill packages; `.github/prompts/truthmark-portal.prompt.md`; and `.gemini/commands/truthmark/portal.toml`. V1 Portal installs no dedicated subagents or helper agents.

When Portal is disabled or omitted, init emits no Portal skill, prompt, or command surfaces, and generated managed instruction blocks do not mention Portal.

Portal is manual-only. It is never a completion gate, never Truth Sync, and runs only when the user explicitly asks to generate, refresh, or update the committed static HTML Portal.

The workflow reads Markdown directly from the checkout and does not require the `truthmark` CLI or package. `truthmark check` or index commands may be used only as optional supporting evidence when available. Portal has no `.truthmark/index.json` dependency.

Portal writes generated non-canonical static files only under the fixed output directory. The output directory may be replaced entirely during generation.

Generated output should be a committed multi-page static HTML site with local CSS, JavaScript, assets, and search metadata. Generated pages must include source provenance and a visible statement that Markdown remains canonical and generated HTML is presentation only. Manifest and search metadata stay under `<output>/assets`. No remote scripts, analytics, fonts, CSS, or CDN dependencies are used by default. Pictures and screenshots require an explicit user or template request.

## State, Retry, And Failure Behavior

Portal remains disabled when the config block is omitted or `enabled` is omitted/false. Portal is manual-only and is not triggered by Truth Sync, `truthmark check`, `truthmark init`, repository indexing, or normal completion workflows. Generated output is replaceable presentation state, not repository truth.

## Outputs

Portal outputs committed static HTML presentation files, supporting assets, optional metadata under the fixed output directory, and a completion report. Markdown truth docs remain authoritative.

## Product Decisions

- Decision (2026-06-01): Truthmark Portal config only controls enablement. Output and template locations are fixed by Truthmark from `truthmark.workspace`.
- Decision (2026-05-25): Portal is opt-in and manual-only; generated Portal output is a human presentation surface and must not become canonical repository truth or an automatic Sync/check gate.
- Decision (2026-05-25): Portal V1 is agent-native and Markdown-native. It does not introduce a required Portal package, generated `.truthmark/index.json`, or deterministic renderer dependency.

## Rationale

Large repositories need a human browsable entrypoint over routed truth docs, but Truthmark's authority model stays Markdown-first. Keeping Portal as an optional installed workflow gives humans a committed static site without changing agent truth sources or normal completion workflows.

## Non-Goals

- no automatic Portal generation after code changes
- no canonical HTML truth surface
- no mandatory `truthmark` binary, Portal package, remote service, or `.truthmark/index.json`
- no writes outside the fixed Portal output directory

## Maintenance Notes

Update this document when Portal config, generated surfaces, write boundaries, default output/template behavior, or generated-site safety rules change.
