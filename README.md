# Truthmark

**Your agents write code. Truthmark maintains human-facing, Git-reviewable documentation.**

[![npm version](https://img.shields.io/npm/v/truthmark?color=cb3837&label=npm)](https://www.npmjs.com/package/truthmark)
[![CI](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/merlinhu1/truthmark/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/merlinhu1/truthmark/badge)](https://scorecard.dev/viewer/?uri=github.com/merlinhu1/truthmark)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >=24](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](package.json)

[Website](https://merlinhu1.github.io/truthmark/) | [GitHub](https://github.com/merlinhu1/truthmark) | [User Guide](docs/user-guide.md)

[🇺🇸 English](README.md) | [🇨🇳 简体中文](docs/readmes/README.zh.md) | [🇯🇵 日本語](docs/readmes/README.ja.md) | [🇰🇷 한국어](docs/readmes/README.ko.md) | [🇩🇪 Deutsch](docs/readmes/README.de.md) | [🇫🇷 Français](docs/readmes/README.fr.md) | [🇪🇸 Español](docs/readmes/README.es.md) | [🇧🇷 Português](docs/readmes/README.pt.md) | [🇷🇺 Русский](docs/readmes/README.ru.md) | [🇸🇦 العربية](docs/readmes/README.ar.md) | [🇮🇹 Italiano](docs/readmes/README.it.md) | [🇵🇱 Polski](docs/readmes/README.pl.md) | [🇹🇷 Türkçe](docs/readmes/README.tr.md) | [🇻🇳 Tiếng Việt](docs/readmes/README.vi.md) | [🇮🇩 Bahasa Indonesia](docs/readmes/README.id.md) | [🇬🇷 Ελληνικά](docs/readmes/README.el.md)

![Truthmark banner](docs/assets/truthmark-banner.png)

## 🚀 Quick Start: running locally in five minutes

Run this inside the Git repository you want Truthmark to manage:

```bash
cd /path/to/your-repo
npm install -g truthmark
truthmark config
```

Enable the AI host you actually use. Fresh configs are host-neutral, so add a top-level `platforms` list to `.truthmark/config.yml` before initialization:

```yaml
version: 2
platforms:
  - codex        # or: claude-code, github-copilot, opencode, antigravity, cursor
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
```

Then install the repo-local truth docs, routing, and AI-host instructions:

```bash
truthmark init
truthmark check
git diff
```

Now try the most common adoption path: document one existing behavior from code and tests. In your AI coding host, ask the installed workflow:

```text
/truthmark-document document the implemented session timeout behavior across src/auth/session.ts and tests/auth/session.test.ts
```

After that, users should not normally invoke Truth Sync directly. Keep coding through your AI host; the installed repository instructions tell the agent to run relevant tests and perform the Truth Sync review before handoff when functional code changes. You review the resulting code diff plus truth-doc diff.

If you only want CLI validation and do not want host-specific AI workflows yet, leave `platforms` omitted and run `truthmark init && truthmark check`; you can add a platform later and rerun `truthmark init`.

## 💡 The Problem: The AI Documentation Gap

AI coding agents are incredible at writing code fast. But this speed creates a dangerous new failure mode: **the repository's story drifts from reality.**

* Behavior is lost in ephemeral chat histories.
* Architecture documents quickly fall behind.
* Product decisions vanish after handoff.
* Code reviewers are left examining raw code diffs without understanding the "why."
* Every new AI session is forced to rediscover your repository's truth from scratch.

## 🎯 The Solution: Truthmark

**Truthmark** installs a Git-native workflow layer into your repository. It fixes the part of AI development that usually breaks: keeping documentation aligned with code after the first draft.

Instead of hoping humans and AI agents remember to update docs, Truthmark makes documentation a systematic, reviewable habit right inside your repo.

Truthmark is not a one-shot docs generator. It is an ongoing truth-doc curation loop that keeps human-facing docs small, owned, evidence-backed, and reviewable as agents keep changing code.

### ✨ Why Truthmark is Unique

Truthmark isn't just another documentation tool. It is deeply integrated into the AI workflow:

* **🚫 Zero Vendor Lock-in:** No hosted services, no hidden databases, no extra servers to operate.
* **🌳 100% Git-Native:** Everything lives in your repository. The truth moves with your branch.
* **🤝 Human-owned, agent-followed contract:** Maintainers own the repo contract; agents follow the installed instructions while coding.
* **🧭 Ongoing truth curation:** Broad or messy docs are routed toward Structure instead of becoming giant catch-all files.
* **✅ Trust Through Verification:** AI work becomes easier to trust because behavior-changing work includes a human-reviewable truth-doc decision or diff.

## 🔄 How It Works

When an AI agent modifies your code, the job isn't finished. Truthmark installs a finish-time workflow guard that agents follow before handoff:

1. 💻 **Code:** Agent modifies functional code.
2. 🧪 **Test:** Relevant tests are executed.
3. 🔍 **Check:** Truthmark checks mapped documentation as part of the installed finish-time review.
4. 📝 **Document:** Docs are updated by the agent when repository truth has changed.
5. 👀 **Review:** A human reviews the *code diff* + the *truth diff*.

## 🛠 How you interact with Truthmark

Truthmark has one repo-local contract with two ways to use it.

### Humans install and validate the contract

Maintainers and CI use the CLI:

* `truthmark config` - create the initial configuration.
* `truthmark init` - install or refresh routing, truth-doc scaffolds, and AI-host instructions.
* `truthmark check` - validate the repository truth from the terminal.

### Agents follow the contract while coding

Truthmark installs repo-local instructions for supported AI coding hosts such as Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, and Cursor.

The normal loop is simple:

1. Ask your agent for a code change, or ask it to document existing behavior.
2. The installed instructions tell the agent when to test, when to update truth docs, and when to stop for human review.
3. You review ordinary Git diffs: code plus any truth-doc changes.

The user-started agent requests are intentionally few:

* `/truthmark-document` - document existing implemented behavior from code and tests.
* `/truthmark-realize` - implement code from existing truth docs.
* `/truthmark-check` - audit repository truth.

Truth Sync is not the usual way to start work; it is the finish-time review after functional code changes.
Truth Structure is not a day-to-day command; it repairs routing or ownership only when that blocks the work.

## What you get

| Capability | What it does |
| --- | --- |
| Git-native truth | Keeps repository truth in committed Markdown and config. |
| Branch-scoped documentation | Truth moves with the branch instead of living in a private session. |
| Human CLI | Gives maintainers setup, refresh, validation, and inspection commands. |
| Installed agent guidance | Tells coding agents when to document, test, sync truth, audit, or stop for review. |
| Explicit routing | Maps code areas to canonical truth docs. |
| Durable truth curation | Keeps docs bounded, evidence-backed, and reviewable instead of letting them grow into catch-all files. |
| Reviewable handoffs | Produces ordinary Git diffs for both code and truth docs. |
| Local-first operation | Requires no hosted service, daemon, database, or MCP server. |
| Safer write boundaries | Separates code-first, doc-first, read-only, and doc-only workflows. |
| Validation | Reports routing, authority, frontmatter, link, generated-surface, branch-scope, freshness, and coverage issues. |
| Optional Portal | Generates a committed static HTML presentation site from Markdown truth docs when explicitly enabled and requested. |

## Visual overview

![Truthmark features](docs/assets/truthmark-features.png)

**Features:** what Truthmark installs and how agents use repo-local instructions.

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

Most AI tools can draft documentation. Truthmark keeps repository truth curated after the draft, after the next code change, and after the doc starts getting too broad.

It is useful when you need:

- less documentation drift
- better handoffs
- branch-specific product truth
- durable architecture and API documentation
- explicit ownership between docs and code
- safer agent write boundaries
- reviewable documentation instead of hidden memory
- agent guidance that still works from committed repo files

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
| Reviewing AI-assisted documentation changes | Truthmark plus Git review |

Truthmark’s lane is narrow by design:

```text
make repository truth explicit
route it to code
install agent guidance around it
keep the result reviewable in Git
```

## Go deeper

The README is the storefront: fast context, quick start, and the core mental model.

The [static website](https://merlinhu1.github.io/truthmark/) is the concise public introduction for GitHub Pages.

For command-by-command usage, surface comparisons, supported platform details, configuration, routing, Portal, and examples, read the [Truthmark User Guide](docs/user-guide.md).

## Project status

The current release provides:

- local CLI commands for config, init, check, index, impact, and workflow status
- generated repo-local agent instructions for Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, and Cursor
- route, authority, frontmatter, link, freshness, generated-surface, branch-scope, and coverage diagnostics
- branch-scoped truth docs and derived repository-intelligence artifacts

## Documentation

- [User guide](docs/user-guide.md)
- [Docs index](docs/README.md)
- [Architecture overview](docs/truthmark/engineering/architecture/overview.md)
- [API and CLI contracts](docs/truthmark/engineering/contracts/config-route-and-check-contracts.md)
- [Repository truth maintenance guide](docs/standards/maintaining-repository-truth.md)

For local development and contribution commands, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Design boundaries

Truthmark is intentionally small: local, committed, branch-scoped, and reviewable.

It is not a hosted service, MCP server, vector database, hidden memory layer, CI enforcement product, or autonomous code rewrite engine. It helps repository truth stay visible; it does not replace tests, code review, or human judgment.

## License

MIT. See [LICENSE](LICENSE).
