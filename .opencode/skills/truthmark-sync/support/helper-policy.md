# Optional Helper CLI Policy

Truthmark-managed generated file. Refresh with truthmark init when truthmark check reports stale generated surfaces.

Optional helper CLI commands may collect deterministic checkout facts or validate artifacts. If the Truthmark CLI is unavailable or cannot return the declared helper output, continue manually using this procedure and report which helper was skipped. Helper output is derived evidence; it does not override direct checkout inspection, workflow write boundaries, or parent acceptance.

Runner detection:
- Check that the declared Truthmark CLI runner is available before invoking a helper.
- Invoke helpers through the installed `truthmark validate ... --json` CLI command using argv-style arguments from helper-manifest.yml.
- If unavailable, failing, or returning incompatible output, treat the helper as skipped and use the manual fallback.
- Do not fail the workflow solely because a helper cannot run.

Available helpers:
- validate-sync-report: optional truthmark; manual fallback: manually validate support/report-template.md and check Evidence checked entries match Claim, indented Evidence, and Result: supported | narrowed | removed | blocked
- validate-write-lease: optional truthmark; manual fallback: manually compare declared allowedWrites and forbiddenWrites with the actual changed files

Final reports should include helper status when helpers are declared for this workflow:

```md
Helper scripts:
- validate-sync-report: ran, passed
- validate-write-lease: skipped, no write lease used
```
