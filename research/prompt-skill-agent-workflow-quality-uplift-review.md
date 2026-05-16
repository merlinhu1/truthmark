# Truthmark Prompt, Skill, Agent, and Workflow Quality Uplift Review

Intended commit path: `research/prompt-skill-agent-workflow-quality-uplift-review.md`

## Status

This document is a research and recommendation reference. It is not canonical Truthmark behavior.

It does not by itself change Truthmark workflows, generated surfaces, skills, agents, tests, repository rules, or implementation policy. Any behavior-bearing recommendation must be promoted into canonical truth docs, the typed workflow manifest, renderers, generated host surfaces, and tests before it becomes Truthmark behavior.

This review is based on:

- the current repository branch: `subagent-improvement`;
- the current Truthmark research folder;
- the current generated host surfaces;
- the literature review corpus on prompt standards, skills, agents/subagents, workflow implementation, permissions, routing, evaluation, security, and maintenance.

## Direct Confidence Answer

### Can this review be 100% confident that Truthmark’s prompt, skill, subagent, and workflow quality are world-class?

No.

The repository shows a strong architecture: repository-native workflow surfaces, a typed workflow manifest, generated host adapters, compact managed instruction blocks, workflow write boundaries, read-only verifier subagents, and a leased write-capable `truth-doc-writer`.

That is strong structural evidence.

It is not enough for 100% confidence in world-class runtime behavior. World-class quality for agentic systems requires empirical evidence from routing evals, negative-trigger evals, report-contract evals, permission regression tests, cross-host conformance tests, stale-surface detection, and live or simulated model-behavior tests. The current repository has meaningful deterministic tests, but the inspected branch does not yet show a complete prompt-style evaluation suite for workflow routing, subagent delegation, off-lease behavior, report compliance, and cross-host behavior.

### Is Truthmark following best practice or using the most practical solution for this project?

Mostly yes at the architectural level.

Truthmark’s most important design choices align with recurring best-practice patterns in the literature:

- repository-native, Git-reviewable truth rather than private model memory;
- compact root instructions rather than bloated always-on prompts;
- source-of-truth manifest rendered into host-specific surfaces;
- descriptions treated as routing boundaries;
- explicit positive, negative, and forbidden-adjacent routing cases;
- only one automatic finish-time workflow;
- read-only verifier subagents;
- leased write-capable subagents with parent-owned final acceptance;
- generated host surfaces instead of hand-edited prompt sprawl.

The practical solution is broadly appropriate for this project because Truthmark is a repository protocol, not a cloud orchestration platform or runtime agent framework.

However, “following the right architecture” is different from “proved world-class.” The project still needs stronger empirical evidence, schema validation, cross-host conformance checks, prompt-style evals, and explicit delegation policy.

### Can this review be 100% confident in subagent and workflow performance/reliability?

No.

The current subagent and workflow design is promising and unusually disciplined, but reliability cannot be claimed at 100% without measured behavior. Subagents are especially sensitive to routing, host-specific permission semantics, context isolation, report compliance, and parent validation. The literature consistently treats these as eval and guardrail problems, not as problems solved by prompt text alone.

A more defensible confidence statement is:

| Area | Structural confidence | Empirical runtime confidence | Reason |
|---|---:|---:|---|
| Root managed instructions | High | Medium | Compact and generated, but still need drift/stale-surface checks across docs and hosts. |
| Workflow manifest | High | Medium | Strong typed metadata and tests; behavior still depends on generated prompt interpretation. |
| Generated skills/prompts/commands | Medium-high | Medium-low | Strong boundaries; limited evidence of prompt-style routing evals across hosts/models. |
| Read-only verifier subagents | Medium-high | Medium | Narrow and constrained; need output-schema and delegation evals. |
| Write-capable `truth-doc-writer` | Medium-high design confidence | Medium-low empirical confidence | Lease pattern is strong; runtime reliability needs parent-diff validation evals and cross-host permission conformance. |
| Cross-host workflow parity | Medium | Low-medium | Protocol is generated across hosts, but host capabilities differ materially. |

## Scope

This document focuses on strengthening Truthmark’s first-class product surfaces:

- prompts;
- persistent repository instructions;
- reusable skills;
- agents and subagents;
- generated workflow surfaces;
- workflow implementation;
- routing and invocation;
- permissions and write boundaries;
- evaluation;
- security;
- maintenance;
- cross-host compatibility.

The objective is direct actionability for Truthmark. The review does not recommend background daemons, private memory servers, remote workflow state, or non-Git-reviewable truth state. Those are treated as rejected alternatives unless explicitly scoped as external background context.

## Repository Baseline

### Repository-native truth protocol

Truthmark describes itself as a local-first, Git-native truth layer for AI coding agents. The README says the intended flow is: an agent changes functional code, runs tests, and then the installed Truth Sync workflow updates mapped truth docs before the agent finishes. The README also states that Truthmark is not an MCP memory server, not a daemon, and not a prompt-history artifact. Repository evidence: [`README.md`](https://github.com/merlinhu1/truthmark/tree/subagent-improvement).

`FutureVision.md` reinforces this architecture by rejecting memory servers, session persistence, IDE-plugin centricity, and default merge gating. It describes Truthmark as branch-scoped, committed, reviewable repository truth. Repository evidence: [`FutureVision.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/FutureVision.md).

### Managed root instructions

`AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` contain compact managed Truthmark instruction blocks. They describe the source hierarchy, automatic Truth Sync after functional code changes, skip cases, explicit workflows, and workflow-integrity constraints. They do not contain the full workflow bodies. Repository evidence: [`AGENTS.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/AGENTS.md), [`CLAUDE.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/CLAUDE.md), [`GEMINI.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/GEMINI.md).

### Workflow inventory

The current workflow inventory is:

- Truth Sync
- Truth Structure
- Truth Document
- Truth Realize
- Truth Check

The canonical workflow overview states that workflow surfaces define invocation rules, write boundaries, report shapes, and required reads. It also states that Truth Sync is the only automatic finish-time workflow. Repository evidence: [`docs/truth/workflows/overview.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/overview.md).

### Shared gates

The shared gates file defines:

- Ownership Gate;
- Product Decisions/Rationale preservation gate;
- Evidence Gate;
- Shape Repair Gate.

It states that direct checkout evidence is authoritative and optional repository-intelligence artifacts may assist but cannot override the checkout. Repository evidence: [`docs/truth/workflows/shared-gates.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/shared-gates.md).

### Workflow manifest

`src/agents/workflow-manifest.ts` is the typed workflow source of truth. It defines workflow metadata, descriptions, short descriptions, default prompts, implicit invocation policy, positive triggers, negative triggers, forbidden adjacency, required gates, allowed writes, report sections, read-only subagents, and write-capable subagents. Repository evidence: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

### Generated host surfaces

`src/templates/workflow-surfaces.ts` renders workflow skill bodies, subagent profiles, host permission text, report structures, and the write-capable `truth-doc-writer` lease contract. Repository evidence: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts).

`src/templates/generated-surfaces.ts` renders host outputs for Codex, OpenCode, Claude, GitHub Copilot, and Gemini. Codex, OpenCode, Claude, and GitHub Copilot receive workflow skills/prompts and generated agents. Gemini receives command TOML files under `.gemini/commands/truthmark/`. Repository evidence: [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts).

### Current agents and subagents

Truthmark has read-only verifier subagents including route auditor, claim verifier, and doc reviewer. These are constrained to assigned shards and return findings rather than making final decisions.

Truthmark also has a write-capable `truth-doc-writer`. It requires a parent-issued write lease, may edit only leased truth docs and routing files, must block on off-lease ambiguity, and must return a structured YAML report. The parent workflow validates the actual diff before acceptance. Repository evidence: [`.opencode/agents/truth-doc-writer.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-doc-writer.md), [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts).

### Research folder

The research folder contains non-canonical design references.

`research/2026-05-15-agent-skills-workflow-review.md` describes skills as context packages, descriptions as routing logic, progressive disclosure, and eval needs. Repository evidence: [`research/2026-05-15-agent-skills-workflow-review.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-15-agent-skills-workflow-review.md).

`research/2026-05-16-write-capable-opencode-subagents-design.md` proposes write-capable OpenCode subagents under explicit parent-issued leases. It is non-canonical. Current source has already promoted the `truth-doc-writer` pattern beyond OpenCode to several host surfaces; broader workers such as route structurer and realize writer remain research-only ideas. Repository evidence: [`research/2026-05-16-write-capable-opencode-subagents-design.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-16-write-capable-opencode-subagents-design.md).

### Current tests

The inspected tests already cover meaningful deterministic behavior:

- workflow manifest description shape, positive triggers, negative triggers, forbidden adjacency, gates, writes, report sections, and subagent assignment;
- generated init surfaces, compact root blocks, host-specific files, workflow metadata, OpenCode permissions, and no repo-root generated skill pollution;
- write-lease path acceptance/rejection;
- prompt surface boundaries for Truth Realize and related workflow behavior.

Repository evidence: [`tests/agents/workflow-manifest.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/workflow-manifest.test.ts), [`tests/agents/write-lease.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/write-lease.test.ts), [`tests/agents/prompts.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/prompts.test.ts), [`tests/init/init.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/init/init.test.ts).

## Literature-Derived Quality Criteria

This section extracts standards from the reviewed literature. It is used as the comparison basis for the gap analysis.

### Prompt quality criteria

A high-quality coding-agent or workflow-agent prompt should:

1. separate stable instructions from task-specific context;
2. state scope, evidence, allowed writes, forbidden writes, and output format;
3. use clear structure such as sections, Markdown, or XML-style delimiters where useful;
4. include examples when they reduce ambiguity;
5. define success criteria before iteration;
6. be evaluated against both expected and unexpected behavior;
7. avoid overloading always-on context with rarely used procedure details.

External evidence:

- OpenAI’s prompt engineering guide distinguishes instruction hierarchy and recommends structured prompt formats such as Markdown/XML sections and examples. Source: [OpenAI Prompt Engineering Guide](https://developers.openai.com/api/docs/guides/prompt-engineering).
- Anthropic’s prompt engineering overview says prompt work should start with clear success criteria and empirical tests. Source: [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview).
- OpenAI’s agent evals guidance treats traces, tool calls, handoffs, and safety violations as evaluation targets. Source: [OpenAI Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals).

### Persistent repository instruction quality criteria

High-quality repository instructions should:

1. be stable and repository-wide;
2. include build/test/validation commands and project conventions;
3. be concise;
4. avoid task-specific workflow bodies;
5. preserve local precedence and host-specific behavior;
6. point to deeper workflow surfaces instead of duplicating them.

External evidence:

- GitHub says repository custom instructions should help Copilot understand how to build, test, and validate the project and should not be task-specific. Source: [GitHub Copilot custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot).
- OpenCode says project `AGENTS.md` should be committed and should cover build, lint, test, architecture, and project-specific conventions. Source: [OpenCode Rules](https://opencode.ai/docs/rules/).
- The AGENTS.md open format frames AGENTS.md as a README-like file for agents with project overview, build/test commands, code style, testing, and security notes. Source: [AGENTS.md open format](https://agents.md/).

### Skill quality criteria

A high-quality AI skill should:

1. be a reusable context package, not a human manual;
2. have a concise routing description;
3. use `SKILL.md` or equivalent as a small entrypoint;
4. use progressive disclosure for references, scripts, examples, and assets;
5. keep the main body short enough to avoid context bloat;
6. include deterministic scripts only when they improve reliability;
7. treat scripts and external resources as security-sensitive;
8. include explicit trigger and non-trigger behavior;
9. be evaluated with positive, negative, forbidden-adjacent, and regression cases;
10. be maintained from observed failure modes, not by accumulating prose.

External evidence:

- OpenAI Codex Skills defines skills as packages of instructions/resources/scripts and says descriptions drive implicit invocation; descriptions should explain exactly when a skill should and should not trigger. Source: [OpenAI Codex Skills](https://developers.openai.com/codex/skills).
- Anthropic’s skill best practices say descriptions are critical to selection, should be specific, and skill bodies should use progressive disclosure and stay concise. Source: [Anthropic Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).
- OpenCode Skills says name and description are shown to the model and the body is loaded by a skill tool; it also supports per-skill permissions. Source: [OpenCode Skills](https://opencode.ai/docs/skills/).
- Microsoft Agent Skills defines skills as portable instructions, scripts, and resources, with progressive disclosure and script-security guidance. Source: [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills).
- Perplexity’s skill-maintenance article treats descriptions as routing triggers, says every skill is a context tax, and recommends evals before skill changes. Source: [Perplexity, Designing, Refining, and Maintaining Agent Skills](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity).

### Agent/subagent quality criteria

A high-quality agent or subagent should:

1. have one narrow responsibility;
2. have a description that functions as delegation/routing logic;
3. run with the least necessary tools;
4. isolate context where isolation improves quality;
5. return structured findings or reports;
6. avoid taking over final acceptance unless explicitly designed as a handoff system;
7. avoid write access unless the task and file boundaries are constrained;
8. avoid recursive fan-out or over-delegation without evidence;
9. preserve parent-owned orchestration when the parent must interpret policy or validate diffs.

External evidence:

- Claude Code subagents have separate context, prompts, tools, and permissions, and are delegated by description. Source: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents).
- OpenCode agents require descriptions that say what the agent does and when to use it, and expose permissions for tools and actions. Source: [OpenCode Agents](https://opencode.ai/docs/agents/).
- OpenAI Codex subagents are specialized agents whose results are collected by the main agent; custom agents should be narrow and opinionated. Source: [OpenAI Codex Subagents](https://developers.openai.com/codex/subagents).
- Gemini CLI subagents use separate context, custom instructions, curated tools, and main-session orchestration; Google cautions that heavy code-edit subagents can conflict or overwrite each other. Source: [Google Developers Blog, Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/).
- Anthropic’s “Building effective agents” recommends simple composable patterns first, adding complexity only when measurement shows improvement. Source: [Anthropic, Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents).

### Workflow implementation quality criteria

A high-quality repository-native workflow should:

1. have explicit invocation criteria;
2. have positive triggers, negative triggers, and skip cases;
3. have forbidden adjacency for easily confused workflows;
4. define allowed and forbidden writes;
5. define required reads or evidence;
6. define gates and escalation behavior;
7. define report contracts;
8. be rendered deterministically into host surfaces;
9. support stale-surface detection;
10. be tested both deterministically and with prompt-style evals.

External evidence:

- Anthropic distinguishes predefined workflows from dynamic agents and describes workflow patterns such as prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer loops. Source: [Anthropic, Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents).
- Microsoft distinguishes skills from workflows: skills are selected by AI, while workflows are explicit deterministic paths better suited for side effects, approvals, and predictable behavior. Source: [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills).
- GitHub’s Copilot customization cheat sheet distinguishes always-on instructions, manual prompts, custom agents, subagents, skills, hooks, and MCP by trigger mode and use case. Source: [GitHub Copilot customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet).

### Permission and write-boundary quality criteria

High-quality permission and write-boundary design should:

1. use least privilege;
2. separate static tool permissions from runtime task intent;
3. use read-only roles when writes are not needed;
4. constrain write-capable agents by file allowlists and denylists;
5. require explicit approval or confirmation for risky actions;
6. validate actual changes against the task boundary;
7. use deterministic safeguards because prompt injection cannot be fully eliminated.

External evidence:

- OpenCode Permissions defines allow/ask/deny behavior and granular permission rules. Source: [OpenCode Permissions](https://opencode.ai/docs/permissions/).
- Microsoft Agent Skills recommends sandboxing, resource limits, input validation, allowlisting, and logging for scripts. Source: [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills).
- MCP security guidance recommends least privilege, consent before execution, exact command visibility, sandboxing, and avoiding broad scopes. Source: [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices).
- NCSC explains that prompt injection does not have a reliable data/instruction boundary and recommends deterministic safeguards and privilege reduction. Source: [NCSC, Prompt injection is not SQL injection](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection).

### Evaluation quality criteria

High-quality evaluation should cover:

1. prompt behavior;
2. skill routing;
3. positive triggers;
4. negative triggers;
5. forbidden adjacency;
6. tool use;
7. handoffs;
8. report contracts;
9. permission boundaries;
10. regression cases from real failures;
11. deterministic and model-based checks where appropriate;
12. cross-host behavior where multiple hosts are supported.

External evidence:

- OpenAI’s agent evals guidance uses traces, graders, datasets, and eval runs to check tools, handoffs, instructions, safety requirements, prompts, routing, and guardrails. Source: [OpenAI Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals).
- OpenAI’s eval-skills article recommends explicit, implicit, contextual, and negative-control eval prompts, deterministic graders, repo cleanliness checks, sandbox/permission checks, and real-failure-driven coverage. Source: [OpenAI, Evals in agentic workflows](https://developers.openai.com/blog/eval-skills).
- Perplexity recommends evals before skill creation, with positive examples, negative examples, forbidden loads, neighbor confusion, progressive-loading checks, end-to-end behavior, LLM-judge cases, and cross-model testing. Source: [Perplexity skill-maintenance article](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity).

## Truthmark Gap Analysis

Severity levels:

- Critical: unsafe or invalid behavior would be likely if shipped or expanded without mitigation.
- High: likely to reduce workflow correctness, reliability, or safety in normal use.
- Medium: important quality improvement; current behavior may be acceptable but not world-class or fully proven.
- Low: useful refinement, mostly maintainability or clarity.
- Already strong: current repository aligns well with the literature.

### Gap analysis table

| Severity | Area | Finding | Repository evidence | External source evidence | Why it matters |
|---|---|---|---|---|---|
| Already strong | Product architecture | Truthmark is repository-native, branch-scoped, Git-reviewable, and explicitly not a private memory or daemon system. | README describes Git-native truth and explicitly says Truthmark is not an MCP memory server, daemon, or prompt-history artifact. `FutureVision.md` rejects memory servers and session persistence. Sources: [`README.md`](https://github.com/merlinhu1/truthmark/tree/subagent-improvement), [`FutureVision.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/FutureVision.md). | AGENTS.md, GitHub, and OpenCode all treat repository instruction files as committed project context. Sources: [AGENTS.md open format](https://agents.md/), [GitHub custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot), [OpenCode Rules](https://opencode.ai/docs/rules/). | This is an appropriate foundation for a repository truth protocol and avoids hidden state. |
| Already strong | Root instruction placement | Root managed blocks are compact and route to workflow surfaces rather than embedding full procedures. | `AGENTS.md`, `CLAUDE.md`, and tests show compact managed blocks and workflow references. Sources: [`AGENTS.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/AGENTS.md), [`CLAUDE.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/CLAUDE.md), [`tests/init/init.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/init/init.test.ts). | GitHub says repository instructions should not be task-specific; Claude/OpenAI/Microsoft skill docs place detailed repeatable procedures in skills. Sources: [GitHub custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot), [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [OpenAI Codex Skills](https://developers.openai.com/codex/skills), [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills). | Reduces always-on prompt bloat and keeps stable policy separate from workflow bodies. |
| Already strong | Manifest-owned workflow metadata | The typed manifest owns workflow ids, descriptions, triggers, negative triggers, forbidden adjacency, gates, writes, reports, and subagent assignments. | `src/agents/workflow-manifest.ts` defines these fields; manifest tests require them. Sources: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts), [`tests/agents/workflow-manifest.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/workflow-manifest.test.ts). | Skill and workflow literature repeatedly emphasizes explicit descriptions, routing, scope, and structured outputs. Sources: [OpenAI Codex Skills](https://developers.openai.com/codex/skills), [Perplexity skill-maintenance article](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents). | A typed manifest prevents hand-edited prompt drift and makes workflow protocol testable. |
| Already strong | Routing descriptions | Generated descriptions are explicitly treated as routing triggers, not summaries. | Workflow overview says descriptions are routing triggers; manifest tests forbid summary-like descriptions and require trigger language. Sources: [`docs/truth/workflows/overview.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/overview.md), [`tests/agents/workflow-manifest.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/workflow-manifest.test.ts). | Perplexity says skill descriptions are routing triggers; OpenAI, Anthropic, and OpenCode say descriptions drive skill/agent selection. Sources: [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [OpenAI Codex Skills](https://developers.openai.com/codex/skills), [Anthropic Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [OpenCode Skills](https://opencode.ai/docs/skills/). | This is one of the most important design choices for workflow correctness. |
| Already strong | Sync-only automatic workflow | Truth Sync is the only automatic finish-time workflow; Structure, Document, Realize, and Check are explicit/manual. | Workflow overview, manifest, root blocks, and generated surfaces all state this. Sources: [`docs/truth/workflows/overview.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/overview.md), [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts), [`AGENTS.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/AGENTS.md). | Microsoft distinguishes AI-selected skills from deterministic workflows for side effects/approvals; Claude supports manual-only skill modes; GitHub distinguishes automatic and manual surfaces. Sources: [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills), [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [GitHub customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet). | Automatic side-effecting workflows should be narrowly scoped. Truthmark’s current automatic behavior is conservative. |
| Already strong | Read-only verifier subagents | Route auditor, claim verifier, and doc reviewer are scoped as read-only verifier agents with parent-owned decisions. | `workflow-surfaces.ts` defines read-only context boundaries and JSON report expectations. Generated host agents reflect this. Source: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts). | Claude, Codex, OpenCode, and Gemini describe subagents as specialists with separate context and tool scopes. Sources: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents), [OpenAI Codex Subagents](https://developers.openai.com/codex/subagents), [OpenCode Agents](https://opencode.ai/docs/agents/), [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/). | Verifier agents are a low-risk, high-fit subagent pattern for Truthmark. |
| Already strong | Write lease concept | `truth-doc-writer` requires a parent-issued lease and parent diff validation. | `workflow-surfaces.ts`, generated doc-writer agents, and write-lease tests encode lease fields, off-lease behavior, and path validation. Sources: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts), [`.opencode/agents/truth-doc-writer.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-doc-writer.md), [`tests/agents/write-lease.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/write-lease.test.ts). | OpenCode supports least-privilege permissions, Microsoft and MCP stress sandbox/allowlist controls, and NCSC stresses deterministic safeguards because prompt injection cannot be fully eliminated. Sources: [OpenCode Permissions](https://opencode.ai/docs/permissions/), [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills), [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices), [NCSC prompt injection guidance](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection). | The lease model is a practical bridge between static host permissions and runtime workflow intent. |
| Critical | Future write-worker expansion | Adding `truth-route-structurer`, `truth-realize-writer`, or other write-capable workers before complete leases, conflict policy, diff validation, report schemas, and evals would be a critical risk. | The research file proposes additional write-capable workers but labels itself non-canonical. Current source promotes only `truth-doc-writer`. Sources: [`research/2026-05-16-write-capable-opencode-subagents-design.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-16-write-capable-opencode-subagents-design.md), [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts). | Gemini cautions that heavy code-edit subagents can conflict or overwrite each other; Anthropic recommends adding complexity only when measurement shows improvement; NCSC recommends deterministic safeguards and privilege reduction. Sources: [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/), [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), [NCSC prompt injection guidance](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection). | Code-writing or route-rewriting workers can create overlapping edits, hidden policy drift, and false acceptance if not strictly controlled. |
| High | Empirical prompt/workflow eval coverage | The repo has strong deterministic shape tests, but inspected evidence does not show a complete prompt-style eval suite for real workflow routing, negative prompts, forbidden adjacency, report compliance, and delegation behavior. | Tests enforce manifest shape and generated surfaces; they do not appear to exercise a broad model-facing prompt corpus. Sources: [`tests/agents/workflow-manifest.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/workflow-manifest.test.ts), [`tests/init/init.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/init/init.test.ts), [`tests/agents/prompts.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/prompts.test.ts). | OpenAI recommends explicit, implicit, contextual, and negative-control eval prompts; Perplexity recommends evals before skill changes and neighbor-confusion tests; Anthropic says prompt engineering should begin from success criteria and empirical tests. Sources: [OpenAI Eval Skills](https://developers.openai.com/blog/eval-skills), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview). | Without behavioral evals, prompt and routing quality cannot be claimed as world-class. |
| High | Delegation policy not fully first-class | The manifest lists subagents but does not appear to own detailed `delegateWhen`, `inlineWhen`, conflict policy, parallelism policy, or host fallback policy. | `workflow-manifest.ts` has read-only and write subagent assignment but no structured delegation-policy fields. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts). | Claude distinguishes when to use subagents versus the main conversation; Codex notes subagents consume more tokens; Gemini cautions about parallel code-edit conflicts; Anthropic recommends simple workflows and measured complexity. Sources: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents), [OpenAI Codex Subagents](https://developers.openai.com/codex/subagents), [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/), [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents). | Subagent dispatch is a product behavior, not a documentation detail. It should be manifest-owned and testable. |
| High | Cross-host permission equivalence cannot be assumed | The same logical doc writer exists across several hosts, but host permission systems differ; Gemini currently has commands only. | Generated surfaces include doc writers for Codex, OpenCode, Claude, and GitHub Copilot, while Gemini receives commands. OpenCode has explicit granular permissions. Sources: [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts), [`.gemini/commands/truthmark/sync.toml`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.gemini/commands/truthmark/sync.toml), [`.opencode/agents/truth-doc-writer.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-doc-writer.md). | GitHub docs show feature support varies across surfaces; Claude states skill `allowed-tools` grants permission but does not necessarily restrict other tools; OpenCode permissions are granular but host-specific; Gemini subagents are separate from command files. Sources: [GitHub customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet), [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [OpenCode Permissions](https://opencode.ai/docs/permissions/), [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/). | Protocol parity and permission parity are different. Truthmark should not imply identical safety across hosts without conformance evidence. |
| High | Parent diff validation is not yet proven end-to-end | The lease pattern and path validator are strong, but inspected tests do not show complete parent-orchestration simulations that compare worker reports, actual diffs, workflow status, and final acceptance. | `write-lease.test.ts` validates allowed/off-lease paths; generated prompts instruct parent diff validation. Sources: [`tests/agents/write-lease.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/write-lease.test.ts), [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts). | OpenAI agent evals evaluate traces, handoffs, and violations; Goalkeeper’s judge gate inspects diff/log against a Definition of Done after validators pass. Sources: [OpenAI Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals), [Goalkeeper](https://github.com/itsuzef/goalkeeper). | The most important safety property for write-capable workers is acceptance based on actual diff, not self-report. |
| High | Report contracts are not fully schema-owned across all surfaces | The manifest includes report sections and generated surfaces contain report instructions, but inspected evidence does not show a complete schema validator for every workflow report and every worker report across hosts. | Manifest has `reportSections`; write worker returns YAML; Sync has structured parser references; tests check some report sections. Sources: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts), [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts), [`tests/agents/prompts.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/prompts.test.ts). | OpenAI evals and Goalkeeper both treat structured outputs and checkable definitions of done as evaluation artifacts. Sources: [OpenAI Eval Skills](https://developers.openai.com/blog/eval-skills), [OpenAI Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals), [Goalkeeper](https://github.com/itsuzef/goalkeeper). | Report shape is part of workflow reliability and should be machine-checkable where possible. |
| High | Stale research/canonical drift risk | The write-capable subagent research doc describes a proposed OpenCode-first direction, but current source has already promoted `truth-doc-writer` across several hosts. | Research file is non-canonical and proposes broader workers; canonical source/generated surfaces include doc writer across Codex/OpenCode/Claude/GitHub. Sources: [`research/2026-05-16-write-capable-opencode-subagents-design.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-16-write-capable-opencode-subagents-design.md), [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts). | Anthropic cautions against time-sensitive stale skill content; Perplexity says skill descriptions and changes need maintenance/evals because small wording changes affect routing. Sources: [Anthropic Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity). | Agents may treat research as current behavior unless the canonical boundary is repeatedly clear. |
| Medium | Skill body bloat and progressive disclosure | Generated workflow skills are necessarily procedural, but the repository does not yet appear to enforce broad body-size or duplication budgets across all generated host surfaces. | Existing tests enforce compact root blocks and description length, but inspected tests do not appear to enforce skill body budget or duplicated-procedure budget across every generated skill. Sources: [`tests/init/init.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/init/init.test.ts), [`tests/agents/workflow-manifest.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/workflow-manifest.test.ts). | Anthropic recommends keeping `SKILL.md` concise and splitting details; Perplexity says every skill is a context tax; Agent Skills spec recommends progressive disclosure. Sources: [Anthropic Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [Agent Skills Specification](https://agentskills.io/specification). | Workflow skills can become too large to route well or too expensive to load. |
| Medium | Positive/negative routing examples are manifest data but not enough by themselves | The manifest has positive, negative, and forbidden-adjacent examples, but model-facing prompt behavior needs an eval corpus. | Manifest includes these arrays and tests require them. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts). | OpenAI and Perplexity both recommend explicit prompt sets, negative controls, and neighbor-confusion evals. Sources: [OpenAI Eval Skills](https://developers.openai.com/blog/eval-skills), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity). | Metadata can be correct while actual model routing still fails. |
| Medium | Gemini capability gap | Truthmark currently generates Gemini commands, while 2026 Gemini CLI also supports subagents. This is not necessarily wrong, but it is a capability difference that should remain explicit. | Gemini generated surfaces are command TOMLs under `.gemini/commands/truthmark`. Source: [`.gemini/commands/truthmark/sync.toml`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.gemini/commands/truthmark/sync.toml). | Gemini CLI supports project/global subagents under `.gemini/agents` with descriptions, tools, and separate context; Google cautions about heavy code-edit conflicts. Source: [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/). | Users may assume all hosts have the same generated subagent behavior. |
| Medium | Security standard for future scripts/assets is not yet central | Current Truthmark workflow skills appear mostly prompt-based, but literature treats future skill scripts/assets as security-sensitive. | Generated surfaces and skills exist, but the current repository does not appear to have a central skill-script security policy because scripts are not the main current pattern. Source: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts). | Microsoft recommends sandboxing, input validation, allowlisting, and audit logging for scripts; MCP and NCSC recommend least privilege and deterministic safeguards. Sources: [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills), [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices), [NCSC prompt injection guidance](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection). | If future skills add scripts or assets, security rules should be explicit before expansion. |
| Medium | Cross-host conformance tests need protocol-level checks | Tests assert many generated files exist, but protocol parity across hosts should be tracked as a matrix, not only snapshots. | `init.test.ts` verifies files, metadata, and selected contents across hosts. Source: [`tests/init/init.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/init/init.test.ts). | GitHub shows host surfaces differ in automatic/manual triggers and feature support; OpenCode, Claude, Codex, and Gemini all expose different skill/agent/command semantics. Sources: [GitHub customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet), [OpenCode Skills](https://opencode.ai/docs/skills/), [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [OpenAI Codex Skills](https://developers.openai.com/codex/skills), [Gemini custom commands](https://google-gemini.github.io/gemini-cli/docs/cli/custom-commands.html). | Host-specific differences are a first-class risk area for a cross-host protocol. |
| Low | Root managed blocks may be too compressed for human scanning | Compactness is good, but extremely compressed root blocks can be harder for humans to audit. | Root blocks are compact and tests enforce compactness. Sources: [`AGENTS.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/AGENTS.md), [`tests/init/init.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/init/init.test.ts). | GitHub recommends instructions no longer than about two pages but readable; AGENTS.md says precise agent guidance is useful. Sources: [GitHub custom instructions](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot), [AGENTS.md open format](https://agents.md/). | A small readability pass may help maintainers without increasing model context meaningfully. |
| Low | Host metadata compatibility should stay explicit | Hosts support different metadata fields and may ignore unknown fields. | Generated surfaces target different host paths and formats. Source: [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts). | OpenCode ignores unknown metadata fields; Agent Skills spec defines portable fields; Claude/Codex have host-specific semantics. Sources: [OpenCode Skills](https://opencode.ai/docs/skills/), [Agent Skills Specification](https://agentskills.io/specification), [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [OpenAI Codex Skills](https://developers.openai.com/codex/skills). | Metadata drift is likely as host standards evolve. |

## Workflow-by-Workflow Quality Assessment

This section maps the literature and gap analysis to each Truthmark workflow. It is intentionally practical, because workflows are first-class product architecture in Truthmark.

### Truth Sync

Current role: automatic finish-time workflow after functional code/config/behavior changes.

Repository evidence: Truth Sync is the only automatic finish-time workflow and may write canonical truth docs and routing files. Sources: [`docs/truth/workflows/overview.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/overview.md), [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

Literature fit:

- Aligns with repository-native instruction patterns from AGENTS.md, GitHub, Codex, and OpenCode.
- Aligns with workflow-gate patterns from Anthropic.
- Aligns with evaluation needs from OpenAI and Perplexity.

Quality assessment:

| Dimension | Assessment |
|---|---|
| Routing description | Strong structurally; should be prompt-eval tested against finish-time, docs-only, and mixed changes. |
| Negative triggers | Strong in manifest; needs model-facing evals. |
| Forbidden adjacency | Strong conceptually; especially important against Structure/Document/Realize confusion. |
| Write boundary | Strong: truth docs/routing only. |
| Report contract | Present; should become schema-checked across hosts. |
| Subagent dispatch | Appropriate for route/claim verification and leased doc writing; needs manifest-owned delegation criteria. |
| Automatic/manual status | Correctly automatic only at finish time; should remain narrowly scoped. |
| Reliability confidence | Medium without behavioral evals. |

### Truth Structure

Current role: explicit/manual route topology and truth-doc structure repair.

Repository evidence: Manifest defines Structure for missing/broad/misowned/stale routing and shape repair; it is not automatic. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

Literature fit:

- Aligns with routing/workflow boundary literature.
- Particularly sensitive to neighbor-confusion evals.

Quality assessment:

| Dimension | Assessment |
|---|---|
| Routing description | Strong but should be tested against Document and Sync confusion. |
| Negative triggers | Present. |
| Forbidden adjacency | Present. |
| Write boundary | Routing and starter truth docs, not functional code. |
| Report contract | Present; should be schema-checked. |
| Subagent dispatch | Route auditor is useful; write-capable route structurer should remain research-only until strict leases/evals exist. |
| Automatic/manual status | Correctly manual. |
| Reliability confidence | Medium without routing evals. |

### Truth Document

Current role: explicit/manual documentation of existing implemented behavior.

Repository evidence: Manifest and generated skills distinguish Document from Sync and Realize. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts), [`.opencode/skills/truthmark-document/SKILL.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/skills/truthmark-document/SKILL.md).

Literature fit:

- Aligns well with skill-as-context-package literature.
- Benefits from evidence-gate and claim-verifier subagents.

Quality assessment:

| Dimension | Assessment |
|---|---|
| Routing description | Strong, but needs prompt evals for “document existing behavior” versus “implement from docs.” |
| Negative triggers | Present. |
| Forbidden adjacency | Present. |
| Write boundary | Truth docs/routing only. |
| Report contract | Present; should be schema-checked. |
| Subagent dispatch | `truth-doc-writer` can help when leases are precise. |
| Automatic/manual status | Correctly manual. |
| Reliability confidence | Medium without prompt/e2e evals. |

### Truth Realize

Current role: explicit/manual implementation from truth docs into functional code.

Repository evidence: Generated Realize surface states it is doc-first, code-only, and must not update truth docs or routing. Source: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts).

Literature fit:

- Aligns with prompt-chaining and workflow-vs-agent distinction.
- Highest risk if converted into write-capable worker because it edits functional code.

Quality assessment:

| Dimension | Assessment |
|---|---|
| Routing description | Strong; must stay distinct from Sync and Document. |
| Negative triggers | Present. |
| Forbidden adjacency | Present. |
| Write boundary | Functional code only; no truth docs/routing. |
| Report contract | Present; should be schema-checked. |
| Subagent dispatch | No write worker currently; this is conservative and appropriate. |
| Automatic/manual status | Correctly manual. |
| Reliability confidence | Medium for prompt surface; lower for any future code-writing subagent without further evals. |

### Truth Check

Current role: explicit/manual truth health audit.

Repository evidence: Manifest defines Truth Check as audit/read-only and not a general code review or finish-time rewrite. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

Literature fit:

- Aligns with verifier/judge/eval patterns.
- Should avoid becoming a generic code-review workflow.

Quality assessment:

| Dimension | Assessment |
|---|---|
| Routing description | Strong; needs negative evals against general lint/code review. |
| Negative triggers | Present. |
| Forbidden adjacency | Present. |
| Write boundary | Read-only by default. |
| Report contract | Present; should be schema-checked. |
| Subagent dispatch | Read-only verifiers fit well. |
| Automatic/manual status | Correctly manual. |
| Reliability confidence | Medium without audit prompt evals and structured report validation. |

## Recommendations

Every recommendation below is traceable to both repository evidence and reviewed literature.

### Ship now

These are small, low-risk changes that improve workflow quality immediately.

#### 1. Add this research document under `research/`

Change:

- Add `research/prompt-skill-agent-workflow-quality-uplift-review.md`.

Repository evidence:

- The research folder already contains non-canonical design references and explicitly separates research from canonical behavior. Source: [`research/2026-05-15-agent-skills-workflow-review.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-15-agent-skills-workflow-review.md).

External evidence:

- Perplexity and Anthropic both emphasize maintaining skill and prompt systems through observed failures, explicit evals, and current documentation. Sources: [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [Anthropic Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

Rationale:

- This creates a traceable research artifact without changing canonical behavior.

#### 2. Add a non-canonical-status note to the write-capable subagent research file

Change:

- Add a short note near the top of `research/2026-05-16-write-capable-opencode-subagents-design.md`:
  - `truth-doc-writer` has been promoted into source/generated surfaces for several hosts.
  - Additional workers such as `truth-route-structurer` and `truth-realize-writer` remain research-only.
  - Behavior-bearing rules live in source/generated surfaces/tests, not this research file.

Repository evidence:

- The research file proposes write-capable OpenCode subagents, while current source/generated surfaces include `truth-doc-writer` across more hosts. Sources: [`research/2026-05-16-write-capable-opencode-subagents-design.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-16-write-capable-opencode-subagents-design.md), [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts).

External evidence:

- Anthropic cautions against stale or time-sensitive skill information; Perplexity emphasizes that skill description and behavior changes require maintenance and eval discipline. Sources: [Anthropic Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity).

#### 3. Add snapshot tests for the `truth-doc-writer` lease language across all generated agent hosts

Change:

- Extend init/generated-surface tests to assert that every generated `truth-doc-writer` surface includes:
  - explicit parent-issued lease requirement;
  - allowed write paths;
  - forbidden write classes;
  - off-lease block/report behavior;
  - YAML report fields;
  - parent actual-diff validation language.

Repository evidence:

- `truth-doc-writer` already has this behavior in templates and OpenCode generated surface; write-lease tests validate allowed/off-lease paths. Sources: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts), [`.opencode/agents/truth-doc-writer.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-doc-writer.md), [`tests/agents/write-lease.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/write-lease.test.ts).

External evidence:

- OpenCode supports granular permissions; MCP and NCSC recommend least privilege and deterministic safeguards; OpenAI evals recommend permission regression checks. Sources: [OpenCode Permissions](https://opencode.ai/docs/permissions/), [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices), [NCSC prompt injection guidance](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection), [OpenAI Eval Skills](https://developers.openai.com/blog/eval-skills).

#### 4. Add explicit Gemini capability language

Change:

- In generated Gemini commands and workflow overview, state:
  - Gemini surfaces in this Truthmark version are command-only.
  - They do not install generated Gemini subagents.
  - The same workflow gates, write boundaries, and report expectations still apply inline.

Repository evidence:

- Gemini generated surfaces are TOML commands, while other hosts receive generated agents. Sources: [`.gemini/commands/truthmark/sync.toml`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.gemini/commands/truthmark/sync.toml), [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts).

External evidence:

- Gemini CLI supports both commands and subagents, but they are different surfaces. Sources: [Gemini custom commands](https://google-gemini.github.io/gemini-cli/docs/cli/custom-commands.html), [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/).

#### 5. Add a generated-surface bloat smoke test

Change:

- Add deterministic limits for generated workflow descriptions, root managed blocks, and skill body size.
- Start with warnings or generous thresholds to avoid blocking useful detail too early.

Repository evidence:

- Current tests already enforce compact root blocks and description shape. Sources: [`tests/init/init.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/init/init.test.ts), [`tests/agents/workflow-manifest.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/workflow-manifest.test.ts).

External evidence:

- Anthropic recommends keeping `SKILL.md` concise; Perplexity says every skill is a context tax; Agent Skills spec recommends keeping main bodies concise and using progressive disclosure. Sources: [Anthropic Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [Agent Skills Specification](https://agentskills.io/specification).

#### 6. Add a deterministic check that canonical docs and generated surfaces agree on subagent inventory

Change:

- Add a test or `truthmark check` diagnostic comparing:
  - manifest subagent assignments;
  - generated host surfaces;
  - workflow overview summary;
  - README installed-surface summary.

Repository evidence:

- The repository has a source manifest, generated surfaces, and human docs that can drift. Sources: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts), [`docs/truth/workflows/overview.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/overview.md), [`README.md`](https://github.com/merlinhu1/truthmark/tree/subagent-improvement).

External evidence:

- Perplexity emphasizes skill maintenance because small text changes affect routing; OpenAI evals recommend repo cleanliness and regression checks. Sources: [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [OpenAI Eval Skills](https://developers.openai.com/blog/eval-skills).

### Build next

These are medium-sized changes requiring source, renderer, generated-surface, and test updates.

#### 1. Add a prompt-style workflow routing eval suite

Change:

- Add fixtures for each workflow:
  - positive explicit invocation;
  - positive implicit invocation where applicable;
  - contextual invocation;
  - negative trigger;
  - forbidden adjacency;
  - skip case;
  - ambiguous mixed case.

Suggested file pattern:

- `tests/evals/workflow-routing-cases.ts`
- `tests/evals/workflow-routing.test.ts`

Suggested fixture shape:

```ts
type WorkflowRoutingEvalCase = {
  id: string;
  userPrompt: string;
  changedFiles?: string[];
  expectedWorkflow: WorkflowId | "none" | "block";
  expectedReason: string;
  forbiddenWorkflows?: WorkflowId[];
  source: "manifest-positive" | "manifest-negative" | "forbidden-adjacent" | "real-failure" | "synthetic";
};
```

Repository evidence:

- Manifest already contains positive triggers, negative triggers, and forbidden adjacency. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

External evidence:

- OpenAI recommends explicit, implicit, contextual, and negative-control eval prompts; Perplexity recommends positive/negative/forbidden and neighbor-confusion evals; Anthropic starts prompt engineering with success criteria/evals. Sources: [OpenAI Eval Skills](https://developers.openai.com/blog/eval-skills), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview).

#### 2. Promote delegation policy into the workflow manifest

Change:

- Extend `WorkflowManifestEntry` with a structured delegation policy.

Suggested pseudocode:

```ts
delegationPolicy: {
  delegateReadOnlyWhen: string[];
  delegateWriteWhen: string[];
  keepInlineWhen: string[];
  maxParallelReadOnlySubagents?: number;
  maxParallelWriteLeases?: number;
  conflictPolicy: "serialize" | "block" | "parent-only";
  parentValidationRequired: string[];
  hostFallback: {
    whenSubagentsUnavailable: "inline" | "block";
    note: string;
  };
}
```

Repository evidence:

- The manifest owns subagent assignments but not detailed delegation policy. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

External evidence:

- Claude distinguishes main-conversation versus subagent use; Codex warns subagents cost more tokens; Gemini warns about code-edit conflicts; Anthropic recommends adding complexity only when measured. Sources: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents), [OpenAI Codex Subagents](https://developers.openai.com/codex/subagents), [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/), [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents).

#### 3. Add workflow and worker report schemas

Change:

- Convert report sections into schema-like definitions for each workflow.
- Add a reusable worker YAML schema for `truth-doc-writer`.
- Add validators or snapshot tests for generated report contracts.

Suggested pseudocode:

```ts
type ReportField = {
  key: string;
  required: boolean;
  type: "string" | "string[]" | "object[]" | "enum";
  enumValues?: string[];
};

type WorkflowReportContract = {
  workflow: WorkflowId;
  requiredHeadings: string[];
  requiredFields: ReportField[];
};
```

Repository evidence:

- Manifest has report sections and generated surfaces include report instructions. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

External evidence:

- OpenAI agent evals evaluate output and trace structure; Goalkeeper uses a structured Definition of Done, validator output, judge result, and fix-list. Sources: [OpenAI Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals), [Goalkeeper](https://github.com/itsuzef/goalkeeper).

#### 4. Add parent/subagent orchestration tests

Change:

- Add deterministic simulations for:
  - parent issues valid lease;
  - worker returns completed YAML;
  - actual diff matches lease;
  - actual diff violates lease;
  - worker report omits required fields;
  - worker blocks on ambiguous ownership;
  - parent rejects off-lease edit even if worker reports success;
  - overlapping write leases are blocked or serialized.

Repository evidence:

- Current write-lease tests validate allowed/off-lease paths; generated surfaces state parent validation. Sources: [`tests/agents/write-lease.test.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/tests/agents/write-lease.test.ts), [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts).

External evidence:

- OpenAI agent evals check handoffs, tools, safety violations, and routing; Goalkeeper’s judge pattern validates diff/log against an explicit contract after validators pass. Sources: [OpenAI Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals), [Goalkeeper](https://github.com/itsuzef/goalkeeper).

#### 5. Add cross-host protocol conformance matrix

Change:

- Add a generated or tested matrix asserting for each host:
  - workflow ids present;
  - invocation policy present;
  - routing description present;
  - gates present;
  - write boundaries present;
  - report contract present;
  - read-only agents present or explicit fallback;
  - write-capable agent present or explicit fallback;
  - host capability limitations documented.

Suggested test target:

```ts
expectHostProtocolParity({
  host: "gemini",
  workflow: "truth-sync",
  supportsGeneratedSubagents: false,
  requiredFallbackNote: true,
});
```

Repository evidence:

- `generated-surfaces.ts` emits different host surfaces; Gemini currently receives commands only. Source: [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts).

External evidence:

- GitHub, Gemini, OpenCode, Claude, and Codex expose different customization primitives. Sources: [GitHub customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet), [Gemini custom commands](https://google-gemini.github.io/gemini-cli/docs/cli/custom-commands.html), [OpenCode Skills](https://opencode.ai/docs/skills/), [Claude Code skills](https://code.claude.com/docs/en/slash-commands), [OpenAI Codex Skills](https://developers.openai.com/codex/skills).

#### 6. Add stale-surface diagnostics to `truthmark check`

Change:

- Extend `truthmark check` to detect:
  - generated surface version mismatch;
  - workflow list mismatch;
  - subagent inventory mismatch;
  - report section mismatch;
  - generated file missing for configured host;
  - manual edit to generated managed block;
  - canonical docs mentioning a workflow or agent not in the manifest.

Repository evidence:

- `FutureVision.md` identifies stale generated surfaces and conformance tests as important V2 directions; current source has generated surfaces and version markers. Source: [`FutureVision.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/FutureVision.md).

External evidence:

- OpenAI eval skills recommend repo cleanliness and regression checks; Perplexity emphasizes skill maintenance and change sensitivity. Sources: [OpenAI Eval Skills](https://developers.openai.com/blog/eval-skills), [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity).

#### 7. Add a Truthmark skill/security policy for future scripts and assets

Change:

- Add a canonical or generated standard stating:
  - default generated skills should not include executable scripts unless needed;
  - scripts must be deterministic;
  - scripts must be reviewed like code;
  - scripts must declare dependencies;
  - scripts must not access secrets or network unless explicitly allowed;
  - generated surfaces must not instruct agents to run unreviewed scripts.

Repository evidence:

- Current generated skills are prompt-heavy, but source templates are the natural place to enforce future skill format rules. Source: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts).

External evidence:

- Microsoft recommends sandboxing, input validation, allowlisting, logging, and source trust for scripts; Anthropic says skills from untrusted sources can introduce tool misuse or data exposure; MCP security emphasizes command visibility and least privilege. Sources: [Microsoft Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills), [Anthropic Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices).

### Research further

These ideas need examples, evals, or host-parity checks before adoption.

#### 1. Gemini generated subagents

Research question:

- Should Truthmark generate `.gemini/agents/*.md` surfaces in addition to `.gemini/commands/truthmark/*.toml`?

Repository evidence:

- Current Gemini generated surfaces are command files. Source: [`.gemini/commands/truthmark/sync.toml`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.gemini/commands/truthmark/sync.toml).

External evidence:

- Gemini CLI supports subagents with project/global Markdown files, descriptions, tools, and separate context. It also cautions about conflict risk in heavy code-editing tasks. Source: [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/).

Research criteria:

- host permission support;
- command/agent interaction model;
- support for read-only verifiers;
- support for leased doc writer;
- generated-surface parity;
- stale-surface tests;
- conflict behavior.

#### 2. `truth-route-structurer`

Research question:

- Can route/topology repair be safely delegated to a write-capable worker?

Repository evidence:

- The research file proposes broader write-capable workers, but source currently promotes only `truth-doc-writer`. Source: [`research/2026-05-16-write-capable-opencode-subagents-design.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-16-write-capable-opencode-subagents-design.md).

External evidence:

- Subagent sources support specialist workers, but also emphasize narrow roles, tool restrictions, and conflict management. Sources: [Claude Code subagents](https://code.claude.com/docs/en/sub-agents), [OpenAI Codex Subagents](https://developers.openai.com/codex/subagents), [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/).

Research criteria:

- route-write lease;
- ownership conflict policy;
- split/merge operation schema;
- route-map report contract;
- parent validation against actual diff;
- negative evals for over-structuring.

#### 3. `truth-realize-writer`

Research question:

- Can functional code realization be delegated safely, or should it remain parent-only?

Repository evidence:

- Truth Realize is currently explicit/manual and code-only, with no write subagent assignment. Source: [`src/agents/workflow-manifest.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

External evidence:

- Gemini warns that heavy code-edit subagents can conflict or overwrite each other; Anthropic recommends extensive sandbox testing and guardrails for autonomous agents. Sources: [Gemini CLI subagents](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/), [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents).

Research criteria:

- code-write lease;
- test contract;
- no truth-doc writes;
- conflict detection;
- rollback strategy;
- parent acceptance;
- stronger evals than doc writing.

#### 4. Judge-agent or reviewer-agent acceptance patterns

Research question:

- Should Truthmark add a judge-style verifier for parent workflow acceptance or Truth Check?

Repository evidence:

- Current read-only verifier agents already exist; Truth Check is read-only/audit-oriented. Source: [`src/templates/workflow-surfaces.ts`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts).

External evidence:

- Goalkeeper uses a fresh-context judge after validators pass; Anthropic describes evaluator-optimizer loops; OpenAI agent evals evaluate traces and outputs. Sources: [Goalkeeper](https://github.com/itsuzef/goalkeeper), [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), [OpenAI Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals).

Research criteria:

- judge input contract;
- judge output schema;
- false-positive/false-negative evals;
- whether judge is always-on, manual, or only for high-risk workflows;
- interaction with human review.

#### 5. Cross-model and cross-host routing evals

Research question:

- How stable are generated workflow descriptions across Codex, Claude, OpenCode, Copilot, and Gemini?

Repository evidence:

- Truthmark renders host-specific surfaces from one source. Source: [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts).

External evidence:

- Perplexity recommends cross-model evals; GitHub shows host feature support varies; Anthropic says test with the models planned for use. Sources: [Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity), [GitHub customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet), [Anthropic Skill Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices).

Research criteria:

- same prompt corpus;
- same expected routing;
- host-specific output capture;
- report-shape scoring;
- model/version tracking.

#### 6. Open Agent Skills compatibility

Research question:

- Should Truthmark render a host-neutral `.agents/skills` package in addition to host-specific skills?

Repository evidence:

- Truthmark already renders host-specific skills/prompts/commands/agents. Source: [`src/templates/generated-surfaces.ts`](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts).

External evidence:

- Agent Skills defines a portable `SKILL.md` package structure; OpenCode can read `.agents/skills`; OpenAI Codex Skills build on open Agent Skills concepts. Sources: [Agent Skills Specification](https://agentskills.io/specification), [OpenCode Skills](https://opencode.ai/docs/skills/), [OpenAI Codex Skills](https://developers.openai.com/codex/skills).

Research criteria:

- does it reduce duplication or add confusion;
- how host-specific metadata is represented;
- whether generated `.agents/skills` would be canonical or adapter;
- permission semantics.

## Proposed Quality Rubric for Truthmark

This rubric can be used to decide whether prompt, skill, agent, and workflow surfaces are approaching world-class quality.

### Prompt quality rubric

| Criterion | Minimum bar | World-class bar |
|---|---|---|
| Scope | States task and boundaries | States task, positive triggers, negative triggers, forbidden adjacency, and skip cases |
| Evidence | Mentions evidence | Requires source evidence and blocks/report when missing |
| Writes | Mentions allowed writes | Explicit allowed/forbidden writes with validation path |
| Output | Has report instructions | Schema-checkable report contract |
| Context placement | Uses root instructions | Places stable, workflow, skill, and reference context in separate layers |
| Evaluation | Manual review | Positive, negative, ambiguity, and regression prompt evals |

### Skill quality rubric

| Criterion | Minimum bar | World-class bar |
|---|---|---|
| Description | Says what skill does | Functions as routing boundary with when/not-when language |
| Body | Contains procedure | Concise body with progressive disclosure |
| Examples | Some examples | High-signal examples and negative cases only |
| Scripts | Optional scripts | Deterministic, reviewed, sandboxed scripts only |
| Maintenance | Updated ad hoc | Updated from observed failures and eval results |
| Tests | Snapshot only | Routing, load, report, and regression evals |

### Agent/subagent quality rubric

| Criterion | Minimum bar | World-class bar |
|---|---|---|
| Purpose | Named role | One narrow responsibility and explicit non-goals |
| Tools | Some limits | Least-privilege host permissions plus runtime constraints |
| Context | Separate prompt | Clear context boundary and assigned shard |
| Output | Text summary | Structured report with required fields |
| Writes | Prompt instruction | Static permissions plus runtime lease and parent diff validation |
| Delegation | Parent may use | Manifest-owned delegation criteria and conflict policy |

### Workflow quality rubric

| Criterion | Minimum bar | World-class bar |
|---|---|---|
| Invocation | User can run it | Explicit/manual/automatic policy with skip cases |
| Routing | Description exists | Positive/negative/forbidden-adjacent cases tested by evals |
| Gates | Some procedural steps | Shared gates with deterministic validation where possible |
| Writes | Described | Allowed/forbidden write contract and actual-diff checks |
| Reports | Human-readable | Schema-checkable and snapshot-tested |
| Surfaces | Generated | Cross-host protocol conformance and stale-surface diagnostics |

## Proposed Evaluation Matrix

| Evaluation category | Deterministic test | Prompt-style eval | Source support |
|---|---|---|---|
| Positive routing | Manifest has positive triggers; generated description includes use case | User prompt should select correct workflow | OpenAI Eval Skills; Perplexity |
| Negative routing | Manifest has negative triggers | User prompt should not trigger workflow | OpenAI Eval Skills; Perplexity |
| Forbidden adjacency | Manifest declares adjacent workflows | Mixed prompt should block or select correct workflow | Perplexity neighbor-confusion evals |
| Implicit invocation | Only Sync allows implicit invocation | Functional code change should trigger Sync at finish | GitHub/Claude/Microsoft invocation distinctions |
| Explicit invocation | Manual workflows have direct prompts | Explicit `/truthmark-*` request selects exact workflow | Gemini commands; GitHub prompt files |
| Read-only subagent dispatch | Generated agents are read-only and deny edits | Parent dispatches verifier for isolated shard | Claude/Codex/OpenCode subagents |
| Write lease acceptance | Allowed paths accepted | Worker edits leased docs only | OpenCode permissions; MCP least privilege |
| Off-lease rejection | Off-lease paths rejected | Worker self-reports success but diff violates lease | NCSC deterministic safeguards; Goalkeeper judge |
| Report compliance | Report schema validator passes/fails | Agent omits required report fields | OpenAI Agent Evals; Goalkeeper |
| Cross-host parity | Protocol matrix per host | Same scenario behaves equivalently by protocol | GitHub taxonomy; host docs |
| Stale-surface detection | Version/inventory checks | N/A | OpenAI repo cleanliness; Perplexity maintenance |
| Security checks | Permissions snapshot | Prompt injection tries to induce unauthorized write | MCP security; NCSC; OWASP |

## Proposed OpenCode Write-Capable Subagent Standard

This standard is intentionally stricter for OpenCode because OpenCode exposes granular permissions and is a strong proving ground for write-capable workers.

### Allowed only when

A write-capable OpenCode subagent is allowed only when:

1. the active workflow permits that worker;
2. the parent can issue an exact lease;
3. the lease names exact allowed writes;
4. the lease names explicit forbidden writes;
5. the worker can complete without interpreting global policy beyond the lease;
6. the parent will inspect actual Git diff;
7. there are no overlapping write leases;
8. host permissions constrain the worker as much as the host allows.

Repository evidence:

- `truth-doc-writer` already follows a lease pattern. Source: [`.opencode/agents/truth-doc-writer.md`](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-doc-writer.md).

External evidence:

- OpenCode supports granular allow/ask/deny permissions; MCP and NCSC support least privilege and deterministic safeguards. Sources: [OpenCode Permissions](https://opencode.ai/docs/permissions/), [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices), [NCSC prompt injection guidance](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection).

### Forbidden when

A write-capable worker is forbidden when:

1. ownership is ambiguous;
2. allowed writes cannot be named precisely;
3. the task requires broad functional code edits;
4. the worker would edit generated surfaces, templates, tests, package config, or repo policy without explicit lease;
5. two write leases overlap;
6. the parent cannot inspect actual diff;
7. the host cannot provide enough tool or file constraints and no deterministic fallback exists.

### Required lease fields

```yaml
workflow: truth-sync | truth-document | truth-structure | truth-realize | truth-check
worker: truth-doc-writer
shard: string
objective: string
requiredReads:
  - path-or-glob
allowedWrites:
  - path-or-glob
forbiddenWrites:
  - path-or-glob
evidenceRequired:
  - implementation-or-routing-evidence
verification:
  - parent-validation-step
reportFields:
  - status
  - worker
  - workflow
  - shard
  - filesChanged
  - claimsChecked
  - evidenceChecked
  - offLeaseChanges
  - blockers
  - notes
```

### Required parent validation

The parent must:

1. read worker report;
2. inspect actual diff;
3. compare changed files against lease;
4. reject off-lease edits;
5. reject missing required report fields;
6. reject unsupported claims;
7. run applicable validation;
8. include worker result in parent-owned workflow report.

### Required tests before additional write workers

Before any new write-capable worker is enabled:

- lease schema test;
- static permission snapshot;
- off-lease rejection test;
- overlapping lease test;
- worker report schema test;
- parent actual-diff validation test;
- routing/delegation prompt eval;
- cross-host fallback test;
- stale-surface check.

## Rejected or Avoided Directions

The following directions are attractive in some agent systems but conflict with Truthmark’s repository-native architecture or the reviewed safety literature.

| Direction | Why to avoid | Repository evidence | Literature evidence |
|---|---|---|---|
| Background daemon orchestration | Would shift truth from Git-reviewable surfaces into hidden runtime state. | `FutureVision.md` rejects daemon/server architecture. | AGENTS.md/GitHub/OpenCode emphasize repository instruction files; NCSC recommends deterministic safeguards and auditability. |
| Private model memory as truth source | Not branch-scoped, not reviewable, and not portable across agents. | README and FutureVision reject private memory/server truth. | AGENTS.md and GitHub instructions use committed repo context. |
| Unrestricted write-capable subagents | Host permissions and prompt text are insufficient for safe writes. | Truthmark’s doc writer requires leases and parent diff validation. | OpenCode permissions, MCP, NCSC, and Microsoft all emphasize least privilege and approval/sandboxing. |
| Forced cross-host parity | Hosts expose different instruction, skill, command, and agent primitives. | Gemini currently has commands only; other hosts have agents. | GitHub taxonomy and Gemini/OpenCode/Claude/Codex docs show different capabilities. |
| Root prompt bloat | Always-on prompt context becomes expensive and harder to maintain. | Root managed blocks are compact and tested. | GitHub, Anthropic, and Perplexity all warn against bloated instructions/skills. |
| Treating research docs as behavior | Blurs non-canonical references with active protocol. | Research files state non-canonical status. | Skill-maintenance literature emphasizes stale guidance and currentness. |

## File-Level Implementation Handoff

Likely files to change for the “Ship now” and “Build next” items:

### Research files

- `research/prompt-skill-agent-workflow-quality-uplift-review.md`
- `research/2026-05-16-write-capable-opencode-subagents-design.md`

### Canonical truth docs

- `docs/truth/workflows/overview.md`
- `docs/truth/workflows/shared-gates.md`
- `docs/truthmark/areas.md`

### Source

- `src/agents/workflow-manifest.ts`
- `src/agents/instructions.ts`
- `src/templates/workflow-surfaces.ts`
- `src/templates/generated-surfaces.ts`

### Generated OpenCode surfaces

- `.opencode/skills/*/SKILL.md`
- `.opencode/agents/*.md`

### Generated Codex surfaces

- `.codex/skills/*/SKILL.md`
- `.codex/agents/*`

### Generated Claude surfaces

- `.claude/skills/*/SKILL.md`
- `.claude/agents/*`

### Generated GitHub Copilot surfaces

- `.github/prompts/*`
- `.github/agents/*`

### Generated Gemini surfaces

- `.gemini/commands/truthmark/*`

### Tests

- `tests/agents/workflow-manifest.test.ts`
- `tests/agents/write-lease.test.ts`
- `tests/agents/prompts.test.ts`
- `tests/init/init.test.ts`
- new: `tests/evals/workflow-routing-cases.ts`
- new: `tests/evals/workflow-routing.test.ts`
- new: `tests/agents/report-contract.test.ts`
- new: `tests/agents/subagent-delegation.test.ts`
- new: `tests/init/cross-host-conformance.test.ts`
- new or extended: stale-surface diagnostics under the `truthmark check` test area

## Final Assessment

Truthmark’s architecture is stronger than typical prompt-only or ad hoc agent-workflow projects. The project already aligns with many of the best patterns in the literature:

- repository-native truth;
- compact managed root instructions;
- manifest-owned workflow metadata;
- generated host surfaces;
- descriptions as routing boundaries;
- explicit negative triggers and forbidden adjacency;
- Sync-only automatic workflow;
- read-only verifier subagents;
- leased write-capable doc writer;
- parent-owned acceptance.

The evidence does not support 100% confidence in world-class quality or runtime reliability yet.

The highest-leverage next step is not more prompt prose. It is evaluation and conformance infrastructure:

1. prompt-style workflow routing evals;
2. manifest-owned delegation policy;
3. worker/report schemas;
4. parent-diff validation tests;
5. cross-host protocol conformance;
6. stale-surface diagnostics.

Those additions would turn the current strong architecture into a more defensible world-class implementation.
