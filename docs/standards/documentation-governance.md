---
status: active
doc_type: standard
last_reviewed: 2026-05-09
source_of_truth:
  - ../README.md
  - ../ai/repo-rules.md
---

# Documentation Governance

## Scope

This standard defines the documentation-governance rules Truthmark itself follows when routing truth docs, syncing code changes into docs, and realizing docs back into code.

Projects may adapt the exact directory layout, but the rules below are the reusable core that makes branch-local truth routing work.

For the broader reusable baseline beyond documentation governance, see `docs/standards/default-principles.md`.

Small repositories are in scope. A project does not need a large documentation program to benefit from Truthmark. It needs only a small canonical truth surface, clear ownership, and a willingness to improve routing quality over time.

## Core Rules

- Each document should have one primary responsibility.
- Each class of fact should have one canonical source.
- Current implementation, reusable standards, and future proposals should be stored separately.
- Historical plans and generated planning artifacts should stay outside the canonical current-state tree until they are intentionally rewritten.
- Do not maintain parallel documentation trees for the same subject.
- The root README may introduce the project or product, but it should not silently compete with canonical engineering or behavior docs.
- Agent instruction files may install workflow behavior, but they are not product truth unless a project explicitly includes them in authority.
- Generated helper output is never canonical truth.

## Truthmark Implications

- Truth Sync works best when changed code maps to a small and explicit set of truth docs.
- Truth Realize works best when authority order and area ownership are unambiguous.
- Weak routing produces weak truth maintenance.
- Large repositories should treat topology repair as an AI workflow responsibility, not as a human folder-discipline requirement.
- Automatically created truth should be placed conservatively: extend mapped docs first, create an area-local doc second, create a new area only as a last resort.
- When a fact is already canonical elsewhere, Truth Sync should update or reference that source rather than duplicating the fact in a second document.

## Canonical Surface

Truthmark's minimal canonical surface is:

- `docs/ai/repo-rules.md` as the repository-wide agent policy source
- `TRUTHMARK.md` as the human and agent-readable truth-workflow entrypoint
- `docs/truthmark/areas.md` as the primary routing surface
- the project's canonical truth docs under directories such as `docs/standards/`, `docs/architecture/`, and `docs/features/`

By default, instruction files such as `AGENTS.md` install workflow behavior. They do not outrank the canonical truth surface unless a project opts into that explicitly.

In Truthmark itself, `AGENTS.md` should contain a small manual preamble plus the managed Truthmark block. The block is workflow installation, not the place for broader repository rules.

## Recommended Document Classes

Use a small number of stable document classes:

- standards for reusable rules and governance
- architecture for current structural decisions
- features for current feature behavior and invariants

Projects do not need every class on day one. They do need a clear separation between current truth and future proposals.

## Decision-Bearing Truth Docs

Active decisions are part of current truth. They live in the canonical doc for the feature, contract, architecture surface, or standard they govern.

Use `Product Decisions` and `Rationale` sections for decisions that explain non-obvious behavior, boundaries, rejected directions, or migration constraints.

When a decision changes, replace the old active decision in the same canonical doc. Git history is the historical decision log.

Short inline dates are allowed on active decisions, for example `Decision (2026-05-09): keep routing agent-native`. The date is context on the active decision, not a separate historical log.

Do not create separate timestamped ADR folders, planning tickets, or historical design notes as the current decision source. Historical notes may remain supplementary only after the active decision is promoted into the canonical doc.

## Update Rules

- Behavior changes and truth-doc updates should land in the same working change when possible.
- Major product, onboarding, install, command, positioning, or workflow changes should include a root README review in the same working change. Update the README when its human-facing claims, examples, or command sequences are stale.
- When the root README has localized variants, keep them aligned with the English README for materially changed install, command, positioning, and workflow guidance in the same working change, or explicitly document why a variant intentionally differs.
- When routing changes, update `docs/truthmark/areas.md` and any affected canonical docs together.
- When routing is broad, overloaded, or catch-all, run Truth Structure before adding more generic feature docs.
- When a document stops being canonical, supersede or demote it explicitly.
- If Truth Sync is skipped, the skip reason should be stated clearly.
- If Truth Sync creates missing truth, it should avoid duplicating facts that are already canonical elsewhere.
- When `truthmark init` seeds a broad truth-doc list from existing Markdown, narrow that list to the canonical surface before relying on it.

## Anti-Patterns

- multiple documents claiming authority over the same behavior
- product behavior defined only in agent instruction files
- the root README redefining behavior already owned by canonical docs
- the root README lagging behind major install, command, or workflow changes
- current-state docs mixed with draft proposals in the same file
- historical planning docs treated as if they were current product truth
- generated helper output committed to Git or treated as authority
- area mappings that are so broad that agents cannot identify which docs actually matter
- generic feature docs created because topology was too broad to resolve a specific behavior owner
- current decisions stored only in separate timestamped plans, ADR logs, or draft specs
- old and new decisions coexisting as parallel active truth

## Checklist

- Does this document have one primary responsibility?
- Does each class of fact have one canonical source?
- Is this fact stored in the correct document class?
- Does `docs/truthmark/areas.md` route the changed area to the right truth docs?
- If routing is broad or overloaded, has Truth Structure repaired topology before new feature docs were created?
- Are duplicated or shadow documentation paths being avoided?
- Is generated helper output still treated as non-authoritative rather than truth?
- If historical notes exist, have they stayed clearly separate from the current canonical tree?
