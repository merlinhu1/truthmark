# Improvement Loop

When a workflow eval fails:

1. For catalog runs, read `final-report.md` first and use `audit.json` for scenario verdicts, deterministic failures, changed-file summaries, and judge summaries. For single-scenario debug runs, read the detailed `report.md`, `result.json`, deterministic results, command output, changed files, patches, and judge results.
2. Record a human review as `accepted`, `rejected`, `needs-rerun`, or `not-evaluable`.
3. Classify failures with labels from `failure-taxonomy.md`.
4. Decide the smallest fix target:
   - skill or prompt text when the agent misunderstood workflow behavior;
   - rubric text when the evaluation expectation was underspecified;
   - scenario fixture when the setup did not isolate the intended failure;
   - deterministic validator when an objective violation was missed;
   - judge prompt/schema when semantic scoring was malformed.
5. Promote real failures into minimal scenarios instead of checking in large run artifacts.
6. Rerun the scenario with one manual command and compare the new report folder.

LLM judge scores are advisory until calibrated by human review. Deterministic gates cannot be overridden by a judge score.
