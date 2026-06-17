---
name: truthmark-check
description: Use when the user asks to audit repository truth health, routing, ownership, or canonical docs. Not for normal lint/test/typecheck/code-review verification, finish-time Sync, or silently rewriting docs.
argument-hint: Optional area, doc path, or audit focus
user-invocable: true
truthmark-version: 2.3.0
---

# Truthmark Check

This Codex/OpenAI agents file is an adapter for the canonical Truthmark workflow package. It is not the workflow source of truth.

Canonical workflow files:
- .truthmark/agent/workflows/truthmark-check/SKILL.md
- .truthmark/agent/workflows/truthmark-check/support/procedure.md
- .truthmark/agent/workflows/truthmark-check/support/report-template.md
- .truthmark/agent/workflows/truthmark-check/support/subagents-and-leases.md

Read the canonical SKILL.md first, then read support files only as that skill directs. Preserve this adapter as host invocation and discovery guidance only.
