# Evidence-Backed Truth Workflows Design

Status: proposal
Date: 2026-05-14
Audience: Truthmark maintainers

This is a non-canonical design proposal. It describes a possible future change and must not be treated as current Truthmark product behavior until implemented and reflected in the canonical docs.

## Problem

Truthmark is strong at truth ownership, write boundaries, routing, and checker diagnostics. It can tell an agent where truth should live and whether the documentation topology is healthy.

The current weakness is claim-level grounding. Truthmark does not yet help an agent validate whether a newly written explanation is actually supported by implementation, config, routing, templates, or tests. This leaves room for generated docs to be well-placed but still stale, overbroad, or hallucinated.

The solution must preserve a core Truthmark constraint: installed workflow files must remain sufficient runtime. Users must not need the `truthmark` CLI installed on their computer for Truth Sync, Truth Document, Truth Structure, Truth Realize, or Truth Check to work. CLI diagnostics may improve the workflow when available, but the CLI must always be optional.

## Goals

- Require evidence for new or changed behavior-bearing truth claims.
- Keep Truthmark agent-native and checkout-first.
- Preserve the current rule that installed workflow surfaces are enough to operate.
- Improve stale-doc detection by checking whether changed functional code has impacted truth owners.
- Add optional CLI diagnostics without turning the CLI into a required workflow orchestrator.
- Keep canonical docs readable by putting most evidence detail in workflow reports, not inline citations.

## Non-Goals

- Do not add a required daemon, database, remote service, generated packet, cache, or repository index.
- Do not require users to run `truthmark` during agent workflows.
- Do not make derived analysis artifacts authoritative.
- Do not require every sentence in every doc to carry source citations.
- Do not turn Truthmark into a README generator or per-symbol documentation generator.
- Do not let tests override implementation, config, routing, or templates as primary evidence.

## Product Principle

Evidence validation is a workflow contract first and optional tooling second.

An agent with only repository access should be able to perform the workflow by reading:

- `.truthmark/config.yml`
- `docs/truthmark/areas.md`
- relevant child route files under `docs/truthmark/areas/`
- changed implementation files
- relevant config, templates, and tests
- impacted canonical truth docs

The CLI can later automate some checks, but it must only provide advisory validation.

## Core Concept

Add an Evidence Gate to Truth Sync, Truth Document, Truth Structure, and Truth Check.

Before finishing, the agent must verify that each new or changed behavior-bearing claim is supported by evidence from the active checkout. Unsupported claims must be removed, narrowed, or reported as blocked.

Truth Structure is included when it writes routed docs, route ownership, starter truth docs, active decisions, or rationale. Route ownership changes always require topology evidence, even when they do not add behavior prose. Topology evidence means repository layout, implementation boundaries, existing docs, config, tests, or route files that support why a code surface belongs to a particular truth owner.

Behavior-bearing claims include:

- command behavior
- options and config fields
- diagnostics and result envelopes
- routing ownership
- workflow boundaries
- generated surface behavior
- architecture and module ownership
- active product decisions and rationale

Claims that usually do not need claim-level evidence:

- wording cleanup
- formatting
- navigation text
- section reordering with no behavior change
- link-only maintenance

## Manual Workflow

Truth Sync, Truth Document, and claim-writing Truth Structure should follow this portable sequence:

1. Identify the changed or undocumented implemented behavior.
2. Read the committed Truthmark hierarchy contract and route files.
3. Map the behavior to bounded truth owners.
4. Inspect the owning canonical docs.
5. Inspect implementation, config, routing, templates, and nearby tests that support or constrain the behavior.
6. Update only workflow-allowed docs and route files.
7. Review each changed behavior-bearing claim.
8. Confirm primary evidence from implementation, config, routing, or templates.
9. Use tests as corroborating evidence, not as the sole source of implemented truth when implementation says otherwise.
10. Remove, narrow, or block unsupported claims.
11. Report evidence reviewed.

If routing is missing, stale, broad, overloaded, catch-all, or cannot map the behavior to a bounded truth owner, the workflow should run Truth Structure when safe and in scope. Otherwise it should block and recommend Truth Structure. When Truth Structure creates or changes routed truth docs, routing ownership, decisions, or rationale, those additions pass through the same Evidence Gate before completion.

Truth Check uses the gate differently because it is an audit workflow. It does not validate "new or changed truth claims" unless it edits docs as a follow-up action. Instead, it must support each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests. Unsupported findings should be removed or marked as open questions.

## Evidence Report

Workflow completion reports should include a compact evidence section.

```text
Evidence checked
- Claim: <short claim summary>
  Evidence: <path>:<line> / <path>:<line>
  Result: supported | narrowed | removed | blocked
```

Truth Check should use an audit-shaped variant:

```text
Evidence checked
- Finding: <short finding summary>
  Evidence: <path>:<line> / <path>:<line>
  Suggested fix: <repair or follow-up>
  Confidence: high | medium | low
```

The report is completion evidence, not durable repository truth. If the report is only an agent final message, later CLI checks cannot inspect it. The MVP should not depend on replaying or parsing prior reports.

Canonical docs should only include evidence references when the reference improves the maintained truth itself, such as a stable contract file or a governing config path. A future durable evidence artifact would need a separate explicit design and must remain optional.

## Impacted-Doc Check

Before claim validation, the agent should perform a route-first impacted-doc check.

The check answers:

- Which functional files changed?
- Which routed area owns those files?
- Which canonical truth docs are direct owners?
- Did the change also affect contracts, architecture, generated surfaces, or workflow behavior?
- Did the relevant canonical docs change, or are they already current?

Agent behavior:

- Changed functional code must map to a bounded route owner.
- Direct route owners are the primary impacted docs.
- `source_of_truth` entries, nearby tests, architecture docs, and contract docs may add secondary impacted docs.
- If no impacted doc changed, the agent must report why truth was already current or why sync was skipped.
- If changed docs sit outside likely impacted owners, the agent must justify the placement or move the change.

## Evidence Rules

Primary evidence:

- implementation code
- config files
- routing files
- generated surface templates
- schemas and contract definitions

Corroborating evidence:

- tests
- examples
- snapshots
- existing canonical docs

Existing docs are useful context, but they are not proof that implemented behavior is current. On conflict, the agent must inspect implementation and decide whether code is intentional or docs are stale.

## Optional CLI Diagnostics

The CLI may automate diagnostics later, but all CLI calls remain optional.

The current `truthmark check` model validates the active checkout. It does not have a diff base or workflow context, so this design must not add default diagnostics that depend on "changed functional files" or "changed canonical docs."

For the MVP, impacted-doc checks remain agent-only workflow steps. Future CLI support requires an explicit diff contract first.

The simplest future contract is explicit changed paths, supplied by the caller. For example, a future checker mode could accept a path list from arguments or stdin and then compute impacted docs from that list. It should not infer staged, unstaged, or historical changes by default because those choices are workflow-specific.

Possible future diff-aware diagnostics after that contract exists:

- `error`: provided changed functional file has no bounded route owner
- `review`: provided changed functional code maps to owner docs, but no impacted doc was provided or changed in the same review set
- `review`: provided changed canonical doc is outside likely impacted owners
- `review`: provided changed doc introduces high-risk behavior claims without obvious source evidence in the same review set

Possible future evidence-artifact diagnostics require a parseable optional artifact or input. They are out of scope for the MVP because completion reports are not durable repository data.

Workflow wording should use optional language, such as:

```text
Run `truthmark check` when available for additional validation. The workflow remains valid without the CLI; inspect the checkout directly when the command is unavailable.
```

## Architecture

Implementation should happen in two layers.

### Layer 1: Workflow Contract

Update generated workflow surfaces so agents can perform the Evidence Gate without tooling.

Affected surfaces:

- Truth Sync instructions
- Truth Document instructions
- Truth Structure instructions for claim-writing topology work
- Truth Check instructions
- report examples
- compact managed instruction blocks only if needed for trigger clarity

This layer should not introduce new runtime dependencies.

### Layer 2: Optional Checker Support

Extend `truthmark check` only after the workflow contract is clear and a diff/input contract exists for change-aware diagnostics.

Recommended order:

1. Keep default `truthmark check` focused on active-checkout health.
2. Add an explicit changed-path input contract for optional diff-aware diagnostics.
3. Add impacted-doc diagnostics using route resolution and the provided changed paths.
4. Add heuristic changed-claim detection for high-risk provided doc paths.
5. Add parser-backed TS/JS import impact ranking as an optional precision improvement.

The checker must not become the workflow runtime.

## Internal Types For Future Tooling

These types are useful for optional future CLI internals and structured evidence inputs. They are not required committed artifacts and are not part of the workflow-only MVP.

```ts
type EvidenceItem = {
  path: string;
  line?: number;
  kind: "implementation" | "test" | "config" | "routing" | "template";
};

type EvidenceClaim = {
  docPath: string;
  section: string;
  kind:
    | "behavior"
    | "contract"
    | "workflow"
    | "routing"
    | "architecture"
    | "decision";
  summary: string;
  evidence: EvidenceItem[];
  result: "supported" | "narrowed" | "removed" | "blocked";
};

type ImpactedDoc = {
  docPath: string;
  reason:
    | "direct-route-owner"
    | "source-of-truth"
    | "nearby-test"
    | "contract-owner"
    | "architecture-owner"
    | "generated-surface-owner";
  confidence: "high" | "medium" | "low";
};
```

## Phasing

### Phase 1: Portable Evidence Gate

- Update installed workflow text.
- Add evidence report sections.
- Teach Truth Sync, Truth Document, and claim-writing Truth Structure to remove, narrow, or block unsupported claims.
- Teach Truth Check to support findings and suggested fixes with evidence.
- Keep CLI use optional.

### Phase 2: Route-First Impact Diagnostics

- Keep impacted-doc review as an agent workflow step.
- Do not add default `truthmark check` diagnostics that require a diff.
- Define an explicit changed-path input contract before adding CLI support.

### Phase 3: Claim Heuristics

- Inspect provided Markdown paths or hunks only after a diff/input contract exists.
- Flag high-risk claims mentioning commands, options, diagnostics, generated surfaces, routes, architecture ownership, or product decisions.
- Ask for source evidence in diagnostics without claiming full semantic proof.

### Phase 4: Semantic Impact Ranking

- Add an optional lightweight repository index for TS/JS imports and exports.
- Use it to rank impacted docs and neighboring modules.
- Keep the index derived and non-authoritative.

## Failure Modes

Overburdening agents:

- Keep the evidence section compact.
- Validate changed behavior-bearing claims only, not entire documents.

Citation noise in canonical docs:

- Put proof trail in reports by default.
- Add inline evidence only where it improves durable truth.
- Do not add CLI validation of past report evidence unless a parseable optional evidence input exists.

False confidence from tests:

- Make tests corroborating evidence.
- Prefer implementation, config, routing, templates, schemas, and contract definitions for primary support.

CLI dependency creep:

- Generated workflow text must explicitly state that CLI calls are optional.
- Any future cache, index, or claim ledger must be derived and non-authoritative.
- Default `truthmark check` must not become diff-aware without an explicit input contract.

Weak routing:

- Do not let agents add generic docs behind broad or stale routes.
- Block or run Truth Structure when bounded ownership is unclear.

## Review Questions

1. Should evidence reports be required for all Truth Sync completions, or only when truth docs changed?
2. Should Truth Document require stronger evidence reporting than Truth Sync because it has no code diff trigger?
3. Should Truth Structure evidence be required only when it writes routed docs, ownership claims, decisions, or rationale?
4. Should a future diff-aware checker use explicit changed paths only, or also support a named base such as `--since`?
5. Should evidence spans include line numbers in reports when available, or are paths sufficient for the first workflow-only phase?
6. Should derived semantic indexes be explicitly banned from installed workflow inputs until a later version?

## Recommended Decision

Adopt the Evidence Gate as a portable workflow requirement first. Add optional CLI diagnostics only after the workflow contract is clear and the relevant diff or structured-input contract exists.

This preserves Truthmark's strongest product boundary: canonical truth is maintained by agents inspecting the active checkout directly, while the CLI installs and validates surfaces without becoming a required execution bridge.
