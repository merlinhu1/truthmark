---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-15
source_of_truth:
  - ../../../src/agents/prompts.ts
  - ../../../src/templates/codex-skills.ts
  - ../../../src/realize/report.ts
---

# Truth Realize Workflow

## Purpose

Truth Realize implements functional code from existing canonical truth docs.

## Scope

Truth Realize is doc-first and manual. Truth docs lead, code follows, and the agent may write functional code only.

## Triggers

- explicit user invocation through the installed host surface

## Inputs

- source truth docs
- route metadata
- relevant implementation code and tests
- `.truthmark/config.yml`

## Execution Model

Truth Realize must read source truth docs, routing, and relevant code before writing functional code. It must not edit truth docs or truth routing.

## Current Behavior

Truth Realize applies the ownership gate to source truth docs before writing code. If a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence, Truth Realize blocks before writing code and recommends Truth Structure or Truth Document.

When source truth is bounded and current, Truth Realize implements only the bounded current truth claims from the source docs and reports changed code files plus verification.

Completion reports include `Truth docs used`, `Code updated`, and `Verification`.

ContextPack may be used to collect bounded implementation context when available. It does not replace checkout inspection, does not grant write permission outside the workflow boundary, and cannot override source truth docs or current code. If ContextPack is unavailable, Truth Realize proceeds manually and reports that repository-intelligence artifacts were not generated.

## Product Decisions

- Decision (2026-05-15): Truth Realize remains available only through explicit user invocation and is always generated for configured platforms instead of being gated by a config toggle.
- Decision (2026-05-15): Truth Realize must not implement from broad, mixed-owner, stale, or unrouteable truth docs.

## Rationale

Doc-first implementation is only reliable when the source truth has a bounded owner. Implementing ambiguous truth turns documentation drift into code behavior.

## Non-Goals

- no truth-doc edits
- no routing edits
- no implementation from ambiguous source truth

## Maintenance Notes

Update this doc when Realize invocation, source-doc checks, write boundaries, or report shape changes.
