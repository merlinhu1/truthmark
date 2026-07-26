# Harden Init routing and generated-surface lifecycle

Date: 2026-07-10
Previous version: 2.2.6
New version: 2.2.7
Version action: patch
SemVer rationale: This is a backward-compatible release that adds platform-derived instruction routing, repository-wide coverage discovery, generated-surface reconciliation, and explicit uninstall lifecycle controls while retaining legacy configuration parsing.

- Instruction placement now follows configured platforms; legacy version-2 `instruction_targets` remains accepted but ignored.
- Check and RepoIndex share Git-visible, NUL-safe repository discovery, including functional code under arbitrary roots.
- Init reconciles exact safely recognized inactive generated surfaces while preserving diverged, Gemini, and unrelated files.
- `truthmark uninstall --dry-run|--apply [--json]` provides a deterministic removal plan and preserves authored truth, configuration, templates, Portal output, and global package installation.
- Human-readable `truthmark workflow status` output now presents bounded applicability and advisory context while JSON retains the full schema-versioned contract; duplicate diagnostics are collapsed at WorkflowState composition.
