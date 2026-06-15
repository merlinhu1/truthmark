---
status: active
doc_type: architecture
last_reviewed: 2026-06-12
source_of_truth:
  - ../../README.md
  - ../truthmark/truth/architecture/overview.md
  - ../truthmark/truth/workflows/overview.md
  - ../truthmark/truth/repository/workflow-state.md
---

# Truthmark Product Boundary

**Audience:** Truthmark maintainers and agents changing this repository.
**Portability:** repo-local only; not installed into downstream projects.

## Purpose

This is the product-boundary guardrail for Truthmark designs and plans.

This document governs the Truthmark repository itself. It is not a scaffolded Truthmark artifact and must not be installed into downstream repositories as their product boundary.

Downstream repositories may define their own product-boundary docs if useful, but Truthmark's installed workflows must not impose this repository's product strategy, non-goals, or governance doctrine on user projects.

Read it before proposing changes to product shape, runtime model, persistence, dependencies, workflow authority, generated surfaces, command surface, or agent write boundaries.

## North Star

**Your agents write code. Truthmark maintains the human-facing, Git-reviewable documentation.**

Truthmark keeps repository documentation aligned with agent-made code changes so humans can review the resulting documentation changes in Git.

Canonical truth documents are human-facing Git-review artifacts. Human maintainers are the primary reviewers; agents write and maintain truth docs, but agents are not the only consumers.

Truth-doc structure, wording, and style must be friendly for humans to read and understand.

Human-friendly truth docs:

- Make the audience and purpose clear near the top.
- Separate current behavior from rationale, decisions, operations, contracts, and future or non-goals.
- Use scannable headings and bounded sections.
- Use plain, concrete, present-tense wording.
- Expand or link terms and acronyms that are not obvious to a maintainer.
- Trace claims to source evidence without forcing readers to inspect giant machine payloads.
- Keep examples, commands, and paths accurate, minimal, and reviewable.
- Keep prose concise enough for Git diff review while complete enough to preserve decisions and rationale.

## In Scope

Truthmark is an agent-native, host-native, local-first documentation workflow layer for software repositories.

Truthmark owns:

- Git-tracked repository documentation and routing metadata
- host-native agent workflow surfaces such as skills, prompts, commands, managed instruction blocks, and subagents
- branch-local documentation checks, workflow indexes, impact summaries, context packs, and workflow state derived from the active checkout
- write boundaries for read-only, documentation-write, route-write, code-write, and presentation-write workflows
- optional CLI/package helpers that improve validation or setup without becoming required for normal agent workflow execution

Truthmark workflows must remain operational from repository files alone. A design that blocks the agent workflow because a package, CLI, daemon, server, IDE plugin, or external service is missing is outside the product boundary.

## Out Of Scope

Truthmark must not become:

- a hosted service
- a daemon or workflow orchestrator
- a database-backed runtime
- a hidden memory or session-persistence layer
- an IDE plugin, MCP server, or CLI package as the product center of gravity
- a requirements-management, PRD, proposal, or spec lifecycle platform
- a documentation hosting platform
- a default CI, PR approval, or merge-enforcement product
- an arbitrary workflow DAG engine

Optional integrations are acceptable only when they preserve host-native agent workflows, Git-tracked documentation, and a no-blockade fallback path.

## Design Guardrails

1. **Repository files are the authority.** The active checkout and Git-tracked docs outrank chat history, caches, generated summaries, and off-repo memory.
2. **Agent workflows are host-native.** Truthmark should meet agents inside their existing hosts through generated skills, prompts, commands, instruction blocks, and subagents.
3. **CLI/package helpers are optional.** They may configure, validate, index, or refresh files, but missing helpers must not block the documented agent workflow.
4. **Generated surfaces are product output, not source authority.** Update templates, schemas, manifests, and renderers first; review generated diffs.
5. **Write boundaries fail closed.** Missing config, ambiguous ownership, missing comparison base, or stale routing must block or narrow writes, never widen them.
6. **Human review stays central.** Truthmark produces reviewable documentation changes, not silent approval or merge authority.
7. **Local-first simplicity wins.** Add dependencies, services, or runtime layers only when they preserve the no-blockade repository-file workflow.
8. **Truth docs stay human-friendly.** Truth docs must be structured and written for maintainers to review, scan, and understand before they are optimized for agent or machine consumption.

## Required Product Boundary Check

Every new design or implementation plan must answer:

- Which part of the North Star improves?
- Which in-scope surface changes?
- What adjacent out-of-scope product shape could this drift toward?
- Does it introduce a package, CLI, daemon, database, hosted service, IDE plugin, MCP server, memory layer, lifecycle artifact, or workflow engine as a requirement?
- If a helper or integration is unavailable, how does the agent workflow continue from repository files alone?
- What are the allowed writes, forbidden writes, and fail-closed states?
- Which docs or tests prevent future boundary drift?

A plan that cannot answer these questions is not ready for implementation.

## Product Decisions

- Decision (2026-06-12): Product-boundary checks live in architecture because they govern runtime topology, persistence, dependencies, workflow authority, generated surfaces, and write boundaries.
- Decision (2026-06-12): Repository rules cite this document so agents must check product boundaries before generating new designs or plans.
- Decision (2026-06-12): Truthmark workflows must stay 100% operational from repository files and host-native agent surfaces; missing packages, CLIs, daemons, services, or plugins must not block normal workflow execution.
- Decision (2026-06-12): Human-facing readability is part of the Truthmark product boundary for canonical truth documents.

## Maintenance Notes

Update this document when Truthmark's North Star, runtime model, persistence model, generated-surface model, workflow model, command boundary, or non-goals change.
