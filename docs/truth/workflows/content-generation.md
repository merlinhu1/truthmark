---
status: active
doc_type: behavior
truth_kind: workflow
last_reviewed: 2026-05-15
source_of_truth:
  - ../../../src/generation/**
---

# Workflow Content Generation

## Purpose

Content-generation prompt contracts shape draft truth-doc updates without becoming workflow authority.

## Scope

This document owns source-internal draft prompt contracts used by Truthmark workflow code.

## Triggers

- renderer or schema changes under `src/generation/**`

## Inputs

- JSON-backed evidence context
- structured output schemas
- workflow-authorized target docs

## Execution Model

Workflow prompts grant permissions and set write boundaries. Content-generation prompt contracts may render evidence context and validate structured draft output, but they do not grant permission to write files or replace direct checkout inspection.

Generated draft content remains advisory until a workflow-authorized agent applies it to canonical docs.

## Current Behavior

Truthmark keeps content-generation contracts separate from installed workflow authority. Agents still inspect the checkout directly and use installed workflow surfaces for permissions, boundaries, and reporting.

## Product Decisions

- Decision (2026-05-15): Content-generation prompt contracts are source-internal draft helpers, not workflow authority.

## Rationale

Separating draft generation from workflow authority prevents helper prompts from bypassing ownership gates or write boundaries.

## Non-Goals

- no permission grants from draft prompts
- no replacement for direct checkout inspection

## Maintenance Notes

Update this doc when `src/generation/**` changes prompt contracts, schemas, validation, or runtime relationship to installed workflows.
