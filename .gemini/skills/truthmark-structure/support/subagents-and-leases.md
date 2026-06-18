# Truthmark Structure Subagents And Leases

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

Gemini CLI subagent mode:
- use automatically when this workflow runs in Gemini CLI and the parent agent chooses bounded project subagent fan-out
- dispatch read-only project subagents only: @truth-route-auditor
- subagents inspect checkout evidence directly, return structured findings, and must not edit files
- parent supplies bounded evidence shards; subagents must not preload host instruction files or repo-wide policy docs unless assigned as evidence
- Parent agent owns all Truth Structure writes and final topology decisions
