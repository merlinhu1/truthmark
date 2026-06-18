# Truthmark Preview Subagents And Leases

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

OpenCode subagent mode:
- use automatically when this workflow runs in OpenCode and the parent agent chooses bounded subagent fan-out
- dispatch read-only project subagents only: @truth-route-auditor
- workers inspect checkout evidence directly, return structured findings, and must not edit files
- parent supplies bounded evidence shards; workers must not preload host instruction files or repo-wide policy docs unless assigned as evidence
- Parent agent owns the final Truth Preview report
