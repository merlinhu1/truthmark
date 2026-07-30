# Truthmark 2.3 interactive init and platform selection

Status: accepted direction, planned in OpenSpec

Date: 2026-07-29

Target: Truthmark 2.3

## Decision

Truthmark 2.3 keeps repository installation only.

`truthmark init` becomes the single setup command. It asks interactive users to choose zero or more supported repository platforms, accepts repeatable `--platform` values for automation, writes the existing version-2 `.truthmark/config.yml`, and generates only the selected host surfaces.

The public `truthmark config` command is removed in the next minor release. The config file remains the Git-tracked repository authority. Repository finish-time Truth Sync behavior remains unchanged.

Personal installation, Git hooks, commit-triggered Sync, platform executors, and local automation runtime are deferred altogether.

## Canonical implementation plan

OpenSpec change: [`interactive-init-platform-selection`](../../openspec/changes/interactive-init-platform-selection/)

- [Proposal](../../openspec/changes/interactive-init-platform-selection/proposal.md)
- [Technical design](../../openspec/changes/interactive-init-platform-selection/design.md)
- [Repository initialization requirements](../../openspec/changes/interactive-init-platform-selection/specs/repository-initialization/spec.md)
- [Implementation tasks](../../openspec/changes/interactive-init-platform-selection/tasks.md)

The OpenSpec artifacts are the implementation contract. This note remains a compact decision index and must not duplicate or expand their scope.
