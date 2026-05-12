---
status: active
doc_type: standard
last_reviewed: 2026-05-06
source_of_truth:
  - ../README.md
  - documentation-governance.md
---

# Default Principles

## Scope

This standard defines the reusable default principles Truthmark can safely scaffold into repositories that adopt branch-local truth workflows.

These are bootstrap defaults, not immutable law. Repositories should replace or extend them once they have stable project-specific standards.

## Default Versus Project Standards

- Truthmark defaults are a starting point for repositories that do not yet have explicit standards.
- Repository-specific standards are preferred once a project has stable architecture, product rules, or verification needs.
- Local standards should be explicit and committed in the repository rather than left in chat, memory, or team habit.
- When a project defines its own standards clearly, those standards should take precedence over generic Truthmark defaults.

## Reusable Default Principles

### Authority And Context

- Authority order should be explicit.
- Committed repository artifacts are the durable source of truth.
- External memory and off-repo discussion are non-authoritative unless the user provides them in the current session or commits them into the repo.
- Agent instruction files install workflow behavior by default; they do not become product truth unless a project opts into that explicitly.

### Documentation Governance

- Each document should have one primary responsibility.
- Each class of fact should have one canonical source.
- Current implementation, reusable standards, and future proposals should be stored separately.
- Historical planning artifacts should stay historical until they are rewritten into the current canonical tree.
- Do not maintain parallel documentation trees for the same subject.
- The root README may remain an onboarding or product-facing entry point, but it should not silently compete with canonical engineering docs.

See [docs/standards/documentation-governance.md](documentation-governance.md) for the governance baseline.

### Verification Discipline

- Verification commands should have one canonical source.
- Build, lint, and typecheck are necessary but not sufficient for behavior changes.
- New behavior and bug fixes should add or update relevant automated coverage when reasonably testable.
- Skipped verification should be stated explicitly with a reason.
- Documentation-only changes do not require code-level verification unless commands or executable examples changed.

### Completion Discipline

- Repositories should define a completion gate or pre-completion checklist.
- If a normally expected test or check is skipped, the reason should be stated explicitly.
- Behavior changes and documentation changes should land together.
- Scope should stay focused; unrelated refactors should not be mixed into the requested work.
- Repositories should avoid speculative compatibility layers, duplicate contracts, shadow behaviors, or parallel route surfaces unless an explicit migration requirement exists.

### Harness Principles

- Important project facts should be visible in committed repository artifacts.
- If an agent repeatedly misses an important fact, the repository probably needs a clearer maintained document for that fact.
- Explicit constraints, routing, and feedback loops are more reliable than vague prompt instructions.
- Weak routing and weak feedback produce weak truth maintenance.
- AI-native structure repair should handle broad or overloaded documentation topology before agents create more generic truth docs.
- Installed repository workflows should remain usable from committed files even when the Truthmark CLI is unavailable.

## What Truthmark Can Reuse Safely

Truthmark can safely reuse or adapt defaults in these areas:

- documentation governance
- authority order and context-boundary rules
- verification and testing discipline
- pre-completion and explicit skip-reason discipline
- harness and repository-visible feedback principles

## What Truthmark Should Not Treat As Universal Defaults

Truthmark should not impose repository-specific rules such as:

- language- or framework-specific dependency layering models
- stack-specific localization rules
- repository-specific route, permission, or contract conventions
- product-specific feature invariants
- toolchain-specific command versions unless the project config sets them

Truthmark can provide places for those rules to live, but the content should belong to the project.

## Recommended Default Scaffold

When a repository has no explicit standards yet, a small default baseline is reasonable:

- a documentation governance standard
- authority and routing entrypoints such as `.truthmark/config.yml` and `docs/truthmark/areas.md`
- a verification standard with canonical commands and skip rules
- a completion checklist or equivalent completion gate

Truthmark can bootstrap only part of that baseline automatically today. Repositories may need to add richer standards after initialization.

Projects may keep that baseline, replace it, or extend it with their own standards.

## Override Model

- Users are allowed to write their own standards.
- In practice, writing project-specific standards is often better than relying forever on generic defaults.
- Truthmark should make those standards easy to add, route, and keep authoritative.
- Default principles are meant to reduce ambiguity at startup, not to lock a project into Truthmark-authored policy forever.
