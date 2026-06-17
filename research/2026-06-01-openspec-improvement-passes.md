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
- WorkflowState and ImpactSet expose compact path/metadata handoffs without embedding source-file or truth-doc body contents.
- `workflow status` composes the above into an optional agent-facing status/debug contract; `workflow instructions` is intentionally absent in the current product boundary.

This is OpenSpec-inspired ergonomics, not OpenSpec behavior. Truthmark workflow state is about routes, truth docs, evidence, health, and allowed writes — not proposals, specs, design docs, tasks, archive/apply, or artifact completion by file existence.

## Implementation principles

1. **Compose first, refactor later.** Build the workflow-state API from current data sources before reorganizing generated-surface internals.
2. **Version the agent contract early.** Use a schema version such as `truthmark-workflow/v0` so generated agent surfaces can rely on it without pretending it is final.
3. **Keep JSON stable and prose generated from repository files.** Agent surfaces should remain host-native and should not require live CLI preflight to avoid embedding stale workflow logic.
4. **Make write boundaries machine-readable.** Every workflow status should say whether it is read-only and exactly what it may write.
5. **Keep OpenSpec non-goals visible in code review.** No `changes/`, proposal/spec/task DAGs, archive/apply semantics, arbitrary workflow schemas, or required pre-implementation planning artifacts.

## Pass overview

| Pass | Name | Outcome | Can ship independently? |
|---|---|---|---|
| 0 | Baseline contract and guardrails | Document and test the non-OpenSpec boundary before code changes | Yes |
| 1 | Workflow state core | New typed `WorkflowState` builder composes manifest/check/index/impact/context | Yes, internal only |
| 2 | Agent-facing CLI | `truthmark workflow status --json` exposes compact workflow state; `workflow instructions` is intentionally not shipped | Yes, status-only |
| 3 | Generated playbooks consume the contract | Superseded: generated host surfaces stay host-native with direct-checkout fallback instead of live CLI preflight | No — superseded |
| 4 | Compact truth health scorecard | `check --json` gets a tiny diagnostic triage index; workflow-state exposure is deferred | Yes |
| 5 | Preview/Explore wording hardening | Implemented as read-only `truthmark-preview` wording/report hardening without new JSON or live preflight | Yes |
| 6 | Lightweight Sync intent checklist | Add a pre-write intent section to Sync instructions/reports; no typed plan engine yet | Yes |
| 7 | Platform surface adapter refactor | Deferred internal maintainability refactor after behavior stabilizes | No — explicitly deferred |

---

# Pass 0: Baseline Contract And Guardrails

## Objective

Before adding features, make the intended product boundary explicit so later implementation passes do not drift into OpenSpec-lite.

## Files

- Modify: the current routed engineering CLI/workflow contract truth doc if routing points there (for 2.2.x lanes, normally under `docs/truthmark/engineering/**`).
- Modify: legacy `docs/truthmark/truth/**/*.md` only if the inspected checkout still uses that path as active routed truth.
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
   - Truthmark may add agent-readable workflow status/action-context behavior when it remains optional and compact.
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

Expose the workflow-state layer through a stable compact JSON status command that agents and humans may use for debugging or bounded repository-intelligence handoff.

## Current status

Implemented as **status-only**. `truthmark workflow status --workflow <workflow> [--base <ref>] --json` is the supported command. `truthmark workflow instructions` was intentionally removed/superseded because committed host-native surfaces and direct checkout inspection are the runtime contract; generated workflows must not depend on a live CLI playbook command.

## Supported CLI

```bash
truthmark workflow status --workflow truthmark-sync --base main --json
```

Support legacy/short workflow aliases deliberately if needed:

- `truth-sync` -> `truthmark-sync`
- `truth-document` -> `truthmark-document`
- `truth-realize` -> `truthmark-realize`

If aliases are supported, add tests and document them. Do not add aliases accidentally.

## Files

- Modify: `src/cli/program.ts`
- Modify: `src/cli/handlers.ts`
- Do not create `src/workflow-state/instructions.ts` unless a later product decision reintroduces a workflow-instructions command.
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

### Task 2.2: Keep `workflow instructions` absent

**Objective:** Prevent stale CLI-first playbook behavior from returning through regressions.

**Current contract:**

- `truthmark workflow --help` lists `status` but not `instructions`.
- `truthmark workflow instructions --workflow truthmark-sync --json` exits non-zero as an unknown command.
- Generated public workflow surfaces must not mention `truthmark workflow instructions`.

**Verification:**

```bash
npx vitest run tests/cli/check-workflow.test.ts tests/templates/generated-surfaces.test.ts
```

### Task 2.3: Document the Agent-Compatible CLI Contract

**Objective:** Make the human/agent command split explicit.

**Files:**

- Modify: the routed CLI contract truth doc.
- Optionally modify: `README.md` only with a compact conceptual pointer, not a long command inventory.

**Content:**

- Human/setup commands: `config`, `init`.
- Agent/context commands: `check`, `index`, `impact`, `validate`, and optional `workflow status`. The standalone `context` command and `workflow instructions` command are intentionally absent in the current contract.
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

## Current status

**Superseded by the product boundary.** Truthmark now keeps committed host-native workflow files as the runtime contract. Generated skill packages contain compact procedures and support-file pointers; GitHub Copilot prompts and Gemini commands are thin adapters. Agents inspect the checkout directly and may use `workflow status` or `impact` only as optional compact helpers.

Do not revive the original CLI-first/live-preflight design unless a later product decision explicitly changes the boundary. Mandatory or generic live preflight would move the CLI toward the product center of gravity and would weaken the no-blockade repository-file fallback.

## Files

- Modify: `src/templates/workflow-surfaces.ts`
- Modify: `src/templates/generated-surfaces.ts`
- Modify: `src/agents/workflow-manifest.ts` only if manifest fields need extra playbook metadata.
- Test: `tests/templates/generated-surfaces.test.ts`
- Test: `tests/init/init.test.ts`
- Test: `tests/agents/instructions.test.ts`
- Test: `tests/integration/agent-workflow-contract.test.ts`

## Required generated-surface behavior

Generated prose must say:

- committed host-native workflow files and support files are the normal runtime contract;
- direct checkout inspection is the canonical fallback when optional helper commands are unavailable;
- obey the workflow's documented write boundary and helper validator policy;
- do not edit generated surfaces manually;
- do not create OpenSpec-style change/spec/task artifacts, proposal files, archive/apply lifecycle objects, or arbitrary workflow DAGs;
- do not mention `truthmark workflow instructions` or generic live-preflight boilerplate.

## Tasks

### Task 3.1: Add renderer tests against CLI-first workflow instructions

**Objective:** Pin the new generated-surface contract before changing renderer output.

**Tests:**

- Codex/OpenCode/Claude/GitHub Copilot/Gemini generated public workflow surfaces do not mention `truthmark workflow instructions`.
- They do not require `truthmark workflow status` as live preflight.
- They keep direct-checkout fallback and compact host-surface adapter wording.
- They do not instruct creation of proposal/spec/task/change lifecycle artifacts.

**Verification:**

```bash
npx vitest run tests/templates/generated-surfaces.test.ts tests/agents/instructions.test.ts
```

### Task 3.2: Preserve host-native workflow surface rendering

**Objective:** Keep generated surfaces compact, host-native, and non-CLI-dependent.

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

- Generated bodies do not include CLI-first workflow status/instructions calls.
- Managed blocks are preserved.
- Generated outputs do not claim helper success unless the agent is instructed to run a validator and check `data.validation.ok: true`.
- No generated output implies Truthmark is an application feature rather than workflow/tooling scaffolding.

---

# Pass 4: Compact Truth Health Scorecard

## Objective

Add a **small** scorecard layer to `check --json` so humans and agents can triage repository-truth health quickly without reading every raw diagnostic first.

This is intentionally narrower than the original Pass 4 idea. The scorecard is not a second checker, not a grade, not a workflow-state payload, and not a new command. It is a compact index over the existing diagnostics returned by `check --json`.

## Product decision

Implement Pass 4 as **check-only**:

- Add `data.scorecard` to `truthmark check --json`.
- Do **not** add `data.workflowState.scorecard` in this pass.
- Do **not** update generated playbooks in this pass.
- Keep raw diagnostics authoritative.
- Keep JSON compact enough that routine checks do not become expensive to read or paste.

Reason: routine `check --json` output should stay compact and triage-oriented. Workflow-state scorecard exposure should wait until there is evidence agents need it inside optional workflow status; do not reintroduce a workflow-instructions payload for scorecard delivery.

## Proposed dimensions

Use stable IDs only in runtime JSON; labels/remediation can live in docs/constants.

- `routing-coverage`
- `ownership-clarity`
- `evidence-support`
- `branch-freshness`
- `generated-surface-freshness`
- `truth-doc-structure`
- `decision-rationale-preservation`

## Compact type shape

```ts
export type TruthHealthScorecard = {
  schemaVersion: "truthmark-scorecard/v0";
  dimensions: Array<{
    id: TruthHealthDimensionId;
    status: "pass" | "warn" | "fail" | "not-run";
    diagnosticIndexes: number[];
    evidence?: string[]; // optional, capped, non-pass only
  }>;
};
```

Rules:

- `diagnosticIndexes` point into the raw diagnostics returned with the same command result.
- `evidence` is optional and should be capped to 1-2 short snippets for non-pass dimensions.
- Do not emit full diagnostic text, source excerpts, labels, or remediation paragraphs in every dimension.
- `branch-freshness` is `not-run` when no `--base` was supplied.

## Files

- Create: `src/checks/scorecard.ts`
- Modify: `src/checks/check.ts`
- Test: `tests/checks/scorecard.test.ts`
- Modify: `tests/checks/check.test.ts`
- Modify: the routed check/validation truth doc after route confirmation (for 2.2.x lanes, normally under `docs/truthmark/engineering/**`).

Do **not** modify `src/workflow-state/**`, `src/templates/**`, generated platform surfaces, or report validators for this pass.

## Tasks

### Task 4.1: Add compact scorecard mapper tests

**Objective:** Prove the scorecard is a compact triage index over existing diagnostics.

**Tests:**

- Shape includes `schemaVersion: "truthmark-scorecard/v0"` and the seven dimension IDs.
- Runtime dimensions include `id`, `status`, `diagnosticIndexes`, and optional capped `evidence` only.
- Error diagnostics map to `fail`; non-error mapped diagnostics map to `warn`.
- No mapped diagnostics after a relevant check ran maps to `pass`.
- Missing base maps branch freshness to `not-run`.
- `diagnosticIndexes` remain stable when one diagnostic maps to multiple dimensions.

**Verification:**

```bash
npx vitest run tests/checks/scorecard.test.ts
```

### Task 4.2: Implement the pure scorecard mapper

**Objective:** Add the minimum implementation needed for the tests.

**Implementation constraints:**

- Use diagnostic category first.
- Use message/data predicates only when a category is too coarse.
- No filesystem writes, Git commands, OpenSpec runtime artifacts, external calls, or LLM judgment.
- Keep optional evidence short and capped.

**Verification:**

```bash
npx vitest run tests/checks/scorecard.test.ts
npm run typecheck
```

### Task 4.3: Include compact scorecard in `check --json`

**Objective:** Add `data.scorecard` without changing the existing diagnostic contract.

**Expected JSON excerpt:**

```json
{
  "data": {
    "scorecard": {
      "schemaVersion": "truthmark-scorecard/v0",
      "dimensions": [
        { "id": "branch-freshness", "status": "not-run", "diagnosticIndexes": [] }
      ]
    }
  }
}
```

**Must preserve:**

- top-level `diagnostics`
- `data.branchScope`
- optional `data.impactSet`
- `data.truthVisibility`

**Verification:**

```bash
npx vitest run tests/checks/check.test.ts tests/checks/scorecard.test.ts
npx tsx src/cli/main.ts check --json
```

### Task 4.4: Update routed check-output truth docs only

**Objective:** Document the new check JSON contract without implying workflow-state support.

**Docs:**

- Confirm routing through `.truthmark/config.yml` and `docs/truthmark/routes/areas.md`.
- Update the routed validation/check contract doc.
- Say raw diagnostics remain authoritative.
- Say workflow-state scorecard exposure is deferred if needed to prevent ambiguity.

**Verification:**

```bash
npx tsx src/cli/main.ts check --json
npx tsx src/cli/main.ts index --json
```

---

# Pass 5: Preview / Truth Explore Wording Hardening

## Objective

Make the existing `truthmark-preview` workflow read as a safe “Truth Explore” stance for agents: inspect ownership, likely evidence, ambiguity, and recommended next workflow **without writing anything**.

This pass should be mostly generated-instruction and workflow-copy refinement. Do not add a new workflow ID and do not add a broad `exploration` JSON object yet.

## Product decision

Keep the manifest id as `truthmark-preview`. Use “Truth Explore” only as user-facing wording inside Preview instructions if helpful.

Do **not** add this proposed object in the first pass:

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

Reason: most of those fields duplicate existing workflow-state concepts or require agent judgment. Large path arrays and speculative “likely impacts” would add token cost without enough new correctness.

## Files

- Modify: `src/agents/workflow-manifest.ts` only if Preview manifest wording/report sections need tightening.
- Do not modify `src/workflow-state/instructions.ts`; Preview/Explore wording belongs in host-native workflow surfaces and reports.
- Modify: `src/templates/workflow-surfaces.ts` only for wording emitted to generated surfaces.
- Modify focused Preview/generated-surface tests that already cover Preview text.

Do **not** add a new workflow id, new CLI command, or new workflow-state JSON object.

## Tasks

### Task 5.1: Tighten Preview/Explore instruction wording

**Objective:** Make Preview clearly safe and read-only.

**Instruction requirements:**

- Say Preview/Explore is read-only.
- Tell agents to call `truthmark workflow status --workflow truthmark-preview --json`.
- Tell agents to inspect only enough checkout evidence to answer ownership/ambiguity/next-workflow questions.
- Tell agents to report the recommended next workflow instead of executing Sync/Document/Structure/Realize.
- Do not tell agents to edit docs, routes, code, or generated surfaces.

**Verification:**

```bash
npx vitest run tests/agents/truth-preview.test.ts tests/templates/generated-surfaces.test.ts
```

### Task 5.2: Preserve existing workflow-state contract

**Objective:** Ensure the wording improvement does not introduce new JSON fields or broaden write permissions.

**Checks:**

- `truthmark-preview` remains the manifest id.
- Preview action context remains read-only.
- No `exploration` object is added.
- Generated surfaces do not imply automatic follow-on writes.

**Verification:**

```bash
npx vitest run tests/workflow-state/build.test.ts -t "preview"
npx tsx src/cli/main.ts workflow status --workflow truthmark-preview --json
```

---

# Pass 6: Lightweight Sync Intent Checklist

## Objective

Before truth-doc writes, make agents state a reviewable Sync intent: changed code reviewed, affected routes, target truth docs, intended update, evidence to verify, no-update-needed rationale, and blockers.

This borrows OpenSpec's “reviewable intent” value without creating persistent change objects or a typed Sync Plan engine.

## Product decision

Start with a **checklist embedded in Sync instructions and reports**, not a `src/sync/plan.ts` builder.

Do **not** create this typed object in the first pass:

```ts
export type TruthSyncPlan = {
  schemaVersion: "truthmark-sync-plan/v0";
  changedCodeReviewed: string[];
  affectedRoutes: string[];
  targetTruthDocs: string[];
  staleClaims: Array<...>;
  proposedUpdates: string[];
  noUpdateNeededRationale: string[];
};
```

Reason: `staleClaims` and `proposedUpdates` require agent judgment and checkout inspection. A generated skeleton could look authoritative while incomplete, and it would duplicate the final Sync report.

## Non-goal

Do not create `truthmark/changes/*`, proposal files, task files, sync-plan files, lifecycle objects, or arbitrary workflow DAGs. The Sync intent is transient report content.

## Files

- Do not modify `src/workflow-state/instructions.ts`; Sync Intent is transient host-surface/report content, not a workflow-instructions payload.
- Modify: `src/templates/workflow-surfaces.ts`
- Modify: `src/agents/workflow-manifest.ts` if report sections/templates are centralized there.
- Modify: `tests/agents/truth-sync.test.ts`
- Modify: `tests/templates/generated-surfaces.test.ts`
- Modify report validator tests only if the validator already recognizes report sections and the change is intentionally optional.

Do **not** create `src/sync/plan.ts` in this pass.

## Proposed report section

```md
## Sync Intent

- Changed code reviewed:
- Affected route/truth owner:
- Target truth docs:
- Intended update:
- Evidence to verify:
- No-update-needed rationale:
- Blockers:
```

## Tasks

### Task 6.1: Add Sync Intent to generated Sync instructions

**Objective:** Require agents to pause before truth-doc writes and summarize intent.

**Instruction behavior:**

- Inspect the checkout and configured routes first; optionally use `workflow status` as a compact helper when available.
- Fill the Sync Intent section before editing truth docs.
- If route ownership is ambiguous, block and recommend Truth Structure instead of guessing.
- Only edit allowed truth docs/routes after the intent is clear.
- Validate final report with `truthmark validate sync-report <report-file> --json` when applicable.

**Verification:**

```bash
npx vitest run tests/agents/truth-sync.test.ts tests/templates/generated-surfaces.test.ts
```

### Task 6.2: Keep validator changes optional during migration

**Objective:** Avoid breaking existing reports before all generated surfaces are refreshed.

**Decision:** The Sync Intent section should be encouraged/recognized in this pass, not required by the validator unless all generated templates and tests are updated in the same change.

**Verification:**

```bash
npx vitest run tests/sync/report.test.ts tests/cli/validate.test.ts
```

---

# Pass 7: Deferred Platform Surface Adapter Refactor

## Objective

Defer platform adapter refactoring out of the V2 value path. It is internal maintainability work and should happen only after Passes 4-6 behavior is stable and generated-output parity tests are strong enough to catch prompt drift.

## Deferred rationale

Truthmark supports many host-native surfaces, and current rendering is centralized. An adapter registry may help later, but it does not directly improve repository-truth correctness now. Refactoring Codex, OpenCode, Claude Code, Copilot, and Gemini surfaces at once creates broad churn and subtle prompt-regression risk.

## Do not implement in V2

Do not create these files as part of the current V2 pass sequence:

- `src/templates/platform-adapters/types.ts`
- `src/templates/platform-adapters/registry.ts`
- `src/templates/platform-adapters/codex.ts`
- `src/templates/platform-adapters/opencode.ts`
- `src/templates/platform-adapters/claude.ts`
- `src/templates/platform-adapters/copilot.ts`
- `src/templates/platform-adapters/gemini.ts`

## Future acceptance criteria before reopening

Only reopen this pass when:

1. Generated behavior from Passes 4-6 is stable.
2. Parity/snapshot tests prove generated body content, frontmatter, helper manifests, diagnostic categorization, and host-native paths do not drift.
3. The first adapter is a no-op wrapper around one existing platform renderer.
4. Platforms migrate one at a time.
5. Generated output is byte-for-byte or semantically equivalent before old central branches are removed.

---

# Cross-pass acceptance criteria

A pass is ready to merge only when:

- It preserves Truthmark's fixed repository-truth workflow model.
- It does not add OpenSpec proposal/spec/design/task lifecycle objects.
- JSON output uses the standard command envelope: `command`, `summary`, `diagnostics`, `data`.
- New nested JSON contracts have `schemaVersion` fields.
- Read-only workflows are machine-readably read-only.
- Write workflows include allowed writes, forbidden writes, stop conditions, and helper validator commands where applicable.
- Generated surfaces remain host-native and operational from repository files alone; optional CLI helpers must not become required live preflight.
- Generated surfaces do not hard-require optional repo-specific files unless proven/configured.
- Tests cover source-tree and built CLI behavior where CLI surface changes.
- Truthmark check/index are run after docs or generated-surface changes.

# Recommended implementation order

1. **Pass 0** first, because it prevents mission drift.
2. **Pass 1** next, because all later behavior needs the internal state model.
3. **Pass 2** is status-only in the current product boundary; keep `workflow instructions` absent.
4. **Pass 3** is superseded; preserve host-native generated surfaces instead of CLI-first live preflight.
5. **Pass 4** is implemented as a compact `check --json` scorecard; keep workflow-state exposure deferred.
6. **Pass 5** is implemented as read-only Preview/Explore wording/report hardening, with no new JSON object.
7. **Pass 6** is the next recommended feature: a lightweight Sync Intent checklist, with no typed plan engine yet.
8. **Pass 7** remains deferred out of the V2 value path until generated behavior is stable and parity tests justify the refactor.

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
node dist/main.js workflow instructions --workflow truthmark-check --json # expected to fail: command intentionally absent
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
4. Improve human review with compact scorecards and lightweight Sync intent checklists.
5. Refactor platform rendering only after behavior is stable and the adapter refactor has a separate maintainability justification.

This gives Truthmark OpenSpec's best workflow ergonomics while keeping Truthmark focused on repository truth, route ownership, evidence-backed claims, branch-scoped freshness, safe write boundaries, and Git-reviewable local operation.
