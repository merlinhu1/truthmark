## Why

Truthmark currently renders near-identical workflow instructions into several host-specific surfaces (`.agents`, `.claude`, `.github`, `.gemini`, `.opencode`, and top-level instruction files). Even though those files are generated, duplicated workflow prose makes review noisy and lets stale prompt wording drift across hosts. At the same time, agent skill hosts package and progressively disclose resources from the skill directory, so adapter-only skill folders can drop native resource packaging.

This change converges generated surfaces around one canonical renderer and repository-local Truthmark agent package while preserving host-native skill packages. Host skill directories remain complete generated packages with colocated support files; prompt/command surfaces stay thin adapters that route to the host-local or canonical package entrypoint.

## What Changes

- Introduce a canonical Truthmark agent package under `.truthmark/agent/` containing workflow skill entrypoints, procedures, report templates, shared guidance, helper metadata, and a manifest.
- Render configured host skill directories as native generated packages with colocated procedure, report-template, helper, and lease resources.
- Keep GitHub Copilot prompt files, Gemini command files, top-level managed blocks, and other non-skill surfaces as thin adapters/discovery surfaces.
- Add freshness and hygiene checks that detect stale canonical package files and stale or missing generated host skill package files.
- Preserve current workflow behavior while moving source authority from copied host prompts to canonical renderers and validated generated packages.
- Do not add hooks, CI blockers, mandatory live MCP servers, or mandatory CLI execution for normal agent workflows.

## Capabilities

### New Capabilities

- `canonical-agent-workflow-package`: Defines the canonical repository-local package for Truthmark workflow prompts/skills and the native-package/freshness contract for generated host surfaces.

### Modified Capabilities

- None. This repository does not yet have archived OpenSpec specs; this change introduces a new capability instead of modifying an existing spec.

## Impact

- Source renderers: `src/templates/workflow-surfaces.ts`, `src/templates/generated-surfaces.ts`, `src/templates/agents-block.ts`, `src/checks/generated-surfaces.ts`.
- Workflow manifest and metadata: `src/agents/workflow-manifest.ts`, `src/agents/shared.ts`, workflow-specific agent renderers.
- Generated repository surfaces: `.agents/**`, `.claude/**`, `.github/**`, `.gemini/**`, `.opencode/**`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`.
- Tests: generated-surface freshness tests, workflow renderer tests, init/check integration tests, disk-level generated-file hygiene scans.
- Truth docs: engineering workflow/repository truth docs and route metadata describing generated-surface ownership.
- External reference patterns:
  - GitHub Agent Skills are folders of instructions, scripts, and resources; project skills live under repository skill directories such as `.github/skills`, `.claude/skills`, and `.agents/skills`: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
  - Agent Skills package reusable instructions, scripts, reference materials, templates, and other resources in one skill folder: https://github.com/agentskills/agentskills
  - MCP Prompts expose prompt templates through list/get APIs while letting clients choose their UI pattern: https://modelcontextprotocol.io/specification/2025-06-18/server/prompts.md
  - GitHub reusable workflows and composite actions avoid repeated workflow definitions through reusable called units: https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows and https://docs.github.com/en/actions/tutorials/create-actions/create-a-composite-action
  - OpenAPI Generator normalizes an input model and applies target templates rather than treating every generated output as the source of truth: https://github.com/OpenAPITools/openapi-generator/blob/master/docs/templating.md
