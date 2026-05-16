---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-16
source_of_truth:
  - ../../../src/agents/truth-preview.ts
  - ../../../src/agents/workflow-manifest.ts
  - ../../../src/templates/workflow-surfaces.ts
  - ../../../src/templates/generated-surfaces.ts
---

# Truth Preview

## Scope

Truth Preview previews likely Truthmark routing before edits.

It is an explicit read-only planning surface. It is intended, not authorized, and hands off to the selected workflow after user approval.

## Triggers

- explicit user invocation through the installed host surface
- questions about likely workflow routing, route ownership, target files, write classes, or subagent use before edits

## Execution Model

Truth Preview reads only the context needed to preview ownership:

- `.truthmark/config.yml`
- root and child route files
- relevant canonical docs
- relevant implementation files

Truth Preview reports the likely Truthmark workflow, why that workflow was selected, likely route owner, expected write classes, expected target files, suggested subagent use, blocking ambiguity, and handoff.

Truth Preview may suggest the read-only route auditor when bounded verifier input would reduce context or clarify route ownership. It does not use write workers and does not issue write leases.

Truth Preview must not edit files, create truth docs, update routing, run Truth Sync automatically, replace Truth Check, claim final correctness, issue write leases, or mutate code.

Completed reports include `Requested outcome`, `Likely workflow`, `Why this workflow`, `Likely route owner`, `Expected write classes`, `Expected target files`, `Suggested subagent use`, `Blocking ambiguity`, and `Handoff`.

## Product Decisions

- Decision (2026-05-16): Truth Preview is a first-class explicit workflow because routing transparency before mutation can prevent agents from loading or acting through the wrong heavier workflow.
- Decision (2026-05-16): Truth Preview is not automatic. Its value is a cheap selector for ambiguous routing or write-boundary questions, not a required gate before normal edits.
- Decision (2026-05-16): Truth Preview reports intended next steps only; it does not authorize writes or validate final correctness.

## Rationale

Preview improves agent performance only when it prevents unnecessary workflow loading, broad context gathering, or wrong-owner edits. Making it automatic would add ceremony and context to straightforward tasks.

## Non-Goals

- no automatic invocation
- no validation gate
- no Truth Check replacement
- no file mutation

## Maintenance Notes

Update this doc when Preview triggers, read boundaries, report shape, generated surfaces, or handoff behavior change.
