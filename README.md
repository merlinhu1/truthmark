# Truthmark

**Your agents write code. Truthmark maintains human-facing, Git-reviewable documentation.**

[🇺🇸 English](README.md) | [🇨🇳 简体中文](docs/readmes/README.zh.md) | [🇯🇵 日本語](docs/readmes/README.ja.md) | [🇰🇷 한국어](docs/readmes/README.ko.md) | [🇩🇪 Deutsch](docs/readmes/README.de.md) | [🇫🇷 Français](docs/readmes/README.fr.md) | [🇪🇸 Español](docs/readmes/README.es.md) | [🇧🇷 Português](docs/readmes/README.pt-BR.md) | [🇷🇺 Русский](docs/readmes/README.ru.md) | [🇸🇦 العربية](docs/readmes/README.ar.md) | [🇮🇹 Italiano](docs/readmes/README.it.md) | [🇵🇱 Polski](docs/readmes/README.pl.md) | [🇹🇷 Türkçe](docs/readmes/README.tr.md) | [🇻🇳 Tiếng Việt](docs/readmes/README.vi.md) | [🇮🇩 Bahasa Indonesia](docs/readmes/README.id.md) | [🇬🇷 Ελληνικά](docs/readmes/README.el.md)

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

Then install the repo-local truth docs, routing, and agent workflow surfaces:

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

**Truthmark** installs a Git-native workflow layer into your repository. It fixes the part of AI development that usually breaks: helping the documentation stay aligned with the code.

Instead of hoping humans and AI agents remember to update docs, Truthmark makes documentation a systematic, reviewable habit right inside your repo.

### ✨ Why Truthmark is Unique

Truthmark isn't just another documentation tool. It is deeply integrated into the AI workflow:

* **🚫 Zero Vendor Lock-in:** No hosted services, no hidden databases, no extra servers to operate.
* **🌳 100% Git-Native:** Everything lives in your repository. The truth moves with your branch.
* **🤝 Dual-Surface Architecture:** It cleanly separates the tools humans use to manage the repo from the workflows AI agents use to write code.
* **✅ Trust Through Verification:** AI work becomes easier to trust because behavior-changing work includes a human-reviewable truth-doc decision or diff.

## 🔄 How It Works

When an AI agent modifies your code, the job isn't finished. Truthmark installs a finish-time workflow guard that agents follow before handoff:

1. 💻 **Code:** Agent modifies functional code.
2. 🧪 **Test:** Relevant tests are executed.
3. 🔍 **Check:** `Truth Sync` checks mapped documentation when the installed workflow runs.
4. 📝 **Document:** Docs are updated by the agent when repository truth has changed.
5. 👀 **Review:** A human reviews the *code diff* + the *truth diff*.

## 🛠 Two Surfaces, One Truth System

Truthmark is intentionally split into two distinct surfaces to serve both human maintainers and AI agents.

### 1. 🧑‍💻 The Human CLI (Maintainers & CI)
Used by developers to set up, configure, and validate the repository.
* `truthmark config` - Creates your initial configuration.
* `truthmark init` - Installs the necessary routing, scaffolds, and instructions.
* `truthmark check` - Validates truth artifacts from the terminal.

### 2. 🤖 The AI-Facing Workflows (Agents)
Truthmark installs native skills, prompts, and commands that supported AI hosts (like Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, and Cursor) understand. These are *not* shell commands; they are workflow entry points for the AI.
* `/truthmark-sync` - The finish-time workflow agents follow after functional code changes; not a normal user-start command.
* `/truthmark-document` - Generate docs for undocumented existing code.
* `/truthmark-structure` - Organize broad repository areas into specific domains.
* `/truthmark-realize` - **Doc-First Development:** Read architecture docs and generate code to match.
* `/truthmark-check` - Agent-driven audit of the repository's truth.

## What you get

| Capability | What it does |
| --- | --- |
| Git-native truth | Keeps repository truth in committed Markdown and config. |
| Branch-scoped documentation | Truth moves with the branch instead of living in a private session. |
| Human CLI | Gives maintainers setup, refresh, validation, and inspection commands. |
| AI-facing workflows | Gives agents host-native workflows for sync, documentation, structure, realization, and audit. |
| Explicit routing | Maps code areas to canonical truth docs. |
| Reviewable handoffs | Produces ordinary Git diffs for both code and truth docs. |
| Local-first operation | Requires no hosted service, daemon, database, or MCP server. |
| Safer write boundaries | Separates code-first, doc-first, read-only, and doc-only workflows. |
| Validation | Reports routing, authority, frontmatter, link, generated-surface, branch-scope, freshness, and coverage issues. |
| Optional Portal | Generates a committed static HTML presentation site from Markdown truth docs when explicitly enabled and requested. |

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
- durable architecture and API documentation
- explicit ownership between docs and code
- safer agent write boundaries
- reviewable documentation instead of hidden memory
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
| Reviewing AI-assisted documentation changes | Truthmark plus Git review |

Truthmark’s lane is narrow by design:

```text
make repository truth explicit
route it to code
install agent workflows around it
keep the result reviewable in Git
```

## Go deeper

The README is the storefront: fast context, quick start, and the core mental model.

For command-by-command usage, surface comparisons, supported platform details, configuration, routing, Portal, and examples, read the [Truthmark User Guide](docs/user-guide.md).

## Project status

The current release provides:

- local CLI commands for config, init, check, index, impact, and workflow status
- generated AI workflow surfaces for Codex, Claude Code, GitHub Copilot, OpenCode, Antigravity, and Cursor
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
