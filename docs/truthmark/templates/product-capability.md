---
status: active
truth_kind: product-capability
last_reviewed: 2026-06-14
realized_by:
  - { { engineering_realization } }
---

# {{title}}

<!--
Do not make product docs a summary of engineering docs. Do not make engineering docs a detailed version of product docs. Product truth says what must be true and why. Engineering truth says how the repository currently realizes it.
Product docs may cite code directly when code proves current product behavior, but keep implementation flow, renderer internals, CLI envelopes, and generated file inventories in engineering truth.
-->

## Capability Promise

<!--
State the single user-visible capability and what must be true for users or stakeholders.
Do not describe implementation mechanics here.
-->

{{capability_promise}}

## Users And Value

<!--
Describe who benefits from the capability and the durable value it protects.
Tie claims to repository evidence, explicit user instruction, or current behavior.
-->

{{users_and_value}}

## Capability Scope

<!--
Define what this capability includes and excludes, including product boundary constraints and adjacent systems.
Capture important scope limits, ownership boundaries, and non-goal pointers here; keep technical contracts in engineering truth.
-->

{{capability_scope}}

## Current Product Behavior

<!--
Describe current implemented user-visible behavior in present tense.
Code files may appear in Source References when they directly prove current behavior.
-->

{{current_product_behavior}}

## Acceptance Criteria

<!--
List observable criteria that show the capability promise is currently satisfied.
Include criteria that review whether the capability stays within its stated scope and boundary.
Use criteria that can be reviewed from repository evidence or explicit product instruction.
-->

{{acceptance_criteria}}

## Product Decisions

<!--
Keep active decisions only, dated inline when added or changed.
Capture decisions that shape behavior, interfaces, boundaries, compatibility, risk acceptance, or migration constraints.
Replace stale decisions instead of appending historical logs.
-->

{{decision}}

## Engineering Realization Links

<!--
Link engineering truth that realizes this product truth using realized_by frontmatter.
Do not summarize those engineering docs.
-->

{{engineering_realization_links}}

## Non-Goals

<!--
Name adjacent behavior, responsibilities, interfaces, or future expansions this doc intentionally does not own.
Use this section to prevent scope creep and duplicate truth ownership.
-->

{{non_goals}}

## Source References

<!--
List source files, tests, configs, generated templates, route files, or product instructions that support current claims.
-->

{{source_references}}
