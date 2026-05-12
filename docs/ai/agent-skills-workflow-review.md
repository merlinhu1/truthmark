---
status: active
doc_type: agent-guide
last_reviewed: 2026-05-13
source_of_truth:
  - repo-rules.md
  - ../features/installed-workflows.md
  - ../../.codex/skills/truthmark-sync/SKILL.md
  - ../../.codex/skills/truthmark-structure/SKILL.md
  - ../../.codex/skills/truthmark-document/SKILL.md
  - ../../.codex/skills/truthmark-realize/SKILL.md
  - ../../.codex/skills/truthmark-check/SKILL.md
  - https://developers.openai.com/codex/skills
  - https://developers.openai.com/blog/eval-skills
  - https://developers.openai.com/blog/skills-shell-tips
  - https://developers.openai.com/blog/skills-agents-sdk
  - https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
  - https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf
  - https://docs.anthropic.com/en/docs/claude-code/slash-commands
---

# Agent Skills And Workflow Review

This note summarizes the external skill-authoring guidance reviewed on 2026-05-13 and applies it to Truthmark's installed project workflows. It is a reference for future workflow-surface changes, not a replacement for [installed-workflows.md](../features/installed-workflows.md).

## External Standard

Agent skills should be small, concrete, and triggerable from metadata alone. OpenAI and Anthropic both treat `name` and `description` as the first progressive-disclosure layer: the agent decides whether to load the full `SKILL.md` from that metadata. The description therefore needs concrete use cases, non-use cases, expected outputs, and success criteria.

Keep `SKILL.md` focused on the core procedure. Move rare, variant-specific, or long reference material into explicitly linked `references/` files. Use `scripts/` only for deterministic repeated mechanics; leave interpretation, comparison, judgment, and reporting to the model.

Reliable skills need validation, not only syntax checks. Deterministic tests can prove rendered metadata, required routing cues, report shapes, and write-boundary text. They cannot prove that every future AI agent will select the right skill in every realistic conversation.

Security posture matters because skills can contain instructions, scripts, assets, and external dependencies. Treat installed skills as executable agent runtime: inspect the bundled files, scripts, dependency behavior, and any network instructions before trusting them.

## Installed Surface

Truthmark currently installs five workflows across host-specific surfaces:

| Workflow | Main purpose | Codex implicit policy |
| --- | --- | --- |
| `truthmark-sync` | Finish-time code-to-truth synchronization after functional code changes | `allow_implicit_invocation: true` |
| `truthmark-structure` | Design or repair truth routing topology | `allow_implicit_invocation: false` |
| `truthmark-document` | Document existing implemented behavior without code changes | `allow_implicit_invocation: false` |
| `truthmark-realize` | Realize truth docs into functional code | `allow_implicit_invocation: false` |
| `truthmark-check` | Audit repository truth health | `allow_implicit_invocation: false` |

Generated runtime surfaces include `.codex/skills/`, `.claude/skills/`, `.opencode/skills/`, `.github/prompts/`, `.gemini/commands/truthmark/`, and compact managed instruction blocks in files such as `AGENTS.md`.

## What Is Working

- The workflow split is coherent: Structure owns topology, Document owns implemented behavior without code changes, Sync owns code-first finish-time alignment, Realize owns doc-first code changes, and Check owns audit.
- Write boundaries are unusually clear. The skills repeatedly state which docs, routing files, or functional code may be changed.
- The runtime is agent-native. Skills tell agents to inspect the checkout directly and treat the CLI as optional validation rather than a required orchestration bridge.
- The managed instruction block is compact while the detailed procedures live in explicit workflow surfaces, which preserves ordinary task context.
- Codex metadata correctly makes only Sync implicitly invocable. Manual workflows remain explicit in Codex, which reduces accidental Structure, Document, Realize, or Check runs.
- Generated-surface tests cover parseable frontmatter, required phrases, report headings, host paths, version markers, and stale-surface diagnostics.

## Critical Findings

1. Medium: frontmatter descriptions need explicit negative routing cases.
   The body text has good boundaries, but the body loads only after the skill triggers. Descriptions should include concise "do not use when" clauses for nearby workflows. This matters most for Structure versus Document, Document versus Sync, and Check versus ordinary validation.

2. Low: repeated hierarchy and decision-truth text increases drift risk.
   The duplication is defensible because generated host surfaces should remain standalone after install. Still, shared generator constants and tests should continue to own this text. If the body grows substantially, consider a generated `references/truthmark-common.md` only when each supported host reliably exposes skill references.

3. Low: `truthmark-check` can read like a replacement for normal verification.
   The skill body says `truthmark check` is optional and direct inspection is canonical. The description could still clarify that Truth Check is for repository-truth audits, not a substitute for lint, tests, typecheck, code review, or the finish-time Sync gate.

## Resolved Notes

- Resolved 2026-05-13: `truthmark-document` metadata now names Truth Sync, Truth Check, and Truth Structure as the workflows that can hand off missing implemented-behavior documentation.
- Resolved 2026-05-13: `truthmark-sync` frontmatter and Codex metadata now include skip cases for documentation-only changes, formatting-only changes, behavior-preserving renames, missing Truthmark config, and no functional code changes.

## Deterministic Coverage Matrix

| Workflow | Positive trigger examples | Negative trigger examples | Key success checks |
| --- | --- | --- | --- |
| Sync | "I changed session code; finish and sync truth" | docs-only edit, formatting-only edit, no functional code diff | reads changed code and routing, updates only truth docs or routing, reports skipped or blocked correctly |
| Structure | "split broad repository routing into auth and billing" | "document current auth behavior" | repairs route topology before docs, creates bounded starter docs, preserves authored content |
| Document | "document existing order submission behavior" | "implement the behavior in this truth doc" | reads code and tests, writes docs/routing only, does not edit functional code |
| Realize | "realize docs/features/auth/session-timeout.md into code" | "sync docs after my code change" | reads truth docs first, edits functional code only, runs relevant tests |
| Check | "audit truth health before review" | "run lint and tests" | reports issues and suggested fixes, optionally runs `truthmark check`, does not silently rewrite unrelated files |

## Next Improvements

- Add deterministic description-quality tests that require positive and negative routing cues in every generated `SKILL.md` description.
- Treat prompt-style agent evals, if ever added, as smoke checks and examples rather than proof of universal routing correctness.
- Tighten `truthmark-check` descriptions before adding more workflows.
- Keep generated skill bodies below the point where common guidance crowds out workflow-specific procedure.
- Re-audit security posture before any Truthmark skill gains scripts, assets, or network-capable dependencies.
