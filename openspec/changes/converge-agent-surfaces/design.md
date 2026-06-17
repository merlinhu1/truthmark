## Context

Truthmark has a mature generated-surface pipeline: workflow bodies are rendered from TypeScript source, then projected into host-specific files for Codex/OpenAI-style agents, Claude, GitHub Copilot, Gemini, OpenCode, and top-level instruction files. Recent review feedback exposed two constraints that must both be respected:

1. wording changes such as lane simplification or enforcement-metaphor cleanup should not create independent workflow authorities across hosts; and
2. agent skill hosts package and progressively disclose files from the skill directory, so adapter-only skill folders can lose native procedure/report/helper resources.

The right target is not one tiny adapter everywhere. The right target is one canonical source model plus generated host-native packages where the host expects a skill package.

This follows established patterns:

- GitHub Agent Skills are folders of instructions, scripts, and resources; project skills are stored in repository skill directories such as `.github/skills`, `.claude/skills`, and `.agents/skills`.
- The Agent Skills open format describes a skill as a folder with `SKILL.md` plus optional scripts, references, assets, templates, and other resources, loaded through progressive disclosure.
- MCP Prompts standardize prompt discovery/retrieval, but allow clients to expose prompts through any UI pattern, which supports thin prompt/command adapters.
- GitHub reusable workflows and composite actions centralize repeated workflow logic behind callers.
- OpenAPI Generator separates a normalized generator model from target-specific templates, which is analogous to a canonical Truthmark workflow model projected into host-native outputs.

## Goals / Non-Goals

**Goals:**

- Establish `.truthmark/agent/` as the canonical repository-local Truthmark workflow package and manifest.
- Keep TypeScript workflow renderers as the single source model for generated workflow bodies.
- Preserve host-native skill packaging by rendering complete skill folders with colocated support files for skill hosts.
- Keep prompt/command/top-level instruction surfaces small, reviewable, and adapter-shaped.
- Add deterministic checks that make stale or manually diverged canonical and host-native generated packages visible through `truthmark check` and tests.
- Preserve direct repository-file operation: agents can work from committed files without requiring a live server, hook, or network service.

**Non-Goals:**

- Do not require MCP for normal operation. MCP prompt exposure can be a future optional adapter.
- Do not remove host-specific generated files or skill resources.
- Do not make adapter-only skill folders the default for hosts that package resources from the skill directory.
- Do not change Truthmark workflow semantics while moving source authority.
- Do not add CI/PR blockers, hooks, or mandatory runtime enforcement.

## Decisions

### Decision 1: Canonical package plus host-native skill packages

Create `.truthmark/agent/manifest.json` and `.truthmark/agent/workflows/<workflow>/` package directories. Each workflow package owns:

- `SKILL.md` entrypoint text
- `procedure.md`
- `report-template.md` when applicable
- subagent/lease guidance when applicable
- helper metadata/policy when helper scripts are exposed

Configured host skill directories (`.agents/skills`, `.opencode/skills`, `.claude/skills`, `.github/skills`, `.gemini/skills`) are generated as complete native packages with their own colocated support files. These packages are projections of the same canonical renderer, not independently edited authorities.

Alternative rejected: adapter-only skill folders. That preserves a single visible body but weakens hosts whose native skill invocation makes only the skill directory and its resources available.

### Decision 2: Thin adapters are for non-skill entrypoints

GitHub Copilot prompt files, Gemini command files, managed instruction blocks, and similar non-skill host surfaces stay thin. They identify the intended workflow entrypoint, avoid recursive command dispatch, and route the model to the host-native skill package or canonical `.truthmark/agent` package.

Alternative rejected: copying full workflow bodies into every prompt/command adapter. That recreates review noise without preserving skill resource packaging.

### Decision 3: Manifest records package modes and hashes

The manifest stores canonical workflow package paths, support files, package modes, and content hashes. Operational fields that vary by checkout path must be omitted from hashes or represented with stable repository-relative paths.

Alternative rejected: rely only on renderer tests. Renderer tests can pass while checked-in generated surfaces are stale; disk-level checks are required because agents consume checked-in files.

### Decision 4: Checks fail as diagnostics, not workflow blockers

`truthmark check` reports stale or missing canonical package files and stale or missing generated host package files as diagnostics. It does not add hooks, CI blockers, or hard runtime enforcement. Agent behavior remains guided by repository files and report quality.

Alternative rejected: add mandatory preflight CLI execution before agent workflows. This conflicts with the existing product boundary that Truthmark should remain an injected repository-truth workflow and should not block normal agent execution.

## Risks / Trade-offs

- **Risk: Generated host skill bodies still create review churn.** → Mitigation: treat them as generated native packages, validate freshness deterministically, and review source renderers plus focused generated diffs.
- **Risk: Agents treat host package copies as independent authority.** → Mitigation: generated checks reject stale divergence; docs state host packages are projections of the canonical renderer/package.
- **Risk: Adapter-only looks cleaner but breaks packaging.** → Mitigation: reserve adapter-only surfaces for prompts/commands/instruction blocks, not skill directories.
- **Risk: Hashes become noisy because paths or version strings vary.** → Mitigation: hash only repository-relative canonical content and deterministic render inputs.
- **Risk: OpenSpec/MCP concepts accidentally expand scope.** → Mitigation: keep OpenSpec artifacts as planning/specification only; keep MCP prompt exposure as an optional future adapter, not a required runtime dependency.

## Migration Plan

1. Add canonical package renderers and manifest generation.
2. Render all configured host skill directories as native generated packages with colocated support files.
3. Keep prompt/command/top-level instruction files as thin adapters or discovery surfaces.
4. Add tests that canonical and host-native packages contain the workflow sections and support files consumed by skill hosts.
5. Add disk-level hygiene checks for stale/missing canonical package files and stale/missing host-native package files.
6. Update Truthmark docs/routes to describe canonical renderer/package ownership and native skill packaging.

Rollback strategy: because host surfaces remain generated, rollback can restore the previous host package projection while leaving the canonical package in place.

## Open Questions

- Should `.truthmark/agent/manifest.json` be checked by `truthmark check` only, or also exposed through `truthmark workflow status --json`? Recommended default: check first; status exposure can follow after the package model stabilizes.
- Should MCP prompt exposure be part of this change? Recommended default: no; track it as a future optional adapter after repository-file package generation is stable.
