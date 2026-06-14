---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-31
---

# Workflow Content Generation

## Purpose

Content-generation prompt contracts shape draft truth-doc updates without becoming workflow authority.

## Scope

This document owns the source-internal prompt, schema, registry, and validation contracts under `src/generation/**` that draft truth-doc updates from bounded evidence context. Installed workflow surfaces own permissions, write boundaries, and final acceptance.

## Triggers

- prompt renderer, schema, registry, type, or validator changes under `src/generation/**`
- changes to draft-output semantics such as evidence IDs, relevant-doc path checks, blocked status rules, patch-path validation, or JSON parsing requirements
- workflow changes that alter how generated draft content is consumed or rejected

## Inputs

- JSON-backed evidence context
- structured output schemas
- workflow-authorized target docs

## Execution Model

Workflow prompts grant permissions and set write boundaries. Content-generation prompt contracts may render evidence context and validate structured draft output, but they do not grant permission to write files or replace direct checkout inspection.

Generated draft content remains advisory until a workflow-authorized agent applies it to canonical docs.

## Steps

1. Source workflow code gathers evidence context and target-doc boundaries.
2. Content-generation prompt contracts render that context for draft generation.
3. Structured output schemas validate draft shape where applicable.
4. A workflow-authorized agent decides whether and how to apply the draft to canonical docs under the installed workflow write boundary.

Current behavior notes:

Truthmark keeps content-generation contracts separate from installed workflow authority. Agents still inspect the checkout directly and use installed workflow surfaces for permissions, boundaries, and reporting.

## State, Retry, And Failure Behavior

Draft prompt output is advisory state only. If generation fails, schema validation fails, or evidence is insufficient, the owning workflow must fall back to direct checkout inspection and either write a supported truth-doc update or report why it blocked.

## Outputs

Generated draft content may become proposed truth-doc prose only after a workflow-authorized agent validates it against checkout evidence and applies it within allowed write paths. The prompt contracts themselves do not produce authoritative repository truth.

## Product Decisions

- Decision (2026-05-15): Content-generation prompt contracts are source-internal draft helpers, not workflow authority.

## Rationale

Separating draft generation from workflow authority prevents helper prompts from bypassing ownership gates or write boundaries.

## Non-Goals

- no permission grants, write leases, or workflow authority from draft prompts
- no replacement for direct checkout inspection, route ownership review, or final workflow acceptance
- no unrestricted patch paths outside repository-relative `docs/**` targets supplied by the bounded context

## Maintenance Notes

Update this doc when `src/generation/**` changes prompt contracts, schemas, validation, or runtime relationship to installed workflows.

## Source References

- ../../../../src/generation/\*\*
