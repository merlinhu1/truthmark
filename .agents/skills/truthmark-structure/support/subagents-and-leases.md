# Truthmark Structure Subagents And Leases

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

Codex subagent mode:
- use automatically when this workflow runs in Codex and the parent agent chooses bounded subagent fan-out
- dispatch read-only project agents only: truth_route_auditor
- workers inspect checkout evidence directly, return structured findings, and must not edit files
- parent supplies bounded evidence shards; workers must not preload host instruction files or repo-wide policy docs unless assigned as evidence
- Parent agent owns all Truth Structure writes and final topology decisions
