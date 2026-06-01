# Truthmark × OpenSpec Deep Behavioral Research

Date: 2026-06-01  
Truthmark repository: `/opt/data/repos/truthmark`  
OpenSpec repository: `/tmp/openspec-research` (`Fission-AI/OpenSpec`, cloned locally)  
Output location: `.hermes/research/2026-06-01-openspec-comparison.md`

## Research intent

This report compares Truthmark against Fission-AI/OpenSpec at the behavior/workflow/schema/agent level. It intentionally does **not** compare superficial README positioning, implementation languages, or repository size.

The goal is to understand what OpenSpec does better and what Truthmark can learn **without becoming a spec-driver library** and without replicating OpenSpec's proposal/spec/design/task lifecycle.

Truthmark's intended mission remains: a local-first, Git-native repository-truth governance layer that installs truth-aware workflows into coding-agent surfaces, validates ownership/routing/freshness, and keeps implementation-aligned truth reviewable in Git.

OpenSpec's intended mission is different: a local spec/change lifecycle system that helps agents and humans create, apply, verify, sync, and archive proposed behavior changes through structured artifacts.

## Methodology

I inspected both repositories as local code, not just documentation:

- Truthmark: `/opt/data/repos/truthmark`
  - CLI command definitions and handlers
  - config schema/defaults/load behavior
  - init/scaffold/generation behavior
  - generated agent surfaces and workflow manifest
  - routing/truth-doc model
  - check, impact, context-pack, freshness, evidence, and path/git containment behavior
  - active `.truthmark/config.yml`
- OpenSpec: `/tmp/openspec-research`
  - CLI workflow commands
  - artifact graph runtime
  - built-in workflow schemas
  - planning-home/workspace behavior
  - generated skills/commands/adapters
  - Markdown parsers and validators
  - archive/apply/spec-delta behavior
  - tests and workflow templates

Important caveat: Truthmark's worktree is heavily dirty and appears to contain the current v2 workspace refactor. I treated the current worktree as the active design under review.

---

## Executive judgement

OpenSpec is ahead of Truthmark in **agent-facing workflow state ergonomics**. Its strongest transferable idea is not “specs,” but the way it converts local repository state into explicit machine-readable guidance for agents:

- `status --json` tells the agent what exists, what is ready, what is blocked, and what is next.
- `instructions <artifact/action> --json` gives the agent exact context files, constraints, output paths, dependencies, and stop conditions.
- `actionContext` gives allowed edit roots and mode-specific constraints.
- Tool-specific generated skills/commands teach many agent hosts to use the same local CLI contract.

Truthmark already has many of the right lower-level pieces:

- workflow manifest with triggers, negative triggers, allowed writes, forbidden adjacency, report sections, helpers, and subagents
- strict v2 config and path containment
- routing/truth-doc ownership model
- `check`, `impact`, `context`, `validate` commands
- generated surfaces for Codex, OpenCode, Claude Code, GitHub Copilot, and Gemini CLI
- write leases and helper validators

But Truthmark's pieces are less unified as a single agent-facing state machine. OpenSpec's advantage is that an agent can ask the tool: **what should I do next, what may I edit, and why?** Truthmark can adopt that pattern without adopting OpenSpec's artifact lifecycle.

Highest-value improvement for Truthmark:

> Add a Truthmark-native `workflow status/instructions --json` layer that composes the existing manifest, route map, check diagnostics, impact set, context pack, write boundaries, and validators into one explicit workflow contract for agents.

This would improve Truthmark's mission directly: repository-truth governance becomes more deterministic, safer, and easier for agents to follow.

---

## Mission comparison

### Truthmark

Truthmark is a repository-truth workflow layer. It is not supposed to be the feature spec, task manager, or product lifecycle tool. Its core concerns are:

- Which source files and docs own a behavior?
- Which truth documents must change when code behavior changes?
- Which truth docs are canonical and which are generated/host surfaces?
- Which agent workflow is appropriate for the task?
- What can the agent write safely?
- Are generated agent surfaces and truth docs fresh, routed, and reviewable?

Evidence inspected:

- CLI description in `src/cli/program.ts`: Git-native, branch-scoped truth workflow installer for local AI coding agents.
- `src/agents/workflow-manifest.ts`: defines `truthmark-sync`, `truthmark-structure`, `truthmark-document`, `truthmark-preview`, `truthmark-realize`, `truthmark-check`, and `truthmark-portal`.
- `.truthmark/config.yml`: v2 config locates the Truthmark-owned workspace under `docs/truthmark`, with routing/truth/templates scoped inside it.
- `src/checks/*`, `src/impact/build.ts`, `src/context-pack/build.ts`: validation, routing, impact, freshness, and bounded workflow context.

### OpenSpec

OpenSpec is a spec/change lifecycle system. Its core concerns are:

- Create a named change.
- Generate proposal/spec/design/task artifacts.
- Validate Markdown artifact structure and spec deltas.
- Tell agents which artifact is ready/blocked/done.
- Apply tasks/changes.
- Verify behavior against specs.
- Archive/sync deltas into canonical specs.

Evidence inspected:

- `schemas/spec-driven/schema.yaml`: proposal/specs/design/tasks/apply workflow artifacts.
- `src/core/artifact-graph/*`: runtime artifact graph and dependency state.
- `src/commands/workflow/status.ts` and `src/commands/workflow/instructions.ts`: agent-facing state and instructions API.
- `src/core/archive.ts` and `src/core/specs-apply.ts`: spec delta apply/archive behavior.
- `src/core/templates/workflows/*`: generated skills that guide agents through OpenSpec actions.

### Core mission difference

| Dimension | Truthmark | OpenSpec |
|---|---|---|
| Primary object | Repository truth, routes, evidence, governance | Proposed changes, specs, deltas, tasks |
| Default runtime | Installed agent workflows + local CLI validation | Local CLI state machine + generated workflow commands |
| Write target | Canonical truth docs/routes or functional code depending on workflow | `openspec/changes/*`, `openspec/specs/*`, task files |
| Success condition | Repo truth is aligned, routed, fresh, and reviewable | Change artifacts are complete, valid, implemented, verified, archived |
| Agent role | Keep truth aligned and constrained | Produce/apply/verify change artifacts |
| What not to become | General spec/task lifecycle | N/A; that is OpenSpec's mission |

Truthmark should learn OpenSpec's agent-state ergonomics, not its product lifecycle.

---

## Behavioral architecture comparison

## 1. Workflow state model

### OpenSpec behavior

OpenSpec has an explicit artifact graph.

Evidence:

- `src/core/artifact-graph/types.ts` defines `ArtifactSchema` with `id`, `generates`, `description`, `template`, optional `instruction`, and `requires`.
- `src/core/artifact-graph/graph.ts` topologically sorts artifacts and computes ready/blocked/done state.
- `src/core/artifact-graph/state.ts` detects completion from generated output files.
- `schemas/spec-driven/schema.yaml` declares concrete artifacts: proposal, specs, design, tasks, apply.
- `schemas/workspace-planning/schema.yaml` declares a different planning workflow with workspace guards.

This means OpenSpec can answer:

- Which artifact should the agent create next?
- Which dependency blocks it?
- Which output path proves completion?
- Which apply action is unlocked?

The workflow state is not only prose; it is computable.

### Truthmark behavior

Truthmark has a workflow manifest rather than an artifact graph.

Evidence:

- `src/agents/workflow-manifest.ts` declares workflow IDs, triggers, negative triggers, allowed writes, forbidden adjacency, report sections, helpers, and subagents.
- `src/context-pack/build.ts` computes workflow-specific allowed write paths and bounded context for `truth-sync`, `truth-document`, and `truth-realize`.
- `src/checks/check.ts`, `src/impact/build.ts`, and `src/repo-index/route-map.ts` compute truth health, affected routes, impacted source/truth surfaces, and diagnostics.

Truthmark's state is more governance-oriented than sequence-oriented. It can identify affected routes and allowed paths, but it does not yet expose a single OpenSpec-style “ready/blocked/next action” workflow API.

### Judgement

OpenSpec is better at making workflow state legible to agents. Truthmark should not copy artifact DAGs, but should expose governance state in a similarly explicit way.

Recommended Truthmark direction:

```bash
truthmark workflow status --workflow truth-sync --base main --json
truthmark workflow instructions --workflow truth-sync --base main --json
```

The response should include:

- selected workflow
- applicability and non-applicability reasons
- changed files inspected
- affected routes
- target truth docs
- allowed write paths
- forbidden write paths
- required checks/helpers
- blockers/warnings
- suggested next actions
- report template

This reuses Truthmark's existing concepts and avoids OpenSpec-style proposal/spec artifacts.

---

## 2. Agent-facing CLI contract

### OpenSpec behavior

OpenSpec's CLI acts like an agent API.

Evidence:

- `src/commands/workflow/status.ts` loads planning home, schema, change metadata, context, and returns structured status.
- `src/core/artifact-graph/instruction-loader.ts` returns rich status fields such as `planningHome`, `changeRoot`, `artifactPaths`, `affectedAreas`, `nextSteps`, `actionContext`, and `applyRequires`.
- `src/commands/workflow/instructions.ts` returns artifact-specific instructions, dependency files, template content, resolved output paths, context/rules, and unlocks.
- Generated workflow templates such as `src/core/templates/workflows/propose.ts`, `continue-change.ts`, `apply-change.ts`, and `archive-change.ts` instruct agents to call the CLI JSON endpoints before acting.

OpenSpec's generated prompts are not the sole source of truth. They teach agents to ask the CLI for the current state and obey it.

### Truthmark behavior

Truthmark has useful JSON-capable commands and helper validators:

- `truthmark check --json`
- `truthmark impact --base ... --json`
- `truthmark context --workflow ... --format json`
- `truthmark validate sync-report ... --json`
- `truthmark validate document-report ... --json`
- `truthmark validate write-lease ... --json`

Evidence:

- Command definitions in `src/cli/program.ts`.
- Handler validation in `src/cli/handlers.ts`.
- Helper definitions in `src/agents/workflow-manifest.ts`.
- Context pack construction in `src/context-pack/build.ts`.

But the contract is distributed. Agents have to know which combination of commands to call and how to map them to workflow intent.

### Judgement

OpenSpec does better because the CLI itself presents a coherent agent-facing contract.

Recommended Truthmark direction:

Publish and implement a stable **Agent-Compatible CLI Contract**:

- human/setup commands: `config`, `init`
- agent/context commands: `check`, `impact`, `context`, `validate`, future `workflow status`, future `workflow instructions`
- stable JSON fields
- best-effort fields
- missing-command degradation behavior
- examples for each installed host surface

This is a documentation and API-contract improvement, not a spec-driver pivot.

---

## 3. Action constraints and write boundaries

### OpenSpec behavior

OpenSpec returns explicit action context.

Evidence:

- `src/core/change-status-policy.ts` defines `ActionContext` with mode, source of truth, planning artifacts, linked context, allowed edit roots, whether affected-area selection is required, and constraints.
- Repo-local mode allows project-root edits.
- Workspace-planning mode has empty allowed edit roots and explicit constraints to avoid implementation edits without an allowed root.
- Generated apply/archive workflows stop on unsupported workspace modes or empty allowed roots.

This is one of OpenSpec's strongest behaviors: agents are given not just content but an editing policy.

### Truthmark behavior

Truthmark already has stronger product-level write boundaries than OpenSpec in some ways:

- `truthmark-sync`: canonical truth docs and routing files only.
- `truthmark-document`: canonical truth docs and routing files only.
- `truthmark-realize`: functional code only; must not edit truth docs/routing.
- `truthmark-preview` and `truthmark-check`: read-only.
- `truthmark-portal`: configured Portal output only.
- write leases limit doc-writing subagents.
- path containment prevents writes outside repo/worktree.

Evidence:

- `src/agents/workflow-manifest.ts`: workflow allowed writes and forbidden adjacency.
- `src/templates/workflow-surfaces.ts`: subagent and write-lease instructions.
- `src/fs/paths.ts` and `src/git/repository.ts`: repo containment and Git worktree path resolution.
- `src/context-pack/build.ts`: allowed write paths by workflow.

However, Truthmark's action constraints are mostly encoded in generated prose and manifest data. They are not yet a central machine-readable response for every workflow.

### Judgement

Truthmark has the right governance primitives; OpenSpec packages them better for agent consumption.

Recommended Truthmark direction:

Every workflow status/context response should include:

```json
{
  "workflow": "truthmark-sync",
  "mode": "truth-doc-write",
  "allowedWritePaths": [],
  "forbiddenWritePaths": [],
  "stopConditions": [],
  "requiredEvidence": [],
  "leaseValidationCommand": null,
  "sourceOfTruth": "repository"
}
```

For read-only workflows, `allowedWritePaths` should be empty and `mode` should explicitly be `read-only`.

This directly supports Truthmark's mission and does not copy OpenSpec's artifacts.

---

## 4. Generated agent surfaces

### OpenSpec behavior

OpenSpec generates tool-native commands and skills through an adapter architecture.

Evidence:

- `src/core/command-generation/types.ts` separates `CommandContent` from `ToolCommandAdapter`.
- `src/core/command-generation/generator.ts` delegates file path and formatting to the adapter.
- `src/core/command-generation/registry.ts` registers adapters for multiple tools.
- Tool-specific adapters format commands for Claude, Cursor, Codex, Gemini, GitHub Copilot, OpenCode, and others.
- `src/core/init.ts` generates skills and/or commands based on profile/delivery settings.

OpenSpec's adapter separation is maintainable. The workflow content is tool-agnostic; rendering is tool-specific.

### Truthmark behavior

Truthmark already generates many high-value agent surfaces:

- Codex: `.codex/skills`, `.codex/agents`, metadata
- OpenCode: `.opencode/skills`, `.opencode/agents`
- Claude Code: `CLAUDE.md`, `.claude/skills`, `.claude/agents`
- GitHub Copilot: `.github/copilot-instructions.md`, `.github/skills`, `.github/prompts`, `.github/agents`
- Gemini CLI: `GEMINI.md`, `.gemini/skills`, `.gemini/commands`, `.gemini/agents`

Evidence:

- `src/templates/generated-surfaces.ts`: platform-specific surface rendering.
- `src/templates/workflow-surfaces.ts`: skill package rendering, report templates, subagent instructions, helper manifests.
- `src/config/schema.ts`: supported platforms are encoded in config schema.

Truthmark's generated surfaces are product-aligned and strong. The implementation, however, appears more centralized and constant-heavy than OpenSpec's adapter architecture.

### Judgement

OpenSpec does better internally by separating platform adaptation from workflow content.

Recommended Truthmark direction:

Refactor generated surface implementation toward a platform adapter registry:

- platform id
- supported surface types
- output paths
- formatting/frontmatter rules
- capability flags
- skill rendering rules
- command rendering rules
- agent/subagent rendering rules

This is an internal maintainability improvement. It should not imply chasing OpenSpec's full tool list or broadening the product mission.

---

## 5. Schema and config design

### OpenSpec behavior

OpenSpec supports workflow schemas that define artifact IDs, dependencies, generated paths, templates, instructions, and apply behavior.

Evidence:

- `schemas/spec-driven/schema.yaml`: built-in spec-driver workflow.
- `schemas/workspace-planning/schema.yaml`: workspace planning workflow.
- `src/core/artifact-graph/resolver.ts`: project-local, user override, and package built-in schema resolution.
- `src/core/artifact-graph/schema.ts`: validation for schema integrity such as missing refs, duplicates, and cycles.

This extensibility is valuable because OpenSpec's product is workflow/spec definition.

### Truthmark behavior

Truthmark's v2 config is intentionally narrower and governance-specific.

Evidence:

- `src/config/schema.ts`: strict `version: 2`, supported platforms, workspace, routes, truth root, templates, generated portal, instruction targets, frontmatter policy, ignore policy.
- `src/config/defaults.ts`: default workspace is under `docs/truthmark`.
- `src/config/load.ts`: validates unsupported legacy shape, workspace containment, forbidden overlaps, child path restrictions, portal output overlap, and instruction targets outside the Truthmark workspace.
- `.truthmark/config.yml`: active config follows this v2 model.

Truthmark's narrower schema is a strength. It prevents the tool from becoming a generic spec workflow engine.

### Judgement

OpenSpec's schema extensibility should not be copied wholesale. Truthmark should instead add constrained governance extension points.

Good future extension points:

- per-workflow severity tuning
- route policy hints
- evidence requirements
- frontmatter policy profiles
- report section toggles
- generated surface selection
- organization-specific required truth-doc sections

Avoid:

- arbitrary workflow DAGs
- arbitrary artifact templates
- OpenSpec-style changes/specs/tasks
- user-defined lifecycle engines

---

## 6. Routing, ownership, and source-of-truth model

### Truthmark behavior

This is Truthmark's strongest unique advantage over OpenSpec.

Evidence:

- `src/routing/areas.ts`: truth document kinds and route area parser.
- `src/routing/area-resolver.ts`: root route index, child route files, containment, duplicate area detection, unreferenced child route diagnostics.
- `docs/truthmark/routes/areas.md`: route index delegates to multiple area files.
- `docs/truthmark/routes/areas/*.md`: area-specific ownership and code/truth mapping.
- `src/checks/areas.ts`: validates code surfaces, truth docs, unmapped functional code, route precision, topology pressure.
- `src/repo-index/route-map.ts`: emits a route map that links route id/name/key/source path/code surface/truth docs/update triggers.

Truthmark knows which parts of the repo own which truth docs. OpenSpec's spec areas are more about capabilities/change artifacts than repository-truth ownership.

### OpenSpec behavior

OpenSpec has affected areas and workspace-planning area scopes, but those are part of planning/spec workflow.

Evidence:

- `.openspec.yaml` change metadata includes affected areas.
- `schemas/workspace-planning/schema.yaml` requires area-scoped specs and guards repo-local implementation edits.
- `src/core/planning-home.ts` distinguishes repo and workspace planning homes.

### Judgement

Truthmark should not trade its route ownership model for OpenSpec's spec area model. But it can learn from OpenSpec's way of surfacing affected areas in status/instructions.

Recommended Truthmark direction:

Workflow status should explicitly report:

- affected routes
- owner route files
- target truth docs
- unmatched changed files
- ownership ambiguity
- route precision score
- route topology pressure

This would turn Truthmark's internal route intelligence into agent-facing guidance.

---

## 7. Validation behavior

### OpenSpec behavior

OpenSpec validates a specific Markdown contract deeply.

Evidence:

- `src/core/parsers/markdown-parser.ts`: masks fenced code blocks, parses Purpose/Requirements/Scenarios.
- `src/core/parsers/requirement-blocks.ts`: parses ADDED/MODIFIED/REMOVED/RENAMED delta sections.
- `src/core/validation/validator.ts`: validates SHALL/MUST requirements, scenarios, duplicate/conflicting requirements, structural rules, strict mode.
- `src/core/specs-apply.ts`: applies deltas in specific order and validates rebuilt specs.
- `src/core/archive.ts`: checks task progress, applies deltas, validates, and archives.

This validation is impressive, but it is tightly coupled to OpenSpec's spec-driver model.

### Truthmark behavior

Truthmark validates repository-truth health rather than spec conformance.

Evidence:

- `src/checks/check.ts`: composes branch scope, authority, areas, frontmatter, links, decisions, generated surfaces, freshness.
- `src/checks/frontmatter.ts`: validates required/recommended fields and route kind matching.
- `src/checks/decisions.ts`: validates required sections by truth kind.
- `src/checks/generated-surfaces.ts`: validates generated surfaces and managed blocks.
- `src/freshness/check.ts`: maps impact diagnostics to freshness results.
- `src/evidence/validate.ts`: validates evidence paths/globs, existence, TypeScript symbol presence, line spans, and hashes.

Truthmark's validation is better aligned with its mission. It should not adopt OpenSpec's SHALL/MUST delta parser.

### Judgement

OpenSpec's transferable advantage is not the exact validator; it is the quality of validation feedback and lifecycle integration.

Recommended Truthmark direction:

Add a truth health scorecard above raw diagnostics:

- routing coverage
- ownership clarity
- evidence support
- freshness against branch diff
- generated surface freshness
- truth-doc structure
- decision/rationale preservation

Keep the underlying validation Truthmark-specific.

---

## 8. Explore/read-only workflow design

### OpenSpec behavior

OpenSpec's `explore` stance is productively low-ceremony:

- read/search/investigate allowed
- no implementation
- no fixed artifact generation
- diagrams/tables/tradeoffs encouraged
- capture only if user explicitly asks

Evidence:

- `src/core/templates/workflows/explore.ts` and workflow docs around action-oriented commands.

### Truthmark behavior

Truthmark has `truthmark-preview`, which is explicit and read-only, but is narrower: it previews routing/workflow target/writes rather than offering a broader truth-discovery stance.

Evidence:

- `src/agents/workflow-manifest.ts`: `truthmark-preview` is read-only, explicit, not a substitute for check/gate.

### Judgement

OpenSpec does better in UX here. Truthmark should expand preview into a broader read-only “truth exploration” stance.

Possible questions it should answer:

- Which truth docs own this behavior?
- Is route ownership ambiguous?
- What evidence supports or contradicts this claim?
- Which source files should be inspected before editing?
- What truth update would likely be required after this code change?
- Which files must not be touched?

This supports Truthmark's mission and does not require proposals/specs/tasks.

---

## 9. Workspace and multi-repo behavior

### OpenSpec behavior

OpenSpec has a planning-home abstraction:

- repo-local planning home
- workspace planning home
- linked repos/context
- workspace mode constraints that prevent implementation edits unless allowed roots are selected

Evidence:

- `src/core/planning-home.ts`: `PlanningHome` type with `kind: 'repo' | 'workspace'`.
- `src/core/workspace/foundation.ts`: workspace state with name/context/links/tools/workspace skills.
- `src/core/change-status-policy.ts`: workspace-planning mode yields empty allowed edit roots and explicit constraints.

### Truthmark behavior

Truthmark is intentionally branch-scoped and repo-scoped. Its path/git containment is strong:

- Git repository discovery in `src/git/repository.ts`.
- Worktree containment and symlink-aware path checks.
- Repo-relative write guards in `src/fs/paths.ts`.
- Config workspace cannot overlap forbidden repository paths.

### Judgement

Truthmark should not implement OpenSpec workspaces. But it can borrow read-only external context guardrails.

Recommended future direction:

- Allow truth docs to cite external evidence as read-only context, if configured.
- Mark external evidence explicitly in status/check output.
- Refuse writes outside the current repository unless a future explicit multi-repo mode is deliberately designed.

This keeps Truthmark's branch-scoped mission intact.

---

## OpenSpec advantages worth learning from

## Advantage 1: Agent-readable status and instructions

OpenSpec's biggest advantage is that agents do not have to infer the current workflow from prose. They can ask the CLI.

Transfer to Truthmark:

- Add `workflow status --json` and `workflow instructions --json`.
- Make these compose existing check/impact/context/manifest results.
- Include next actions, gates, blockers, affected routes, and write constraints.

Do not copy:

- proposal/spec/design/task artifacts
- artifact completion by file existence
- spec archive lifecycle

## Advantage 2: Explicit action context

OpenSpec's `actionContext` is a clean design pattern.

Transfer to Truthmark:

- Return action constraints for each workflow.
- Include mode, allowed writes, forbidden writes, required evidence, and stop conditions.
- Make read-only workflows machine-readably read-only.

Do not copy:

- workspace apply/archive semantics
- allowed edit roots for implementation planning as a product concept

## Advantage 3: Generated tool-native surfaces via adapters

OpenSpec's adapter registry is a better internal architecture for multi-host generation.

Transfer to Truthmark:

- Refactor generated surface rendering into platform adapters.
- Keep workflow content separate from formatting.
- Add capability flags per platform.

Do not copy:

- expanding to every agent host before workflow quality is mature
- OpenSpec command names or behavior

## Advantage 4: Workflow playbooks are operational, not just descriptive

OpenSpec workflow templates tell the agent exactly what to call, read, write, verify, and report.

Transfer to Truthmark:

- Generate clearer per-workflow playbooks from `workflow-manifest.ts`.
- Each playbook should include first CLI calls, required evidence, allowed writes, stop conditions, and final report shape.

Do not copy:

- phase-gated spec lifecycle
- artifact dependency DAGs

## Advantage 5: Human/agent CLI split

OpenSpec is clearer about which commands are for humans and which are for agents.

Transfer to Truthmark:

- Document an Agent-Compatible CLI Contract.
- Stabilize JSON fields for agent use.
- Mark setup/human-only commands separately.

Do not copy:

- making the CLI the only runtime for workflows

## Advantage 6: Explore mode UX

OpenSpec's read-only explore stance is a strong low-ceremony workflow.

Transfer to Truthmark:

- Expand `truthmark-preview` into a broader read-only truth exploration workflow.
- Focus on ownership, route ambiguity, evidence, likely truth impact, and write boundaries.

Do not copy:

- using explore to create OpenSpec artifacts

## Advantage 7: Structured verification reports

OpenSpec's verification shape is easier to read because it groups issues by outcome and priority.

Transfer to Truthmark:

- Add a truth health scorecard grouping diagnostics into governance outcomes.

Do not copy:

- validating implementation against specs as Truthmark's mission

## Advantage 8: Schema resolution provenance

OpenSpec surfaces schema sources: project/user/package.

Transfer to Truthmark:

- For config/rules/policies, expose provenance: default, config, route file, generated surface, ignored path.
- In diagnostics, say where a rule came from.

Do not copy:

- arbitrary workflow schema overrides

---

## What Truthmark already does better or should preserve

## 1. Repository-truth ownership model

Truthmark has a stronger model for mapping code surfaces to canonical truth docs and update triggers.

Preserve:

- route files
- truth document kinds
- code surface mapping
- update truth triggers
- unmapped surface diagnostics
- route precision/topology pressure metrics

Do not replace these with OpenSpec affected areas.

## 2. Separation from project docs

The current v2 design keeps Truthmark-owned material under a dedicated workspace (`docs/truthmark`) while allowing route files to reference project-owned docs/evidence.

Preserve:

- Truthmark-owned routes/truth/templates/generated workspace
- project docs remain project-owned
- no broad ownership of arbitrary documentation

## 3. Write boundaries by workflow

Truthmark's workflow boundaries are product-critical:

- Sync/Document write truth docs/routes.
- Realize writes code, not truth docs.
- Preview/Check are read-only.
- Portal writes configured portal output only.

Preserve and make machine-readable.

## 4. Local-first, Git-reviewable operation

Truthmark's advantage is Git-native reviewability and no hosted state.

Preserve:

- generated surfaces committed to repo
- branch-scoped checks
- local CLI validation
- no database/server dependency

## 5. Evidence validation

Truthmark's evidence checks are mission-specific and valuable:

- paths/globs inside repo
- existence
- line spans
- TS symbol presence
- hashes

OpenSpec validates spec syntax; Truthmark validates evidence and truth alignment. Keep that distinction.

---

## Specific recommendations

## Priority 1: Add `truthmark workflow status/instructions --json`

### Problem

Truthmark has `check`, `impact`, `context`, and workflow manifest data, but agents do not get one unified workflow-state response.

### Proposed shape

```bash
truthmark workflow status --workflow truth-sync --base main --json
truthmark workflow instructions --workflow truth-sync --base main --json
```

Minimum JSON fields:

```json
{
  "schemaVersion": "truthmark-workflow/v0",
  "workflow": "truthmark-sync",
  "applicability": {
    "state": "applicable | not_applicable | blocked | ambiguous",
    "reasons": []
  },
  "branchScope": {},
  "changedFiles": [],
  "affectedRoutes": [],
  "targetTruthDocs": [],
  "actionContext": {
    "mode": "read-only | truth-doc-write | route-write | code-write | portal-write",
    "allowedWritePaths": [],
    "forbiddenWritePaths": [],
    "stopConditions": [],
    "requiredEvidence": []
  },
  "checks": {
    "required": [],
    "recommended": [],
    "helpers": []
  },
  "nextSteps": [],
  "reportTemplate": {}
}
```

### Why this is OpenSpec-inspired but not OpenSpec-copying

It borrows the status/instructions ergonomics, not the artifact lifecycle.

Truthmark state is route/truth/evidence/write-boundary state, not proposal/spec/task state.

---

## Priority 2: Make action constraints first-class

### Problem

Truthmark write boundaries exist, but they are split across manifest, generated prompts, context packs, and validators.

### Recommendation

Every workflow response should include an `actionContext` equivalent.

Fields:

- workflow mode
- allowed write paths
- forbidden write paths
- read-only assertion
- write lease requirement
- validation command for write lease
- stop conditions
- source-of-truth scope
- generated surfaces that must not be edited manually

### Benefit

Agents become less likely to improvise, accidentally edit generated surfaces, or mix workflows.

---

## Priority 3: Generate clearer workflow playbooks from the manifest

### Problem

`src/agents/workflow-manifest.ts` is rich, but the generated workflow experience can be more operational.

### Recommendation

For each workflow, generate a playbook with:

- when to use
- when not to use
- first CLI calls
- required evidence
- allowed writes
- stop conditions
- helper validators
- subagent delegation policy
- final report schema
- examples of correct/incorrect invocation

### Benefit

OpenSpec shows that workflow text should be executable guidance, not just a policy document.

---

## Priority 4: Add a truth health scorecard

### Problem

Truthmark diagnostics are detailed but may be harder to interpret as product health.

### Recommendation

Add a scorecard layer over `truthmark check`:

- Routing coverage
- Ownership clarity
- Evidence support
- Freshness against branch diff
- Generated surface freshness
- Truth-doc structure
- Decision/rationale preservation

Each dimension should have:

- status: pass/warn/fail/not-run
- key evidence
- top remediation
- linked raw diagnostics

### Benefit

OpenSpec's verify UX is easier for humans; Truthmark can offer equivalent governance clarity.

---

## Priority 5: Refactor generated surfaces into adapters

### Problem

Truthmark supports many host surfaces, but rendering is centralized.

### Recommendation

Introduce a platform adapter model:

```ts
interface TruthmarkSurfaceAdapter {
  id: PlatformId;
  capabilities: SurfaceCapability[];
  renderSkillPackage(...): GeneratedFile[];
  renderCommands(...): GeneratedFile[];
  renderAgents(...): GeneratedFile[];
  renderInstructionBlock(...): GeneratedFile[];
}
```

### Benefit

- Easier platform additions.
- Better parity tests.
- Cleaner handling of platform-specific frontmatter/permissions.
- Less risk when changing generated workflows.

---

## Priority 6: Expand Preview into Truth Explore

### Problem

Truthmark Preview is useful but narrower than OpenSpec Explore.

### Recommendation

Add or expand a read-only workflow focused on truth discovery:

- identify owning route/truth docs
- detect ambiguous ownership
- list source evidence to inspect
- list likely truth impacts
- warn about forbidden writes
- propose, but do not perform, a sync/document/realize path

### Benefit

Gives users and agents a safe investigation mode before picking a workflow.

---

## Priority 7: Add optional Truth Sync Plan

### Problem

Truth Sync writes canonical truth docs. Reviewers benefit from seeing intent before edits.

### Recommendation

Before or inside `truthmark-sync`, produce a plan section:

- code changes reviewed
- affected routes
- target truth docs
- stale claims
- proposed updates
- evidence file/line references
- no-update-needed rationale when applicable

This can be a report section or transient output, not a persisted change object.

### Benefit

It borrows OpenSpec's reviewable delta intent without adding OpenSpec change directories.

---

## Important non-goals

Truthmark should **not**:

- become a spec-driver library
- create `truthmark/changes/*` lifecycle objects
- require proposals/specs/design/tasks before implementation
- own implementation task execution
- merge delta specs into canonical specs
- implement OpenSpec archive/sync semantics
- implement arbitrary workflow DAG schemas
- govern arbitrary project docs
- replace project-specific documentation systems
- implement OpenSpec workspaces/context stores
- coordinate multi-repo change lifecycles
- require agents to use Truthmark for every coding action

Truthmark should continue to focus on:

- route ownership
- canonical truth docs
- evidence-backed claims
- branch-scoped freshness
- reviewable Git diffs
- generated agent surfaces
- safe write boundaries
- local-first validation
- repository-truth health

---

## Behavioral overlap map

| Overlap field | OpenSpec behavior | Truthmark behavior | Best Truthmark lesson |
|---|---|---|---|
| Local CLI | Agent state engine for spec workflow | Installer/checker/context/validator for truth workflows | Make agent-compatible workflow state explicit |
| Agent surfaces | Generated skills/commands call CLI JSON | Generated skills/prompts/agents encode workflow policy | Teach generated surfaces to consume unified JSON contract |
| Schemas/config | Workflow artifact schemas, override layers | Strict v2 governance config | Add constrained governance extension points, not arbitrary DAGs |
| Validation | Markdown spec/delta correctness | Truth routing/evidence/freshness/generated surfaces | Add scorecard and better remediation messages |
| Workspace | Repo/workspace planning homes | Repo-scoped truth workspace under project | Borrow read-only external context guardrails only |
| Status | Ready/blocked/done artifacts | Diagnostics/context/impact but distributed | Add workflow status/instructions |
| Apply/sync | Apply tasks and archive spec deltas | Sync truth docs after behavior changes | Add sync plan/report, not lifecycle artifacts |
| Explore | Read-only discovery stance | Preview routing/write targets | Expand preview into truth exploration |

---

## Implementation sketch for Truthmark vNext

### Phase 1: No new product surface, only compose existing data

Add an internal function:

```ts
buildWorkflowState(repo, workflow, options): WorkflowState
```

Inputs:

- loaded config
- workflow manifest entry
- route map
- check result
- impact result if base provided
- context pack if supported
- generated surface status

Outputs:

- applicability
- affected routes
- target truth docs
- action constraints
- checks/helpers
- next steps

Expose:

```bash
truthmark workflow status --workflow <id> [--base <ref>] --json
```

### Phase 2: Instructions and playbooks

Add:

```bash
truthmark workflow instructions --workflow <id> [--base <ref>] --json
```

Return:

- playbook section
- command sequence
- required reads
- allowed writes
- report template
- validation commands
- stop conditions

Generate host skill support docs from the same state/playbook schema.

### Phase 3: Scorecard

Layer a scorecard onto `check --json` and workflow status:

- raw diagnostics remain stable
- scorecard groups diagnostics by governance outcome
- final report becomes easier to review

### Phase 4: Adapter refactor

Move platform rendering from centralized branching toward adapters. Add parity tests comparing generated files before/after refactor.

---

## Risks and mitigations

## Risk: Truthmark accidentally becomes OpenSpec-lite

Mitigation:

- Keep workflows fixed and governance-specific.
- Do not add artifact DAGs or change folders.
- Do not require planning artifacts before code.
- Keep truth docs as reviewable evidence/decision records, not feature specs.

## Risk: Agent JSON API becomes another unstable surface

Mitigation:

- Version workflow JSON: `truthmark-workflow/v0`.
- Mark stable vs experimental fields.
- Add tests around schema snapshots.

## Risk: More commands increase cognitive load

Mitigation:

- Generated skills should call the commands automatically.
- Humans can keep using existing `check`, `impact`, `context`.
- `workflow status` can explain which lower-level commands it used.

## Risk: Scorecard oversimplifies diagnostics

Mitigation:

- Keep raw diagnostics and file evidence.
- Scorecard should summarize, not replace.

## Risk: Adapter refactor breaks generated surfaces

Mitigation:

- Snapshot all current generated outputs.
- Refactor one platform at a time.
- Require parity tests for unchanged platforms.

---

## Bottom line

OpenSpec is better at making agent workflows computable and legible. It gives agents a local state machine: status, instructions, action context, generated commands, validation, and archive/apply behavior.

Truthmark should learn that ergonomics, not OpenSpec's spec-driver lifecycle.

The strategic improvement is to make Truthmark's repository-truth governance equally explicit:

- Which truth workflow applies?
- Which routes and truth docs are affected?
- Which claims need evidence?
- What can be edited?
- What must not be edited?
- What checks or helper validators must pass?
- What should the final report say?

If Truthmark adds that agent-facing workflow contract while preserving its narrow repository-truth mission, it can gain OpenSpec's strongest workflow advantages without becoming OpenSpec.
