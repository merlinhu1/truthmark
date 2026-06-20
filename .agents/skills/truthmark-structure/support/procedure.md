# Truthmark Structure Procedure

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

Use this skill to design or repair Truthmark area structure.

Truth Structure is agent-native:
- inspect repository layout, current docs, Truthmark config and route files when present, and relevant code directly
- Evidence authority:
  - Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.
  - Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
- Lane classification:
  - before writing canonical truth docs, classify the request or change as product-lane, engineering-lane, both-lane, or ambiguous
  - product-lane writes belong under docs/truthmark/product and state product promises, boundaries, rationale, decisions, and success criteria
  - engineering-lane writes belong under docs/truthmark/engineering and state source-backed current realization, contracts, architecture, workflows, operations, or tests
  - both-lane work must write separate product and engineering docs and cross-link them in route YAML with realized_by and realizes, not in doc frontmatter
  - ambiguous lane ownership must stop or invoke Truth Structure instead of writing a mixed document
  - Do not make product docs a summary of engineering docs. Do not make engineering docs a detailed version of product docs. Product truth says what must be true and why. Engineering truth says how the repository currently realizes it.
- inspect the configured root route index at docs/truthmark/routes/areas.md and relevant child route files under docs/truthmark/routes/areas/ when they exist
- define areas by product or behavior ownership, not by mechanical directory mirroring
- create or repair docs/truthmark/routes/areas.md
- create skeletal starter truth docs only when missing ownership would otherwise block future workflows
- Starter truth docs must use closed YAML frontmatter bounded by opening and closing --- lines; include status, truth_kind, and last_reviewed inside that frontmatter. Put source references in the final ## Source References section, not in frontmatter.
- Starter truth docs are ownership anchors, not behavior writeups: include only the title, bounded area/scope, and Source References needed to make routing explicit.
- Starter truth docs must keep product and engineering truth in separate files; leave substantive behavior, contract, architecture, workflow, operations, or test prose to Truth Document.

- use docs/truthmark/product/** for product truth destinations
- use docs/truthmark/engineering/** for engineering truth destinations
- use only canonical current-truth destinations for starter truth docs
- keep Product Decisions in product truth and Engineering Decisions in engineering truth when selecting destinations; report any relocation need instead of rewriting decision prose during topology review
- preserve unrelated authored content
## New area setup
Use when a user asks to onboard a new code area into Truthmark, a new package, controller, domain, or product area lacks bounded truth ownership, or a new product area needs routing and starter truth docs.
Do:
- inspect the named code area
- infer bounded product or behavior ownership
- choose the owning route when ownership is clear; otherwise propose the route and stop for manual review
- create or update the child route entry or file
- create starter truth docs only where current truth is missing
- report the initial truth boundary
Do not:
- do not edit functional code
- do not perform full behavior documentation unless evidence is inspected and the task explicitly asks for it
- do not patch broad or mixed-owner docs in place
- do not create generic catch-all docs
- do not treat README files as Sync targets
## Topology Governance
Truth Structure owns documentation topology, lane splits, decision relocation, and relationship repair. Do not depend on humans to manually organize docs/truthmark/product or docs/truthmark/engineering. Treat both configured lane roots as managed semantic roots.
Inspect controllers, routes, handlers, services, packages, tests, existing truth docs, and route files; infer product and domain ownership from behavior boundaries, not from mechanical directory mirroring.
When topology pressure exists, repair route structure before creating or extending truth ownership anchors.
Truth-doc ownership review:
- before editing or relying on candidate route owners and current truth docs, verify each target/source truth doc is a bounded owner for the behavior
- if a target/source doc mixes independent owners, spans unrelated behaviors, acts as an index, or needs cross-owner edits, do not patch or in-place repair it
- if a truth doc mixes independent owners, route ownership is broad, or a split is required for bounded ownership, split or reroute only the ownership topology when safe; otherwise stop with manual-review files
- report Ownership reviewed, Structure required, Truth docs split, Truth docs restructured, or Manual handoff reason as applicable
Topology pressure signals:
- one area maps broad code such as src/**, app/**, server/**, services/**, or packages/**
- one area maps multiple unrelated controllers, route groups, services, or bounded contexts
- one truth doc owns unrelated behaviors or unrelated endpoint families
- either configured lane root has many direct non-index docs
- a changed controller, route, or service cannot map to a specific behavior doc
- Truth Sync would need to create a new generic truth doc because routing is too broad
- endpoint or controller names reveal domains missing from docs/truthmark/routes/areas/**
Use these review thresholds as guidance:
- more than 10 direct truth docs in one folder
- more than 15 leaf areas in one child route file
- more than 8 truth docs mapped to one area
- more than 5 controllers mapped through one catch-all area
Repair rules:
- split broad, overloaded, or catch-all areas into behavior-owned child route files
- split or flag mixed-owner truth docs for bounded owners before any workflow adds new behavior claims
- create route files under docs/truthmark/routes/areas/ when a product/domain boundary is clear
- create skeletal engineering ownership anchors under docs/truthmark/engineering only when behavior lacks a current owner
- create skeletal product ownership anchors under docs/truthmark/product only when product promise, boundary, rationale, or user-visible capability ownership is in scope
- README.md files are indexes, not Truth Sync targets
- prefer bounded product docs under product/capabilities or product/decisions and engineering docs under engineering/<kind>/<surface>.md
- keep behavior truth docs behavior-oriented, not endpoint-oriented
- keep API endpoint details in the nearest contract truth doc when such a doc exists
- update routing so future Truth Sync can target small docs
- preserve existing authored docs; move or rewrite only when needed to remove ambiguity
- report Truth docs split when one broad or mixed-owner truth doc becomes multiple bounded docs
Evidence checklist:
- apply the evidence checklist before finishing when Truth Structure writes routed docs, ownership claims, lane-specific decisions, or rationale
- support ownership/behavior claims with topology or primary checkout evidence from layout, implementation boundaries, docs, config, route files, tests, templates, schemas, or contracts
- tests/examples/canonical docs corroborate; remove, narrow, or record unsupported claims for manual handoff
- Do not finish topology repair with mixed product/engineering authority in a single canonical truth doc.
- If an existing canonical doc has wrong-lane sections, report the lane repair needed and only move content when the topology split explicitly requires it.
Portable fallback:
- If this skill surface is unavailable, perform the same workflow directly from committed repository files.
- Do not require the truthmark CLI.
- Inspect .truthmark/config.yml and configured route files only when they exist; then inspect canonical docs and representative implementation code.
- Use a subagent only when the host supports that pattern; otherwise perform the topology repair inline.
Truthmark hierarchy hints:
- Config, when present: .truthmark/config.yml
- Root route index, when present: docs/truthmark/routes/areas.md
- Area route files, when present: docs/truthmark/routes/areas/**/*.md
- Product truth docs, when present: docs/truthmark/product/**/*.md
- Engineering truth docs, when present: docs/truthmark/engineering/**/*.md
Decision truth lives in the canonical doc it governs; date active decisions inline when added or changed.
Do not create separate active-decision ADR/planning logs; replace the active decision and let Git history carry the audit trail.
Product decisions belong in product truth; engineering, architecture, contract, workflow, and operational decisions belong in engineering truth.
