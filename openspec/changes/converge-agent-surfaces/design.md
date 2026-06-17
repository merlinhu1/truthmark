## Context

Truthmark has a mature generated-surface pipeline: workflow bodies are rendered from TypeScript source, then projected into host-specific files for Codex/OpenAI-style agents, Claude, GitHub Copilot, Gemini, OpenCode, and top-level instruction files. Recent review feedback exposed a maintenance problem: wording changes such as lane simplification or enforcement-metaphor cleanup require inspecting many generated copies, and stale copies can continue shaping agent behavior even after source renderers are fixed.

The right target is not zero generated files. Host ecosystems have different discovery paths and metadata formats. The right target is zero duplicated workflow authority: one canonical package defines behavior, while generated host files only adapt host invocation and discovery.

This follows established patterns:

- Anthropic Agent Skills are filesystem packages containing reusable instructions, metadata, scripts, templates, and references; their documented benefit is reducing repeated guidance across conversations.
- MCP Prompts standardize prompt discovery/retrieval, but explicitly allow clients to expose prompts through any UI pattern, which supports a canonical prompt model with host-specific adapters.
- GitHub reusable workflows and composite actions centralize repeated workflow logic behind callers.
- OpenAPI Generator separates a normalized generator model from target-specific templates, which is analogous to a canonical Truthmark workflow model projected into host adapters.

## Goals / Non-Goals

**Goals:**

- Establish `.truthmark/agent/` as the canonical repository-local source for Truthmark workflow skill/prompt content.
- Keep host-specific generated files small, reviewable, and adapter-shaped.
- Support expanded host files only as a compatibility projection with provenance and freshness hashes.
- Add deterministic checks that make stale or manually diverged adapters visible through `truthmark check` and tests.
- Preserve direct repository-file operation: agents can work from committed files without requiring a live server, hook, or network service.

**Non-Goals:**

- Do not require MCP for normal operation. MCP prompt exposure can be a future optional adapter.
- Do not remove host-specific generated files entirely.
- Do not change Truthmark workflow semantics while moving the source of authority.
- Do not add CI/PR blockers, hooks, or mandatory runtime enforcement.
- Do not keep old copied-prompt surfaces as parallel authorities after migration is complete.

## Decisions

### Decision 1: Canonical package plus host adapters

Create `.truthmark/agent/manifest.json` and `.truthmark/agent/workflows/<workflow>/` package directories. Each workflow package owns:

- `SKILL.md` or equivalent entrypoint text
- `procedure.md`
- `report-template.md` when applicable
- `subagents.md` when applicable
- `helpers.json` when helper scripts are exposed

Generated host surfaces point to these files and describe only host-specific invocation details. They do not restate procedure or report bodies.

Alternative rejected: make one physical file satisfy every host. Hosts require different names, metadata, frontmatter, prompt formats, and command locations; a single physical file would either lose host affordances or grow host-specific branches inside the canonical content.

### Decision 2: Adapter modes are explicit

Each generated host surface declares one of two modes:

- `adapter`: thin wrapper that references canonical files.
- `expanded-adapter`: full inline projection for hosts that need prompt bodies copied into the host surface.

Expanded adapters include machine-readable provenance comments:

```md
<!-- truthmark:adapter-mode=expanded-adapter -->
<!-- truthmark:canonical=.truthmark/agent/workflows/truthmark-sync/SKILL.md -->
<!-- truthmark:canonical-sha256=<hash> -->
<!-- truthmark:generated-sha256=<hash> -->
```

Alternative rejected: silently expanding some hosts. Silent expansion would recreate today's review problem because copied prompt bodies would look authoritative.

### Decision 3: Manifest hashes are derived from canonical files

The manifest stores canonical workflow package paths, adapter capabilities, and content hashes. Generated adapters are rendered deterministically from the manifest and package metadata. Operational fields that vary by checkout path must be omitted from hashes or represented with stable repository-relative paths.

Alternative rejected: rely only on renderer tests. Renderer tests can pass while checked-in generated surfaces are stale; disk-level checks are required because agents consume checked-in files.

### Decision 4: Checks fail as diagnostics, not workflow blockers

`truthmark check` reports stale package/adapters, missing canonical references, and unauthorized prompt prose in adapters as diagnostics. It does not add hooks, CI blockers, or hard runtime enforcement. Agent behavior remains guided by repository files and report quality.

Alternative rejected: add mandatory preflight CLI execution before agent workflows. This conflicts with the existing product boundary that Truthmark should remain an injected repository-truth workflow and should not block normal agent execution.

### Decision 5: Compatibility migration is phased

The migration starts by generating canonical packages while retaining current expanded host surfaces. Then adapters are enabled host-by-host. Each phase has tests that ensure no workflow semantics changed, and generated files are kept fresh before broader conversion.

Alternative rejected: big-bang deletion of all copied surfaces. That would make host-specific regressions harder to isolate.

## Risks / Trade-offs

- **Risk: Some hosts ignore referenced files.** → Mitigation: keep `expanded-adapter` mode per host until evidence shows adapter-only works reliably.
- **Risk: Agents treat adapters as source of truth anyway.** → Mitigation: adapter text explicitly says canonical package files are authoritative; checks reject full procedure/report prose in adapter mode.
- **Risk: Generated-surface churn remains large during migration.** → Mitigation: phase by host and keep tests focused on semantic equivalence/freshness rather than exact whole-file snapshots.
- **Risk: Hashes become noisy because paths or version strings vary.** → Mitigation: hash only repository-relative canonical content and deterministic adapter render inputs.
- **Risk: OpenSpec/MCP concepts accidentally expand scope.** → Mitigation: keep OpenSpec artifacts as planning/specification only; keep MCP prompt exposure as an optional future adapter, not a required runtime dependency.

## Migration Plan

1. Add canonical package renderers and manifest generation without changing host surfaces.
2. Add tests that canonical package files contain the same workflow body sections currently rendered in host skill packages.
3. Add adapter rendering primitives and disk-level hygiene checks.
4. Convert one low-risk host to adapter-only and validate with generated-surface tests plus `truthmark check --json`.
5. Convert remaining hosts to adapter or expanded-adapter mode based on host reliability.
6. Remove duplicated prompt-body assertions from adapter tests and replace them with canonical package assertions.
7. Update Truthmark docs/routes to describe canonical workflow package ownership.

Rollback strategy: because host surfaces remain generated, rollback can restore expanded-adapter mode for any host while leaving the canonical package in place.

## Open Questions

- Which host should convert to adapter-only first? Recommended default: `.agents` or `.opencode`, because they are closest to generic repository-file consumption.
- Should `.truthmark/agent/manifest.json` be checked by `truthmark check` only, or also exposed through `truthmark workflow status --json`? Recommended default: check first; status exposure can follow after the package model stabilizes.
- Should MCP prompt exposure be part of this change? Recommended default: no; track it as a future optional adapter after repository-file canonicalization is complete.
