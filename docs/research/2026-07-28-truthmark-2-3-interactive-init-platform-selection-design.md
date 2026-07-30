# Truthmark 2.3 interactive init and platform selection

Status: implemented in Truthmark 2.3

Date: 2026-07-29

Target: Truthmark 2.3

## Decision

Truthmark 2.3 keeps repository installation only.

`truthmark init` becomes the single setup command. It asks interactive users to choose zero or more supported repository platforms, accepts repeatable `--platform` values for automation, writes the existing version-2 `.truthmark/config.yml`, and generates only the selected host surfaces.

The public `truthmark config` command is removed in the next minor release. The config file remains the Git-tracked repository authority. Repository finish-time Truth Sync behavior remains unchanged.

Personal installation, Git hooks, commit-triggered Sync, platform executors, and local automation runtime are deferred altogether.

This note is a compact decision index. The implementation is represented by the source, tests, generated surfaces, and release documentation in the repository.
