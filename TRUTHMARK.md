---
status: active
doc_type: truthmark
last_reviewed: 2026-05-08
source_of_truth:
  - README.md
  - docs/ai/repo-rules.md
  - docs/truthmark/areas.md
---

# Truthmark

Markdown in the current checkout is authoritative for this branch.

Installed workflow surfaces include a Truthmark 1.2.0 version marker. After upgrading Truthmark, rerun `truthmark init` and review generated workflow diffs.

Truth Sync runs automatically before finishing when functional code changes exist, and updates truth docs.

Truth Sync can also be invoked explicitly through installed truthmark-sync skill surfaces.

Truth Structure is manual and updates area routing plus starter truth docs.

Truth Check is manual and audits repository truth health.

Installed skills and the managed AGENTS block are the workflow runtime. Agents inspect the checkout directly and may use `truthmark check` only as optional validation.

Truth Realize is manual and updates code to match truth docs.

Truth Sync may create or extend mapped truth docs when implementation would otherwise remain undocumented.

Truth Realize never edits truth docs.
