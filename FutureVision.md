Directions for V2

Priority order: Evidence and Adoption first. Conformance continuously. Propagation and
Decision Architecture in a later pass when the core confidence surface is stable.

---

V2.0 — Ship First

1. Evidence Layer
   - Strengthen `truthmark check` into the primary confidence surface. Error diagnostics
     should be the canonical signal of truth health, not a secondary linting step.
   - Make check output more actionable: route precision score, unmapped code surfaces, stale
     generated surfaces, topology pressure hotspots in one readable report.
   - Expose stable JSON output from `truthmark check` so CI, PR bots, and future adapters
     can consume truth health without parsing human-readable text.
   - Add lightweight traceability reporting: which routed docs have explicit code ownership,
     active decisions, and at least one verification link. This is coverage for Truthmark's
     narrower scope, not full MBSE traceability.
   - Build before/after demos: code change -> tests -> Truth Sync -> reviewable truth diff.

2. Adoption Layer
   - Create high-quality example repos: Node API, Go service, frontend app, monorepo, infra
     repo. Each one should show a real Truth Sync cycle, not just the installed scaffolding.
   - Add migration guides for teams already using AGENTS.md, CLAUDE.md, Copilot
     instructions, or Gemini commands. The entry point is their existing agent config, not
     a blank repo.
   - Sharpen messaging: "Your agents write code. Truthmark makes their context reviewable in
     Git."
   - Reduce vocabulary friction. "Truth" is powerful internally, but new users need concrete
     outcomes: fewer repeated decisions, better handoffs, less doc drift.
   - Show comparative stories: prompt-only repo vs Truthmark repo, broad route vs precise
     route, undocumented change vs reviewable truth diff. These replace the abstract truth
     explorer idea; showing is better than a browseable demo that requires building a separate
     site product.

---

V2.x — Steady Conformance (ongoing alongside V2.0)

3. Conformance Layer
   - Treat generated host surfaces as adapters with contract tests covering each platform
     (Codex, Claude Code, Copilot, OpenCode, Gemini CLI). Host API evolution is the main
     breakage risk; tests catch it before users do.
   - Keep all configured platforms current as those hosts evolve. External signal: Codex
     reads repo instructions and skills; Copilot supports repo/path/agent instructions;
     Claude Code has project skills; Gemini CLI supports project commands.
   - Keep MCP and IDE integrations as optional adapter surfaces only. They must not become
     the product center of gravity. Truthmark is a repository protocol, not a server.

---

V2.5 — Next Wave

4. Propagation Layer
   - Inspired by Reqvire's change-propagation concept, but scoped to Truthmark's narrower
     model: route-aware, not requirement-graph-aware.
   - For code-first changes, Truth Sync should emit "likely stale" hints when a change
     touches code owned by multiple routes or when owned docs have not been touched in the
     same branch. This is a check signal, not an automatic rewrite.
   - For doc-first changes, Truth Realize should emit a bounded implementation checklist
     (which code files are owned by the changed doc, what tests cover them) before the agent
     begins writing code. Reduces scope drift.
   - Treat active decisions as reviewable objects: a truth diff that shows a Product Decision
     change should surface which code areas and tests that decision governs. Reviewers should
     not need to reconstruct the impact manually.

5. Decision Architecture (New Idea — Evaluate Before Building)
   - Proposal: separate business decisions from technical decisions by where they live.
     Business decisions (what the PM decided the product must do and why) belong in truth
     docs. Technical decisions (why this implementation approach, which trade-offs were made
     in code) can live as structured comments in the code.
   - The existing Product Decisions / Rationale section structure in canonical docs already
     approximates this: "Product Decisions" is the business layer, "Rationale" is the
     technical justification.
   - Opportunity: make this convention explicit, validated, and agent-readable. `truthmark
     check` could warn when a Product Decisions section reads like an implementation note
     (contains file names, library names, performance numbers) rather than product intent.
   - Risk 1: the boundary is blurry. "We chose PostgreSQL because the team knows it" is a
     technical decision with an organizational cause; "we chose eventual consistency because
     the PM wants fast writes" is a business decision that shapes technical choices. Many
     real decisions span both.
   - Risk 2: code comments don't survive refactoring. They drift more than truth docs, which
     have routing, check, and Truth Sync discipline.
   - Risk 3: agents crossing two locations (truth doc for the what, code for the why) is
     more expensive than one location with both. The protocol should be clear about which
     agent reads what.
   - Better formulation: truth docs own product intent and the business rationale for
     decisions. Technical trade-offs and implementation rationale should also appear in truth
     docs when the trade-off is decision-bearing (likely to be revisited or affects contract
     boundaries). Implementation-local detail (why this loop is structured this way) belongs
     in code comments and is outside Truthmark's scope.
   - Verdict: validate the convention with example repos before encoding it as a validated
     check. It is a governance principle, not a structural enforcement.

---

Non-Goals (What Truthmark Should Not Become)

These are competitive directions that feel adjacent but would dilute the product:

- A full requirements or MBSE platform (that is Reqvire's lane).
- A memory server or session-persistence tool.
- A spec or PRD authoring tool.
- An IDE or editor plugin (adapter surfaces only, not first-party tooling).
- A merge gate or CI approval system (truth health is a signal, not an enforcement layer by
  default).

---

Market Position

Reqvire validates demand for Git-native, Markdown-based, AI-readable context with
traceability and coverage. ADRs (15k GitHub stars) validate demand for decision-record
discipline across teams. Decision Guardian validates demand for decision-to-code surfacing at
PR review time.

The gap Truthmark owns is narrower and more opinionated: branch-scoped repository truth
as a governance layer, not a requirements system and not a memory tool. The value is that
agent context becomes a committed, reviewable, branch-local Git artifact instead of a
session-private opaque record.

If Reqvire is requirements-as-context and ADRs are decision-as-document, Truthmark is
repository-truth-as-governance: what is authoritative on this branch, what code it owns,
what changed, and what must be updated before work is complete.

> The repo should tell every AI agent what is true, what owns what, what changed, and what
> must be updated before work is complete.