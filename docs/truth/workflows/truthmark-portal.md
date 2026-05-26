---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-25
source_of_truth:
  - ../../../src/agents/truthmark-portal.ts
  - ../../../src/agents/workflow-manifest.ts
  - ../../../src/templates/generated-surfaces.ts
  - ../../../src/templates/workflow-surfaces.ts
  - ../../../src/templates/agents-block.ts
  - ../../../src/config/schema.ts
  - ../../../src/config/load.ts
---

# Truthmark Portal Workflow

## Purpose

Truthmark Portal is an opt-in installed workflow for generating a committed, human-facing, multi-page static HTML presentation site from repository Markdown truth sources.

## Scope

This document owns the installed Portal workflow boundary, config toggle, generated surface behavior, and generated-site safety rules. It does not define a deterministic Portal renderer CLI or make generated HTML canonical truth.

## Triggers

Portal runs only from an explicit user request to generate, refresh, or update the committed static HTML presentation site. It is not triggered by Truth Sync, `truthmark check`, `truthmark init`, repository indexing, or normal completion workflows.

## Execution Model

Portal is an agent-executed workflow that reads Markdown truth sources from the checkout and writes presentation output under the configured Portal output directory. The generated HTML, assets, and metadata are non-canonical; Markdown truth documents remain authoritative.

## Current Behavior

`.truthmark/config.yml` may contain a namespaced `truthmark-portal` block. The raw YAML key is exactly `truthmark-portal`; normalized config exposes `truthmarkPortal`.

When the block is omitted, normalized config defaults to:

```yaml
enabled: false
output: docs/truthmark-portal
template: default
```

If the block exists but `enabled` is omitted, Portal remains disabled. `output` and `template` default independently to `docs/truthmark-portal` and `default`.

The config schema rejects non-object Portal blocks and non-string `output` or `template` values. Config loading also rejects empty, absolute, or parent-traversing Portal outputs and templates. Portal output must be a repository-relative directory and must not overlap source roots, configured instruction targets, `.truthmark/config.yml`, route files, or canonical Markdown roots.

`truthmark init` renders Portal surfaces only when `truthmarkPortal.enabled` is `true`. Enabled platform surfaces include Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini skill packages; `.github/prompts/truthmark-portal.prompt.md`; and `.gemini/commands/truthmark/portal.toml`. V1 Portal installs no dedicated subagents or helper agents.

When Portal is disabled or omitted, init emits no Portal skill, prompt, or command surfaces, and generated managed instruction blocks do not mention Portal.

Portal is manual-only. It is never a completion gate, never Truth Sync, and runs only when the user explicitly asks to generate, refresh, or update the committed static HTML Portal.

The workflow reads Markdown directly from the checkout and does not require the `truthmark` CLI or package. `truthmark check` or index commands may be used only as optional supporting evidence when available. Portal has no `.truthmark/index.json` dependency.

Portal writes generated non-canonical static files only under the configured output directory unless the user explicitly changes scope. The selected output directory may be replaced entirely during generation.

Generated output should be a committed multi-page static HTML site with local CSS, JavaScript, assets, and search metadata. Generated pages must include source provenance and a visible statement that Markdown remains canonical and generated HTML is presentation only. Manifest and search metadata stay under `<output>/assets`. No remote scripts, analytics, fonts, CSS, or CDN dependencies are used by default. Pictures and screenshots require an explicit user or template request.

## Product Decisions

- Decision (2026-05-25): Truthmark Portal is controlled by a namespaced `truthmark-portal` config block rather than a shared optional-workflows list, so enablement, output, and template selection stay together.
- Decision (2026-05-25): Portal is opt-in and manual-only; generated Portal output is a human presentation surface and must not become canonical repository truth or an automatic Sync/check gate.
- Decision (2026-05-25): Portal V1 is agent-native and Markdown-native. It does not introduce a required Portal package, generated `.truthmark/index.json`, or deterministic renderer dependency.

## Rationale

Large repositories need a human browsable entrypoint over routed truth docs, but Truthmark's authority model stays Markdown-first. Keeping Portal as an optional installed workflow gives humans a committed static site without changing agent truth sources or normal completion workflows.

## Non-Goals

- no automatic Portal generation after code changes
- no canonical HTML truth surface
- no mandatory `truthmark` binary, Portal package, remote service, or `.truthmark/index.json`
- no writes outside the configured Portal output directory by default

## Maintenance Notes

Update this document when Portal config, generated surfaces, write boundaries, default output/template behavior, or generated-site safety rules change.
