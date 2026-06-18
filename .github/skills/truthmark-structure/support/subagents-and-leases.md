# Truthmark Structure Subagents And Leases

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

Copilot custom-agent mode:
- use automatically when this workflow runs in Copilot and the parent agent chooses bounded custom-agent fan-out
- dispatch read-only project custom agents only: @truth-route-auditor
- custom agents inspect checkout evidence directly, return structured findings, and must not edit files
- parent supplies bounded evidence shards; custom agents must not preload host instruction files or repo-wide policy docs unless assigned as evidence
- Parent agent owns all Truth Structure writes and final topology decisions
