---
status: active
doc_type: truthmark
last_reviewed: 2026-05-10
source_of_truth:
  - README.md
  - docs/ai/repo-rules.md
  - docs/truthmark/areas.md
---

# Truthmark

Markdown in the current checkout is authoritative for this branch.

Installed workflow surfaces include a Truthmark 1.2.2 version marker. After upgrading Truthmark, rerun `truthmark init` and review generated workflow diffs.

Workflow runtime lives in installed skills and managed instruction blocks. Agents inspect the checkout directly; `truthmark check` is optional validation.

Truth Sync follows code; Truth Realize follows docs. Truth Sync may update mapped truth docs; Truth Realize never edits truth docs or routing.
