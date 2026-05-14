---
status: active
doc_type: agent-guide
last_reviewed: 2026-05-15
source_of_truth:
  - repo-rules.md
  - ../truth/workflows/overview.md
  - ../truth/workflows/shared-gates.md
  - ../../src/agents/workflow-manifest.ts
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
  - https://code.claude.com/docs/en/slash-commands
  - https://agentskills.io/specification
  - https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity
---

This note summarizes external skill-authoring guidance reviewed on 2026-05-15 and applies it to Truthmark's installed project workflows. It is a reference for future workflow-surface changes, not a replacement for [workflow overview](../truth/workflows/overview.md) and the bounded workflow truth docs under `docs/truth/workflows/`.

## External Links Reviewed

All external links in `source_of_truth` resolved on 2026-05-15. The previous Anthropic Claude Code slash-command URL redirects to `https://code.claude.com/docs/en/slash-commands`; use the canonical redirected URL in this doc.

The Perplexity review adds a stricter standard than this doc previously stated: description metadata is routing logic, not a compact summary of the workflow. Expected outputs and success criteria belong in the body, report contract, or eval rubric.

## Skill Design Standard

Agent skills are context packages, not human manuals. Every skill is a tax paid by every session at the metadata layer and by every loaded conversation at the body layer. Add or grow a skill only when representative agents fail, behave inconsistently, or need durable project-specific context that the base model would not reliably infer.

Use progressive disclosure:

- metadata: `name` and `description` decide whether the skill loads
- body: the short core procedure, boundaries, gotchas, and report shape
- bundled files: scripts, references, assets, or config loaded only when needed

Descriptions are the hardest line. They should be short routing triggers, ideally 50 words or fewer, written as "Use when..." or "Load when..." with user intent, symptoms, and adjacent-workflow exclusions. They must not summarize the workflow steps, duplicate the body, or promise outputs.

Skill bodies should skip obvious mechanics the model already knows. Keep opinionated boundaries, gotchas, failure modes, negative examples, and high-value judgment rules. Move heavy, rare, or mutually exclusive material into explicitly named reference files only when each supported host can expose and load those files reliably.

Use scripts only for deterministic repeated mechanics the agent would otherwise reinvent. Leave interpretation, comparison, ownership decisions, and reporting to the model unless a deterministic checker can enforce them better than prose.

## Evaluation Standard

Reliable skills need evals before or alongside skill changes, not only syntax checks. For workflow-surface changes, maintain three classes of cases:

- positive routing: the workflow loads when its real trigger appears
- negative routing: the workflow stays unloaded for nearby but wrong tasks
- forbidden adjacency: the workflow does not steal requests from a sibling workflow

Useful eval suites cover loading precision/recall, required file reads, forbidden loads, progressive reference reads, end-to-end task completion, and cross-host behavior where hosts differ. Deterministic tests can prove rendered metadata, required routing cues, report headings, write-boundary text, and stale-surface diagnostics. Prompt-style agent evals are smoke checks and examples, not proof of universal routing correctness.

Maintenance should be append-mostly. Add gotchas when agents fail, tighten descriptions only with routing evals, and re-check nearby workflows when any description changes. A changed description can break workflows that were not edited.

Security posture matters because skills can contain instructions, scripts, assets, dependencies, and network instructions. Treat installed skills as executable agent runtime: inspect bundled files, scripts, dependency behavior, and any network instruction before trusting them.

## Truthmark Workflow Inventory

Truthmark currently installs five workflows across host-specific surfaces:

| Workflow | Main purpose | Codex implicit policy |
| --- | --- | --- |
| `truthmark-sync` | Finish-time code-to-truth synchronization after functional code changes | `allow_implicit_invocation: true` |
| `truthmark-structure` | Design or repair truth routing topology | `allow_implicit_invocation: false` |
| `truthmark-document` | Document existing implemented behavior without code changes | `allow_implicit_invocation: false` |
| `truthmark-realize` | Realize truth docs into functional code | `allow_implicit_invocation: false` |
| `truthmark-check` | Audit repository truth health | `allow_implicit_invocation: false` |

Generated runtime surfaces include `.codex/skills/`, `.claude/skills/`, `.opencode/skills/`, `.github/prompts/`, `.gemini/commands/truthmark/`, and compact managed instruction blocks in files such as `AGENTS.md`.

Current strengths:

- The workflow split is coherent: Structure owns topology, Document owns implemented behavior without code changes, Sync owns code-first finish-time alignment, Realize owns doc-first code changes, and Check owns audit.
- Write boundaries are unusually clear. The skills repeatedly state which docs, routing files, or functional code may be changed.
- The runtime is agent-native. Skills tell agents to inspect the checkout directly and treat the CLI as optional validation rather than a required orchestration bridge.
- The managed instruction block is compact while detailed procedures live in explicit workflow surfaces, preserving ordinary task context.
- Codex metadata correctly makes only Sync implicitly invocable. Manual workflows remain explicit in Codex, reducing accidental Structure, Document, Realize, or Check runs.
- Generated-surface tests cover parseable frontmatter, required phrases, report headings, host paths, version markers, and stale-surface diagnostics.

## Current Findings

1. Medium: workflow evals should test routing, not just rendered text.
   Existing deterministic tests prove surfaces contain required words. Add positive, negative, and forbidden-adjacency cases for each workflow description before changing metadata. A useful first suite can run against generated descriptions without invoking a live model.

2. Medium: body growth must stay progressive.
   Repeated hierarchy, decision-truth, ownership, evidence, and preservation gates are defensible because generated host surfaces must stand alone. If bodies grow substantially, split shared guidance into generated references only after every supported host reliably exposes those references and tests prove agents read them when needed.

3. Low: external links should stay canonical and dated.
   Link review should update redirects, add review dates, and keep volatile external guidance in this reference doc rather than embedded directly in runtime workflow bodies.

Resolved:

- Resolved 2026-05-13: `truthmark-document` metadata now names Truth Sync, Truth Check, and Truth Structure as workflows that can hand off missing implemented-behavior documentation.
- Resolved 2026-05-13: `truthmark-sync` frontmatter and Codex metadata now include skip cases for documentation-only changes, formatting-only changes, behavior-preserving renames, missing Truthmark config, and no functional code changes.
- Resolved 2026-05-15: external source links were reviewed, the Claude Code slash-command link was canonicalized, and the Perplexity skill-maintenance standard was incorporated.
- Resolved 2026-05-15: workflow frontmatter descriptions now include adjacent-workflow exclusions without summarizing the full workflow body.
- Resolved 2026-05-15: workflow metadata and routing-eval expectations now live in a typed manifest consumed by generated surfaces and deterministic tests.

## Routing Eval Matrix

| Workflow | Positive trigger examples | Negative trigger examples | Forbidden adjacency | Key success checks |
| --- | --- | --- | --- | --- |
| Sync | "I changed session code; finish and sync truth" | docs-only edit, formatting-only edit, no functional code diff | must not handle doc-first implementation or manual topology design | reads changed code and routing, updates only truth docs or routing, reports skipped or blocked correctly |
| Structure | "split broad repository routing into auth and billing" | "document current auth behavior" | must not implement code or patch mixed-owner docs as shape repair | repairs route topology before docs, creates bounded starter docs, preserves authored content and decisions/rationale |
| Document | "document existing order submission behavior" | "implement the behavior in this truth doc" | must not handle functional-code changes that require Sync | reads code and tests, writes docs/routing only, does not edit functional code |
| Realize | "realize docs/truth/auth/session-timeout.md into code" | "sync docs after my code change" | must not edit truth docs or routing | reads truth docs first, blocks on stale/mixed-owner source truth, edits functional code only, runs relevant tests |
| Check | "audit truth health before review" | "run lint and tests" | must not replace ordinary verification or finish-time Sync | reports issues and suggested fixes, optionally runs `truthmark check`, does not silently rewrite unrelated files |

## Maintenance Rules

- Add deterministic description-quality tests that require positive, negative, and forbidden-adjacency routing cues in every generated `SKILL.md` description.
- Keep generated workflow descriptions, Codex metadata, routing examples, gate lists, write boundaries, and report-section expectations in the typed workflow manifest.
- Treat prompt-style agent evals, if added, as smoke checks and examples rather than proof of universal routing correctness.
- Tighten `truthmark-check` descriptions before adding more workflows.
- Keep generated skill bodies below the point where common guidance crowds out workflow-specific procedure.
- Re-audit security posture before any Truthmark skill gains scripts, assets, network-capable dependencies, or generated reference files.
- When an agent failure reveals a workflow gotcha, add the gotcha to the smallest owning workflow body or shared gate rather than rewriting broad instructions.
