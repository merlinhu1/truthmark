---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-31
source_of_truth:
  - ../../../../src/agents/prompts.ts
  - ../../../../src/templates/workflow-surfaces.ts
  - ../../../../src/realize/report.ts
---

# Truth Realize Workflow

## Purpose

Truth Realize protects doc-first implementation by turning bounded, current canonical truth claims into functional code while keeping truth docs and routing read-only for the run.

## Scope

Truth Realize is doc-first and manual. Truth docs lead, code follows, and the agent may write functional code only.

## Triggers

- explicit user invocation through an installed host surface such as `/truthmark-realize`, `$truthmark-realize`, `/skill truthmark-realize`, or `/truthmark:realize`
- a user request that specifically asks to realize existing truth docs into code, not a generic code edit or documentation task

## Inputs

- source truth docs
- route metadata
- relevant implementation code and tests
- `.truthmark/config.yml`

## Execution Model

Truth Realize must read source truth docs, routing, and relevant code before writing functional code. It must not edit truth docs or truth routing.

## Steps

1. Read source truth docs, routing metadata, relevant implementation code, tests, and config.
2. Verify the source truth docs are bounded, current, routeable, and not mixed-owner or index-like.
3. Implement only the bounded current truth claims from the source docs.
4. Run relevant tests or report why they could not run.
5. Report changed functional-code files and verification.

Current behavior notes:

Truth Realize applies the ownership gate to source truth docs before writing code. If a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence, Truth Realize blocks before writing code and recommends Truth Structure or Truth Document.

When source truth is bounded and current, Truth Realize implements only the bounded current truth claims from the source docs and reports changed code files plus verification.

Completion reports include `Truth docs used`, `Code updated`, and `Verification`.

ContextPack may be used to collect bounded implementation context when available. It does not replace checkout inspection, does not grant write permission outside the workflow boundary, and cannot override source truth docs or current code. If ContextPack is unavailable, Truth Realize proceeds manually and reports that repository-intelligence artifacts were not generated.

## State, Retry, And Failure Behavior

Truth Realize blocks before writing code when source truth is broad, mixed-owner, stale, unrouteable, or conflicts with implementation evidence. It remains explicit and manual-only.

## Outputs

Truth Realize outputs functional-code changes and a verification report. It must not output truth-doc edits or route-file edits.

## Product Decisions

- Decision (2026-05-15): Truth Realize remains available only through explicit user invocation and is always generated for configured platforms instead of being gated by a config toggle.
- Decision (2026-05-15): Truth Realize must not implement from broad, mixed-owner, stale, or unrouteable truth docs.

## Rationale

Doc-first implementation is only reliable when the source truth has a bounded owner. Implementing ambiguous truth turns documentation drift into code behavior.

## Non-Goals

- no truth-doc edits, template rewrites, or truth-routing changes
- no automatic invocation as a finish gate for ordinary code tasks
- no implementation from broad, mixed-owner, stale, unrouteable, or implementation-conflicting source truth

## Maintenance Notes

Update this doc when Realize invocation, source-doc checks, write boundaries, or report shape changes.
