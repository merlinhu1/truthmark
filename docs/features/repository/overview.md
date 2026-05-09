---
status: active
doc_type: feature
last_reviewed: 2026-05-09
source_of_truth:
  - ../../truthmark/areas/repository.md
---

# Repository Overview

## Scope

This bounded leaf truth doc owns the default repository behavior surface created by Truthmark.

## Current Behavior

- `truthmark init` scaffolds this doc as the default bounded leaf truth doc for the configured default area.
- The default scaffold treats feature `README.md` files as indexes and expects current behavior truth to live in bounded leaf docs such as this one.
- Downstream repositories are expected to replace this seed content with repository-specific current behavior as the mapped code surface evolves.

## Product Decisions

- Decision (2026-05-09): Feature README files are indexes; behavior truth belongs in bounded leaf docs.

## Rationale

Bounded leaf docs keep agent context focused and prevent large products from accumulating unreviewable feature manuals.
