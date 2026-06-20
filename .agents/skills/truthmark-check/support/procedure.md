# Truthmark Check Procedure

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

# Truthmark Check

Use this skill to audit repository truth health.

Invocations: OpenCode /skill truthmark-check; Codex /truthmark-check or $truthmark-check; Claude Code /truthmark-check; GitHub Copilot /truthmark-check; Antigravity @truthmark-check; Cursor @truthmark-check.

Truth Check is agent-led:

- inspect .truthmark/config.yml and configured route files only when they exist; then inspect canonical docs and relevant implementation directly
- inspect the configured root route index at docs/truthmark/routes/areas.md and relevant child route files under docs/truthmark/routes/areas/ when they exist
- Evidence authority:
  - Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.
  - Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.
- Lane classification:
  - classify the request or changed surface as product-lane, engineering-lane, both-lane, or ambiguous for reporting only
  - product-lane ownership belongs under docs/truthmark/product and describes product promises, boundaries, rationale, decisions, and success criteria
  - engineering-lane ownership belongs under docs/truthmark/engineering and describes source-backed current realization, contracts, architecture, workflows, operations, or tests
  - both-lane ownership uses separate product and engineering docs cross-linked in route YAML with realized_by and realizes, not in doc frontmatter
  - ambiguous lane ownership should be reported for manual handoff or routed to Truth Structure
  - Do not make product docs a summary of engineering docs. Do not make engineering docs a detailed version of product docs. Product truth says what must be true and why. Engineering truth says how the repository currently realizes it.
- check that current docs describe current code rather than historical plans
- keep lane and cross-lane checks route-first and bounded:
  - for a narrow audit, inspect only the routed area and directly linked counterpart docs
  - for root-wide truth health, first build a cheap route-map/index from route files, then inspect only mismatches and linked leaves
  - inspect product counterparts for engineering docs only when route YAML claims a product relationship, or when the user explicitly asks for user-visible product coverage
- check lane root/kind alignment for product truth under docs/truthmark/product and engineering truth under docs/truthmark/engineering
- check route YAML cross-lane realized_by and realizes links for existence and lane compatibility
- report missing product links for user-visible engineering docs only as a second-pass review diagnostic, not as default full-document reads or hard errors
- check product docs do not contain engineering execution flow, generated file inventories, or CLI envelope mechanics
- check engineering docs do not contain product promises, product rationale, or Product Decisions sections
- never judge whether a product decision is commercially correct, valuable, prioritized, or desirable
- check that route files map code surfaces to canonical truth docs when route files exist
- check for broad, catch-all, index-like, or mixed-owner truth docs and report them as topology issues requiring Truth Structure
- check that canonical docs keep lane-appropriate decisions and rationale sections
- optionally run truthmark check when local tooling is available
- must not require the truthmark binary; direct inspection is always valid
- report issues and suggested fixes without silently rewriting unrelated files
- if follow-up docs edits are needed for mixed-owner docs, run or recommend Truth Structure before editing
Evidence checklist:
- support each finding and suggested fix with evidence from config, route files, canonical docs, implementation, templates, or tests
- canonical docs are context, not sole proof when implementation conflicts
- remove unsupported findings or mark open questions; validate changed claims if you edit docs

Truthmark hierarchy hints:
- Config, when present: .truthmark/config.yml
- Root route index, when present: docs/truthmark/routes/areas.md
- Area route files, when present: docs/truthmark/routes/areas/**/*.md
- Product truth docs, when present: docs/truthmark/product/**/*.md
- Engineering truth docs, when present: docs/truthmark/engineering/**/*.md
Decision truth lives in the canonical doc it governs; date active decisions inline when added or changed.
Do not create separate active-decision ADR/planning logs; replace the active decision and let Git history carry the audit trail.
Product decisions belong in product truth; engineering, architecture, contract, workflow, and operational decisions belong in engineering truth.
