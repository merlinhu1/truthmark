---
status: active
truth_kind: engineering-workflow
last_reviewed: 2026-06-29
---

# Installed Workflow Runtime

## Purpose

This doc describes how the repository currently realizes host-native Truthmark workflow surfaces.

## Scope

It owns generated workflow runtime behavior, managed instruction blocks, optional validation commands, and direct-checkout fallback rules.

## Current Implementation Behavior

The source manifest and renderers are the package-generation authority.

`truthmark init` projects source renderers into configured host-native workflow files.

Fresh configs do not assume a host platform:

- Host-specific surfaces are generated only when `.truthmark/config.yml` explicitly lists platforms such as Codex, OpenCode, Claude Code, GitHub Copilot, Antigravity, or Cursor.

Generated host skill directories are native skill packages for write-capable and audit workflows:

- `SKILL.md` files keep package-local `support/procedure.md` and `support/report-template.md`.
- Subagent and lease guidance is kept only when the workflow uses subagents.
- Hosts that package skill-directory resources do not depend on arbitrary cross-repository file reads.

Generated helper manifests and helper policy support files are not emitted:

- Optional validation commands stay in workflow metadata.
- Report validation accepts manual fallback evidence.

Truthmark no longer emits Truth Preview as a generated host surface:

- No configured host receives a Preview skill package, prompt, or command.
- Preview-like route/workflow selection remains internal advisory behavior that agents can perform with direct checkout inspection or optional workflow-status/impact helpers.

Truthmark does not emit a separate `.truthmark/agent/` workflow copy:

- Host surfaces are the runtime surfaces agents actually load.
- Duplicating workflow packages under `.truthmark/agent/` would add repository docs with no active host consumer.

GitHub Copilot prompts and top-level managed instruction blocks stay thin:

- They point to host-native workflow entrypoints when a host skill package exists.
- They do not embed full workflow bodies or cross-host invocation lists.

Antigravity rule files remain flat host rule surfaces:

- They inline the workflow procedure and report template because that host does not consume the package-local `support/` directory model.
- They omit the duplicate quick-procedure block and do not reference nonexistent `support/` files.
- They keep only host-local invocation framing and do not embed cross-host invocation lists.

Cursor Agent Skills are generated as project skill packages under `.cursor/skills/truthmark-*`:

- They use Cursor's current Agent Skills model rather than `.cursor/rules` dynamic rule files.
- `SKILL.md` carries the description that lets Cursor select the workflow automatically when relevant and supports manual `/` invocation.
- Package-local `support/procedure.md`, `support/report-template.md`, and any lease guidance stay colocated with the Cursor skill.

Generated-surface checks report missing or stale configured host-native skill package files.

Workflow manifest entries use review-oriented questions that surface as a WorkflowState `reviewChecklist`.

Evidence-oriented entries surface as `evidencePrompts`.

Generated GitHub Copilot prompt files act as compact host entrypoint adapters:

- They direct the current invocation to host-local skill package files.
- They avoid dispatching another Truthmark command.
- They do not embed duplicate workflow bodies or cross-host invocation lists.

Truth Sync generated procedures use a product-truth decision before canonical truth writes:

- Update or route product truth only when a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed.
- Internal implementation changes default to engineering truth.

Truth Sync owns bounded topology repair before normal syncing:

- Missing, stale, broad, overloaded, or catch-all routing is repaired inside Sync when the repair is safe and in scope.
- Safe repair stays limited to affected route/truth owners.
- Unsafe, ambiguous, or out-of-scope topology repair is handed off manually to Truth Structure.

Truth Sync performs decision context capture from the current task conversation:

- Agents review user-provided decisions, rationale, constraints, tradeoffs, rejection reasons, and scope boundaries.
- Agents carry that context into Sync Intent.
- Supported context is placed in the correct product or engineering truth lane.
- The report records whether context was placed, skipped because none was provided, or handed off for manual review.

Truth Document and Truth Sync procedures tell agents to write professional, readable truth docs without importing a full external writing prompt:

- Prefer specific current-state claims over promotional, symbolic, or generic significance language.
- Avoid common AI-writing tells such as vague expert attribution, generic upbeat conclusions, and stock words like "pivotal", "crucial", "underscores", "serves as", "stands as", "showcases", and "landscape".
- Keep claims evidence-backed and diff-friendly: one durable claim per bullet or line; paragraphs should be no longer than one or two short sentences.
- Do not add personality, rhetorical flourish, first-person commentary, or marketing tone.
- Rewrite dense or formulaic prose only when readability improves without removing scope, evidence, decisions, or source references.

Truth Structure stays topology-first:

- It creates skeletal starter truth docs only when missing ownership would block future workflows.
- Starter docs are ownership anchors, not substantive behavior writeups.
- Template-section authoring, doc-shape repair, and architecture-doc prose guidance stay out of the Structure procedure.

Other write-capable truth workflows preserve lane-specific classification before canonical truth writes.

Read-only Check surfaces classify lane ownership for reporting without write-authorizing phrasing.

The manual Truth Realize prompt path uses Realize-specific lane guidance:

- Read product truth as requirements.
- Read engineering truth as implementation context.
- Do not write truth docs or truth routing while realizing docs into code.

Preview-like route selection stays internal and thin when agents need it before choosing a workflow:

- Read the root route index first.
- Read only child route files relevant to the selected scope or changed paths.
- Report unresolved manual handoff questions instead of treating selection as final correctness or write authorization.

Truth Check and read-only route auditors use route-first bounded inspection for lane and cross-lane relationship checks:

- Narrow audits stay within the routed area plus directly linked counterpart docs.
- Root-wide health first builds a route-map/index from route files.
- Missing product links for user-visible engineering docs are second-pass review diagnostics rather than default full-document reads.

Truth Sync generated procedures and report templates include a transient Sync Intent checkpoint that records:

- changed code reviewed
- affected route/truth owner
- target truth docs
- intended update
- evidence to verify
- user-provided decisions/rationale
- no-update-needed rationale
- blockers

Truth Sync successful report examples target bounded behavior ownership rather than the provisional bootstrap handoff:

- The successful session-timeout example uses a bounded authentication route and `engineering/behaviors/session-timeout.md`.
- The provisional `bootstrap-routing.md` document is represented only as a blocked topology case that tells agents to run Truth Structure before updating behavior truth.
- `truthmark validate sync-report` rejects completed reports that list `bootstrap-routing.md` as an updated or target truth doc.

Optional CLI repository-intelligence helpers are compact advisory cards:

- `workflow status` reports affected files, likely route owners, suggested truth docs, open questions, skipped helper status, and compact write-boundary suggestions.
- `impact` exposes branch-diff routing data.
- Neither helper emits source-file or truth-doc body contents.

- The repository includes a maintainer-only workflow evaluation framework under `workflow-eval-framwork/`; it is not part of the published npm package and normal Truthmark users do not need it:

- It tests agent behavior for installed workflow skills and prompts using cataloged scenarios, rubrics, realistic multi-file development fixtures, fake agents, deterministic grading, required manual LLM judge commands, and human review.
- Scenarios include source files, tests, route ownership, product truth, engineering behavior truth, API contract truth, and operations truth so workflow agents must choose the correct lane and bounded owner instead of solving a one-file toy case.
- A catalog run executes registered scenarios across Truth Sync, Truth Document, Truth Realize, Truth Check, and Truth Structure, then persists only `final-report.md` and `audit.json` for the full suite.
- Per-scenario command output, patches, reports, and judge scratch files are temporary in catalog mode and are discarded after aggregation.
- Scenario setup patches are applied after the fixture baseline commit so agents evaluate real pre-existing diffs.
- Deterministic expectations are prompt-visible or semantically forced by the workflow; exact command requirements and required file targets are not hidden arbitrary grader traps.
- Catalog runs without judge results are `not_evaluable`; deterministic-only output is only a harness smoke test.
- Judge failures produce failed runs; `not_evaluable` is reserved for missing or malformed judge output.
- Explicit `--agent-model` and `--judge-model` labels are preserved in `audit.json`, `final-report.md`, and wrapper environment variables for reproducible model comparisons.
- The runner exports `TRUTHMARK_EVAL_AGENT_USAGE` and `TRUTHMARK_EVAL_JUDGE_USAGE` sidecar paths so wrappers can report provider token usage without coupling the runner to one provider event format.
- Scenario results, suite `audit.json`, and `final-report.md` record measured agent tokens, judge tokens, and suite totals for prompt/workflow-surface usage comparisons.
- `--require-usage` makes missing or invalid usage sidecars non-passing for real model-comparison runs.
- The framework does not enforce token budgets or estimate dollar cost; raw token counts are the durable telemetry signal.
- Focused single-scenario runs require an explicit debug flag and are not sufficient for workflow-quality claims across the product surface.
- Manual run artifacts stay ignored by default so expensive or stale eval history is not committed accidentally.
- The framework is not part of normal `truthmark check`, `truthmark init`, generated host surfaces, package install, downstream workflow execution, or default CI agent execution.

Truth Sync workflow status separates impacted primary truth docs from candidate stale truth docs and route files.

This keeps stale repository-truth correction available without making every indexed doc look like the starting scope.

## Triggers

- `truthmark init` refreshes configured workflow surfaces.
- Explicit host invocations run manual workflows.
- Truth Sync is the finish-time workflow when functional code changed.

## Inputs

- Source workflow renderers and manifest entries under `src/agents/**` and `src/templates/**`.
- `.truthmark/config.yml` platform selections.
- Committed host-native workflow files and managed instruction blocks.
- Optional workflow-status and impact helper outputs.

## Execution Model

Committed workflow files are the runtime contract. The CLI installs and validates surfaces but does not act as daemon, database, or workflow orchestrator.

## Steps

- Maintainers edit source renderers, workflow manifest entries, or shared workflow guidance.
- `truthmark init` refreshes configured generated surfaces.
- Agents load host-native skill packages, prompt adapters, command adapters, or managed instruction blocks.
- Agents inspect the checkout directly and use optional helpers only as compact advisory context.

## State, Retry, And Failure Behavior

- Generated-surface state is represented by committed files.
- Stale generated surfaces are reported by check and repaired by rerunning init.
- Missing helper output does not block direct-checkout workflow execution.

## Outputs

- Host-native skill packages and support files for configured platforms.
- Compact prompt and command adapters where applicable.
- Managed instruction blocks with non-versioned refresh guidance.
- Workflow reports produced by the running agent, not by a Truthmark daemon.

## Product Truth Links

- `docs/truthmark/product/capabilities/agent-native-workflow-injection.md`

## Engineering Decisions

- Decision (2026-06-14): Product and engineering truth remain separate generated-workflow lanes for truth creation, structure, audit, and cross-lane ownership checks.
- Decision (2026-06-17): Routine code-first Truth Sync uses a product-truth decision instead of a full lane-classification gate.
  - Product truth is opt-in for externally visible promises, product boundaries, APIs, acceptance criteria, or explicit user/product evidence.
- Decision (2026-06-15): Optional workflow handoff helpers use `workflow status --json` and `impact --json`; generated surfaces must not direct agents to a standalone ContextPack command.
- Decision (2026-06-16): `truthmark workflow instructions` is intentionally absent.
  - Committed host-native workflow files and direct checkout inspection are the runtime contract, while `workflow status` remains an optional compact helper.
- Decision (2026-06-17): Workflow status presents optional helper output as advisory workflow cards with review checklists, evidence prompts, open questions, and skipped-helper status.
  - Generated workflows still run from committed host-native files and direct checkout inspection when helpers are unavailable.
- Decision (2026-06-16): Truth Sync uses a transient Sync Intent checklist in generated procedures and report templates before truth writes; it is not a persistent plan object or lifecycle artifact.
- Decision (2026-06-18): Truth Sync treats user-provided decision rationale from the current task conversation as first-class sync input.
  - The workflow records that context in Sync Intent, routes it to the correct product or engineering truth section when supported, and reports where it was placed, skipped because none was provided, or handed off for manual review.
- Decision (2026-06-17): Source manifest/renderers are the workflow-generation authority; configured host skill directories are native generated packages with colocated resources.
  - Truthmark does not emit a separate `.truthmark/agent/` workflow copy when no host surface consumes it.
- Decision (2026-06-18): Fresh configs do not assume Codex, OpenCode, or any other host platform. Host-specific surfaces are generated only for explicit `platforms` entries.
- Decision (2026-06-18): Generated helper manifest and helper policy files are retired. Validation helpers remain as optional workflow metadata and explicit `truthmark validate ...` commands, not package support files.
- Decision (2026-06-20): Truth Preview generated host surfaces are retired.
  - The repository no longer emits Preview skill packages, Copilot prompts, Antigravity rules, or Cursor rules.
  - Route/workflow preview remains an internal read-only selection behavior rather than an installed workflow surface.
- Decision (2026-06-18): Truth Sync retains bounded topology repair.
  - Missing, stale, broad, overloaded, or catch-all route ownership is repaired inside Sync when safe and scoped to the changed functional code.
  - Only unsafe, ambiguous, or out-of-scope topology repair is handed off manually to Truth Structure.
- Decision (2026-06-21): Truth Sync report examples and validation must not accept `bootstrap-routing.md` as a completed behavior-update target.
  - Bootstrap-only mappings are blocked topology handoffs until Truth Structure assigns a bounded owner.
- Decision (2026-06-21): Cursor workflow generation uses Agent Skill project packages under `.cursor/skills/truthmark-*`, not dynamic `.cursor/rules` files.
  - Agent Skills are the single current native Cursor workflow representation because they provide description-based selection plus package-local resources.
- Decision (2026-06-26): Truth-doc prose guidance uses a compact professional checklist instead of vendoring a full humanizer prompt into generated workflows.
  - Truthmark keeps the benefit of avoiding AI-style padding while controlling token cost and preserving evidence-backed documentation tone.

## Rationale

Committed host-native workflow files keep agent behavior reviewable in Git while avoiding a required live Truthmark runtime.

## Non-Goals

- The runtime does not orchestrate agents.
- The runtime does not create hidden off-repo workflow packets.
- The runtime does not make optional helpers mandatory preflight steps.

## Maintenance Notes

Update this doc when workflow manifest fields, generated surface paths, optional validation metadata, or managed instruction behavior changes.

## Source References

- ../../../../src/agents/instructions.ts
- ../../../../src/agents/prompts.ts
- ../../../../src/agents/workflow-manifest.ts
- ../../../../src/agents/workflow-helper-validation.ts
- ../../../../src/agents/truth-sync.ts
- ../../../../src/sync/report.ts
- ../../../../src/agents/shared.ts
- ../../../../src/templates/workflow-surfaces.ts
- ../../../../src/templates/generated-surfaces.ts
- ../../../../src/checks/generated-surfaces.ts
- ../../../../workflow-eval-framwork/catalog.yaml
- ../../../../scripts/workflow-eval-framwork/run-agent-scenario.mjs
- `src/agents/workflow-manifest.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/generated-surfaces.ts`
