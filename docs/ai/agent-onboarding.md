---
status: active
doc_type: agent-guide
last_reviewed: 2026-05-13
source_of_truth:
  - repo-rules.md
  - ../README.md
---

# Agent Onboarding

## Purpose

Fast routing for agents. Repository-wide rules live in [docs/ai/repo-rules.md](repo-rules.md).

## Startup

1. Read your agent entry point, usually [AGENTS.md](../../AGENTS.md).
2. Read [docs/README.md](../README.md).
3. Identify whether the task changes scaffold behavior, diagnostics, installed workflows, or only documentation placement.
4. Read only the docs that govern that slice before editing code or canonical docs.

## Change Routing

### CLI or scaffold behavior

Read:

1. [docs/architecture/overview.md](../architecture/overview.md)
2. [docs/architecture/module-map.md](../architecture/module-map.md)
3. [docs/truth/init-and-scaffold.md](../truth/init-and-scaffold.md)
4. [docs/truth/contracts.md](../truth/contracts.md)

### Diagnostics, routing, or containment checks

Read:

1. [docs/architecture/module-map.md](../architecture/module-map.md)
2. [docs/truth/check-diagnostics.md](../truth/check-diagnostics.md)
3. [docs/standards/documentation-governance.md](../standards/documentation-governance.md)
4. [docs/truth/contracts.md](../truth/contracts.md)

### Installed workflow, prompt, or reporting changes

Read:

1. [.truthmark/config.yml](../../.truthmark/config.yml)
2. [docs/truth/installed-workflows.md](../truth/installed-workflows.md)
3. [docs/standards/maintaining-repository-truth.md](../standards/maintaining-repository-truth.md)
4. [docs/ai/agent-skills-workflow-review.md](agent-skills-workflow-review.md)

### Documentation structure or policy changes

Read:

1. [docs/README.md](../README.md)
2. [docs/standards/documentation-governance.md](../standards/documentation-governance.md)
3. [docs/standards/maintaining-repository-truth.md](../standards/maintaining-repository-truth.md)

## Agent Rules

Do:

- treat [docs/ai/repo-rules.md](repo-rules.md) as the primary authority for repository-wide rules
- route code changes to the nearest maintained architecture, contract, and truth docs
- update [docs/truthmark/areas.md](../truthmark/areas.md) when canonical routing changes
- preserve the generated Truthmark block in [AGENTS.md](../../AGENTS.md) unless the template behavior itself is changing
- keep non-canonical planning notes separate from current-state docs

Do not:

- treat [README.md](../../README.md) as the final source of behavioral truth
- invent unimplemented commands such as a current `truthmark realize` CLI command
- leave routing broad when you can point to a smaller maintained truth surface
- rewrite functional code during documentation-only tasks

## Verification

Use [docs/standards/testing-and-verification.md](../standards/testing-and-verification.md) for commands and [docs/standards/pre-completion-checklist.md](../standards/pre-completion-checklist.md) as the completion gate.
