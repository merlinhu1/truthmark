# Failure Taxonomy

Use stable labels when reviewing workflow eval failures.

- `skill-not-triggered`: the expected workflow skill or prompt was not used.
- `wrong-workflow`: the agent selected a different Truthmark workflow.
- `over-triggered-workflow`: the agent ran a write workflow for a read-only or general task.
- `missing-route-read`: the agent did not inspect required route/config evidence.
- `wrong-route-owner`: the agent updated or cited the wrong bounded truth owner.
- `bootstrap-route-misuse`: the agent treated a bootstrap catch-all as behavior truth.
- `forbidden-code-write`: a documentation workflow changed functional code.
- `forbidden-doc-write`: a code-realization workflow changed truth docs or routes.
- `missing-evidence`: a changed truth claim lacks checkout evidence.
- `unsupported-claim`: the result preserves or adds a claim without evidence.
- `stale-truth-followed`: Realize followed stale truth instead of blocking.
- `report-invalid`: the workflow report is absent or fails validation.
- `verification-skipped-without-rationale`: required checks were neither run nor explained.
- `token-bloat`: the agent loaded or repeated unnecessary context.
- `agent-runner-failed`: the configured runner command failed before behavior could be evaluated.
- `judge-not-evaluable`: judge output was missing, malformed, or insufficient.
