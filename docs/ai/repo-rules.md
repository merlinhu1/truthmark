---
status: active
doc_type: agent-rules
last_reviewed: 2026-05-09
source_of_truth:
  - ../../AGENTS.md
  - ../README.md
  - ../../TRUTHMARK.md
---

# Repository Rules

## Scope

This document defines repository-wide agent rules, authority order, and completion requirements for Truthmark.

Detailed standards, current architecture, contracts, and current feature behavior live under [docs/](../README.md).

## Authority and Context

### Authority Order

When sources conflict, authority descends in this order:

1. this file
2. [TRUTHMARK.md](../../TRUTHMARK.md)
3. [docs/truthmark/areas.md](../truthmark/areas.md)
4. `docs/standards/**/*.md`
5. `docs/architecture/**/*.md`
6. `docs/features/**/*.md`

[README.md](../../README.md) may help with onboarding and positioning context, but it does not override the canonical current-state docs above.

### Context Boundaries

Authoritative context is limited to committed repository artifacts plus user-provided session context:

- code
- docs
- tests
- config
- generated artifacts that are checked into the repo intentionally

Treat chat history, external notes, and off-repo memories as non-authoritative unless the user provides them in the current session or the information has been committed into the repository.

### Code-vs-Docs Rule

Code is the current implementation.

If code and docs conflict:

1. inspect the relevant code path
2. determine whether the code is intentional or the doc is stale
3. update the stale doc when behavior is intentional
4. only change code to match docs when the user explicitly wants that outcome or the docs clearly reflect the intended requirement

## Project Intent

Truthmark is an agent-native repository truth protocol packaged with a local-first Node and TypeScript installer and validator.

Current product boundaries:

- user-facing CLI commands are `config`, `init`, and `check`
- installed `SKILL.md` files and the managed `AGENTS.md` block are the runtime for truth workflows
- Truth Structure, Truth Sync, Truth Realize, and Truth Check are installed workflow surfaces, not top-level CLI commands
- `truthmark config` writes the committed hierarchy contract before workflow installation
- `.truthmark/config.yml` `platforms` controls which agent harness surfaces `truthmark init` installs or refreshes
- agents inspect the checkout directly and make semantic judgments about area structure, routing, sync, realization, and truth health
- `truthmark init` installs or refreshes workflow surfaces
- `truthmark check` validates repository truth artifacts after agent work
- the tool operates on the active Git worktree and does not require a daemon, database, or remote service
- V1 does not ship an MCP server

## Non-Negotiable Rules

1. **Branch-local Markdown is canonical**
   - The current checkout is the truth boundary.

2. **Keep current truth separate from history**
   - Current behavior belongs in configured canonical roots such as `docs/architecture/**` and `docs/features/**`.
   - Historical planning artifacts do not become current truth automatically; rewrite current decisions into the canonical docs they govern.

3. **Keep active decisions in canonical docs**
   - Active decisions and rationale belong in the same canonical doc as the behavior they govern.
   - Short inline decision dates are allowed; do not create separate timestamped decision-ticket folders for current decisions.

4. **The managed Truthmark block stays managed**
   - The block in [AGENTS.md](../../AGENTS.md) between `<!-- truthmark:start -->` and `<!-- truthmark:end -->` is a generated surface.
   - Manual repository-specific guidance belongs outside that block.

5. **Document actual V1 behavior only**
   - Do not add speculative CLI commands, hosted services, or product capabilities that are not implemented.

6. **Areas routing must stay explicit**
   - If the canonical docs for a code area change, update [docs/truthmark/areas.md](../truthmark/areas.md) in the same change.

7. **Docs change with behavior**
   - If a behavior, contract, workflow, or completion rule changes, update the nearest canonical doc in the same working change.
   - For major product, onboarding, install, command, positioning, or workflow changes, review the root [README.md](../../README.md) in the same working change and update stale user-facing claims, examples, or command sequences.
   - When the root README changes materially, update the localized README variants in the same working change or explicitly confirm why they remain intentionally different.

8. **Keep onboarding honest**
   - The root README is not the canonical behavior spec, but it is the human entry point. It must not lag behind major product changes that affect how people understand, install, or use Truthmark.

9. **Prefer established module boundaries**
   - Follow the current directory responsibilities before introducing new abstractions or duplicate surfaces.

10. **Testing policy is centralized**
   - Follow [docs/standards/testing-and-verification.md](../standards/testing-and-verification.md) for commands.

11. **Completion policy is centralized**
   - Use [docs/standards/pre-completion-checklist.md](../standards/pre-completion-checklist.md) as the completion gate.

12. **Scope changes narrowly**
   - Do not mix unrelated refactors or speculative cleanup into a focused task.

## Documentation Routing

Start here when working in an unfamiliar area:

- [docs/README.md](../README.md)
- [docs/architecture/overview.md](../architecture/overview.md)
- [docs/architecture/module-map.md](../architecture/module-map.md)
- [docs/features/contracts.md](../features/contracts.md)

### CLI or scaffold changes

Read:

1. [docs/features/init-and-scaffold.md](../features/init-and-scaffold.md)
2. [docs/features/contracts.md](../features/contracts.md)
3. [docs/standards/maintaining-repository-truth.md](../standards/maintaining-repository-truth.md) when the change affects docs placement or AGENTS management

Run `truthmark config` before `truthmark init` in new repositories so teams can review the hierarchy before generated agent behavior is installed.

### Check, routing, or validation changes

Read:

1. [docs/features/check-diagnostics.md](../features/check-diagnostics.md)
2. [docs/standards/documentation-governance.md](../standards/documentation-governance.md)
3. [docs/features/contracts.md](../features/contracts.md)

### Installed workflow or reporting changes

Read:

1. [TRUTHMARK.md](../../TRUTHMARK.md)
2. [docs/features/installed-workflows.md](../features/installed-workflows.md)
3. [docs/standards/maintaining-repository-truth.md](../standards/maintaining-repository-truth.md) if routing or canonical docs placement changes

### Documentation-only organization changes

Read:

1. [docs/README.md](../README.md)
2. [docs/standards/documentation-governance.md](../standards/documentation-governance.md)
3. [docs/standards/maintaining-repository-truth.md](../standards/maintaining-repository-truth.md)

## Guardrails

### Anti-drift rules

- do not create a shadow documentation tree
- do not treat historical plans as current implementation docs
- do not keep editing the managed Truthmark block manually unless the template behavior itself is changing
- do not broaden current-state docs with draft or aspirational behavior
- do not leave doc routing ambiguous when code moves or new code surfaces are added
- do not finish a major product or workflow change without checking whether the root README still tells the truth

### Divergence rule

When several files follow an established pattern and one diverges, assume the diverging file needs justification before copying it.

### When blocked

Re-read the relevant canonical docs, inspect the owning implementation, and then change approach. If the blocker remains, surface the blocker explicitly instead of guessing.

## Maintenance

Update this file only when repository-wide agent rules change.

When updating it:

- keep it concise and policy-focused
- move detailed procedures into standards or guides
- keep current feature behavior in `docs/features`
- update `last_reviewed`
