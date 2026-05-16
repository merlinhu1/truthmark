# Prompt, Skill, Agent, and Workflow Literature Review

## Status

This document is a literature review and research reference. It is not canonical Truthmark behavior. It does not by itself change Truthmark workflows, generated surfaces, skills, agents, tests, repository rules, or implementation policy.

The document collects and compares literature relevant to prompt standards, reusable skills, agents/subagents, and repository-native workflow implementation. Any later design decision for Truthmark would need to be promoted through the appropriate canonical files, source manifest, renderers, generated host surfaces, and tests.

## Scope

This review covers literature related to:

- prompt standards
- persistent repository instructions
- reusable skills
- agents and subagents
- workflow implementation
- routing and invocation
- permissions and write boundaries
- evaluation
- security
- maintenance
- cross-host compatibility

The review intentionally does not apply a strict year cutoff. Official, canonical, influential, or actively maintained sources are included even when they predate 2026. Source age, publication date, update date, or currentness signal is recorded where available.

The primary research question is:

> What does the best available literature say about world-class standards for prompts, skills, agents/subagents, and workflow implementation in modern AI coding-agent systems?

The secondary questions are organized around prompt structure, reusable AI skills, agent/subagent delegation, repository-native workflows, routing triggers, negative triggers, permissions, verification, evaluation, cross-source agreement, cross-source disagreement, and relevance to Truthmark’s workflow/skill/agent architecture.

## Truthmark Context

This section summarizes the local repository context so that the external literature can be mapped later. It is descriptive, not evaluative.

### Repository and product context

Truthmark presents itself as a local-first, Git-native protocol for repository truth workflows. The README describes a normal workflow in which an agent changes functional code, runs tests, then uses Truth Sync to update mapped truth docs before finishing. It also describes the central repository files: `.truthmark/config.yml`, `docs/truthmark/areas.md`, generated workflow surfaces, and the truth docs under `docs/truth/**/*.md`. Source: [README.md](https://github.com/merlinhu1/truthmark/tree/subagent-improvement).

`FutureVision.md` frames the project as a repository protocol rather than a server. It lists non-goals such as a memory server, session persistence, IDE-plugin centricity, and default merge gating. It emphasizes committed, branch-scoped, Git-reviewable truth. Source: [FutureVision.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/FutureVision.md).

### Managed instruction blocks

`AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` contain managed Truthmark instruction blocks. These blocks describe the source hierarchy, the finish-time Truth Sync rule, skip cases, explicit workflows, and workflow-integrity requirements. They point agents toward canonical docs and generated surfaces rather than embedding all workflow details in root instructions. Sources: [AGENTS.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/AGENTS.md), [CLAUDE.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/CLAUDE.md), [GEMINI.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/GEMINI.md).

### Current workflows

The current workflow inventory is:

- Truth Sync
- Truth Structure
- Truth Document
- Truth Realize
- Truth Check

The workflow overview states that workflow surfaces define invocation rules, write boundaries, report shapes, and required reads. It also states that Truth Sync is the only automatic finish-time workflow. Structure, Document, Realize, and Check are explicit/manual unless invoked by another workflow under documented rules. Source: [docs/truth/workflows/overview.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/overview.md).

### Shared workflow gates

The shared gates document defines common workflow gates:

- Ownership Gate
- Product Decisions/Rationale preservation gate
- Evidence Gate
- Shape Repair Gate

It also states that the direct checkout is the ground truth and that optional repository intelligence may assist but may not override the checkout. Source: [docs/truth/workflows/shared-gates.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/shared-gates.md).

### Truth docs and routing

`docs/truthmark/areas.md` acts as the root route index. It maps installed workflow behavior to source areas such as `src/agents/**`, `src/generation/**`, `src/realize/**`, `src/sync/**`, template renderers, and truth docs. It also states when truth updates are required, including workflow boundary changes, report shape changes, generated content changes, version marker changes, and sync classification changes. Source: [docs/truthmark/areas.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truthmark/areas.md).

### Workflow manifest

`src/agents/workflow-manifest.ts` is the typed workflow manifest. It defines workflow ids, display names, descriptions, short descriptions, default prompts, implicit invocation policy, positive triggers, negative triggers, forbidden adjacency, required gates, allowed writes, report sections, read-only subagents, and write-capable subagents. Source: [src/agents/workflow-manifest.ts](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts).

The manifest currently distinguishes read-only subagents such as route auditor, claim verifier, and doc reviewer from the write-capable `truth-doc-writer`. Truth Sync and Truth Document include the write-capable doc writer. Truth Check uses read-only verifier agents.

### Instruction rendering

`src/agents/instructions.ts` renders compact managed instruction snippets. These rendered snippets include the automatic Truth Sync rule, the direct-checkout rule, the truth-doc write boundary, and skip reasons. Source: [src/agents/instructions.ts](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/instructions.ts).

### Generated host surfaces

`src/templates/workflow-surfaces.ts` defines host-surface templates for skills, prompts, commands, and agents. It includes read-only subagent context boundaries and the write-capable `truth-doc-writer` profile. The doc writer requires an explicit parent-issued write lease and returns a structured YAML report. It may edit only leased truth docs and routing paths unless explicitly leased otherwise; the parent validates actual Git diff before accepting the worker’s output. Source: [src/templates/workflow-surfaces.ts](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts).

`src/templates/generated-surfaces.ts` renders host outputs for Codex, OpenCode, Claude, GitHub Copilot, and Gemini. The workflow overview states that Codex, OpenCode, Claude, and GitHub Copilot include verifier and leased doc-writer agents. Gemini currently receives generated commands under `.gemini/commands/truthmark/*.toml`. Source: [src/templates/generated-surfaces.ts](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts).

### Generated skills, prompts, commands, and agents

The repository includes generated OpenCode skills such as `.opencode/skills/truthmark-sync/SKILL.md` and `.opencode/skills/truthmark-document/SKILL.md`. These files include routing descriptions, invocation rules, write boundaries, subagent mode, parent validation, gates, and report expectations. Sources: [.opencode/skills/truthmark-sync/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/skills/truthmark-sync/SKILL.md), [.opencode/skills/truthmark-document/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/skills/truthmark-document/SKILL.md).

The generated OpenCode `truth-doc-writer` agent is a write-capable subagent with constrained permissions and a required lease. It denies task/web/external-directory access, asks for bash access, and limits edit permissions to truth-doc and route paths. Source: [.opencode/agents/truth-doc-writer.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-doc-writer.md).

The generated OpenCode route auditor is a read-only verifier subagent. It is instructed to inspect only assigned routing evidence, return JSON, and avoid making edits or final workflow decisions. Source: [.opencode/agents/truth-route-auditor.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-route-auditor.md).

Codex, Claude, and GitHub Copilot generated surfaces expose analogous skills/prompts and agents. Sources include [.codex/skills/truthmark-sync/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.codex/skills/truthmark-sync/SKILL.md), [.codex/agents/truth-doc-writer.toml](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.codex/agents/truth-doc-writer.toml), [.claude/skills/truthmark-sync/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.claude/skills/truthmark-sync/SKILL.md), [.claude/agents/truth-doc-writer.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.claude/agents/truth-doc-writer.md), [.github/prompts/truthmark-sync.prompt.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.github/prompts/truthmark-sync.prompt.md), and [.github/agents/truth-doc-writer.agent.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.github/agents/truth-doc-writer.agent.md).

Gemini generated surfaces are command files such as `.gemini/commands/truthmark/sync.toml`. These command files contain prompt text and command descriptions but do not contain generated Gemini subagents in the inspected branch. Source: [.gemini/commands/truthmark/sync.toml](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.gemini/commands/truthmark/sync.toml).

### Research folder

The research folder contains non-canonical design references. The 2026-05-15 review describes skills as context packages, descriptions as routing logic, progressive disclosure, evals, and security considerations. It explicitly states that behavior-bearing findings must be promoted into truth docs, the manifest, renderers, generated surfaces, and tests before becoming behavior. Source: [research/2026-05-15-agent-skills-workflow-review.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-15-agent-skills-workflow-review.md).

The 2026-05-16 write-capable OpenCode subagents design proposes parent-issued write leases, parent-owned final acceptance, and possible workers such as `truth-doc-writer`, `truth-route-structurer`, and `truth-realize-writer`. The research file is explicitly non-canonical. Source: [research/2026-05-16-write-capable-opencode-subagents-design.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-16-write-capable-opencode-subagents-design.md).

## Literature Search Method

Sources were found through the seed list, official documentation navigation, repository inspection, and targeted searches for current platform documentation and major agent-framework materials. Search terms are listed in Appendix C.

Source quality was judged by:

- officialness: whether the source is maintained by the platform or research organization;
- canonicality: whether the source defines current user-facing behavior or a published standard;
- influence: whether the source is widely adopted or cited in the coding-agent ecosystem;
- maintenance: whether the source is currently updated or attached to an active repository;
- concreteness: whether the source discusses prompts, skills, agents, workflows, routing, permissions, evaluation, or safety in implementable detail.

There is no strict year cutoff. Older sources were included when they remain current, canonical, or influential. For example, Anthropic’s “Building effective agents” is from 2024 but is still widely referenced and directly addresses agent workflow patterns. The AGENTS.md open format is not a single vendor product page, but it is included because it is an active open format used across coding-agent systems. Currentness was judged from page metadata, visible update markers, active repository state, or whether the page is current official documentation.

Official docs, standards/specifications, maintained repositories, engineering blogs, production case studies, and research papers were treated differently:

- official docs were treated as evidence of current platform behavior;
- standards/specifications were treated as evidence of shared or portable formats;
- maintained repositories were treated as practical implementation examples;
- engineering blogs were treated as design rationale or product practice, not necessarily normative behavior;
- research papers were treated as empirical or conceptual evidence and were caveated when preprint or benchmark-specific;
- practitioner examples were treated as illustrative unless they contained concrete reusable structures.

Access date for source review: 2026-05-16.

## Included Source Ledger

| Source | Organization / author | Date or currentness signal | Source type | Inclusion reason | Relevant areas | Notes |
|---|---|---:|---|---|---|---|
| [Prompt Engineering Guide](https://developers.openai.com/api/docs/guides/prompt-engineering) | OpenAI | Current official docs; references current GPT model family | Official documentation | Canonical OpenAI guidance for system/developer/user prompts, structure, examples, and coding prompts | Prompt, context placement, output contracts | Strong for prompt mechanics; less specific to repository workflows |
| [Codex AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md) | OpenAI | Current Codex docs | Official documentation | Defines how Codex discovers and applies AGENTS.md instructions | Persistent repository instructions, precedence, maintenance | Directly relevant to repository-native coding-agent instructions |
| [Codex Skills](https://developers.openai.com/codex/skills) | OpenAI | Current Codex docs | Official documentation | Defines Codex skill packages, `SKILL.md`, progressive disclosure, implicit/explicit invocation | Skill, routing, context budgeting | Relevant to SKILL.md-style packages |
| [Codex Subagents](https://developers.openai.com/codex/subagents) | OpenAI | Current Codex docs | Official documentation | Defines Codex subagents, custom agents, sandbox/approval inheritance, and narrow specialist design | Agents, subagents, permissions, orchestration | Relevant to Truthmark’s Codex surfaces |
| [Evals in agentic workflows: three skills](https://developers.openai.com/blog/eval-skills) | OpenAI | 2026-01-22 | Engineering blog | Concrete 2026 treatment of evals as agentic workflow skills | Evaluation, skill evals, routing evals | Blog, not formal spec; useful implementation detail |
| [Skills shell tips](https://developers.openai.com/blog/skills-shell-tips) | OpenAI | 2026-02-11 | Engineering blog | Discusses skill descriptions, shell workflows, deterministic helpers, and network risk | Skills, scripts, routing, security | Shell-oriented but highly relevant to skill execution |
| [Equip agents with skills using the Agents SDK and Codex](https://developers.openai.com/blog/skills-agents-sdk) | OpenAI | 2026-03-09 | Engineering blog | Discusses repo-local skills, AGENTS.md, GitHub Actions, and deterministic scripts | Skills, repo workflows, evals, maintenance | SDK-oriented; still relevant as platform practice |
| [Agent Evals Guide](https://developers.openai.com/api/docs/guides/agent-evals) | OpenAI | Current official docs | Official documentation | Describes traces, graders, datasets, eval runs, tools, handoffs, and safety checks | Evaluation, agents, routing, guardrails | General agent-eval guidance |
| [Improve agents with Codex](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop) | OpenAI Cookbook | 2026-05-12 | Cookbook / implementation guide | Describes traces, feedback, evals, harness updates, validation, and routing changes | Evaluation, maintenance, workflows | Cookbook pattern, not normative standard |
| [Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview) | Anthropic | Current official docs | Official documentation | Establishes Anthropic prompting workflow, success criteria, evals, examples, and structure | Prompt, evals, prompt iteration | High-level overview |
| [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) | Anthropic | Current official docs | Official documentation | Defines skills as modular filesystem capabilities with progressive disclosure | Skills, metadata, security, cross-surface use | Directly relevant to SKILL.md packages |
| [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | Anthropic | Current official docs | Official documentation | Detailed guidance on skill descriptions, body size, progressive disclosure, evals, and maintenance | Skill, routing, bloat control, evals | Strong skill-quality source |
| [Claude Code subagents](https://code.claude.com/docs/en/sub-agents) | Anthropic | Current Claude Code docs | Official documentation | Defines subagents with separate context, prompts, tools, permissions, and descriptions | Subagents, delegation, permissions, reports | Directly relevant to generated `.claude/agents` |
| [Claude Code skills and commands](https://code.claude.com/docs/en/slash-commands) | Anthropic | Current Claude Code docs | Official documentation | Describes skills, supporting files, invocation controls, and command/skill boundary | Skills, commands, invocation, maintenance | The slash-command seed resolves into current skill guidance |
| [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Anthropic | 2024-12-19; still influential | Engineering essay | Defines workflow vs agent patterns: chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer | Agents, workflows, routing, evaluation, tool design | Older than 2026 but still canonical/influential |
| [OpenCode docs](https://opencode.ai/docs/) | OpenCode | Last updated 2026-05-16 | Official documentation | Current product overview; describes OpenCode as a terminal coding agent and project rules | Persistent instructions, host behavior | Useful for host context |
| [OpenCode agents](https://opencode.ai/docs/agents/) | OpenCode | Last updated 2026-05-16 | Official documentation | Defines primary agents, subagents, agent files, descriptions, prompts, modes, permissions | Agents, subagents, permissions | Directly relevant to `.opencode/agents` |
| [OpenCode skills](https://opencode.ai/docs/skills/) | OpenCode | Last updated 2026-05-16 | Official documentation | Defines OpenCode skills, recognized metadata, paths, loading behavior, and permissions | Skills, routing, permissions, cross-host compatibility | Directly relevant to `.opencode/skills` |
| [OpenCode permissions](https://opencode.ai/docs/permissions/) | OpenCode | Last updated 2026-05-16 | Official documentation | Defines allow/ask/deny permission categories and granular rules | Permissions, write boundaries, security | Directly relevant to host-specific write boundaries |
| [Agent Skills specification](https://agentskills.io/specification) | Agent Skills | Active specification; repository maintained | Standard/specification | Defines portable `SKILL.md` package structure, metadata, progressive disclosure, scripts, references, assets | Skill, compatibility, metadata | Useful for cross-host skill format comparison |
| [Agent Skills repository](https://github.com/agentskills/agentskills) | Agent Skills community | Active GitHub repository | Standard repository | Maintained reference for the Agent Skills standard | Skill, compatibility | Complements specification page |
| [AGENTS.md open format](https://agents.md/) | Agentic AI Foundation / community | Active open format | Open format / standard-like guidance | Defines AGENTS.md as a simple README-like instruction file for agents | Persistent repository instructions, precedence, maintenance | Relevant across Codex/OpenCode/GitHub and repository-native workflows |
| [GitHub Copilot customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet) | GitHub | Current GitHub Docs; 2026 copyright | Official documentation | Compares custom instructions, prompt files, custom agents, subagents, skills, and hooks | Persistent instructions, prompts, agents, skills, hooks | Strong cross-surface taxonomy |
| [Adding repository custom instructions for GitHub Copilot](https://docs.github.com/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot) | GitHub | Current GitHub Docs; 2026 copyright | Official documentation | Defines repository custom instructions, path-specific instructions, AGENTS.md support, and instruction scope | Persistent repository instructions | Directly relevant to `.github` surfaces |
| [Gemini CLI custom commands](https://google-gemini.github.io/gemini-cli/docs/cli/custom-commands.html) | Google Gemini CLI | Active official docs; 2026 commit activity observed | Official documentation | Defines global/project custom commands, TOML fields, shell injection, and file injection | Commands, workflow surfaces, invocation | Relevant to `.gemini/commands/truthmark` |
| [Subagents have arrived in Gemini CLI](https://developers.googleblog.com/subagents-have-arrived-in-gemini-cli/) | Google Developers Blog | 2026-04-15 | Engineering blog / product announcement | Describes Gemini CLI subagents, separate context, instructions, tools, routing, and project/global agent files | Subagents, delegation, context isolation | Announcement-level but official and current |
| [Agent Skills](https://learn.microsoft.com/en-us/agent-framework/agents/skills) | Microsoft Agent Framework | Last updated 2026-04-10 | Official documentation | Defines skills as portable instructions/scripts/resources; covers progressive disclosure, scripts, security, workflows distinction | Skills, workflow distinction, security | Strong source for skill-vs-workflow boundary |
| [Handoff orchestration](https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/handoff) | Microsoft Agent Framework | Last updated 2026-05-09 | Official documentation | Defines handoff orchestration, specialist agents, handoff rules, tool approval, checkpointing | Agents, handoff, orchestration, permissions | Relevant to parent-child and specialist-agent comparisons |
| [Google ADK overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/adk) | Google Cloud | Last updated 2026-05-15 | Official documentation | Describes ADK as a framework for build/run/evaluate/scale and dynamic or deterministic orchestration | Agents, workflows, evaluation | Framework-level context rather than coding-agent host surface |
| [Google ADK multi-agent systems](https://github.com/google/adk-docs/blob/main/docs/agents/multi-agents.md) | Google ADK | Active docs repository | Official framework docs | Defines multi-agent hierarchy, workflow agents, LLM-driven delegation, descriptions, and routing | Agents, subagents, workflows, routing | Useful for parent-child and workflow-agent comparison |
| [AWS Bedrock multi-agent collaboration](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-multi-agent-collaboration.html) | AWS | Current AWS docs | Official documentation | Defines supervisor/collaborator agents, roles, responsibilities, routing, and guardrails | Multi-agent orchestration, permissions, routing | Enterprise platform context; not coding-agent-specific |
| [LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview) | LangChain | Current docs | Maintained open-source framework docs | Describes durable, stateful, long-running agents, human-in-the-loop, memory, tracing, and evaluation | Workflows, agents, evaluation, state | Important contrasting architecture; not repository-surface-specific |
| [Model Context Protocol Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices) | Model Context Protocol | Current official docs | Security best practices | Discusses prompt injection, tool poisoning, least privilege, tool allowlists, and human confirmation | Security, permissions, tool risk | Relevant to external tools and permission boundaries |
| [Prompt injection is not SQL injection](https://www.ncsc.gov.uk/blog-post/prompt-injection-is-not-sql-injection) | UK NCSC | 2025-12-08 | Government security guidance | Explains prompt injection as instruction/data confusion and recommends deterministic safeguards and privilege reduction | Security, prompt injection, permissions | Strong safety framing; not coding-agent-specific |
| [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/) | OWASP | 2024-11-17; active 2026 project resources | Security standard / community guidance | Defines common LLM application security risk categories | Security, tool misuse, supply-chain risk | Broad; useful background rather than workflow detail |
| [Designing, Refining, and Maintaining Agent Skills at Perplexity](https://research.perplexity.ai/articles/designing-refining-and-maintaining-agent-skills-at-perplexity) | Perplexity Research | 2026-05-01 | Production engineering article | Detailed source on skill descriptions, progressive disclosure, evals, scripts, bloat, and maintenance | Skills, routing, evals, maintenance | Practitioner source with strong implementation detail |
| [Goalkeeper](https://github.com/itsuzef/goalkeeper) | Youssef / open source | Active 2026 repository | Practitioner repository | Demonstrates judge-gate pattern, explicit Definition of Done, validation, and fresh-context subagent review | Judge agents, verification, workflows | Illustrative; not a platform standard |
| [Matt Pocock skills](https://github.com/mattpocock/skills) | Matt Pocock | Active popular repository | Practitioner repository | Demonstrates compact skill examples, handoff skills, TDD skills, and skill-writing practices | Skills, prompt reuse, maintenance | Illustrative; useful for concrete skill style |

## Rejected or Low-Relevance Source Ledger

| Source | Reason rejected or downgraded | Historically relevant? | Replacement or better source |
|---|---|---:|---|
| Generic SEO prompt-engineering summaries found during discovery | Too shallow, not canonical, and usually restated official guidance without implementation detail | Limited | OpenAI and Anthropic official prompt docs |
| Third-party Gemini CLI tutorials | Often restated official command/subagent docs and lacked durable implementation detail | Limited | Gemini CLI official custom-command docs and Google Developers subagent announcement |
| Third-party “best AI agent framework” listicles | Broad, ranking-oriented, and not specific to prompts, skills, permissions, routing, or workflow surfaces | Limited | LangGraph, Google ADK, Microsoft Agent Framework, AWS Bedrock official docs |
| Microsoft AutoGen older docs | Historically important but superseded or de-emphasized relative to Microsoft Agent Framework for current skill/workflow documentation | Yes | Microsoft Agent Framework skills and handoff orchestration docs |
| Cursor documentation discovered during search | Relevant platform area, but not inspected deeply enough in this review to support source-centered claims | Yes | GitHub Copilot, Codex, OpenCode, Claude Code, and Gemini CLI docs |
| Vendor marketing pages about “autonomous agents” without concrete docs | Lacked concrete structure for prompts, skills, routing, permissions, or evals | Limited | Anthropic “Building effective agents,” Google ADK, Microsoft Agent Framework |
| Unmaintained toy agent repositories | Not current enough and not influential enough for standards comparison | Limited | Goalkeeper and Matt Pocock skills as maintained practitioner references |
| Blog posts about prompt injection without operational safeguards | Often alarmist or duplicative; lacked practical permission or boundary patterns | Some | NCSC prompt injection guidance, OWASP LLM Top 10, MCP security best practices |

## Annotated Bibliography

### OpenAI — Prompt Engineering Guide

The OpenAI Prompt Engineering Guide is current official documentation for structuring prompts. It addresses how instructions are divided between system, developer, user, and assistant messages, and it treats developer messages as a place for rules and business logic that should apply across user requests. The guide discusses Markdown and XML-style structure for separating instructions from supporting context, and it includes coding-prompt examples that define role, tool use, tests, and output expectations.

The source is strongest for prompt structure, instruction hierarchy, examples, output contracts, and coding-task prompt format. It is less specific about repository-native workflow generation or subagent delegation. For Truthmark, it provides background on how generated workflow prompts can structure instruction hierarchy and output contracts without claiming that Truthmark should adopt any particular OpenAI-only surface.

### OpenAI — Codex AGENTS.md Guide

The Codex AGENTS.md guide defines how Codex discovers and applies repository instruction files. It describes global and project-specific AGENTS.md files, discovery order, nested overrides, and a project instruction size limit. It treats AGENTS.md as the place for project setup, build, test, formatting, and repository expectations.

The source addresses persistent repository instructions, instruction precedence, local overrides, and maintenance. Its relevance to Truthmark is direct because Truthmark uses managed repository instruction blocks and must coexist with host-specific instruction discovery. The limitation is that it describes Codex behavior specifically; other hosts may read different files or apply different precedence rules.

### OpenAI — Codex Skills

The Codex Skills documentation defines skills as packages containing instructions, resources, and scripts. It describes the `SKILL.md` entrypoint, name/description/path listing, progressive disclosure, explicit invocation, and implicit invocation through descriptions. It also discusses context budgeting for skill listings and loading.

The source addresses reusable skills, metadata, descriptions, progressive disclosure, and context placement. It is directly relevant to Truthmark’s generated `.codex/skills` and to any comparison of SKILL.md-like packages across hosts. The limitation is host specificity: Codex skill invocation and context budgets do not automatically apply to Claude, OpenCode, GitHub Copilot, or Gemini.

### OpenAI — Codex Subagents

The Codex Subagents documentation describes subagents as specialized agents that can run in parallel and report back to a main agent. It describes custom agents in `.codex/agents`, fields such as name, description, and developer instructions, inherited sandbox/approval behavior, optional sandbox override, and a default depth cap to avoid recursive fan-out. It encourages narrow, opinionated custom agents.

The source addresses delegation, specialist agents, context splitting, sandbox inheritance, and recursive-delegation risks. It is relevant to Truthmark’s generated Codex agents and to the broader question of parent-owned orchestration. Its limitation is that it describes a Codex-specific execution model and approval system.

### OpenAI — Evals in agentic workflows: three skills

This 2026 OpenAI engineering article treats evaluation work itself as a set of agentic skills. It frames evals as prompt, trace/artifact, check, and score pipelines. It distinguishes defining success before writing a skill, using name and description as selection signals, and designing trigger and negative-control evaluations. It includes examples of deterministic trace checks and compact eval sets.

The source addresses prompt evals, skill evals, routing evals, negative controls, and evaluation-data management. It is relevant to Truthmark because workflows and generated surfaces depend on correct routing, invocation, and report behavior. The article is practical but not a formal standard.

### OpenAI — Skills shell tips

This article focuses on skills that guide shell-based agent work. It treats a skill as a reusable procedure that can include scripts, templates, examples, and explicit invocation patterns. It emphasizes writing descriptions as routing logic, including “use” and “don’t use” cases, and using explicit skill calls for deterministic workflows. It also discusses risks around network access, secrets, and tool use.

The source addresses scripts, shell workflows, skill descriptions, deterministic helpers, and skill-security boundaries. It is relevant to Truthmark’s workflow skills because Truthmark’s generated surfaces direct agents through repeatable procedures. The limitation is that examples are shell-oriented and may not generalize to all workflow surfaces.

### OpenAI — Equip agents with skills using the Agents SDK and Codex

This 2026 OpenAI article discusses repository-local skills, AGENTS.md, GitHub Actions, and the division between mandatory workflows and optional skills. It presents AGENTS.md as a place for required workflows and high-level instructions, while skills carry on-demand procedures, scripts, and context. It also connects skills to CI and deterministic validation.

The source addresses persistent repository instructions, skills, deterministic scripts, and repository workflows. It is relevant because Truthmark’s architecture similarly separates root managed blocks from generated workflow surfaces. The limitation is that it is tied to OpenAI’s Agents SDK and Codex examples, so its details are not automatically host-neutral.

### OpenAI — Agent Evals Guide

The Agent Evals Guide describes using traces, graders, datasets, and eval runs to assess agent behavior. It frames traces as containing model calls, tool calls, guardrails, handoffs, and other execution steps. It suggests evaluating whether the right tool was called, whether a handoff happened appropriately, whether an instruction or safety requirement was violated, and whether prompt or routing changes improved behavior.

The source addresses agent evaluation, routing evaluation, tool-use evaluation, handoff evaluation, and guardrail checks. It is relevant to Truthmark’s interest in workflow routing, report contracts, subagent dispatch, and permission boundaries. The limitation is that it describes OpenAI’s evaluation infrastructure rather than a repository-native test harness.

### OpenAI Cookbook — Improve agents with Codex

The OpenAI Cookbook’s agent-improvement-loop example describes how traces, human feedback, evals, and harness changes can be used to improve agents. It treats an agent harness as containing instructions, tools, routing, output validation, and evaluation metadata. It describes a loop in which observed failures are converted into validation or harness changes.

The source addresses maintenance, evaluation, routing, tool policy, and output validation. It is relevant to Truthmark as a model for treating workflow-surface changes as evaluated artifacts. It is a cookbook example rather than a normative platform specification.

### Anthropic — Prompt engineering overview

Anthropic’s prompt engineering overview frames prompt engineering around defining success criteria, establishing evals, and iterating through techniques such as clarity, examples, XML tags, role prompting, chain-of-thought controls, and prompt chaining. It places eval design before prompt iteration.

The source addresses prompt structure, examples, uncertainty, and prompt evaluation. It is relevant to Truthmark because workflow prompts and generated surfaces can be evaluated as prompts rather than treated as static documentation. Its limitation is that it is a general model-use guide, not a repository-agent workflow standard.

### Anthropic — Agent Skills overview

Anthropic’s Agent Skills overview defines skills as modular capabilities stored as filesystem resources. It emphasizes that skills differ from one-off prompts because they are reusable packages with instructions and supporting materials. It describes progressive disclosure, `SKILL.md`, name and description fields, security considerations, and cross-surface availability limitations.

The source addresses skill definition, metadata, progressive disclosure, and security. It is directly relevant to Truthmark’s generated `SKILL.md` surfaces. Its limitation is that Anthropic skill semantics may differ from Codex, OpenCode, and GitHub Copilot.

### Anthropic — Skill authoring best practices

Anthropic’s skill authoring best-practices document gives detailed guidance on naming, descriptions, progressive disclosure, body size, concrete examples, validation, and real-world usage. It states that skill descriptions are critical for selection among many skills and should describe when the skill should be used. It recommends keeping the body concise, moving large content into supporting files, avoiding time-sensitive information, and testing skills with real scenarios.

The source addresses skill routing, context bloat, evals, examples, maintenance, and description quality. It is highly relevant to Truthmark’s workflow-skill descriptions and generated surfaces. Its limitation is that it focuses on Claude skill behavior and not every host supports the same frontmatter or invocation semantics.

### Anthropic — Claude Code subagents

Claude Code subagents are specialist assistants with their own context, prompt, tools, and permissions. The docs describe project-level and user-level subagents, frontmatter fields, tool selection, descriptions for delegation, subagent chaining, and hooks. They distinguish work that should stay in the main conversation from work that should be delegated to subagents.

The source addresses context isolation, specialist agents, permission boundaries, delegation descriptions, and parent/subagent tradeoffs. It is directly relevant to Truthmark’s `.claude/agents` surfaces and to the wider question of verifier or worker subagents. Its limitation is host specificity.

### Anthropic — Claude Code skills and commands

Claude Code’s skills and commands documentation describes skills as prompt-based reusable capabilities with supporting files. It notes that skills are recommended over older custom commands for many repeated workflows. It describes description-based loading, manual-only or disabled model invocation modes, tool restrictions, supporting files, shell-execution policy, overrides, and troubleshooting for skills that trigger too often or not often enough.

The source addresses skill invocation, command/skill boundaries, progressive disclosure, tool restrictions, and description tuning. It is relevant to Truthmark’s generated Claude skill surfaces and to the distinction between command files and skill packages. The limitation is that it describes Claude Code behavior specifically.

### Anthropic — Building effective agents

Anthropic’s “Building effective agents” distinguishes workflows from agents: workflows follow predefined code paths, while agents dynamically direct processes and tools. It describes prompt chaining with gates, routing, parallelization, orchestrator-workers, evaluator-optimizer loops, and autonomous agents. It warns that frameworks can obscure prompts and responses and recommends starting with simple, composable patterns.

The source addresses agent workflow patterns, gates, routing, parallelism, evaluation, tool definition, and human checkpoints. It is relevant to Truthmark’s workflow architecture because Truthmark’s workflows resemble predefined workflow surfaces more than unconstrained autonomous agents. It predates 2026 but remains influential and canonical enough to include.

### OpenCode — Docs overview

OpenCode’s docs describe OpenCode as an open-source terminal-based AI coding agent. They describe project rules through `AGENTS.md` and recommend committing project instructions. The overview provides host context for the more specific agents, skills, and permissions pages.

The source addresses persistent instructions and host behavior. It is relevant to Truthmark because Truthmark generates OpenCode surfaces. Its limitation is that the overview is less detailed than the agents, skills, and permissions docs.

### OpenCode — Agents

OpenCode’s agents docs define primary agents and subagents. Primary agents are main workflows such as Build or Plan; subagents can be invoked automatically or manually and run as child sessions. Agent configuration can be project-local in `.opencode/agents/`. Descriptions are required and should answer what the agent does and when to use it. Agents can have prompts, models, tools, modes, and permissions.

The source addresses agent/subagent design, routing descriptions, modes, and permissions. It is directly relevant to Truthmark’s `.opencode/agents` surfaces. Its limitation is that OpenCode’s model of subagents and permissions is host-specific.

### OpenCode — Skills

OpenCode’s skills docs define skills as reusable instructions loaded on demand. It supports `.opencode/skills`, compatibility with Claude-style and Agent Skills-style locations, and recognized metadata. It states that available skills are shown to the model by name and description and that a skill loader fetches the body. It also describes per-skill and per-agent permission controls.

The source addresses skills, descriptions, progressive loading, permissions, and cross-host compatibility. It is directly relevant to Truthmark’s `.opencode/skills` surfaces. The limitation is that OpenCode frontmatter support and permission merging do not necessarily apply to other hosts.

### OpenCode — Permissions

OpenCode’s permissions docs define allow, ask, and deny behaviors, granular tool rules, external-directory rules, and defaults. The available permission categories include read, edit, bash, web, task, grep, glob, list, and others.

The source addresses tool permissions, least privilege, write boundaries, and host-level enforcement. It is directly relevant to Truthmark’s OpenCode agent surfaces. The limitation is that static host permissions cannot represent every runtime workflow constraint.

### Agent Skills specification

The Agent Skills specification defines a portable skill directory structure. It requires `SKILL.md` and supports frontmatter fields such as name, description, license, compatibility, metadata, and experimental allowed tools. It defines scripts, references, assets, progressive disclosure, and validation with a reference tool.

The source addresses skill metadata, standard format, scripts, references, and compatibility. It is relevant to Truthmark’s cross-host skill comparisons because several vendors and repositories converge around `SKILL.md`-style packages. Its limitation is that host-specific platforms may support only subsets or extensions of the spec.

### Agent Skills repository

The Agent Skills repository is the maintained reference repository for the open Agent Skills format. It is relevant as a current implementation and maintenance signal for the specification. It complements the spec by showing active development and community stewardship.

The source addresses compatibility and standard maintenance. It is less detailed than the specification itself, but it helps establish currentness and active maintenance.

### AGENTS.md open format

AGENTS.md defines itself as a simple open format for guiding coding agents, comparable to a README for agents. It suggests including project overview, build/test commands, style conventions, security considerations, and nested instruction files. It describes closest-file precedence and user prompts overriding file instructions.

The source addresses persistent repository instructions, precedence, test instructions, and living documentation. It is directly relevant to Truthmark’s managed root blocks and repository-native instruction model. Its limitation is that it intentionally has no required fields and is format-light.

### GitHub Copilot — Customization cheat sheet

GitHub’s Copilot customization cheat sheet compares custom instructions, prompt files, custom agents, subagents, agent skills, hooks, and MCP. It distinguishes automatic and manual usage, which surfaces are supported in which environments, and what each customization type is meant to do.

The source addresses cross-surface taxonomy, invocation modes, repository instructions, prompts, agents, skills, and hooks. It is relevant to Truthmark’s cross-host generated surfaces. Its limitation is that it is a product comparison table, not a deep implementation standard.

### GitHub Copilot — Repository custom instructions

GitHub’s custom-instructions docs describe repository-wide instructions, path-specific instructions, and agent instructions. They recommend using instructions to tell Copilot how to understand the project and build, test, and validate changes. They warn that instructions should be concise and not task-specific.

The source addresses persistent repository instructions, scope, placement, and bloat control. It is directly relevant to Truthmark’s `.github` surfaces and managed instruction blocks. Its limitation is that it focuses on GitHub Copilot behavior.

### Gemini CLI — Custom commands

Gemini CLI custom commands are reusable prompt shortcuts stored globally or in a project under `.gemini/commands`. Commands are TOML files with a required `prompt` and optional one-line `description`. They can include arguments, shell command execution with user confirmation, and file or directory injection.

The source addresses command surfaces, explicit invocation, prompt reuse, shell execution, and file injection. It is relevant to Truthmark’s generated `.gemini/commands/truthmark/*.toml` files. Its limitation is that commands are not equivalent to skills or subagents.

### Gemini CLI — Subagents announcement

The Gemini CLI subagents announcement describes subagents as separate-context workers with custom system instructions and curated tools. It describes the main session as orchestrator, mentions parallel work and context-rot avoidance, and shows project/global Markdown agent files with YAML frontmatter including name, description, tools, and model.

The source addresses subagent isolation, routing descriptions, project-local agent definitions, and tool scoping. It is relevant as a comparison point because Truthmark currently generates Gemini commands but not generated Gemini agents. The limitation is that it is an announcement blog rather than full reference documentation.

### Microsoft Agent Framework — Agent Skills

Microsoft’s Agent Skills docs define skills as portable packages of instructions, scripts, and resources. They support `SKILL.md`, scripts, references, assets, metadata, compatibility, allowed tools, and progressive disclosure. The docs also distinguish skills from workflows: skills are selected by the AI, while workflows are deterministic, checkpointed, and often involve side effects or approvals.

The source addresses skills, progressive disclosure, scripts, security, caching, skill approval, and workflow distinction. It is strongly relevant to Truthmark’s skill-vs-workflow architecture. The limitation is Microsoft Agent Framework specificity.

### Microsoft Agent Framework — Handoff orchestration

Microsoft’s handoff orchestration docs describe control transfer between specialist agents. They contrast handoff with agent-as-tools patterns in terms of control flow, task ownership, and context management. They describe handoff rules, human-in-the-loop approval, checkpointing, context synchronization, tool approval, and specialized executors.

The source addresses parent-child orchestration, specialist agents, routing rules, and tool approval. It is relevant to Truthmark’s subagent delegation context, although Truthmark’s generated host surfaces are not Microsoft Agent Framework workflows. The limitation is that it belongs to a framework rather than a coding-agent host.

### Google ADK — Overview

Google ADK describes an open-source framework for building, running, evaluating, and scaling agent systems. It supports predictable pipelines and agent-coordinated dynamic routing, multi-agent architectures, tools, evaluation, and local/cloud execution.

The source addresses agent framework architecture, workflows, evaluation, and dynamic routing. It is relevant as background for how major platforms frame agent orchestration. It is less directly relevant to repository-native generated AI-host surfaces.

### Google ADK — Multi-agent systems

Google ADK multi-agent docs describe multi-agent hierarchies, parent-child relationships, workflow agents such as Sequential, Parallel, and Loop agents, and LLM-driven delegation. They emphasize modularity, specialization, reusability, maintainability, and clear descriptions on subagents so the parent can route tasks.

The source addresses subagent hierarchy, workflow agents, parallel agents, descriptions, and delegation. It is relevant to Truthmark’s read-only verifier and worker subagent context. Its limitation is framework-specific execution semantics.

### AWS Bedrock — Multi-agent collaboration

AWS Bedrock’s multi-agent collaboration docs describe a supervisor agent and collaborator agents with designated roles, responsibilities, tools, knowledge bases, and guardrails. The supervisor routes tasks and coordinates collaborators.

The source addresses supervisor-worker orchestration, role separation, and guardrails. It is relevant as enterprise background for multi-agent coordination. It is not specific to coding agents, Git repositories, SKILL.md packages, or host-generated workflow surfaces.

### LangGraph overview

LangGraph describes a framework and runtime for long-running, stateful agents. It emphasizes durable execution, streaming, human-in-the-loop, memory, debugging, tracing, evaluation, and deployment. It positions itself as low-level orchestration infrastructure for agents.

The source addresses workflow durability, state, traces, evaluation, and human oversight. It is relevant as a contrasting architecture to Truthmark’s repository-native generated surfaces. Its limitation is that it centers runtime orchestration, not Git-reviewable host-specific prompt surfaces.

### Model Context Protocol — Security Best Practices

MCP security guidance discusses prompt injection, tool poisoning, tool shadowing, least-privilege access, human confirmation, and tool allowlists. It treats external tools and data sources as attack surfaces and recommends constraining capability exposure.

The source addresses permissions, prompt injection, tool risk, and security boundaries. It is relevant to Truthmark’s tool/agent permission context and external-resource boundaries. Its limitation is that it is MCP-specific and not solely about coding agents.

### NCSC — Prompt injection is not SQL injection

The NCSC article explains prompt injection as a consequence of mixing instructions and untrusted data in LLM context. It argues that LLMs lack a reliable data/instruction boundary and recommends reducing risk and impact through deterministic safeguards, privilege reduction, logging, monitoring, and avoiding designs that cannot tolerate residual risk.

The source addresses prompt injection, deterministic safeguards, privilege reduction, and audit logging. It is relevant to any AI workflow that reads repository content and may write files or invoke tools. Its limitation is that it is general security guidance rather than a workflow-surface implementation manual.

### OWASP Top 10 for LLM Applications

OWASP’s Top 10 for LLM Applications is a community security reference for LLM application risks. It covers prompt injection, sensitive information disclosure, supply-chain risks, excessive agency, and related concerns.

The source addresses security taxonomy and risk categories. It is relevant as background for permission, tool, and reviewable-artifact discussions. It is broad and does not directly define skill or workflow structure.

### Perplexity — Designing, Refining, and Maintaining Agent Skills

Perplexity’s 2026 article is a detailed practitioner guide for agent skills. It defines a skill as structured context for models and environments. It describes a hub-and-spoke skill directory with `SKILL.md`, scripts, references, assets, and config. It treats the description as a routing trigger, not internal documentation. It describes progressive disclosure, index cost, loaded body cost, runtime resources, eval-first skill writing, negative examples, neighbor confusion, deterministic scripts, maintenance, and bloat control.

The source addresses skill structure, routing, evals, scripts, maintenance, and bloat. It is highly relevant to Truthmark’s workflow skills. It is practitioner literature, not an official platform standard, but it provides unusually concrete implementation detail.

### Goalkeeper

Goalkeeper is an open-source practitioner repository for contract-driven autonomous goal execution in Claude Code. It uses explicit contracts with objective, non-goals, Definition of Done, validators, checkpoint cadence, rejection limits, judge mode, and diff exclusions. It demonstrates a judge-gate pattern where a fresh-context subagent checks diffs and logs after validators pass, approving or returning a structured fix list.

The source addresses judge agents, validation, workflow gates, explicit contracts, and human escalation. It is relevant to Truthmark’s interest in verifier agents and parent-owned acceptance. It is illustrative, not a general standard.

### Matt Pocock skills

Matt Pocock’s skills repository is a popular practitioner collection of reusable skills for coding agents. It emphasizes small, composable skills, shared language, handoff skills, TDD skills, and adapting skills to one’s own codebase. It also discusses common agent failure modes and the role of skills in reducing verbosity and improving agent navigation.

The source addresses practical skill packaging, prompt reuse, maintenance, and coding-agent workflow habits. It is useful as a concrete practitioner reference. It is not a formal standard and should be distinguished from official docs.

## Literature by Topic

### Prompt Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Prompt roles and hierarchy matter | OpenAI distinguishes system, developer, user, and assistant messages, with developer messages carrying rules and business logic. Repository instructions are another persistent layer in coding-agent systems. | OpenAI Prompt Engineering Guide; OpenAI Codex AGENTS.md Guide; GitHub custom instructions; AGENTS.md open format |
| Prompts should be structured | Markdown, XML-like tags, sections, and explicit task framing help separate instructions, data, examples, and outputs. | OpenAI Prompt Engineering Guide; Anthropic prompt engineering overview; Anthropic skill docs |
| Success criteria and evals should precede iteration | Anthropic frames prompt engineering as starting with success criteria and evals. OpenAI’s eval sources similarly treat prompt and agent changes as measurable. | Anthropic prompt engineering overview; OpenAI Agent Evals Guide; OpenAI Eval Skills; OpenAI Cookbook |
| Examples are useful but should be scoped | Anthropic and OpenAI both discuss examples as a way to shape behavior. Perplexity cautions that examples in skills should target non-obvious cases and failure modes rather than duplicating obvious instructions. | Anthropic prompt engineering overview; OpenAI Prompt Engineering Guide; Perplexity skills guide |
| Output contracts reduce ambiguity | Coding prompts and agent eval sources emphasize structured output, trace checks, report fields, validation, and defined success. | OpenAI Prompt Engineering Guide; OpenAI Agent Evals Guide; Goalkeeper |
| Prompt chaining and gates are common workflow patterns | Anthropic describes prompt chaining with gates and evaluator-optimizer loops for controlled multi-step behavior. | Anthropic Building effective agents |
| Context placement is part of prompt design | Repository instructions, skill descriptions, loaded skill bodies, references, and supporting files occupy different context layers. | OpenAI Codex Skills; Anthropic Skills; Perplexity skills guide; Microsoft Agent Skills |
| Prompt evaluation includes positive and negative behavior | Eval literature treats trigger behavior, negative controls, tool calls, handoffs, and instruction violations as measurable. | OpenAI Eval Skills; OpenAI Agent Evals Guide; Perplexity skills guide |

### Persistent Repository Instruction Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Repository instruction files guide coding agents | AGENTS.md is described as a README-like file for agents, containing project overview, build/test commands, conventions, and security considerations. | AGENTS.md open format; OpenAI Codex AGENTS.md Guide; OpenCode docs; GitHub custom instructions |
| Local and nested precedence exists | Codex and AGENTS.md describe nested instruction files and closest-file precedence. GitHub supports repository-wide and path-specific instructions. | OpenAI Codex AGENTS.md Guide; AGENTS.md open format; GitHub custom instructions |
| Repository instructions should be concise and stable | GitHub recommends repository instructions be about project understanding, build, test, and validation, not task-specific instructions. | GitHub custom instructions; AGENTS.md open format |
| Project-level instructions can be committed | OpenCode recommends committing project rules; AGENTS.md is designed for repository use. | OpenCode docs; AGENTS.md open format |
| Persistent instructions should not absorb all workflow detail | Skill literature treats repeated procedures and detailed workflows as better placed in skills or workflow surfaces. | Anthropic Claude Code skills; Microsoft Agent Skills; Perplexity skills guide |
| Host-specific instruction files differ | GitHub recognizes `.github/copilot-instructions.md`, `.github/instructions`, `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`. Codex and OpenCode have their own discovery behavior. | GitHub custom instructions; OpenAI Codex AGENTS.md Guide; OpenCode docs |

### Skill Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Skills are reusable context packages | Skills package instructions, resources, scripts, examples, and assets for repeated tasks. | OpenAI Codex Skills; Anthropic Agent Skills; Microsoft Agent Skills; Agent Skills specification; Perplexity skills guide |
| `SKILL.md` is a common entrypoint | Multiple sources use a directory containing `SKILL.md` as the skill entrypoint. | OpenAI Codex Skills; Anthropic Agent Skills; Microsoft Agent Skills; Agent Skills specification; OpenCode Skills |
| Descriptions are routing signals | Skill descriptions tell the model when to load or use the skill. Perplexity explicitly says descriptions are routing triggers, not internal documentation. | Anthropic skill best practices; OpenAI Codex Skills; OpenCode Skills; Perplexity skills guide; Agent Skills specification |
| Progressive disclosure is central | Skill listings expose compact metadata; full bodies and supporting files are loaded only when needed. | OpenAI Codex Skills; Anthropic Agent Skills; Microsoft Agent Skills; Perplexity skills guide |
| Skills can include scripts | Scripts are used for deterministic work, setup, validation, or repeated operations, but require security review. | OpenAI Skills shell tips; Microsoft Agent Skills; Agent Skills specification; Perplexity skills guide |
| References/assets/examples belong outside the main body when large | Larger supporting materials should be stored separately and loaded conditionally. | Anthropic skill best practices; Microsoft Agent Skills; Agent Skills specification; Perplexity skills guide |
| Skill bloat is a recurring concern | Skills impose context cost. Perplexity emphasizes index cost and body cost; Anthropic and Microsoft recommend concise bodies. | Perplexity skills guide; Anthropic skill best practices; Microsoft Agent Skills |
| Skill evals should include routing behavior | Positive examples, negative examples, forbidden loads, and neighbor confusion are part of skill evaluation. | OpenAI Eval Skills; Perplexity skills guide; Anthropic skill best practices |

### Agent and Subagent Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Subagents are specialist workers with separate context | Claude Code, Gemini CLI, Codex, OpenCode, Google ADK, and Microsoft all describe specialist or child agents with distinct context or task ownership. | Claude Code subagents; Gemini subagents; Codex Subagents; OpenCode Agents; Google ADK multi-agent docs; Microsoft handoff orchestration |
| Descriptions guide delegation | Subagent descriptions are used by parent agents or orchestrators to decide when to delegate. | Claude Code subagents; OpenCode Agents; Gemini subagents; Google ADK multi-agent docs |
| Agents should be narrow when custom-defined | Codex recommends narrow, opinionated custom agents; Claude and OpenCode similarly frame subagents as specialists. | Codex Subagents; Claude Code subagents; OpenCode Agents |
| Parent/orchestrator roles are common | Microsoft handoff, AWS supervisor agents, Gemini orchestrator framing, and Anthropic orchestrator-worker patterns all describe parent coordination. | Microsoft handoff orchestration; AWS Bedrock multi-agent collaboration; Gemini subagents; Anthropic Building effective agents |
| Read-only or verifier roles are common patterns | Codex custom-agent examples include read-only explorers and reviewers; Goalkeeper uses a judge agent; Anthropic discusses evaluator-optimizer workflows. | Codex Subagents; Goalkeeper; Anthropic Building effective agents |
| Tool and permission boundaries matter | Claude, OpenCode, Codex, Microsoft, and MCP security docs all address tool access, approval, or least privilege. | Claude Code subagents; OpenCode Permissions; Codex Subagents; Microsoft Agent Skills; MCP Security Best Practices |
| Subagents can increase cost and complexity | Codex notes subagents consume more tokens. Anthropic recommends starting with simple composable patterns and avoiding unnecessary complexity. | Codex Subagents; Anthropic Building effective agents |

### Workflow Implementation Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Workflows differ from agents | Anthropic distinguishes predefined workflow paths from dynamically acting agents. Microsoft distinguishes skills from deterministic workflows. | Anthropic Building effective agents; Microsoft Agent Skills |
| Workflow patterns include chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer loops | These are recurring patterns in Anthropic’s agent workflow taxonomy and in ADK workflow agents. | Anthropic Building effective agents; Google ADK multi-agent docs |
| Commands are explicit workflow surfaces | Gemini custom commands and Claude command/skill docs show prompt shortcuts as explicit workflow entrypoints. | Gemini CLI custom commands; Claude Code skills/commands |
| Host-specific surfaces differ | GitHub separates custom instructions, prompts, agents, subagents, skills, and hooks. Gemini commands differ from OpenCode/Claude/Codex skills and agents. | GitHub customization cheat sheet; Gemini CLI custom commands; OpenCode Skills; Claude Code skills |
| Deterministic or checkpointed workflows may be more appropriate than AI-selected skills for side effects | Microsoft states workflows are suited to guaranteed steps, checkpoints, side effects, and approvals. | Microsoft Agent Skills |
| Durable runtime frameworks provide contrasting patterns | LangGraph emphasizes durable execution, memory, human-in-the-loop, tracing, and deployment. | LangGraph overview |

### Routing and Invocation Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Descriptions are routing boundaries | Skill and subagent descriptions are repeatedly used to choose whether and when to invoke a capability. | OpenAI Codex Skills; Anthropic skill best practices; OpenCode Skills; OpenCode Agents; Perplexity skills guide; Gemini subagents |
| Positive and negative examples improve routing | Perplexity recommends positive and negative examples, forbidden loads, and neighbor-confusion evals. OpenAI evals include trigger and negative-control cases. | Perplexity skills guide; OpenAI Eval Skills |
| Explicit invocation exists alongside automatic routing | Codex skills support explicit and implicit invocation; Gemini commands are explicit shortcuts; OpenCode subagents can be automatic or manual. | OpenAI Codex Skills; Gemini CLI custom commands; OpenCode Agents |
| Ambiguity should be handled as a routing problem | Literature discusses tool boundaries, description specificity, and evals for cases where one capability is close to another. | Perplexity skills guide; Anthropic skill best practices; Anthropic Building effective agents |
| Manual-only controls exist for side-effectful or risky workflows | Claude skills can disable model invocation; GitHub differentiates manual prompt files and automatic instructions. | Claude Code skills/commands; GitHub customization cheat sheet |

### Permission and Write-Boundary Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Tool permissions should be explicit | OpenCode, Claude Code, Codex, Microsoft Agent Framework, and MCP all describe tool access or approval controls. | OpenCode Permissions; Claude Code subagents; Codex Subagents; Microsoft Agent Skills; MCP Security Best Practices |
| Least privilege is a recurring security principle | MCP security and OpenCode permission categories both support narrowing capability exposure. | MCP Security Best Practices; OpenCode Permissions |
| Approval gates exist for risky actions | OpenCode uses ask/deny/allow. Microsoft discusses script approval and tool approval. Codex discusses approvals and sandbox behavior. | OpenCode Permissions; Microsoft Agent Skills; Microsoft handoff orchestration; Codex Subagents |
| File access and external directories are security boundaries | OpenCode treats external directories explicitly; Gemini commands respect `.gitignore` and `.geminiignore` during file injection. | OpenCode Permissions; Gemini CLI custom commands |
| Static permissions do not cover all runtime intent | Platform docs define static tool/file controls. Practitioner and workflow literature additionally emphasizes task contracts, validators, judge gates, or parent review. | OpenCode Permissions; Goalkeeper; OpenAI Agent Evals Guide; Anthropic Building effective agents |
| Prompt injection risk motivates deterministic safeguards | NCSC and MCP security guidance emphasize non-LLM safeguards, privilege drops, confirmation, and audit trails. | NCSC prompt injection guidance; MCP Security Best Practices; OWASP LLM Top 10 |

### Evaluation Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Evals should be designed before prompt/skill changes | Anthropic prompts and OpenAI eval skills both put success criteria before iteration. | Anthropic prompt engineering overview; OpenAI Eval Skills |
| Agent evals can inspect traces | OpenAI’s agent evals guide treats traces as containing model calls, tool calls, guardrails, handoffs, and actions. | OpenAI Agent Evals Guide |
| Routing evals should include positive and negative cases | Perplexity and OpenAI both discuss trigger and negative-control evals. | Perplexity skills guide; OpenAI Eval Skills |
| Output contracts are evaluable | Structured reports, JSON/YAML outputs, trace checks, and Definition-of-Done gates support evaluation. | OpenAI Agent Evals Guide; Goalkeeper; OpenAI Cookbook |
| Human feedback and judge models appear in evaluation loops | OpenAI’s agent improvement loop includes human feedback and evals. Goalkeeper uses a judge subagent after validators pass. | OpenAI Cookbook; Goalkeeper |
| Frameworks increasingly include evaluation/tracing | Google ADK, LangGraph/LangSmith, and OpenAI evals all describe tracing, evaluation, or monitoring as part of agent systems. | Google ADK overview; LangGraph overview; OpenAI Agent Evals Guide |

### Security and Safety Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Prompt injection is a structural risk | NCSC explains that LLMs lack reliable data/instruction separation and recommends reducing risk and impact. | NCSC prompt injection guidance |
| Tool exposure increases risk | MCP security guidance discusses tool poisoning, tool shadowing, least privilege, and human confirmation. | MCP Security Best Practices |
| Skills with scripts need review and sandboxing | Microsoft and OpenAI both discuss script execution risks; Microsoft includes sandboxing, input validation, logging, and source trust. | Microsoft Agent Skills; OpenAI Skills shell tips |
| Excessive agency is a security concern | OWASP classifies excessive agency and related risks among LLM application risks. | OWASP Top 10 for LLM Applications |
| Audit trails and logs help manage risk | NCSC, Goalkeeper, LangGraph, and OpenAI eval sources all reference traces, logs, or reviewable artifacts. | NCSC prompt injection guidance; Goalkeeper; LangGraph overview; OpenAI Agent Evals Guide |
| Human confirmation remains important for risky actions | Microsoft, MCP, OpenCode, and Codex all include approval or confirmation concepts. | Microsoft Agent Skills; MCP Security Best Practices; OpenCode Permissions; Codex Subagents |

### Maintenance Standards

| Pattern | What the literature says | Supporting sources |
|---|---|---|
| Keep instructions concise | GitHub custom instructions, Anthropic skill guidance, and Perplexity skill guidance all warn against instruction bloat. | GitHub custom instructions; Anthropic skill best practices; Perplexity skills guide |
| Update skills based on failures and evals | Perplexity describes a maintenance flywheel from real user queries and known failures to eval-backed changes. | Perplexity skills guide |
| Avoid duplicated instructions | Skill literature favors progressive disclosure and supporting files over repeated long instructions. | Anthropic skill best practices; Microsoft Agent Skills; Perplexity skills guide |
| Repository instructions can be living documentation | AGENTS.md describes agent instructions as living documentation for build/test and conventions. | AGENTS.md open format |
| Source-of-truth and generated-surface separation appears as a recurring engineering concern | Official docs often separate configuration, instructions, skills, and commands by surface. Truthmark itself uses a manifest and generated surfaces as repository context. | GitHub customization cheat sheet; OpenCode Skills; Truthmark repository evidence |
| Stale instruction risk is implicit in currentness and precedence guidance | Codex AGENTS.md guidance includes verifying loaded instructions. Skill docs caution against time-sensitive info inside skills. | OpenAI Codex AGENTS.md Guide; Anthropic skill best practices |

## Cross-Source Comparison

### Prompt Structure Comparison

| Source family | Prompt surfaces discussed | Structure emphasized | Evaluation emphasized | Notes |
|---|---|---|---|---|
| OpenAI | System/developer/user messages, Codex prompts, AGENTS.md, skills | Role hierarchy, Markdown/XML structure, coding task setup, output contracts | Agent evals, traces, graders, datasets | Strong for message hierarchy and agent eval instrumentation |
| Anthropic | Prompt engineering docs, Claude skills, Claude subagents | Clear instructions, examples, XML tags, role prompting, prompt chaining | Success criteria and evals before iteration | Strong for prompt iteration and simple workflow patterns |
| GitHub Copilot | Custom instructions, prompt files, custom agents, subagents, skills, hooks | Surface taxonomy and scope boundaries | Less detailed in seed docs; product supports hooks and agent customization | Strong cross-surface comparison |
| Gemini CLI | Custom command prompts, file injection, shell commands | Explicit command prompt, TOML fields, dynamic shell/file injection | Not central in command docs | Strong for command-style workflow surfaces |
| OpenCode | AGENTS.md rules, skills, agents | Project rules, skill descriptions, agent descriptions, permissions | Not a deep eval source in inspected docs | Strong for host-native skills/agents/permissions |
| Practitioner sources | Perplexity skills, Goalkeeper contracts, Matt Pocock skills | Skill descriptions, contracts, Definition of Done, handoff prompts | Evals, validators, judge gates | Strong concrete patterns, lower formal authority |

### Skill Structure Comparison

| Source | Entry structure | Metadata | Description role | Progressive disclosure | Scripts/assets | Evaluation / maintenance |
|---|---|---|---|---|---|---|
| OpenAI Codex Skills | Skill directory with `SKILL.md` | Name, description, path; host-specific listing | Used for implicit skill selection | Yes | Instructions/resources/scripts | Eval-related guidance appears in OpenAI eval and skills articles |
| Anthropic Agent Skills | Skill directory with `SKILL.md` and supporting files | Name and description required | Critical for selection among skills | Yes | Supporting files and resources | Best-practice checklist and real-usage testing |
| Agent Skills spec | Directory with `SKILL.md`, scripts, references, assets | Name, description, license, compatibility, metadata, experimental allowed tools | What/when/key terms | Yes | Scripts/references/assets/examples | Validation with reference tooling |
| OpenCode Skills | `.opencode/skills` and compatible locations | Recognized fields vary by host | Name/description displayed to model | Yes, loaded on demand | Permissions can apply to skills | Host docs focus more on loading and permissions |
| Microsoft Agent Skills | Skill folder with `SKILL.md`, scripts, references, assets | Name, description, license, compatibility, metadata, allowed tools | Advertised to agent for selection | Yes | Scripts, references, assets, config | Script approval, sandboxing, caching; skill-vs-workflow distinction |
| Perplexity | Hub-and-spoke skill directory | `SKILL.md` name/description plus supporting files | Routing trigger, not documentation | Yes, with explicit context tiers | Scripts/references/assets/config | Eval-first, maintenance flywheel, bloat budget |
| Matt Pocock skills | Practical repository of concise skill files | Varies by skill | Practical “use when” framing | Usually compact | Examples and workflows | Practitioner maintenance by adaptation |

### Agent/Subagent Comparison

| Source | Agent/subagent model | Delegation mechanism | Context isolation | Permission model | Reporting / acceptance |
|---|---|---|---|---|---|
| OpenCode | Primary agents and subagents | Automatic/manual subagent invocation via descriptions | Child sessions | Per-agent permissions with allow/ask/deny | Host-specific; prompt can define report |
| Claude Code | Project/user subagents | Descriptions guide delegation; subagents can be called directly | Own context, prompt, tools | Per-agent tools/permissions, hooks | Subagent returns summary/findings; parent conversation continues |
| OpenAI Codex | Subagents and custom agents | Main agent spawns specialized agents; explicit ask; parallel tasks | Separate threads/context | Inherited sandbox/approvals with overrides | Results returned to main agent; recursion capped |
| Gemini CLI | Custom subagent Markdown files | Auto-selected by description or invoked by name | Separate context; main session orchestrates | Curated tools per subagent | Results consolidated into main response |
| Microsoft Agent Framework | Handoff orchestration and specialized agents | Handoff rules and task ownership transfer | Context synchronization rules | Tool approval and HITL approval | Handoff, checkpointing, and specialized executor behavior |
| Google ADK | Parent-child multi-agent hierarchy | Parent instruction and subagent descriptions | Agent hierarchy and workflow agents | Framework tools and orchestration | Framework-dependent |
| AWS Bedrock | Supervisor/collaborator agents | Supervisor routes tasks | Collaborator roles and tools | Guardrails, action groups, knowledge bases | Supervisor coordinates responses |
| Goalkeeper | Judge subagent pattern | Validator pass triggers judge | Fresh independent context | Claude Code environment-dependent | Judge approves/rejects against Definition of Done |

### Workflow Surface Comparison

| Surface family | Typical files/surfaces | Invocation mode | Strength | Limitation |
|---|---|---|---|---|
| OpenCode | `AGENTS.md`, `.opencode/skills`, `.opencode/agents` | Automatic or manual depending on skill/agent description | Rich skills/agents/permissions | Host-specific permission semantics |
| Claude Code | `CLAUDE.md`, `.claude/skills`, `.claude/agents`, commands/hooks | Automatic skill loading, direct subagent calls, hooks | Strong skill/subagent ecosystem | Claude-specific frontmatter and tools |
| Codex | `AGENTS.md`, `.codex/skills`, `.codex/agents` | AGENTS.md auto-read; skills explicit/implicit; subagents explicit | Strong repository instruction and skill model | Codex-specific sandbox/approval model |
| GitHub Copilot | Custom instructions, prompt files, custom agents, subagents, skills, hooks | Mixed automatic/manual | Clear taxonomy across customization surfaces | Feature availability varies by environment |
| Gemini CLI | `.gemini/commands`, `.gemini/agents` | Commands explicit; agents may be routed/invoked | Strong command/file injection and emerging subagents | Commands and agents are distinct; project support varies |
| Truthmark repository context | Managed root blocks, generated skills/prompts/commands/agents | Sync automatic; others explicit/manual | Manifest-owned generated surfaces | Host capability differences remain part of adapter problem |

### Permission Model Comparison

| Source | Tool permissions | File/write boundaries | Approval model | Security emphasis |
|---|---|---|---|---|
| OpenCode | Explicit allow/ask/deny categories | Granular edit/bash/external-directory permissions | Ask mode for selected tools/actions | Host-level least privilege |
| Claude Code | Tools and permissions per subagent; hooks | Tool selection and hooks can constrain behavior | Hooks and permission controls | Host-level controls plus subagent isolation |
| Codex | Sandbox/approval inheritance and overrides | Workspace sandbox options | Approval requests may surface from subagent activity | Sandbox and approval coordination |
| Gemini CLI commands | Shell command confirmation; file injection respects ignore rules | Command/file injection boundaries | User confirmation for shell execution | Explicit shell/file injection caution |
| Microsoft Agent Framework | Script approval, tool approval, sandboxing | Resource limits, input validation, audit logging | Approval callbacks/HITL | Production script and tool safety |
| MCP security | Tool descriptions, tool allowlists, least privilege | Tool/resource exposure constraints | Human confirmation recommended | Prompt injection/tool poisoning risks |
| Truthmark repository context | Generated host permissions plus runtime lease text | Truth docs/routing write boundaries and leased worker writes | Parent-owned diff validation in generated surfaces | Repository-reviewable write boundaries |

### Evaluation Model Comparison

| Source | Evaluation object | Mechanism | Positive/negative behavior | Notes |
|---|---|---|---|---|
| OpenAI Agent Evals | Agent traces, tools, handoffs, safety | Traces, graders, datasets, eval runs | Yes; wrong tool/handoff/instruction violations | Strong for trace-centered evals |
| OpenAI Eval Skills | Skills and skill-routing behavior | Prompt sets, trace checks, deterministic assertions | Yes; trigger and negative controls | Strong for skill-routing evals |
| OpenAI Cookbook | Agent harness changes | Feedback, traces, evals, validation | Yes; improvement loop | Implementation-oriented |
| Anthropic prompting | Prompts | Success criteria and eval iteration | Implied | Strong for prompt process |
| Perplexity skills | Skill loading and task performance | Positive/negative/forbidden evals, progressive loading checks | Explicit | Strong practitioner skill-eval detail |
| Goalkeeper | Autonomous workflow completion | Validator plus judge gate against Definition of Done | Reject/fix-list behavior | Illustrative judge-agent pattern |
| LangGraph/LangSmith | Agent execution | Tracing, evaluation, monitoring | Framework-dependent | Runtime-observability model |
| Microsoft Agent Framework | Skills/workflows | Script approval, caching, workflow checkpoints | Framework-dependent | Workflow-vs-skill distinction important |

## Agreement Map

| Pattern | Supporting sources | Area | Notes |
|---|---|---|---|
| Skills should have concise routing descriptions | OpenAI Codex Skills; Anthropic skill best practices; OpenCode Skills; Agent Skills spec; Perplexity | Skills, routing | Sources use different names but converge on description-driven selection |
| Reusable context should be separated from one-off task prompts | OpenAI skills; Anthropic skills; Microsoft Agent Skills; Perplexity | Skills, prompts | Repeated procedures become skills/resources, not ad hoc prompts |
| Persistent repository instructions should be stable and concise | AGENTS.md; OpenAI Codex AGENTS.md; GitHub custom instructions; OpenCode docs | Repository instructions | They carry project norms, build/test commands, and conventions |
| Progressive disclosure is a skill standard | OpenAI Codex Skills; Anthropic Agent Skills; Microsoft Agent Skills; Agent Skills spec; Perplexity | Skills, context management | Small metadata first, body/resources later |
| Subagents should have narrow responsibilities | Codex Subagents; Claude Code subagents; OpenCode Agents; Gemini subagents; Google ADK | Agents/subagents | Narrowness supports routing and reduces context contamination |
| Parent/orchestrator coordination is common | Anthropic orchestrator-workers; Microsoft handoff; AWS supervisor; Gemini main session; Google ADK parent agents | Workflows, agents | Sources differ on whether control transfers or remains centralized |
| Permissions should be explicit | OpenCode Permissions; Claude Code subagents; Codex Subagents; Microsoft Agent Skills; MCP security | Permissions/security | Permission models vary by host but least privilege recurs |
| Eval suites should include negative behavior | OpenAI Eval Skills; Perplexity; OpenAI Agent Evals | Evaluation, routing | Negative controls and forbidden invocations are repeated patterns |
| Tool and script execution are security-sensitive | Microsoft Agent Skills; OpenAI Skills shell tips; MCP security; NCSC | Security, skills | Scripted skills and tools require review, sandboxing, or confirmation |
| Workflow and skill are not identical concepts | Microsoft Agent Skills; Anthropic Building effective agents; GitHub customization cheat sheet | Workflow implementation | Skills are often agent-selected; workflows can be deterministic/checkpointed |
| Human review or confirmation remains relevant for risky actions | Microsoft, MCP, OpenCode, Codex, Goalkeeper | Permissions, evaluation, safety | Sources differ on how much is manual versus automated |
| Bloat is a real maintenance risk | Anthropic skill best practices; GitHub custom instructions; Perplexity | Maintenance | Context cost is treated as a design constraint |

## Disagreement Map

| Topic | Source positions | Why they differ | Relevance to Truthmark |
|---|---|---|---|
| Skill format | OpenAI, Anthropic, Microsoft, OpenCode, and Agent Skills all use `SKILL.md`-style packages, but supported metadata and paths differ | Hosts have different loaders, frontmatter fields, permission systems, and compatibility layers | Truthmark has host-specific generated skill surfaces |
| Commands versus skills | Gemini custom commands are explicit TOML prompt shortcuts; Claude docs increasingly frame repeated procedures as skills rather than commands | Command surfaces and skill loaders solve overlapping but different host problems | Truthmark uses Gemini commands and host skills/prompts elsewhere |
| Automatic versus manual invocation | Codex and OpenCode skills can be implicit or explicit; Gemini commands are explicit; GitHub surfaces differ by feature | Invocation depends on host capability and risk model | Truthmark distinguishes automatic Sync from explicit/manual workflows |
| Agent autonomy | Anthropic recommends simple workflows first; LangGraph supports long-running stateful agents; Microsoft supports handoff orchestration | Frameworks target different complexity and deployment settings | Truthmark’s repository-native surfaces are different from durable runtime agents |
| Parent-owned versus handoff ownership | Microsoft handoff transfers control; Gemini describes main session orchestration; Anthropic includes orchestrator-workers; Codex subagents report back | Multi-agent systems differ on whether task ownership moves or remains centralized | Truthmark’s generated surfaces describe parent-owned final acceptance |
| Static permissions versus runtime intent | OpenCode, Claude, Codex, and Microsoft define static or approval-based controls; practitioner systems use contracts/judges; Truthmark research uses leases | Static tools can constrain capability but cannot fully encode task-specific intent | Truthmark’s write lease pattern is a local design pattern adjacent to external permission literature |
| Prompt verbosity | Anthropic and GitHub emphasize concise instructions; Perplexity allows larger loaded skill bodies but warns about context tax; OpenAI discusses context budgeting | Different surfaces have different context budgets and loading semantics | Truthmark’s generated surfaces must balance route visibility and bloat |
| Cross-host parity | GitHub offers a broad taxonomy; OpenCode/Claude/Codex/Gemini implement different mechanics | Host ecosystems are not identical | Truthmark maps one protocol into multiple host surfaces |

## Truthmark Relevance Map

| Truthmark area | Relevant literature | What the literature discusses | Why it may matter |
|---|---|---|---|
| Truth Sync | OpenAI evals; Anthropic workflow gates; Microsoft workflow distinction; OpenCode/Codex/Claude skills | Automatic or implicit workflows, report contracts, gates, skill invocation, verification | Literature discusses how repeated side-effectful procedures can be structured, invoked, and evaluated |
| Truth Structure | Anthropic routing workflows; Perplexity neighbor-confusion evals; OpenAI skill routing evals | Routing, negative cases, adjacent workflow confusion, structure repair | Literature suggests topology/routing workflows are sensitive to boundary definitions |
| Truth Document | Skill descriptions; progressive disclosure; evidence and output contracts | Documentation workflows, skill bodies, evidence requirements, report outputs | Literature provides patterns for implementing documentation procedures as loaded context |
| Truth Realize | Workflow-vs-skill distinction; prompt chaining; coding-agent prompts | Doc-first implementation, code-writing prompts, verification loops | Literature discusses code-writing workflows and testing/validation patterns |
| Truth Check | Agent evals; judge agents; security review; workflow audits | Audit/check workflows, traces, judge gates, validation, report contracts | Literature provides adjacent patterns for review-only or verification workflows |
| Workflow manifest | Microsoft workflow distinction; Anthropic workflow patterns; Google ADK workflow agents | Source structures for workflows, routing, gates, and orchestration | Literature provides context for treating workflows as structured entities rather than ad hoc prompts |
| Generated workflow surfaces | GitHub customization taxonomy; OpenCode/Claude/Codex/Gemini surfaces | Host-specific instructions, skills, prompts, commands, agents | Literature shows that different hosts expose different but overlapping customization surfaces |
| Skills | OpenAI Codex Skills; Anthropic Skills; OpenCode Skills; Agent Skills spec; Microsoft Skills; Perplexity | `SKILL.md`, metadata, description routing, progressive disclosure, scripts, references | Directly maps to generated host skills and skill-like workflow packages |
| Read-only verifier agents | Codex read-only examples; Claude subagents; Goalkeeper judge; OpenAI evals | Specialist verifiers, reviewers, judge agents, fresh-context review | Literature discusses verifier/reviewer roles as a recurring subagent pattern |
| Proposed write-capable OpenCode subagents | OpenCode permissions; Microsoft script/tool approval; NCSC/MCP security; Goalkeeper contracts | Tool permissions, write boundaries, approval, contracts, validation, parent review | Literature provides adjacent evidence for permissioning and validating delegated writes |
| Cross-host adapters | GitHub taxonomy; OpenCode, Codex, Claude, Gemini docs | Platform differences in skills, agents, prompts, commands, permissions | Literature clarifies why host-specific adapters may not be mechanically identical |
| Tests | OpenAI evals; Perplexity evals; Anthropic prompt eval process; Goalkeeper validator/judge | Routing evals, negative controls, traces, validators, judge gates | Literature gives evaluation categories for later test design |

## Candidate Implementation Patterns Found in the Literature

This section lists implementation patterns found in the literature. It does not state whether Truthmark should adopt them.

| Pattern | Source support | Description | Potential relevance to Truthmark | Caveats |
|---|---|---|---|---|
| Source-of-truth manifest rendered into host surfaces | Truthmark repository context; GitHub customization taxonomy; framework config patterns | A central structured definition generates host-specific instructions, prompts, commands, skills, and agents | Truthmark already uses a typed workflow manifest and renderers | External sources usually do not prescribe Truthmark’s exact manifest pattern |
| Narrow skill descriptions used as routing boundaries | OpenAI Codex Skills; Anthropic skill best practices; OpenCode Skills; Perplexity | Descriptions tell the model when to invoke a skill and when not to | Relevant to workflow-skill routing descriptions | Hosts differ on how descriptions are surfaced to the model |
| Progressive disclosure | OpenAI, Anthropic, Microsoft, Agent Skills spec, Perplexity | Skill metadata is shown first; full instructions and resources are loaded only when needed | Relevant to managing workflow-surface size | Some hosts have different loaders or no direct skill equivalent |
| Read-only verifier subagents | Codex examples; Claude subagents; Goalkeeper; Anthropic evaluator-optimizer | Specialist workers inspect evidence and return findings without writing | Relevant to route auditors, claim verifiers, and doc reviewers | “Read-only” may require both prompt instructions and host permissions |
| Judge-gate pattern | Goalkeeper; Anthropic evaluator-optimizer; OpenAI evals | A fresh-context reviewer checks completion against a contract after validators pass | Relevant to workflow check or acceptance research | Practitioner pattern; not a formal standard |
| Parent-owned final acceptance | Gemini orchestrator framing; Codex main-agent result collection; Microsoft orchestration; Truthmark repository context | Parent/orchestrator receives subagent results and coordinates final output | Relevant to parent/subagent workflow design | Microsoft handoff can transfer task ownership, so not universal |
| Leased write-capable worker | Truthmark research/context; OpenCode permissions; Microsoft approval; NCSC/MCP least privilege | A worker receives task-specific allowed writes and parent validates actual diff | Relevant to proposed and current write-capable Truthmark workers | “Write lease” is a Truthmark-local term, not a broad external standard |
| Positive and negative routing evals | OpenAI Eval Skills; Perplexity | Eval sets include prompts that should and should not trigger a skill or workflow | Relevant to workflow routing tests | Requires model-based or prompt-simulation harness design |
| Permission allowlists and denylists | OpenCode Permissions; MCP security; Microsoft Agent Skills | Tools, files, external directories, and scripts are constrained by explicit rules | Relevant to generated agent permissions | Static allowlists may not encode all workflow intent |
| Explicit command surfaces | Gemini custom commands; Claude commands/skills; GitHub prompt files | Commands or prompt files provide manual workflow entrypoints | Relevant to manual Truthmark workflows | Commands differ from skills and subagents |
| Workflow gates | Anthropic prompt chaining gates; Goalkeeper validators/judge; Truthmark gates | A workflow pauses, routes, or rejects based on intermediate checks | Relevant to Truthmark’s shared gates | Gate semantics vary by system |
| Trace-centered evaluation | OpenAI Agent Evals; LangGraph/LangSmith | Agent runs are evaluated through traces, tool calls, handoffs, and outcomes | Relevant to future workflow eval design | Truthmark’s local Git/test model may use different artifacts |

## Open Questions for Future Truthmark Design

The literature raises several questions that are not fully answered for this repository:

1. How much cross-host parity is realistic when Codex, OpenCode, Claude, GitHub Copilot, and Gemini expose different instruction, skill, command, agent, and permission primitives?

2. What belongs in a workflow surface versus a reusable skill when a host treats skills as model-selected context packages but Truthmark treats workflows as behavior-bearing protocol surfaces?

3. How should workflow descriptions be tested as routing boundaries across hosts with different loaders and invocation semantics?

4. What is the appropriate balance between deterministic tests, prompt-style evals, trace-based evals, and model-judge evals for repository-native workflows?

5. Which workflow behaviors should be automatic, explicit, or conditionally invoked by a parent workflow?

6. How should write-capable subagents be validated when host permissions are static but workflow intent is runtime-specific?

7. Should write-capable subagents remain host-specific first, or should all generated hosts expose equivalent workers only when host capabilities match?

8. How should parent workflows validate subagent edits: report schema, Git diff, file allowlist, semantic evidence, tests, or a combination?

9. How should stale generated surfaces be detected when a manifest, renderer, README, truth docs, and host surfaces may drift?

10. Which discovered failure modes should become examples, which should become manifest fields, which should become tests, and which should be left as operator judgment?

11. How much context should be placed in root managed instructions versus generated workflow surfaces versus supporting files?

12. How should security guidance from prompt injection, MCP tool safety, and LLM excessive-agency literature be adapted to local repository-writing agents?

## Appendix A: Source Notes

### OpenAI source notes

- Prompt Engineering Guide: official OpenAI docs; useful for role hierarchy, structured prompts, coding prompt examples, output contracts, and context placement.
- Codex AGENTS.md Guide: official Codex docs; useful for repository instruction discovery, global/project/nested instruction precedence, and instruction size constraints.
- Codex Skills: official Codex docs; useful for skill directory structure, `SKILL.md`, progressive disclosure, implicit and explicit invocation.
- Codex Subagents: official Codex docs; useful for custom agents, narrow subagents, inherited sandbox/approvals, recursion limits, and parallel work.
- Eval Skills: 2026 OpenAI blog; useful for eval-first skills, trigger evals, negative controls, and deterministic trace checks.
- Skills Shell Tips: 2026 OpenAI blog; useful for description-as-routing, shell scripts, deterministic workflows, and tool/security cautions.
- Skills Agents SDK: 2026 OpenAI blog; useful for repository-local skills, AGENTS.md, deterministic scripts, and CI workflows.
- Agent Evals Guide: official docs; useful for traces, graders, datasets, tool-call checks, handoff checks, and safety checks.
- Agent Improvement Loop Cookbook: 2026 OpenAI cookbook; useful for harness-change loops using traces, feedback, evals, routing, and output validation.

### Anthropic source notes

- Prompt engineering overview: useful for success criteria, evals, clarity, examples, XML tags, and prompt chaining.
- Agent Skills overview: useful for skills as filesystem capabilities, progressive disclosure, `SKILL.md`, metadata, and security considerations.
- Skill authoring best practices: useful for description specificity, body-size guidance, examples, evals, and maintenance checklist.
- Claude Code subagents: useful for separate context, prompt, tools, permissions, description-based delegation, and parent/subagent boundaries.
- Claude Code skills/commands: useful for skill loading, supporting files, manual-only modes, tool restrictions, and troubleshooting over-triggering.
- Building effective agents: useful for workflow/agent distinction, prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer, and tool design.

### OpenCode source notes

- OpenCode docs overview: useful for project `AGENTS.md` and host context.
- Agents docs: useful for primary agents, subagents, automatic/manual invocation, child sessions, project-local agent files, descriptions, prompts, modes, and permissions.
- Skills docs: useful for skill paths, recognized metadata, name/description listing, loader behavior, and per-skill/per-agent permissions.
- Permissions docs: useful for allow/ask/deny behavior, granular rules, external directory handling, and permission categories.

### Agent Skills and AGENTS.md source notes

- Agent Skills specification: useful for portable `SKILL.md`, metadata, scripts, references, assets, examples, progressive disclosure, and validation.
- Agent Skills repository: useful as active reference implementation and currentness signal.
- AGENTS.md open format: useful for persistent repository instructions, build/test conventions, nested files, closest-file precedence, and living documentation.

### GitHub source notes

- Copilot customization cheat sheet: useful as a taxonomy across custom instructions, prompt files, custom agents, subagents, skills, hooks, and MCP.
- Repository custom instructions docs: useful for repository-wide, path-specific, and agent instructions, including what belongs in persistent instructions.

### Google and Gemini source notes

- Gemini CLI custom commands: useful for explicit command surfaces, TOML fields, project/global placement, arguments, shell confirmation, and file injection.
- Gemini CLI subagents announcement: useful for separate-context subagents, project/global Markdown agent files, descriptions, tools, models, and main-session orchestration.
- Google ADK overview: useful for agent framework design, predictable pipelines, dynamic routing, multi-agent systems, tools, and evaluation.
- Google ADK multi-agent systems: useful for parent-child hierarchy, workflow agents, parallel agents, and LLM-driven delegation.

### Microsoft and AWS source notes

- Microsoft Agent Skills: useful for skill package structure, metadata, progressive disclosure, script security, script approval, caching, and the distinction between skills and workflows.
- Microsoft handoff orchestration: useful for specialist agents, handoff rules, task ownership, context synchronization, approval, and checkpointing.
- AWS Bedrock multi-agent collaboration: useful for supervisor/collaborator roles, responsibilities, guardrails, and task routing.

### Framework, security, and practitioner source notes

- LangGraph overview: useful as a contrasting runtime-oriented architecture for durable, stateful agents with HITL, memory, tracing, and evaluation.
- MCP security best practices: useful for tool safety, tool poisoning, prompt injection, least privilege, and human confirmation.
- NCSC prompt injection guidance: useful for structural security framing and deterministic safeguards.
- OWASP Top 10 for LLM Applications: useful as broad security taxonomy.
- Perplexity skills guide: useful for skill descriptions, progressive disclosure, scripts, eval-first design, maintenance, bloat, and neighbor-confusion evals.
- Goalkeeper: useful for contract-driven workflow execution, validator-plus-judge gates, fresh-context review, and structured fix lists.
- Matt Pocock skills: useful as an illustrative skill repository with small reusable skills, handoff patterns, TDD patterns, and practical agent workflow examples.

## Appendix B: Repository Evidence Notes

### Files inspected

- [README.md](https://github.com/merlinhu1/truthmark/tree/subagent-improvement)
- [AGENTS.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/AGENTS.md)
- [CLAUDE.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/CLAUDE.md)
- [GEMINI.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/GEMINI.md)
- [FutureVision.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/FutureVision.md)
- [research/2026-05-15-agent-skills-workflow-review.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-15-agent-skills-workflow-review.md)
- [research/2026-05-16-write-capable-opencode-subagents-design.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/research/2026-05-16-write-capable-opencode-subagents-design.md)
- [docs/truth/workflows/overview.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/overview.md)
- [docs/truth/workflows/shared-gates.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truth/workflows/shared-gates.md)
- [docs/truthmark/areas.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/docs/truthmark/areas.md)
- [src/agents/workflow-manifest.ts](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/workflow-manifest.ts)
- [src/agents/instructions.ts](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/agents/instructions.ts)
- [src/templates/workflow-surfaces.ts](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/src/templates/workflow-surfaces.ts)
- [src/templates/generated-surfaces.ts](https://github.com/merlinhu1/truthmark/blob/subagent-improvement/src/templates/generated-surfaces.ts)
- [.opencode/skills/truthmark-sync/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/skills/truthmark-sync/SKILL.md)
- [.opencode/skills/truthmark-document/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/skills/truthmark-document/SKILL.md)
- [.opencode/agents/truth-doc-writer.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-doc-writer.md)
- [.opencode/agents/truth-route-auditor.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.opencode/agents/truth-route-auditor.md)
- [.codex/skills/truthmark-sync/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.codex/skills/truthmark-sync/SKILL.md)
- [.codex/agents/truth-doc-writer.toml](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.codex/agents/truth-doc-writer.toml)
- [.claude/skills/truthmark-sync/SKILL.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.claude/skills/truthmark-sync/SKILL.md)
- [.claude/agents/truth-doc-writer.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.claude/agents/truth-doc-writer.md)
- [.github/prompts/truthmark-sync.prompt.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.github/prompts/truthmark-sync.prompt.md)
- [.github/agents/truth-doc-writer.agent.md](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.github/agents/truth-doc-writer.agent.md)
- [.gemini/commands/truthmark/sync.toml](https://raw.githubusercontent.com/merlinhu1/truthmark/subagent-improvement/.gemini/commands/truthmark/sync.toml)

### Repository observations

- Truthmark installs repository-native workflow surfaces for several AI hosts.
- The workflow inventory is Sync, Structure, Document, Realize, and Check.
- Truth Sync is described as the only automatic finish-time workflow.
- The typed workflow manifest is the central source of workflow metadata.
- Generated workflow descriptions are used as routing triggers.
- Detailed procedures, write boundaries, report contracts, and invocation rules live in generated surfaces.
- Host surfaces include skills, prompts, commands, managed instruction blocks, and agents depending on host.
- Current generated surfaces include read-only verifiers plus leased `truth-doc-writer` agents where hosts support agents.
- Gemini generated surfaces in the inspected branch are command files rather than generated Gemini subagents.
- The research folder contains non-canonical design references and should not be treated as behavior-bearing unless promoted.
- The write-capable OpenCode subagents research file proposes a broader write-worker design, while the current promoted worker in source/generated surfaces is the doc writer.

## Appendix C: Search Queries Used

- `OpenCode skills agents permissions docs`
- `OpenCode AGENTS.md project rules skills subagents permissions`
- `OpenAI Codex skills AGENTS.md subagents docs`
- `OpenAI agent evals traces graders handoffs`
- `OpenAI skills shell tips description routing`
- `Anthropic agent skills best practices description progressive disclosure`
- `Claude Code subagents tools permissions description`
- `Claude Code skills slash commands supporting files`
- `Anthropic building effective agents workflows routing parallelization`
- `Agent Skills specification SKILL.md scripts references assets`
- `AGENTS.md open format coding agents`
- `GitHub Copilot custom instructions prompt files custom agents skills hooks`
- `Gemini CLI custom commands file injection shell commands`
- `Gemini CLI subagents separate context tools description`
- `Microsoft Agent Framework skills workflows scripts security`
- `Microsoft Agent Framework handoff orchestration tool approval`
- `Google ADK multi-agent systems parent child workflow agents`
- `AWS Bedrock multi-agent collaboration supervisor collaborator`
- `LangGraph durable execution human in the loop tracing evaluation`
- `MCP security best practices prompt injection tool poisoning least privilege`
- `NCSC prompt injection is not SQL injection`
- `Perplexity designing refining maintaining agent skills`
- `Goalkeeper judge gate Claude Code subagent Definition of Done`
- `Matt Pocock skills AI agents repository`

## Appendix D: Terminology

| Term | Meaning in this review |
|---|---|
| Prompt | Instructions or context given to a model for a specific interaction, task, workflow, or capability. |
| System prompt | Highest-level model instruction layer in systems that expose system messages. |
| Developer instruction | Instruction layer used by some platforms for durable behavior, rules, tool policy, or application logic. |
| Repository instruction | A project-local instruction file such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or Copilot custom instructions. |
| Skill | A reusable context package, often containing `SKILL.md`, metadata, instructions, scripts, references, assets, or examples. |
| Agent | A model-driven actor with instructions, tools, context, and possibly state or permissions. |
| Subagent | A specialized child or delegated agent, often with separate context, narrower tools, and a specific purpose. |
| Workflow | A repeatable process with invocation criteria, steps, gates, write boundaries, verification, and output/report expectations. |
| Command | A named prompt shortcut or explicit entrypoint, often host-specific, such as a Gemini CLI command. |
| Routing trigger | Text or metadata that helps a model or orchestrator decide when to invoke a prompt, skill, command, workflow, or subagent. |
| Negative trigger | A condition or example indicating when a capability should not be invoked. |
| Forbidden adjacency | A neighboring task or workflow that is easy to confuse with the current one and should be explicitly distinguished. |
| Permission | A host or framework control that constrains tools, files, commands, network access, or approvals. |
| Write boundary | A rule limiting what files, directories, or artifacts may be edited by a workflow or agent. |
| Eval | A test or assessment of model, prompt, skill, agent, routing, tool-use, report, or workflow behavior. |
| Generated surface | A host-specific file or prompt surface generated from a source definition, such as a skill, prompt, command, agent file, or managed instruction block. |
| Source of truth | The canonical repository file or structured definition from which behavior-bearing generated surfaces or documentation derive. |
