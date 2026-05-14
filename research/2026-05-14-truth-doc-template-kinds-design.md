# Truth Doc Template Kinds Design

Status: draft for review

This is a non-canonical design note. It is intentionally kept under `research/` so it does not redefine current Truthmark behavior until a reviewed decision is promoted into canonical docs and implementation.

## Problem

Truthmark currently centers new bounded behavior docs on one editable template:

- `docs/templates/feature-doc.md`

That works for many feature or product-behavior surfaces, but it can become awkward for repositories whose truth is not naturally feature-shaped.

Examples:

- API repositories need to document endpoints, schemas, compatibility, auth, error semantics, and versioning.
- Backend service repositories need to document service behavior, persistence boundaries, queues, workers, and runtime rules.
- UI repositories need to document user flows, app shell behavior, component contracts, and state transitions.
- Mobile and desktop applications need to document lifecycle, platform permissions, offline state, and release constraints.
- Task runner repositories need to document triggers, task graphs, scheduling, caching, retries, and failure behavior.
- Test repositories need to document fixtures, assertions, isolation, execution model, and reporting semantics.
- Infrastructure repositories need to document topology, deployment, permissions, observability, rollback, and operational invariants.

The risk is not that one default template exists. The risk is that Truthmark's product language could imply all canonical truth must be stored as a "feature doc". That would make the system feel mismatched for many repositories and could push users toward arbitrary templates that weaken Truthmark's routing and validation model.

## Goal

Support common repository truth shapes without losing Truthmark's core value:

- branch-local Markdown as canonical truth
- explicit routing from changed code to bounded docs
- agent-safe write boundaries
- current implemented behavior only
- active decisions stored beside the truth they govern
- validation that catches weak or broken truth surfaces

The product should evolve from "feature docs" toward "truth docs". A feature doc becomes one kind of truth doc, not the universal model.

## Non-Goals

- Do not infer a single repository type and force one template for the whole repo.
- Do not allow arbitrary unvalidated template shapes for canonical truth docs.
- Do not create a parallel generated documentation tree.
- Do not treat derived analysis artifacts as canonical truth.
- Do not make users model every repository with a large taxonomy before Truthmark becomes useful.
- Do not require a semantic repository index before typed templates can work.

## Design Principle

Truthmark should have one invariant truth model, but multiple document shapes.

That means:

1. Every canonical truth doc must satisfy the same Truth Contract.
2. Each doc may use a typed template that fits the kind of truth it owns.
3. Routing should identify the kind of truth a document owns.
4. Validation should enforce the universal contract plus kind-specific required sections.

This keeps flexibility at the writing layer while preserving predictability at the governance layer.

## Common Repository Types

Truthmark should assume users may bring any of these repository shapes:

| Repository type | Common truth surfaces |
| --- | --- |
| API / contract repo | endpoints, schemas, SDK contracts, compatibility, auth, errors |
| Backend service / server repo | product behavior, workers, queues, persistence, config, runtime rules |
| Frontend UI repo | user flows, app shell, shared UI behavior, component contracts |
| Mobile / desktop app repo | app flows, platform lifecycle, permissions, offline state, release constraints |
| CLI / developer tool repo | commands, flags, generated files, diagnostics, config, local workflow |
| Task runner / automation repo | triggers, task graph, scheduling, caching, retries, failure behavior |
| Library / package repo | public API, module boundaries, compatibility, examples, extension points |
| Infrastructure / platform repo | topology, deployment, permissions, observability, rollback, availability |
| Test / QA repo | fixtures, assertions, test execution, isolation, reporting |
| Data / ML / analytics repo | pipelines, datasets, model behavior, transforms, evaluation, governance |
| Monorepo | multiple independent truth kinds under one repository |

Truthmark should not ask "what type of repository is this?" as the main model. Repositories often mix shapes, especially monorepos. Instead, Truthmark should ask "what kind of truth does this routed document own?"

## Universal Truth Contract

Every canonical truth doc should satisfy this contract regardless of template kind.

Baseline frontmatter fields:

- `status`
- `doc_type`
- `last_reviewed`
- `source_of_truth`

Recommended frontmatter for canonical truth docs:

- `truth_kind`

`doc_type` should remain the document class, such as `behavior`, `contract`, `architecture`, `standard`, `index`, `route-index`, `area-route`, or `agent-guide`. `truth_kind` should identify the template and validation kind:

- `behavior`
- `contract`
- `architecture`
- `workflow`
- `operations`
- `test-behavior`

Route metadata uses `kind` for the same value. When both frontmatter and route metadata are present, they must agree. Route metadata should be the primary source during routing because existing Truthmark area files already route multiple document classes together, including architecture docs, standards, indexes, and behavior docs.

Required semantic properties:

- The doc owns one bounded truth surface.
- The doc describes current implemented behavior only.
- The doc is listed in route metadata or otherwise has a concrete, parseable route owner.
- The doc includes active decisions beside the behavior they govern.
- The doc explains rationale for active decisions and non-obvious boundaries.
- The doc avoids duplicating facts owned by another canonical source.
- The doc is not a roadmap, plan, generated report, or scratch analysis artifact.
- The doc does not contain unexpanded template placeholders.

Required section anchors:

- `Scope`
- `Product Decisions`
- `Rationale`
- a kind-specific current-truth section
- a kind-specific maintenance/drift section

`Product Decisions` and `Rationale` should remain exact section names unless Truthmark later introduces a configured synonym system. Exact names keep validation simple and agent instructions stable.

## Proposed Truth Doc Kinds

Start with a small set of typed templates:

| Kind | Template | Purpose |
| --- | --- | --- |
| `behavior` | `docs/templates/behavior-doc.md` | Product behavior, app flows, feature behavior, CLI behavior, service behavior |
| `contract` | `docs/templates/contract-doc.md` | API, schema, CLI, SDK, file-format, event, or integration contracts |
| `architecture` | `docs/templates/architecture-doc.md` | Structure, module boundaries, ownership, topology, cross-cutting constraints |
| `workflow` | `docs/templates/workflow-doc.md` | Task runners, CI, automation, schedulers, agent workflows, lifecycle flows |
| `operations` | `docs/templates/operations-doc.md` | Deployment, runtime config, permissions, observability, availability, rollback |
| `test-behavior` | `docs/templates/test-behavior-doc.md` | Test harnesses, fixtures, assertions, execution model, isolation, reporting |

`feature-doc.md` should be replaced by `behavior-doc.md`. Backward compatibility is intentionally out of scope for this design; agents can handle migration from older generated surfaces.

Avoid first-class kinds such as `api`, `server`, `mobile`, `desktop`, or `task-runner`. Those describe repository shapes, not durable truth shapes. For example, a mobile repo may need `behavior`, `contract`, `architecture`, `workflow`, and `operations` docs.

## Template Shapes

### Behavior

For product behavior, app flows, CLI behavior, and service behavior.

Suggested sections:

- Purpose
- Scope
- Current Behavior
- Core Rules
- Flows And States
- Contracts
- Product Decisions
- Rationale
- Non-Goals
- Maintenance Notes

This is the current `feature-doc.md` model with a clearer product name.

### Contract

For external or stable integration surfaces.

Suggested sections:

- Purpose
- Scope
- Contract Surface
- Inputs
- Outputs
- Errors And Diagnostics
- Compatibility Rules
- Versioning And Migration
- Product Decisions
- Rationale
- Non-Goals
- Maintenance Notes

Useful for OpenAPI, GraphQL, protobuf, CLI flags, config files, generated outputs, SDK interfaces, file formats, and events.

### Architecture

For structure and ownership rather than ordinary behavior.

Suggested sections:

- Purpose
- Scope
- System Role
- Boundaries
- Components
- Data And Control Flow
- Ownership
- Cross-Cutting Constraints
- Product Decisions
- Rationale
- Non-Goals
- Maintenance Notes

Architecture docs should not absorb endpoint details, UI copy, validation rules, or bug fixes unless those changes alter system structure or ownership boundaries.

### Workflow

For task runners, schedulers, CI flows, automation, and agent workflows.

Suggested sections:

- Purpose
- Scope
- Triggers
- Inputs
- Execution Model
- Steps
- State, Retry, And Failure Behavior
- Outputs
- Product Decisions
- Rationale
- Non-Goals
- Maintenance Notes

This kind is important because task runner repos and automation-heavy repos often do not fit "feature" language well.

### Operations

For runtime and deployment truth.

Suggested sections:

- Purpose
- Scope
- Operational Surface
- Runtime Topology
- Configuration
- Permissions
- Deployment And Rollback
- Availability And Observability
- Product Decisions
- Rationale
- Non-Goals
- Maintenance Notes

This kind should be used for infrastructure and platform behavior when changes affect deployed behavior, permissions, runtime topology, availability, or operational guarantees.

### Test Behavior

For repositories or areas where tests themselves are the product surface.

Suggested sections:

- Purpose
- Scope
- Test Surface
- Fixtures And Data Model
- Execution Model
- Assertions And Invariants
- Isolation Rules
- Reporting And Failure Semantics
- Product Decisions
- Rationale
- Non-Goals
- Maintenance Notes

This kind avoids forcing test harnesses into product-feature language.

## Routing Model

Routing should declare the intended kind of each truth doc in an agent-friendly structured block.

````md
Truth documents:

```yaml
truth_documents:
  - path: docs/truth/billing/checkout.md
    kind: behavior
  - path: docs/truth/billing/api-contract.md
    kind: contract
  - path: docs/truth/billing/runtime.md
    kind: architecture
```
````

This format is preferred over Markdown tables because agents can append, reorder, and validate keyed fields without preserving table alignment. It is preferred over inline key-value bullets because each entry has stable keys and can be extended later with fields such as `owner`, `code_surface`, `notes`, or `template`.

Explicit route metadata should win over path inference.

## Path Inference Fallback

Path conventions should be fallback behavior only.

Suggested defaults:

| Path | Default kind |
| --- | --- |
| `docs/truth/**` | infer from explicit route metadata first; otherwise `behavior` |
| `docs/contracts/**` | `contract` |
| `docs/api/**` | `contract` |
| `docs/architecture/**` | `architecture` |
| `docs/workflows/**` | `workflow` |
| `docs/operations/**` | `operations` |
| `docs/platform/**` | `operations` or `architecture`, depending on configured root |
| `docs/testing/**` | `test-behavior` |

Fallback inference should produce review diagnostics when ambiguous. It should not silently route a complex doc to the wrong kind.

## Template Resolution

Template lookup should follow this order:

1. Kind-specific configured template path, if present.
2. Default kind template under `docs/templates/`.
3. Built-in minimal template for the kind.
4. Blocking diagnostic if no safe template can be resolved.

Example config shape:

```yaml
docs:
  templates:
    behavior: docs/templates/behavior-doc.md
    contract: docs/templates/contract-doc.md
    architecture: docs/templates/architecture-doc.md
    workflow: docs/templates/workflow-doc.md
    operations: docs/templates/operations-doc.md
    test-behavior: docs/templates/test-behavior-doc.md
```

This should be optional. Truthmark can seed the standard templates during init.

## Validation Model

Validation should have two layers.

Universal checks:

- parseable frontmatter when frontmatter is present
- configured required frontmatter fields, with severity following `.truthmark/config.yml`
- configured recommended frontmatter fields, with severity following `.truthmark/config.yml`
- no unexpanded placeholders
- no feature `README.md` as routed sync target
- required `Product Decisions` section
- required `Rationale` section
- `Scope` section exists
- route metadata includes an entry for each canonical truth doc with a valid `path` and `kind`
- frontmatter `truth_kind`, when present, matches the routed `kind`

Kind-specific checks:

- `behavior`: has `Current Behavior`
- `contract`: has `Contract Surface` and at least one contract-detail section such as `Inputs`, `Outputs`, or `Compatibility Rules`
- `architecture`: has `Boundaries` or `Components`
- `workflow`: has `Triggers` and `Execution Model`
- `operations`: has `Runtime Topology` or `Configuration`
- `test-behavior`: has `Execution Model` and either `Fixtures And Data Model` or `Assertions And Invariants`

Review-only semantic checks:

- scope appears broad, catch-all, or unrelated to routed code surfaces
- source-of-truth references appear stale or too generic
- content appears to duplicate another canonical doc
- behavior claims look like roadmap or planning text

Initial implementation can emit review diagnostics rather than hard failures for subjective semantic quality. Hard failures should be reserved for cases that break workflow safety or parsing, such as invalid frontmatter syntax, unsafe template paths, invalid route metadata, unrouteable docs, or config-required frontmatter fields that are missing.

## Agent Workflow Changes

Generated workflow text should stop saying "feature doc" as the general category.

Preferred language:

- "truth doc" for the generic concept
- "behavior truth doc" for the current feature-style template
- "template kind" for the selected document shape

Truth Structure should:

- choose a truth doc kind when creating starter docs
- prefer explicit kind metadata in route files
- avoid creating generic behavior docs when the truth surface is actually contract, architecture, workflow, operations, or test behavior

Truth Document should:

- inspect existing routing and template kind before creating docs
- create the smallest doc of the correct kind
- block or recommend Truth Structure when the kind is ambiguous because routing is broad or overloaded

Truth Sync should:

- use route metadata to identify the owning truth doc and kind
- follow the selected template's section intent
- preserve authored content that remains accurate
- update decision and rationale sections regardless of kind

Truth Check should:

- validate universal truth contract
- validate kind-specific required sections
- warn when path inference was needed because route metadata omitted kind

## Init Behavior

`truthmark init` should seed:

- `docs/templates/behavior-doc.md`
- `docs/templates/contract-doc.md`
- `docs/templates/architecture-doc.md`
- `docs/templates/workflow-doc.md`
- `docs/templates/operations-doc.md`
- `docs/templates/test-behavior-doc.md`

The default starter leaf doc should be created under `docs/truth/**` and use `behavior` unless explicit route metadata or the configured default area strongly indicates another kind.

Do not over-infer on day one. A wrong inferred kind is worse than a simple default plus clear route metadata.

## Migration Strategy

The direct migration is:

1. Rename product language from "feature doc" to "truth doc".
2. Replace `docs/templates/feature-doc.md` with `docs/templates/behavior-doc.md`.
3. Add the five additional typed templates.
4. Update generated workflows to say `truth doc` and `template kind`.
5. Update route parsing to require structured `truth_documents` kind metadata for canonical truth docs.
6. Update checks to validate universal and kind-specific contracts.
7. Update canonical docs to describe typed truth docs.

## Risks

### Risk: Template flexibility weakens truth governance

If users can define arbitrary templates without validation, agents may create prose that looks useful but no longer supports routing, sync, decisions, or checks.

Mitigation: enforce the Universal Truth Contract for every kind.

### Risk: Too many kinds make the product harder to learn

Users may hesitate if they must choose among many doc kinds before writing anything.

Mitigation: ship the full small set immediately: `behavior`, `contract`, `architecture`, `workflow`, `operations`, and `test-behavior`. Keep kind choice visible in route metadata and keep the taxonomy small instead of adding repo-shape kinds such as `api`, `mobile`, or `server`.

### Risk: Repo type and doc kind get confused

An API repo may also need architecture and workflow docs. A mobile app may need contract and operations docs.

Mitigation: document that kind belongs to a routed truth doc, not to the whole repository.

### Risk: Agents choose the wrong kind

Agents may create a behavior doc for a contract surface or an architecture doc for ordinary feature behavior.

Mitigation: route metadata, path inference warnings, and workflow instructions should make kind selection explicit. Truth Structure should repair broad topology before creating new docs.

### Risk: Section synonyms break validation

Custom templates may rename `Product Decisions` to `Decisions`, or `Rationale` to `Why`.

Mitigation: keep exact required anchors in V1. Add configured synonyms only if there is clear user demand.

## Recommended First Implementation Slice

First slice:

1. Introduce `truth doc` language in docs and generated workflow text.
2. Move default current-truth examples to `docs/truth/**`.
3. Add `behavior-doc.md`, `contract-doc.md`, `architecture-doc.md`, `workflow-doc.md`, `operations-doc.md`, and `test-behavior-doc.md` templates.
4. Add optional canonical truth doc `truth_kind` frontmatter and validate it against routed `kind` when present.
5. Add route metadata parsing for fenced YAML `truth_documents` blocks with explicit `path` and `kind`.
6. Add kind inference fallback by path.
7. Extend doc-structure checks to validate universal required sections plus kind-specific anchors.

Second slice:

1. Improve diagnostics for ambiguous inferred kinds.
2. Add documentation examples for API, UI, server, task runner, mobile, test, and infrastructure repos.
3. Add route-file repair guidance that converts older table or bullet truth-document lists into structured YAML blocks.

Third slice:

1. Use a future repository index or impact model to recommend likely doc kinds from changed code surfaces.
2. Use kind metadata when building Truth Sync or Truth Document context packs.
3. Validate that changed code surfaces match the routed doc kind when possible.

## Resolved Design Choices

1. `operations` and `test-behavior` should ship in the first slice.
2. Route files should use fenced YAML `truth_documents` blocks as the primary agent-friendly format.
3. User-facing examples and default current-truth roots should move to `docs/truth/**`.
4. `doc_type` should remain document class; route metadata `kind` and optional frontmatter `truth_kind` should carry the template and validation kind.

## Open Questions

1. Should exact section names remain mandatory forever, or should projects eventually configure section aliases?

## Proposed Decision

Decision: Truthmark should evolve from a single `feature-doc.md` template toward typed canonical truth doc templates. `behavior` should replace `feature` as the default leaf behavior concept, while `contract`, `architecture`, `workflow`, `operations`, and `test-behavior` provide better shapes for common repository truth surfaces.

Rationale: Repository type is too broad and too mixed to determine one template for a whole project. A routed truth doc kind is the right level of abstraction. It preserves Truthmark's route-first governance while making canonical docs usable for API repos, server repos, UI repos, mobile and desktop apps, task runners, test harnesses, infrastructure repos, and monorepos.
