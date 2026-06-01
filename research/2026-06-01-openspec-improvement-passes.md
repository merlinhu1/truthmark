# Truthmark Improvement Plans From OpenSpec Research

> **For Hermes:** Use `subagent-driven-development` to implement these passes one pass at a time. Each pass should finish with focused tests, `npm run check` when feasible, and a Truthmark Sync review if functional source changes were made.

Date: 2026-06-01  
Source research: `research/2026-06-01-openspec-comparison.md`  
Scope: Truthmark implementation, generated agent surfaces, CLI contract, validation/reporting UX.  
Non-goal: do **not** turn Truthmark into OpenSpec, a spec-driver library, a proposal/task lifecycle, or an arbitrary workflow DAG engine.

## Goal

Convert the OpenSpec comparison findings into staged implementation plans that improve Truthmark's own mission: local-first, Git-native repository-truth governance for coding agents.

The highest-value theme is to make Truthmark's existing route/truth/evidence/write-boundary knowledge as computable and agent-readable as OpenSpec's `status`, `instructions`, and `actionContext`, while preserving Truthmark's narrower repository-truth mission.

## Architecture direction

Truthmark should add a thin workflow-state layer that composes existing systems instead of replacing them:

- `TRUTHMARK_WORKFLOW_MANIFEST` remains the source for workflow identity, triggers, gates, helpers, report sections, subagents, and declared write boundaries.
- `buildRepoIndex()` / route map remain the source for ownership and truth-doc mapping.
- `runCheck()` / diagnostics remain the source for repository truth health.
- `buildImpactSet()` remains the source for branch-diff effects when `--base` is provided.
- `buildContextPack()` remains the source for bounded workflow context and write paths.
- New `workflow status` and `workflow instructions` commands should compose the above into an agent-facing contract.

This is OpenSpec-inspired ergonomics, not OpenSpec behavior. Truthmark workflow state is about routes, truth docs, evidence, health, and allowed writes — not proposals, specs, design docs, tasks, archive/apply, or artifact completion by file existence.

## Implementation principles

1. **Compose first, refactor later.** Build the workflow-state API from current data sources before reorganizing generated-surface internals.
2. **Version the agent contract early.** Use a schema version such as `truthmark-workflow/v0` so generated agent surfaces can rely on it without pretending it is final.
3. **Keep JSON stable and prose generated from data.** Agent surfaces should teach hosts to call the CLI instead of embedding stale workflow logic.
4. **Make write boundaries machine-readable.** Every workflow status should say whether it is read-only and exactly what it may write.
5. **Keep OpenSpec non-goals visible in code review.** No `changes/`, proposal/spec/task DAGs, archive/apply semantics, arbitrary workflow schemas, or required pre-implementation planning artifacts.

## Pass overview

| Pass | Name | Outcome | Can ship independently? |
|---|---|---|---|
| 0 | Baseline contract and guardrails | Document and test the non-OpenSpec boundary before code changes | Yes |
| 1 | Workflow state core | New typed `WorkflowState` builder composes manifest/check/index/impact/context | Yes, internal only |
| 2 | Agent-facing CLI | `truthmark workflow status/instructions --json` expose the state contract | Yes |
| 3 | Generated playbooks consume the contract | Host surfaces call the new CLI and receive operational playbooks | Yes |
| 4 | Truth health scorecard | `check` and workflow status summarize governance outcomes above raw diagnostics | Yes |
| 5 | Truth Explore | Expand Preview into read-only truth discovery without writes | Yes |
| 6 | Truth Sync Plan | Add reviewable sync-intent output before truth-doc edits | Yes |
| 7 | Platform surface adapter refactor | Internal adapter registry for generated host surfaces | Yes, but defer until behavior is stable |

---

# Pass 0: Baseline Contract And Guardrails

## Objective

Before adding features, make the intended product boundary explicit so later implementation passes do not drift into OpenSpec-lite.

## Files

- Modify: `docs/truth/contracts.md` or the current canonical CLI/workflow contract truth doc if routing points elsewhere.
- Modify: `docs/truthmark/truth/**/*.md` only if existing routed truth docs already own CLI/workflow behavior.
- Modify: `tests/cli/help.test.ts` for absence checks if new commands are not yet implemented.
- Create: `tests/workflow-state/non-goals.test.ts` if a new test directory is acceptable, otherwise place absence tests in the closest existing CLI/workflow test file.

## Tasks

### Task 0.1: Record the closed product decision

**Objective:** Make the OpenSpec-learning boundary explicit in canonical truth.

**Steps:**

1. Find the routed truth owner for CLI/workflow contracts:
   - Inspect `docs/truthmark/routes/areas.md` and child area files when present.
   - Identify the truth doc that owns `src/cli/**`, `src/agents/workflow-manifest.ts`, and generated surfaces.
2. Add a dated decision:
   - Truthmark may add agent-readable workflow status/instructions/action-context behavior.
   - Truthmark must not add OpenSpec-style proposal/spec/design/task lifecycle artifacts.
   - Truthmark must not add arbitrary workflow DAG schemas or archive/apply semantics.
3. Keep the language product-scoped: Truthmark is a repository-truth governance layer, not an application feature.

**Verification:**

```bash
npm run check
npx tsx src/cli/main.ts check --json
npx tsx src/cli/main.ts index --json
```

Expected: no new errors. Existing unrelated review diagnostics may be reported separately.

### Task 0.2: Add absence tests for future-only OpenSpec concepts

**Objective:** Prevent accidental exposure of OpenSpec-like lifecycle surface while implementing the improvements.

**Test examples:**

- CLI help does not mention `proposal`, `spec delta`, `archive`, `apply`, `changes`, or `tasks` as Truthmark lifecycle commands.
- Default config does not include arbitrary workflow schemas or artifact DAG configuration.
- Generated workflow surfaces do not instruct agents to create `truthmark/changes/*` directories.

**Files:**

- Modify: `tests/cli/help.test.ts`
- Modify: `tests/init/init.test.ts`
- Modify: `tests/templates/generated-surfaces.test.ts`

**Verification:**

```bash
npx vitest run tests/cli/help.test.ts tests/init/init.test.ts tests/templates/generated-surfaces.test.ts
```

Expected: tests pass and protect the non-goals before feature work starts.

---

# Pass 1: Workflow State Core

## Objective

Create an internal typed workflow-state builder that composes existing Truthmark data into one agent-readable model. Do not expose new CLI commands yet unless needed for tests.

## Architecture

Add a new internal module, for example:

```ts
buildWorkflowState(cwd, options): Promise<WorkflowState>
```

The builder should be a composition layer, not a new workflow engine.

## Proposed files

- Create: `src/workflow-state/types.ts`
- Create: `src/workflow-state/build.ts`
- Create: `src/workflow-state/action-context.ts`
- Create: `tests/workflow-state/build.test.ts`
- Modify: `src/context-pack/types.ts` only if existing context pack types need to expose richer action constraints.
- Modify: `src/context-pack/build.ts` only if write-path derivation should be shared rather than duplicated.

## Proposed type shape

```ts
export type WorkflowStateSchemaVersion = "truthmark-workflow/v0";

export type WorkflowApplicabilityState =
  | "applicable"
  | "not_applicable"
  | "blocked"
  | "ambiguous";

export type WorkflowActionMode =
  | "read-only"
  | "truth-doc-write"
  | "route-write"
  | "code-write"
  | "portal-write";

export type WorkflowActionContext = {
  mode: WorkflowActionMode;
  sourceOfTruth: "repository";
  allowedWritePaths: string[];
  forbiddenWritePaths: string[];
  stopConditions: string[];
  requiredEvidence: string[];
  helperValidationCommands: string[];
  writeLeaseRequired: boolean;
};

export type WorkflowState = {
  schemaVersion: WorkflowStateSchemaVersion;
  workflow: TruthmarkWorkflowId;
  base: string | null;
  applicability: {
    state: WorkflowApplicabilityState;
    reasons: string[];
  };
  changedFiles: Array<{ path: string; status?: string }>;
  affectedRoutes: Array<{
    id?: string;
    name?: string;
    sourcePath?: string;
    codeSurface: string[];
    truthDocs: string[];
  }>;
  targetTruthDocs: string[];
  actionContext: WorkflowActionContext;
  checks: {
    required: string[];
    recommended: string[];
    helpers: string[];
  };
  diagnostics: Diagnostic[];
  nextSteps: string[];
  reportSections: string[];
};
```

## Tasks

### Task 1.1: Add workflow-state types

**Objective:** Define the contract in one place before implementation.

**Files:**

- Create: `src/workflow-state/types.ts`
- Test: `tests/workflow-state/build.test.ts`

**Test first:**

Add a compile-level or runtime shape test that imports the public types and asserts a minimal `WorkflowState` object can be constructed with `schemaVersion: "truthmark-workflow/v0"`.

**Verification:**

```bash
npx vitest run tests/workflow-state/build.test.ts
npm run typecheck
```

Expected before implementation: type/import failure. Expected after implementation: pass.

### Task 1.2: Implement `actionContext` mapping from the manifest

**Objective:** Convert each fixed Truthmark workflow into a machine-readable action policy.

**Files:**

- Create: `src/workflow-state/action-context.ts`
- Test: `tests/workflow-state/build.test.ts`

**Rules:**

- `truthmark-preview` and `truthmark-check` are `read-only` and have empty `allowedWritePaths`.
- `truthmark-sync` is `truth-doc-write` with route/truth-doc allowed writes from context/index data.
- `truthmark-document` is `truth-doc-write` or `route-write` depending on route updates required; start with `truth-doc-write` unless a later route-specific distinction is implemented.
- `truthmark-structure` is `route-write` with route files and starter truth docs only.
- `truthmark-realize` is `code-write` and must forbid truth docs/routing.
- `truthmark-portal` is `portal-write` and must only allow the configured portal output when enabled.

**Test cases:**

- Read-only workflows return no allowed writes.
- Realize forbids Truthmark route/truth paths.
- Sync includes helper validation commands from manifest helpers.
- Missing/invalid config produces blocked or empty write boundaries, not permissive defaults.

**Verification:**

```bash
npx vitest run tests/workflow-state/build.test.ts -t "action context"
```

### Task 1.3: Implement `buildWorkflowState()` composition

**Objective:** Build state from existing Truthmark systems.

**Files:**

- Create: `src/workflow-state/build.ts`
- Modify: `src/context-pack/build.ts` only if shared helpers are needed.
- Test: `tests/workflow-state/build.test.ts`

**Implementation outline:**

1. Load manifest entry from `TRUTHMARK_WORKFLOW_MANIFEST`.
2. Build repo index with `buildRepoIndex(cwd)`.
3. Load config through the same path used by context/check.
4. If `base` is provided, call `buildImpactSet(rootDir, { base })`.
5. For supported workflows, call `buildContextPack(rootDir, { workflow, base })` or a shared internal write-path helper.
6. Merge diagnostics from config/index/impact/context.
7. Derive `applicability` from manifest triggers, config presence, base presence, changed-file availability, and route ambiguity diagnostics.
8. Produce `nextSteps` from blockers and manifest gates.

**Important:** Do not invent OpenSpec-style ready/blocked artifact semantics. Applicability means “can this Truthmark workflow safely run now?” not “which artifact is next?”

**Verification:**

```bash
npx vitest run tests/workflow-state/build.test.ts
npm run typecheck
```

### Task 1.4: Add fixture coverage for missing config and ambiguous routing

**Objective:** Ensure workflow state is fail-closed.

**Files:**

- Modify: `tests/helpers/temp-repo.ts` or existing repo fixture helper.
- Modify: `tests/workflow-state/build.test.ts`

**Test cases:**

- Missing `.truthmark/config.yml` makes Sync not applicable or blocked.
- No changed files with `--base` makes Sync not applicable.
- Unmapped changed functional code produces an ambiguity/blocker reason.
- Context-pack warnings are preserved as diagnostics.

**Verification:**

```bash
npx vitest run tests/workflow-state/build.test.ts
```

---

# Pass 2: Agent-Facing CLI Contract

## Objective

Expose the workflow-state layer through stable JSON commands that agents can call before acting.

## Proposed CLI

```bash
truthmark workflow status --workflow truthmark-sync --base main --json
truthmark workflow instructions --workflow truthmark-sync --base main --json
```

Support legacy/short workflow aliases deliberately if needed:

- `truth-sync` -> `truthmark-sync`
- `truth-document` -> `truthmark-document`
- `truth-realize` -> `truthmark-realize`

If aliases are supported, add tests and document them. Do not add aliases accidentally.

## Files

- Modify: `src/cli/program.ts`
- Modify: `src/cli/handlers.ts`
- Create: `src/workflow-state/instructions.ts`
- Modify: `src/output/render.ts` only if special rendering is needed; prefer normal `CommandResult` JSON.
- Test: `tests/cli/workflow.test.ts`
- Test: `tests/integration/agent-workflow-contract.test.ts`

## Tasks

### Task 2.1: Add CLI parser for `workflow status`

**Objective:** Wire the status command to `buildWorkflowState()`.

**Expected command result:**

```ts
{
  command: "workflow status",
  summary: "Truthmark workflow status completed for truthmark-sync.",
  diagnostics,
  data: { workflowState }
}
```

**Test first:**

Add a subprocess test using `tests/helpers/run-cli.ts` or the existing CLI helper:

```bash
npx tsx src/cli/main.ts workflow status --workflow truthmark-sync --json
```

Expected before implementation: command not found. Expected after implementation: JSON command envelope with `data.workflowState.schemaVersion === "truthmark-workflow/v0"`.

**Verification:**

```bash
npx vitest run tests/cli/workflow.test.ts -t "workflow status"
```

### Task 2.2: Add CLI parser for `workflow instructions`

**Objective:** Give agents a workflow playbook and command sequence derived from the same state.

**Instruction output should include:**

- workflow id and display name
- first commands to run
- required reads
- allowed writes
- forbidden writes
- stop conditions
- helper validator commands
- report sections
- final report shape
- source state summary

**Test first:**

Assert `workflow instructions --workflow truthmark-sync --json` includes:

- `data.instructions.schemaVersion`
- `data.instructions.commandSequence`
- `data.instructions.actionContext`
- `data.instructions.reportTemplate.sections`

**Verification:**

```bash
npx vitest run tests/cli/workflow.test.ts -t "workflow instructions"
```

### Task 2.3: Document the Agent-Compatible CLI Contract

**Objective:** Make the human/agent command split explicit.

**Files:**

- Modify: `docs/truth/contracts.md` or routed CLI contract truth doc.
- Optionally modify: `README.md` only with a compact conceptual pointer, not a long command inventory.

**Content:**

- Human/setup commands: `config`, `init`.
- Agent/context commands: `check`, `index`, `impact`, `context`, `validate`, `workflow status`, `workflow instructions`.
- JSON command envelope guarantee: `command`, `summary`, `diagnostics`, `data`.
- `schemaVersion` guarantees for nested workflow state.
- Stable vs experimental fields.

**Verification:**

```bash
npm run check
npx tsx src/cli/main.ts check --json
npx tsx src/cli/main.ts index --json
```

### Task 2.4: Black-box test built CLI output

**Objective:** Prevent source-only CLI tests from passing while built/package output is broken.

**Files:**

- Modify: `tests/cli/build-artifact.test.ts` or add a workflow-specific built artifact test.

**Test:**

1. Run build before executing `dist`.
2. Execute `node dist/main.js workflow status --workflow truthmark-check --json` from a temp project or temp cwd.
3. Assert the JSON command envelope exists and does not depend on repo-root-only assets.

**Verification:**

```bash
npm run build
npx vitest run tests/cli/build-artifact.test.ts
```

---

# Pass 3: Generated Playbooks Consume The Workflow Contract

## Objective

Update generated agent surfaces so they call `truthmark workflow status/instructions --json` before acting, rather than relying only on embedded prose.

This is the direct transfer of OpenSpec's strongest behavior: generated skills/commands teach agents to ask the local CLI for current state.

## Files

- Modify: `src/templates/workflow-surfaces.ts`
- Modify: `src/templates/generated-surfaces.ts`
- Modify: `src/agents/workflow-manifest.ts` only if manifest fields need extra playbook metadata.
- Test: `tests/templates/generated-surfaces.test.ts`
- Test: `tests/init/init.test.ts`
- Test: `tests/agents/instructions.test.ts`
- Test: `tests/integration/agent-workflow-contract.test.ts`

## Required generated-surface behavior

For each workflow skill/command/prompt surface, add an operational first step:

```bash
truthmark workflow status --workflow <workflow-id> [--base <ref>] --json
truthmark workflow instructions --workflow <workflow-id> [--base <ref>] --json
```

Generated prose must say:

- stop if status says blocked or not applicable unless the user explicitly changes scope;
- obey `actionContext.allowedWritePaths` and `actionContext.forbiddenWritePaths`;
- use helper validator commands when present;
- do not edit generated surfaces manually;
- do not create OpenSpec-style change/spec/task artifacts.

## Tasks

### Task 3.1: Add renderer tests for CLI-first workflow instructions

**Objective:** Pin the new generated-surface contract before changing renderer output.

**Tests:**

- Codex/OpenCode/Claude/GitHub Copilot/Gemini generated workflow surfaces mention `truthmark workflow status`.
- They mention `truthmark workflow instructions`.
- They mention `actionContext` or equivalent write-boundary JSON.
- They do not instruct creation of proposal/spec/task/change lifecycle artifacts.

**Verification:**

```bash
npx vitest run tests/templates/generated-surfaces.test.ts tests/agents/instructions.test.ts
```

### Task 3.2: Update workflow surface rendering

**Objective:** Render the CLI-first operational playbook across all host surfaces.

**Implementation notes:**

- Prefer shared renderer functions in `src/templates/workflow-surfaces.ts` to avoid platform drift.
- Preserve platform-specific syntax/frontmatter.
- Do not list every generated file path in README-style docs.
- Do not hard-require optional repository files such as `.truthmark/config.yml` unless the generated surface is only emitted after proving the file exists.

**Verification:**

```bash
npx vitest run tests/templates/generated-surfaces.test.ts
npx vitest run tests/init/init.test.ts
```

### Task 3.3: Refresh generated surfaces and inspect diffs

**Objective:** Ensure real generated outputs match renderer tests.

**Commands:**

```bash
npx tsx src/cli/main.ts init --json
npm run check
npx tsx src/cli/main.ts check --json
npx tsx src/cli/main.ts index --json
```

**Manual inspection:**

- Generated bodies include CLI-first workflow status/instructions calls.
- Managed blocks are preserved.
- Generated outputs do not claim helper success unless the agent is instructed to run a validator and check `data.validation.ok: true`.
- No generated output implies Truthmark is an application feature rather than workflow/tooling scaffolding.

---

# Pass 4: Truth Health Scorecard

## Objective

Add a scorecard layer above raw diagnostics so humans and agents can understand repository-truth health quickly.

OpenSpec's transferable lesson here is verification UX, not spec validation semantics.

## Proposed dimensions

- Routing coverage
- Ownership clarity
- Evidence support
- Freshness against branch diff
- Generated surface freshness
- Truth-doc structure
- Decision/rationale preservation

## Files

- Create: `src/checks/scorecard.ts`
- Modify: `src/checks/check.ts`
- Modify: `src/workflow-state/build.ts` to include scorecard in workflow state once available.
- Test: `tests/checks/scorecard.test.ts`
- Modify: `tests/checks/check.test.ts`
- Modify: `docs/truth/contracts.md` or routed validation truth doc.

## Proposed type shape

```ts
export type TruthHealthScorecard = {
  schemaVersion: "truthmark-scorecard/v0";
  dimensions: Array<{
    id: string;
    label: string;
    status: "pass" | "warn" | "fail" | "not-run";
    keyEvidence: string[];
    topRemediation: string | null;
    diagnosticIndexes: number[];
  }>;
};
```

## Tasks

### Task 4.1: Add scorecard mapper tests

**Objective:** Map existing diagnostics to stable governance dimensions.

**Tests:**

- Area/routing diagnostics affect Routing coverage and Ownership clarity.
- Evidence diagnostics affect Evidence support.
- Freshness diagnostics affect Freshness against branch diff.
- Generated surface diagnostics affect Generated surface freshness.
- Frontmatter/decision diagnostics affect Truth-doc structure and Decision/rationale preservation.

**Verification:**

```bash
npx vitest run tests/checks/scorecard.test.ts
```

### Task 4.2: Include scorecard in `check --json`

**Objective:** Add scorecard without removing or reshaping raw diagnostics.

**Expected JSON:**

```json
{
  "data": {
    "scorecard": {
      "schemaVersion": "truthmark-scorecard/v0",
      "dimensions": []
    }
  }
}
```

**Verification:**

```bash
npx vitest run tests/checks/check.test.ts tests/cli/check-workflow.test.ts
npx tsx src/cli/main.ts check --json
```

### Task 4.3: Include scorecard summary in workflow state

**Objective:** Let agents see health summary in `workflow status` without parsing all diagnostics.

**Files:**

- Modify: `src/workflow-state/types.ts`
- Modify: `src/workflow-state/build.ts`
- Modify: `tests/workflow-state/build.test.ts`

**Verification:**

```bash
npx vitest run tests/workflow-state/build.test.ts tests/checks/scorecard.test.ts
```

---

# Pass 5: Truth Explore

## Objective

Expand the existing read-only Preview concept into a broader truth-discovery workflow. This should help agents answer “what owns this behavior and what would be impacted?” before selecting Sync, Document, Structure, or Realize.

This should remain read-only. It must not create planning artifacts or write docs.

## Product decision

Use one of these names, and close the decision before implementation:

- Option A: Keep the existing `truthmark-preview` workflow id and expand its instructions/output.
- Option B: Add a new alias or user-facing name “Truth Explore” while keeping `truthmark-preview` as the manifest id for compatibility.

Recommended: **Option B as wording only, Option A in code first**. Expand `truthmark-preview` behavior and call it a read-only Truth Explore stance in generated instructions. Avoid adding another workflow id until tests prove the current id cannot serve the UX.

## Files

- Modify: `src/agents/workflow-manifest.ts`
- Modify: `src/workflow-state/build.ts`
- Modify: `src/templates/workflow-surfaces.ts`
- Modify: `tests/agents/truth-preview.test.ts`
- Modify: `tests/workflow-state/build.test.ts`
- Modify: `tests/templates/generated-surfaces.test.ts`

## Truth Explore should answer

- Which route/truth docs own this behavior?
- Is ownership ambiguous or missing?
- What source evidence should be inspected?
- What truth update would likely be needed after a code change?
- What files must not be touched?
- Which workflow should be selected next?

## Tasks

### Task 5.1: Add read-only explore output to workflow state

**Objective:** Make `truthmark-preview` status useful for discovery.

**Add fields if needed:**

```ts
exploration?: {
  owningRoutes: string[];
  owningTruthDocs: string[];
  evidenceToInspect: string[];
  likelyTruthImpacts: string[];
  ambiguityWarnings: string[];
  recommendedWorkflows: string[];
};
```

**Verification:**

```bash
npx vitest run tests/workflow-state/build.test.ts -t "preview"
```

### Task 5.2: Update generated Preview/Explore instructions

**Objective:** Make generated surfaces frame Preview as safe investigation.

**Renderer requirements:**

- Must say read-only.
- Must call `truthmark workflow status --workflow truthmark-preview --json`.
- Must not tell agents to edit docs/routes/code.
- Must report recommended next workflow instead of performing it.

**Verification:**

```bash
npx vitest run tests/agents/truth-preview.test.ts tests/templates/generated-surfaces.test.ts
```

### Task 5.3: Add CLI examples and docs

**Objective:** Teach users how to run the read-only pass.

**Docs:**

- Routed truth docs only; README gets at most a compact pointer.
- Explain that Preview/Explore can recommend Sync/Structure/Document/Realize but does not perform them.

**Verification:**

```bash
npm run check
npx tsx src/cli/main.ts check --json
npx tsx src/cli/main.ts index --json
```

---

# Pass 6: Truth Sync Plan

## Objective

Before truth-doc writes, produce a reviewable sync-intent plan: changed code reviewed, affected routes, target truth docs, stale claims, proposed updates, evidence references, and no-update-needed rationale.

This borrows OpenSpec's reviewable intent without adding persistent change objects.

## Non-goal

Do not create `truthmark/changes/*`, proposal files, task files, or lifecycle objects. The sync plan is transient command output or a section inside the final Sync report.

## Files

- Create: `src/sync/plan.ts`
- Modify: `src/workflow-state/instructions.ts`
- Modify: `src/templates/workflow-surfaces.ts`
- Modify: `src/agents/workflow-helper-validation.ts` if report validation should require/recognize the plan section.
- Modify: `tests/sync/report.test.ts`
- Create: `tests/sync/plan.test.ts`
- Modify: `tests/agents/truth-sync.test.ts`

## Proposed output shape

```ts
export type TruthSyncPlan = {
  schemaVersion: "truthmark-sync-plan/v0";
  changedCodeReviewed: string[];
  affectedRoutes: string[];
  targetTruthDocs: string[];
  staleClaims: Array<{
    claim: string;
    truthDoc: string;
    evidence: string[];
    proposedAction: "support" | "narrow" | "remove" | "block";
  }>;
  proposedUpdates: string[];
  noUpdateNeededRationale: string[];
};
```

## Tasks

### Task 6.1: Add sync plan builder from workflow state

**Objective:** Reuse impact/routes/context to produce a structured plan skeleton.

**Test cases:**

- With changed code and affected truth docs, plan lists target truth docs.
- With no affected docs, plan records no-update-needed or route ambiguity.
- With route ambiguity, plan blocks instead of guessing.

**Verification:**

```bash
npx vitest run tests/sync/plan.test.ts
```

### Task 6.2: Add sync plan section to workflow instructions

**Objective:** Agents should produce or review the plan before editing truth docs.

**Instruction behavior:**

- Run workflow status/instructions first.
- Summarize sync plan.
- Only then edit canonical truth docs/routes within allowed writes.
- Validate final report with `truthmark validate sync-report <report-file> --json`.

**Verification:**

```bash
npx vitest run tests/agents/truth-sync.test.ts tests/templates/generated-surfaces.test.ts
```

### Task 6.3: Update report validator carefully

**Objective:** If the report template gains a new Sync Plan section, validator behavior should be explicit.

**Decision needed:**

- Required section immediately, or optional during migration?

Recommended: optional in first pass, with generated templates encouraging it. Make it required only after generated surfaces and docs are refreshed.

**Verification:**

```bash
npx vitest run tests/sync/report.test.ts tests/cli/validate.test.ts
```

---

# Pass 7: Platform Surface Adapter Refactor

## Objective

Refactor generated surface rendering toward an adapter registry after the behavior contract is stable.

This is an internal maintainability pass inspired by OpenSpec's adapter design. It should not broaden Truthmark's supported-host mission or force identical generated files across hosts.

## Current concern

Truthmark supports many valuable host-native surfaces, but rendering is centralized and constant-heavy. This makes platform-specific frontmatter, command syntax, skills, agents, helper manifests, and diagnostic categorization harder to evolve safely.

## Proposed adapter interface

```ts
export type SurfaceCapability =
  | "instruction-block"
  | "skill-package"
  | "command"
  | "agent"
  | "prompt"
  | "helper-manifest";

export interface TruthmarkSurfaceAdapter {
  id: PlatformId;
  capabilities: SurfaceCapability[];
  outputRoots: string[];
  renderInstructionBlock(input: RenderInput): GeneratedFile[];
  renderSkillPackage(input: RenderInput): GeneratedFile[];
  renderCommands(input: RenderInput): GeneratedFile[];
  renderAgents(input: RenderInput): GeneratedFile[];
}
```

## Files

- Create: `src/templates/platform-adapters/types.ts`
- Create: `src/templates/platform-adapters/registry.ts`
- Create: `src/templates/platform-adapters/codex.ts`
- Create: `src/templates/platform-adapters/opencode.ts`
- Create: `src/templates/platform-adapters/claude.ts`
- Create: `src/templates/platform-adapters/copilot.ts`
- Create: `src/templates/platform-adapters/gemini.ts`
- Modify: `src/templates/generated-surfaces.ts`
- Modify: `src/init/init.ts` only after adapter outputs are parity-tested.
- Test: `tests/templates/generated-surfaces.test.ts`
- Test: `tests/init/init.test.ts`

## Tasks

### Task 7.1: Add adapter types and registry with one no-op wrapper

**Objective:** Introduce the structure without changing generated output.

**Start with:** Codex or Claude, whichever has the simplest complete surface set.

**Verification:**

```bash
npx vitest run tests/templates/generated-surfaces.test.ts -t "codex"
npm run typecheck
```

Expected: output parity for the migrated platform.

### Task 7.2: Add snapshot/parity tests before moving more platforms

**Objective:** Protect generated-body integrity, not just metadata presence.

**Tests must assert:**

- rendered body contains workflow status/instructions calls;
- body hashes/freshness metadata remain deterministic if used;
- platform-specific frontmatter remains valid;
- missing legacy metadata degrades as regeneration-needed, not corruption;
- no silent fallback to stale embedded prompts.

**Verification:**

```bash
npx vitest run tests/templates/generated-surfaces.test.ts tests/init/init.test.ts
```

### Task 7.3: Migrate remaining platforms one at a time

**Objective:** Keep review diffs small and reversible.

**Order recommendation:**

1. Codex
2. OpenCode
3. Claude Code
4. GitHub Copilot
5. Gemini CLI

**For each platform:**

- Move rendering into adapter.
- Run focused platform tests.
- Run all generated-surface tests.
- Inspect generated outputs from `truthmark init --json`.

**Verification after each platform:**

```bash
npx vitest run tests/templates/generated-surfaces.test.ts tests/init/init.test.ts
npx tsx src/cli/main.ts init --json
npm run check
```

### Task 7.4: Remove old central branching only after parity is proven

**Objective:** Avoid deleting old render paths while still needed.

**Checks:**

- No platform-specific rendering remains in the central file except registry dispatch.
- `truthmark-realize` diagnostic categorization still maps to `realization`, not broad `truth-sync` or generic config categories.
- All generated host-native directories still emit when configured.

**Verification:**

```bash
npm run check
npx tsx src/cli/main.ts check --json
npx tsx src/cli/main.ts index --json
```

---

# Cross-pass acceptance criteria

A pass is ready to merge only when:

- It preserves Truthmark's fixed repository-truth workflow model.
- It does not add OpenSpec proposal/spec/design/task lifecycle objects.
- JSON output uses the standard command envelope: `command`, `summary`, `diagnostics`, `data`.
- New nested JSON contracts have `schemaVersion` fields.
- Read-only workflows are machine-readably read-only.
- Write workflows include allowed writes, forbidden writes, stop conditions, and helper validator commands where applicable.
- Generated surfaces instruct agents to call the CLI and obey the returned state.
- Generated surfaces do not hard-require optional repo-specific files unless proven/configured.
- Tests cover source-tree and built CLI behavior where CLI surface changes.
- Truthmark check/index are run after docs or generated-surface changes.

# Recommended implementation order

1. **Pass 0** first, because it prevents mission drift.
2. **Pass 1** next, because all later behavior needs the internal state model.
3. **Pass 2** next, because generated surfaces need a real CLI contract to call.
4. **Pass 3** next, because it lets agents benefit from the new contract.
5. **Pass 4** next, because scorecard quality improves both human review and workflow status.
6. **Pass 5** and **Pass 6** can be done independently after Pass 2.
7. **Pass 7** last, because adapter refactoring is safer after generated behavior is stable.

# Defer explicitly

Do not implement these unless a later product decision says otherwise:

- arbitrary workflow schema files;
- artifact dependency DAGs;
- `truthmark/changes/*`;
- proposal/spec/design/task generation;
- archive/apply semantics;
- multi-repo planning homes;
- Truthmark-owned implementation task execution;
- required pre-code planning artifacts.

# Final verification bundle

For each completed pass, run the narrow focused tests first. For a full pass completion, run:

```bash
npm run check
npx tsx src/cli/main.ts check --json
npx tsx src/cli/main.ts index --json
git diff --check
```

For CLI contract passes, also run:

```bash
npm run build
node dist/main.js workflow status --workflow truthmark-check --json
node dist/main.js workflow instructions --workflow truthmark-check --json
```

For generated-surface passes, also run:

```bash
npx tsx src/cli/main.ts init --json
npx vitest run tests/templates/generated-surfaces.test.ts tests/init/init.test.ts tests/integration/agent-workflow-contract.test.ts
```

# Bottom line

The improvement path is not “copy OpenSpec.” The improvement path is:

1. Make Truthmark's existing governance state computable.
2. Expose it through stable JSON commands for agents.
3. Teach generated host-native surfaces to consume that contract.
4. Improve human review with scorecards and sync plans.
5. Refactor platform rendering only after behavior is stable.

This gives Truthmark OpenSpec's best workflow ergonomics while keeping Truthmark focused on repository truth, route ownership, evidence-backed claims, branch-scoped freshness, safe write boundaries, and Git-reviewable local operation.
