## Why

Truthmark currently renders near-identical workflow instructions into several host-specific surfaces (`.agents`, `.claude`, `.github`, `.gemini`, `.opencode`, and top-level instruction files). Even though those files are generated, duplicated workflow prose makes review noisy and lets stale prompt wording drift across hosts.

This change converges generated surfaces around one canonical repository-local Truthmark agent package. Host-specific files become thin adapters that route agents to the canonical package, with an expanded compatibility mode only for hosts that cannot reliably follow repository-file references.

## What Changes

- Introduce a canonical Truthmark agent package under `.truthmark/agent/` containing workflow skill entrypoints, procedures, report templates, shared guidance, helper metadata, and a manifest.
- Convert generated host skill/prompt/command files into adapter-only surfaces where possible.
- Add an explicit expanded-adapter compatibility mode with source provenance and hashes for hosts that need full inline workflow bodies.
- Add freshness and hygiene checks that detect stale canonical package files, stale adapters, unauthorized duplicated workflow prose in adapters, and missing canonical references.
- Preserve current workflow behavior while moving authority from copied host prompts to canonical package files.
- Do not add hooks, CI blockers, mandatory live MCP servers, or mandatory CLI execution for normal agent workflows.

## Capabilities

### New Capabilities

- `canonical-agent-workflow-package`: Defines the canonical repository-local package for Truthmark workflow prompts/skills and the adapter/freshness contract for generated host surfaces.

### Modified Capabilities

- None. This repository does not yet have archived OpenSpec specs; this change introduces a new capability instead of modifying an existing spec.

## Impact

- Source renderers: `src/templates/workflow-surfaces.ts`, `src/templates/generated-surfaces.ts`, `src/templates/agents-block.ts`, `src/checks/generated-surfaces.ts`.
- Workflow manifest and metadata: `src/agents/workflow-manifest.ts`, `src/agents/shared.ts`, workflow-specific agent renderers.
- Generated repository surfaces: `.agents/**`, `.claude/**`, `.github/**`, `.gemini/**`, `.opencode/**`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- Tests: generated-surface freshness tests, workflow renderer tests, init/check integration tests, disk-level generated-file hygiene scans.
- Truth docs: engineering workflow/repository truth docs and route metadata describing generated-surface ownership.
- External reference patterns:
  - Anthropic Agent Skills package reusable instructions, metadata, scripts, templates, and references to reduce repeated guidance: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview.md
  - MCP Prompts expose prompt templates through list/get APIs while letting clients choose their UI pattern: https://modelcontextprotocol.io/specification/2025-06-18/server/prompts.md
  - GitHub reusable workflows and composite actions avoid repeated workflow definitions through reusable called units: https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows and https://docs.github.com/en/actions/tutorials/create-actions/create-a-composite-action
  - OpenAPI Generator normalizes an input model and applies target templates rather than treating every generated output as the source of truth: https://github.com/OpenAPITools/openapi-generator/blob/master/docs/templating.md
