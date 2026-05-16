# Truthmark

**Your agents write code. Truthmark makes their context reviewable in Git.**

English | [Deutsch](README.de.md) | [中文](README.zh.md) | [Español](README.es.md) | [Русский](README.ru.md)

![Truthmark banner](docs/assets/truthmark-banner.png)

AI coding agents can change a repository faster than humans can keep its context aligned.

Truthmark fixes the part that usually breaks after the code is written: the repository truth.

It installs a Git-native, branch-scoped workflow layer that helps AI coding agents update the right docs, respect ownership boundaries, and leave humans with normal diffs they can review.

No hosted service.

No database.

No hidden memory layer.

No extra server to operate.

Just repository truth that moves with the branch.

## The problem

AI coding agents are good at producing code. That creates a new failure mode.

The implementation changes, but the repository story drifts:

- behavior lives in chat history
- architecture docs fall behind
- product decisions disappear after handoff
- reviewers see code diffs without the related truth diffs
- branches quietly develop different versions of “what is true”
- each agent session has to rediscover context from scratch

Truthmark turns that fragile context into committed repository infrastructure.

Instead of relying on every human and every agent to remember the right documentation habit, Truthmark installs the habit into the repository.

## The promise

When an agent changes functional code, the work should not end with only a code diff.

The normal Truthmark path is:

```text
agent changes functional code
relevant tests run
Truth Sync checks mapped truth docs
truth docs update when needed
human reviews code diff + truth diff
commit or hand off
```

That is the core value: **AI work becomes easier to trust because the repository stays legible.**

## Two surfaces, one truth system

Truthmark is not just a CLI.

It has two distinct surfaces, and the distinction matters.

### 1. Human-facing CLI

The CLI is for maintainers, reviewers, and automation.

Use it to configure a repository, install or refresh workflow files, validate truth artifacts, and generate optional review context.

```bash
truthmark config
truthmark init
truthmark check
```

The CLI prepares and validates the repository environment.

It is not the AI workflow runtime.

### 2. AI-facing workflow surfaces

The AI-facing surfaces are for coding agents.

Truthmark installs host-native skills, prompts, commands, managed instruction blocks, and supported subagent surfaces so AI agents can follow repository-specific truth workflows inside their normal coding tools.

Examples:

```text
/truthmark-sync
/truthmark-document
/truthmark-structure
/truthmark-realize
/truthmark-preview
/truthmark-check
```

These look like commands because agent hosts expose workflows through slash commands, prompts, skills, or project commands.

They are not shell commands.

They are AI-facing workflow entrypoints.

The split is the product:

```text
humans own the repository contract
Truthmark installs the contract into the repo
agents operate inside that contract
truth updates appear as Git diffs
humans review the result
```

## Quick start

### Requirements

- Node.js `>=20`
- npm
- a Git repository

### Install Truthmark

Run this inside the repository you want to initialize:

```bash
cd /path/to/your-repo
npm install -g truthmark
```

### Create the repository truth contract

```bash
truthmark config
```

This creates:

```text
.truthmark/config.yml
```

Review this file before continuing. It defines the committed hierarchy contract for the repository.

### Install the workflow surfaces

```bash
truthmark init
```

This installs or refreshes:

- route files
- truth-doc scaffolding
- managed instruction blocks
- AI-facing workflow surfaces for configured platforms

### Validate the setup

```bash
truthmark check
```

Then review the generated files before committing.

Typical files include:

```text
.truthmark/config.yml
docs/truthmark/areas.md
docs/truthmark/areas/repository.md
docs/templates/
docs/truth/
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.codex/
.claude/
.opencode/
.github/
.gemini/
```

The exact files depend on `.truthmark/config.yml`.

## First real use

Most repositories need one cleanup pass after initialization.

The default scaffold starts with a broad `repository` area. Real repositories usually need more precise routing.

Ask your agent to split the broad route into actual product, service, domain, or ownership areas:

```text
/truthmark-structure split the broad repository area into auth, billing, and notifications
```

After that, use your AI coding agent normally.

When the agent changes functional code, Truth Sync acts as the finish-time guard that checks whether mapped truth docs need to change before handoff.

## What you get

| Capability | What it does |
| --- | --- |
| Git-native truth | Keeps repository truth in committed Markdown and config. |
| Branch-scoped context | Truth moves with the branch instead of living in a private session. |
| Human CLI | Gives maintainers setup, refresh, validation, and inspection commands. |
| AI-facing workflows | Gives agents host-native workflows for sync, documentation, structure, preview, realization, and audit. |
| Explicit routing | Maps code areas to canonical truth docs. |
| Reviewable handoffs | Produces ordinary Git diffs for both code and truth docs. |
| Local-first operation | Requires no hosted service, daemon, database, or MCP server. |
| Safer write boundaries | Separates code-first, doc-first, read-only, and doc-only workflows. |
| Validation | Reports routing, authority, frontmatter, link, generated-surface, branch-scope, freshness, and coverage issues. |

## Visual overview

![Truthmark features](docs/assets/truthmark-features.png)

**Features:** what Truthmark installs and how the workflow surface is split.

![Truthmark position](docs/assets/truthmark-position.png)

**Position:** where Truthmark fits relative to prompts, memory, and spec workflows.

![Truthmark sync flow](docs/assets/truthmark-syncflow.png)

**Sync flow:** how Truth Sync closes out normal code changes before handoff.

## Why teams adopt it

Truthmark is for teams that already know AI agents can generate code.

The next problem is governance.

Not governance as ceremony. Governance as a simple question:

> After this AI-assisted change, does the repository still tell the truth?

Truthmark helps teams answer that with committed files, explicit routing, and reviewable diffs.

It is useful when you need:

- less documentation drift
- better handoffs
- branch-specific product truth
- durable architecture and API context
- explicit ownership between docs and code
- safer agent write boundaries
- reviewable context instead of hidden memory
- AI workflows that still work from committed repo files

## Where Truthmark fits

Truthmark does not replace prompts, memory, specs, tests, or code review.

It gives those workflows a durable place to land in Git.

| Need | Better fit |
| --- | --- |
| Better output from one agent session | Better prompt |
| Personal or session-level continuity | Memory tool |
| Plan-first feature work | Spec workflow |
| Branch-scoped truth that travels with code | Truthmark |
| Validating behavior correctness | Tests and review |
| Reviewing AI-assisted context changes | Truthmark plus Git review |

Truthmark’s lane is narrow by design:

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## How Truthmark runs

Truthmark runs locally against the active Git worktree.

The human-facing CLI reads and writes repository files, then exits.

The AI-facing workflow surfaces are committed files that agent hosts can load later. That means agents can follow the installed workflow from repository state instead of depending on a background Truthmark process.

The durable surfaces are ordinary repo files:

```text
.truthmark/config.yml
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
docs/**/*
AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md
.codex/skills/
.claude/skills/
.opencode/skills/
.github/prompts/
.gemini/commands/truthmark/
```

Generated workflow surfaces include Truthmark version markers. After upgrading Truthmark, rerun:

```bash
truthmark init
```

Then review the generated diffs.

## Supported agent platforms

The default config includes every supported platform.

Remove platforms you do not use from `.truthmark/config.yml`, then rerun:

```bash
truthmark init
```

| Platform config name | Generated surface | Invocation shape |
| --- | --- | --- |
| `codex` | `.codex/skills/truthmark-*/`, `.codex/agents/` | `/truthmark-*` or `$truthmark-*` |
| `claude-code` | `.claude/skills/truthmark-*/`, `.claude/agents/`, `CLAUDE.md` | `/truthmark-*` |
| `github-copilot` | `.github/prompts/`, `.github/agents/`, `.github/copilot-instructions.md` | `/truthmark-*` in supported Copilot IDEs; `@truth-*` custom agents in Copilot CLI |
| `opencode` | `.opencode/skills/truthmark-*/`, `.opencode/agents/` | `/skill truthmark-*` |
| `gemini-cli` | `.gemini/commands/truthmark/`, `GEMINI.md` | `/truthmark:*` |

Unknown platform names are config errors.

Removing a platform stops future refreshes for that platform. It does not delete previously generated files.

## AI-facing workflows

These workflows are installed into supported AI coding hosts.

They are used by agents or agent hosts during repository work. They are not top-level shell commands.

| Workflow | Direction | Use it when | Write boundary |
| --- | --- | --- | --- |
| Truth Structure | topology-first | The default route is too broad, ownership spans multiple areas, or route files still point at placeholders. | Creates or repairs routing and starter truth docs. |
| Truth Document | implementation-first | Behavior already exists in code, but canonical truth docs are missing or weak. | Writes truth docs and routing only. Functional code must not change. |
| Truth Sync | code-first | Functional code changed and mapped truth docs may need to be updated before handoff. | Updates truth docs. Functional code must not be rewritten by Truth Sync. |
| Truth Preview | read-only | The agent needs to preview likely routing before edits. | Reads only. Does not authorize writes. |
| Truth Realize | doc-first | Product or architecture truth docs lead and code should be updated to match. | Updates code only. The agent must not edit the truth docs it is realizing. |
| Truth Check | audit-first | A reviewer or agent needs to audit repository truth health. | Audits and reports. |

### Important distinction

Do not confuse these two surfaces:

| Surface | Used by | Example | Meaning |
| --- | --- | --- | --- |
| Human CLI | humans, scripts, CI-like checks | `truthmark check` | Validate repository truth artifacts from the terminal. |
| AI-facing workflow | coding agents and agent hosts | `/truthmark-check` | Ask an agent to run the installed audit workflow. |

The names are intentionally related, but the surfaces are different.

## Normal AI-assisted code change

Most users should not need to invoke Truth Sync manually every time.

Truth Sync is the installed finish-time guard for functional code changes.

```text
agent changes functional code
agent runs or asks for relevant tests
installed workflow detects that functional code changed
Truth Sync checks mapped truth docs
agent updates truth docs if needed
human reviews code diff + truth diff
```

Direct invocation is still useful for troubleshooting, forcing an early sync, or making the handoff explicit:

```text
/truthmark-sync sync the repository truth now before handoff
```

## Existing behavior without docs

Use Truth Document when the implementation already exists but the repository truth is incomplete.

```text
/truthmark-document document the implemented session timeout behavior under docs/truth/authentication
```

Truth Document inspects implementation, tests, route files, and existing docs as evidence.

It writes truth docs and routing only.

It must not change functional code.

## Doc-first changes

Use Truth Realize when a product or architecture decision starts in docs and code should be updated to match.

```text
/truthmark-realize realize docs/truth/authentication/session-timeout.md into code
```

Truth Realize is doc-first.

The truth docs lead. The code follows.

The agent must not edit the truth docs it is realizing.

## Read-only routing preview

Use Truth Preview before a change when the agent needs to understand likely routing.

```text
/truthmark-preview preview the likely truth routing for changes to the billing API
```

Truth Preview is read-only.

It is a selector and planning aid, not write authorization and not a replacement for Truth Check.

## Repository truth audit

Use Truth Check when you want an agent-facing audit workflow.

```text
/truthmark-check audit routing and truth coverage before review
```

Use the human-facing CLI when you want terminal validation:

```bash
truthmark check
```

Both are useful. They are not the same surface.

## Human-facing CLI commands

Most maintainers start with three commands.

| Command | Purpose |
| --- | --- |
| `truthmark config` | Create `.truthmark/config.yml`. Writes only that file unless `--stdout` is used. |
| `truthmark init` | Install or refresh configured workflow surfaces from the reviewed config. |
| `truthmark check` | Validate configuration, authority, routing, decision-bearing docs, frontmatter, internal links, branch scope, generated surfaces, freshness, and coverage diagnostics. |

Optional repository-intelligence helpers generate derived review context for the active checkout.

They are not sources of truth.

| Command | Purpose |
| --- | --- |
| `truthmark index` | Build RepoIndex and RouteMap JSON for the active checkout. |
| `truthmark impact --base <ref>` | Map changed files to routed truth docs, owning routes, nearby tests, and public symbols. |
| `truthmark context --workflow <workflow> [--base <ref>]` | Generate a bounded ContextPack for Truth Sync, Truth Document, or Truth Realize. Use `--format markdown` for a human-readable pack. |

Structured output is available with `--json` where supported.

## Configuration

Truthmark is config-first.

The main config file is:

```text
.truthmark/config.yml
```

New repositories should run:

```bash
truthmark config
```

Then review the generated config before running:

```bash
truthmark init
```

Important config areas include:

| Config area | Purpose |
| --- | --- |
| `version` | Config contract version. |
| `platforms` | Agent hosts that should receive platform-specific generated surfaces. |
| `docs.layout` | Current docs layout mode. |
| `docs.roots` | Named canonical documentation roots. |
| `docs.routing.root_index` | Root route index path. |
| `docs.routing.area_files_root` | Directory for delegated child route files. |
| `docs.routing.default_area` | Initial scaffolded child route basename. |
| `docs.routing.max_delegation_depth` | Current maximum route delegation depth. |
| `authority` | Ordered canonical docs and globs used as repository truth authority. |
| `instruction_targets` | Files that receive shared managed instruction blocks, such as `AGENTS.md`. |
| `frontmatter.required` | Metadata fields that produce error diagnostics when missing. |
| `frontmatter.recommended` | Metadata fields that produce review diagnostics when missing. |
| `ignore` | Glob patterns excluded from relevant checks and routing logic. |

## Repository truth routing

Truthmark maps code surfaces to truth docs.

The main routing files are:

```text
docs/truthmark/areas.md
docs/truthmark/areas/**/*.md
```

A route tells the agent:

- which code surface belongs to an area
- which truth docs own that area
- when truth should be updated
- what kind of truth doc is involved

The default scaffold starts broad. Existing repositories should usually split the default route into real ownership areas.

Example:

```text
/truthmark-structure split the broad repository area into frontend, backend, billing, and deployment
```

Good routing gives Truth Sync precise destinations.

Bad routing makes agents guess.

## What Truthmark installs

Truthmark installs a compact repository-native truth layer.

Typical scaffolded and generated files include:

```text
.truthmark/config.yml

docs/truthmark/areas.md
docs/truthmark/areas/**/*.md

docs/templates/behavior-doc.md
docs/templates/contract-doc.md
docs/templates/architecture-doc.md
docs/templates/workflow-doc.md
docs/templates/operations-doc.md
docs/templates/test-behavior-doc.md

docs/truth/README.md
docs/truth/repository/README.md
docs/truth/repository/overview.md

docs/standards/default-principles.md
docs/standards/documentation-governance.md

AGENTS.md
CLAUDE.md
GEMINI.md
.github/copilot-instructions.md

.codex/skills/truthmark-*/
.codex/agents/

.claude/skills/truthmark-*/
.claude/agents/

.opencode/skills/truthmark-*/
.opencode/agents/

.github/prompts/truthmark-*.prompt.md
.github/agents/

.gemini/commands/truthmark/*.toml
```

Truthmark preserves manual content outside managed instruction blocks.

Generated workflow surfaces are managed by Truthmark and may be refreshed by rerunning:

```bash
truthmark init
```

## Subagents and bounded evidence checks

Where supported by the host, Truthmark can install project-scoped verifier agents and a leased `truth-doc-writer`.

These help keep large truth tasks bounded:

- route auditors inspect route ownership
- claim verifiers check whether doc claims are supported by evidence
- doc reviewers inspect truth-doc quality
- leased doc writers handle bounded truth-doc writing shards

The parent workflow still owns final interpretation, write boundaries, diff validation, and acceptance.

This is important: subagents help with bounded evidence work. They do not replace the main workflow contract.

## Review loop

Truthmark is designed for ordinary Git review.

A good AI-assisted handoff should show:

```text
code diff
test evidence
truth-doc diff, if needed
routing changes, if needed
agent report
```

The reviewer should be able to answer:

- What code changed?
- Which truth docs own that code?
- Did those docs need updates?
- If not, why not?
- Did the agent stay inside the workflow write boundary?
- Are tests or verification evidence included?

## Examples

### Initialize a repository

```bash
npm install -g truthmark
truthmark config
truthmark init
truthmark check
```

### Remove unused agent platforms

Edit:

```text
.truthmark/config.yml
```

Then rerun:

```bash
truthmark init
truthmark check
```

### Split broad routing

```text
/truthmark-structure split the broad repository area into auth, billing, notifications, and deployment
```

### Document implemented behavior

```text
/truthmark-document document the implemented password reset flow under docs/truth/authentication
```

### Sync after code changes

```text
/truthmark-sync sync the repository truth now before handoff
```

### Realize a doc-first decision

```text
/truthmark-realize realize docs/truth/billing/invoice-retry-policy.md into code
```

### Audit truth health from the terminal

```bash
truthmark check
```

### Generate branch-impact context

```bash
truthmark impact --base main
```

### Generate workflow context

```bash
truthmark context --workflow truth-sync --base main --format markdown
```

## Project status

Truthmark V1 currently provides:

- `truthmark config`
- `truthmark init`
- `truthmark check`
- `truthmark index`
- `truthmark impact`
- `truthmark context`
- branch-scope metadata
- managed instruction blocks
- generated Truth Structure workflow surfaces
- generated Truth Document workflow surfaces
- generated Truth Sync workflow surfaces
- generated Truth Preview workflow surfaces
- generated Truth Realize workflow surfaces
- generated Truth Check workflow surfaces
- route, authority, decision-structure, frontmatter, link, freshness, generated-surface, and coverage diagnostics
- derived RepoIndex, RouteMap, ImpactSet, and ContextPack artifacts
- host-specific surfaces for Codex, Claude Code, GitHub Copilot, OpenCode, and Gemini CLI

## Development

Install dependencies:

```bash
npm install
```

Run the local development CLI:

```bash
npm run dev -- init
npm run dev -- check
```

Run the full project check:

```bash
npm run check
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | Run the TypeScript CLI entry point with `tsx`. |
| `npm run build` | Build the package. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript checks. |
| `npm run test` | Run tests. |
| `npm run check` | Run lint, typecheck, tests, and build. |
| `npm run release:check` | Run release-oriented validation. |

When changing Truthmark itself, see [CONTRIBUTORS.md](CONTRIBUTORS.md).

## Documentation

The README is the fast path for evaluation and setup.

Detailed current behavior lives under `docs/`:

- [Docs index](docs/README.md)
- [Architecture overview](docs/architecture/overview.md)
- [API and CLI contracts](docs/truth/contracts.md)
- [Init and scaffold behavior](docs/truth/init-and-scaffold.md)
- [Check diagnostics](docs/truth/check-diagnostics.md)
- [Installed workflows](docs/truth/workflows/overview.md)
- [Repository truth maintenance guide](docs/standards/maintaining-repository-truth.md)

## Design boundaries

Truthmark is intentionally small.

It is not:

- a hosted service
- an MCP server
- a vector database
- a documentation website generator
- a CI or PR enforcement product
- a replacement for tests, code review, or technical leadership
- an autonomous code rewrite engine
- a model-training or fine-tuning framework
- a hidden memory layer

Those boundaries are part of the product.

Truthmark keeps the workflow local, committed, branch-scoped, and reviewable.

## Safety and review discipline

Truthmark helps the repository stay honest. It does not prove the code is correct.

Teams should still:

- run relevant tests
- review functional code changes
- review truth-doc changes
- keep secrets out of docs
- keep repository-specific instructions outside managed blocks
- review generated workflow-surface diffs after upgrades
- keep human ownership over product and architecture decisions

Truthmark makes agent context visible. It does not replace human judgment.

## Roadmap direction

The current future direction emphasizes:

- stronger `truthmark check` evidence reporting
- clearer adoption examples
- example repositories showing real Truth Sync cycles
- migration guides for teams already using agent instruction files
- conformance tests for generated host surfaces
- route-aware stale-truth hints
- bounded implementation checklists for doc-first work

The center of gravity stays the same:

```text
repository truth
agent-native workflows
Git review
branch-scoped context
```

## License

MIT. See [LICENSE](LICENSE).
