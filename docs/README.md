---
status: active
doc_type: index
last_reviewed: 2026-08-23
source_of_truth:
  - docs/repo/ai/repo-rules.md
  - ../.truthmark/config.yml
---

# Truthmark Docs Index

## Purpose

`docs/` is Truthmark's repository documentation tree. It keeps repository-wide agent rules, reusable standards, current architecture, current lane-separated truth docs, and non-canonical research notes separate from onboarding copy.

The first thing to establish about any doc here is its **scope**:

- **repo-local** (`docs/repo/**`): policy for developing Truthmark itself. It is not a downstream scaffold, generated surface, or required artifact for repositories that install Truthmark. Nothing under `docs/repo/` ships, and `src/` never references it.
- **product surface** (everything else under `docs/`): documentation of the product Truthmark installs into other repositories. `docs/truthmark/**` is this repository dogfooding the same truth schema that `truthmark init` scaffolds downstream.

Do not cite a repo-local doc as evidence about the product's behavior, schema, or installed surfaces. Every doc under `docs/repo/` declares `scope: repo-local` in frontmatter, and `tests/doc-scope.test.ts` enforces the boundary.

`AGENTS.md` is the agent entry point, but it delegates repository-wide rules to [docs/repo/ai/repo-rules.md](repo/ai/repo-rules.md). [README.md](../README.md) remains the human onboarding and product entry point. [docs/user-guide.md](user-guide.md) owns detailed human-facing command, workflow, and configuration guidance. `.truthmark/config.yml` defines the committed hierarchy contract.

## Scope

This doc defines the current structure, navigation map, and maintenance expectations of Truthmark's canonical `docs/` tree.

## Authority Source

Repository-wide conflict order and completion policy live in [docs/repo/ai/repo-rules.md](repo/ai/repo-rules.md). Use this index for navigation and document-class guidance; it does not restate the full authority hierarchy.

[README.md](../README.md) may help with onboarding and positioning, but it must not override current-state docs or repository-wide agent rules.

## Scope Split

### Repo-local docs (`scope: repo-local`, ships to nobody)

- `docs/repo/ai/` for repository rules and agent onboarding
- `docs/repo/standards/` for reusable constraints and completion rules
- `docs/repo/architecture/` for repository-specific architecture guardrails
- `docs/repo/research/` for non-canonical research evidence, evaluations, and comparisons

### Product-surface docs

- `docs/truthmark/product/` for product capability promises, boundaries, and acceptance criteria
- `docs/truthmark/engineering/` for current implementation behavior, architecture, contracts, workflows, and operations
- `docs/truthmark/engineering/contracts/` for stable contracts the CLI exposes
- `docs/truthmark/routes/` for routing metadata
- `docs/truthmark/templates/` for editable scaffold templates used to create new docs
- [README.md](../README.md) for onboarding and positioning
- [docs/user-guide.md](user-guide.md) for detailed usage, command, workflow, configuration, routing, Portal, and example guidance

## Directory Map

| Path                          | Type              | Scope           | Purpose                                                                               |
| ----------------------------- | ----------------- | --------------- | ------------------------------------------------------------------------------------- |
| `docs/repo/ai/`               | agent rules       | repo-local      | Repository-wide rules and fast onboarding for developing Truthmark itself             |
| `docs/repo/standards/`        | standard          | repo-local      | Reusable constraints, verification rules, completion gates                            |
| `docs/repo/architecture/`     | architecture      | repo-local      | Repository-specific architecture guardrails                                           |
| `docs/repo/research/`         | research          | repo-local      | Non-canonical research evidence, evaluations, and comparisons                         |
| `docs/truthmark/product/`     | product truth     | product surface | Product capability promises, boundaries, decisions, and acceptance criteria           |
| `docs/truthmark/engineering/` | engineering truth | product surface | Current implementation behavior for init, check, contracts, workflows, and operations |
| `docs/truthmark/routes/`      | routing           | product surface | Truth-routing metadata such as `areas.md` and `areas/**/*.md`                         |
| `docs/truthmark/templates/`   | template          | product surface | Editable templates for scaffolded docs; templates are not Truth Sync targets          |
| `docs/user-guide.md`          | guide             | product surface | Detailed usage guide kept out of the root README so onboarding stays concise          |

`docs/truthmark/**` carries `truth_kind` (the schema `truthmark init` scaffolds downstream); `docs/repo/**` carries `doc_type` and never `truth_kind`.

## Frontmatter Policy

Canonical docs should include frontmatter and keep these fields current:

- `status`
- `doc_type`
- `last_reviewed`
- `source_of_truth`

Every doc under `docs/repo/` must also declare `scope: repo-local`.

## Update Rules

- When repository-wide agent policy changes, update [docs/repo/ai/repo-rules.md](repo/ai/repo-rules.md).
- When code-to-doc routing changes, update [docs/truthmark/routes/areas.md](truthmark/routes/areas.md) in the same change.
- When package versions or release/version policy change, apply [docs/repo/standards/versioning.md](repo/standards/versioning.md) before accepting the version.
- When PR or release source text is needed, write a `changes/` note using [docs/repo/standards/change-notes.md](repo/standards/change-notes.md).
- When `truthmark init` or scaffolded files change, update the relevant truth or architecture doc, not only [README.md](../README.md).
- When `truthmark check` changes what it validates or how it reports diagnostics, update both the current truth doc and the contract doc.
- When major product, onboarding, install, command, positioning, or workflow behavior changes, review the root [README.md](../README.md) and update it if the human entry point would otherwise be stale.
- Keep active docs current-state focused; promote necessary accepted rationale into the owning decision section and rely on Git history for superseded plans.
- When current behavior changes for architecture, contracts, or lane-separated truth docs, update the owning current-behavior and Product Decisions or Engineering Decisions sections in the same change.
- Do not keep parallel documentation trees for the same subject.

## Important Truthmark-Specific Caveat

`truthmark init` is the only setup command. In a TTY it offers a numbered zero-or-more platform selection; repeatable `--platform <id>` values provide noninteractive selection, while `--json` never prompts. A first noninteractive run without platform flags remains host-neutral. Init creates or updates the version-2 `.truthmark/config.yml`, then writes a root route index plus one child route file under the configured routing root.

## Recommended Reading Order

### For humans

1. [README.md](../README.md)
2. [docs/user-guide.md](user-guide.md), when command or workflow detail is needed
3. [.truthmark/config.yml](../.truthmark/config.yml)
4. [docs/repo/ai/repo-rules.md](repo/ai/repo-rules.md)
5. [docs/truthmark/engineering/architecture/overview.md](truthmark/engineering/architecture/overview.md)
6. the relevant product, engineering, or standard doc for the area being changed

### For agents

1. [docs/repo/ai/repo-rules.md](repo/ai/repo-rules.md)
2. [docs/repo/ai/agent-onboarding.md](repo/ai/agent-onboarding.md), when routing is unclear or cross-area
3. [docs/truthmark/routes/areas.md](truthmark/routes/areas.md), when mapping code to canonical truth
4. [docs/truthmark/engineering/architecture/overview.md](truthmark/engineering/architecture/overview.md), when changing module boundaries
5. the relevant standard, product truth, and engineering truth docs for the task

Use the route files under [docs/truthmark/routes/](truthmark/routes/) when designing areas for larger API, frontend, infrastructure, or monorepo repositories.

## Maintenance Principle

The canonical tree should stay small, explicit, and current. Git history provides traceability for superseded context; active docs keep current behavior in the owning current-state section and accepted rationale in the owning decision section.

## Product Decisions

- Decision (2026-05-15): The docs index owns navigation and document-class guidance for the canonical tree, while [docs/repo/ai/repo-rules.md](repo/ai/repo-rules.md) owns repository-wide authority order and completion policy.
- Decision (2026-06-20): The root README is the concise human storefront. Detailed human-facing command, workflow, configuration, routing, Portal, and example material belongs in [docs/user-guide.md](user-guide.md).
- Decision (2026-08-23): Repo-local policy lives under `docs/repo/` so the repo-local versus product-surface boundary is visible in every path, not only in prose. Agents reason from paths constantly and read prose once, so the boundary is encoded in the directory name, in `scope: repo-local` frontmatter, and in `tests/doc-scope.test.ts`. The enforcing test is repo-local because `truthmark check` runs in downstream repositories, which do not have this boundary.

## Rationale

Keeping the docs index focused on navigation avoids loading duplicated authority prose while still giving agents and maintainers one stable place to resolve where current truth should live before they edit deeper canonical docs.

Keeping the root README concise reduces evaluator friction while preserving detailed operational guidance in a linked guide.
