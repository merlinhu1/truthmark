# Workflow Eval Framwork

`workflow-eval-framwork` is Truthmark's contributor-only, manual, token-expensive behavioral eval framework for installed workflow skills and prompts.

It is not part of the published npm package and is not needed by normal Truthmark users.

The folder name is intentionally spelled `framwork` because that is the requested canonical path.

## One-command manual run

Run the whole catalog with one explicit command when checking workflow quality:

```bash
node scripts/workflow-eval-framwork/run-agent-scenario.mjs \
  --catalog workflow-eval-framwork/catalog.yaml \
  --host codex \
  --agent-command "codex exec --full-auto" \
  --agent-model "gpt-5.5" \
  --judge-command "your-llm-judge-command" \
  --judge-model "gpt-5.5" \
  --require-usage
```

Catalog runs create a suite folder with exactly two persistent files:

- `final-report.md` — one comprehensive human-facing report for the full evaluation run.
- `audit.json` — compact machine-readable audit data with run metadata, scenario verdicts, deterministic failures, changed-file summaries, and judge summaries.

Per-scenario command output, patches, reports, and judge scratch files are temporary in catalog mode and are discarded after the two suite files are written. Scenario setup patches are still applied after the fixture baseline commit so agents evaluate a real pre-existing diff rather than an empty checkout.

Scenarios should model realistic development situations rather than one-file toy repos. Fixtures include source, tests, product truth, engineering behavior truth, API contract truth, operations truth, and route ownership so agents must choose the correct workflow lane and bounded owner.

A catalog run without `--judge-command` is intentionally `not_evaluable`. It can smoke-test fixture materialization and deterministic gates, but it is not a meaningful workflow-quality result. When `--agent-model` or `--judge-model` is supplied, the runner records those model names in `audit.json`, `final-report.md`, and the `TRUTHMARK_EVAL_AGENT_MODEL` / `TRUTHMARK_EVAL_JUDGE_MODEL` environment variables for wrapper scripts.

## Token usage tracking

The runner exports usage sidecar paths for wrappers:

- `TRUTHMARK_EVAL_AGENT_USAGE` — JSON path for the agent command to write token usage.
- `TRUTHMARK_EVAL_JUDGE_USAGE` — JSON path for the judge command to write token usage.

Each sidecar may contain one usage object or an array of usage objects:

```json
{
  "schemaVersion": 1,
  "source": "codex-jsonl-wrapper",
  "model": "gpt-5.5",
  "inputTokens": 1000,
  "cachedInputTokens": 200,
  "outputTokens": 300,
  "reasoningOutputTokens": 50,
  "totalTokens": 1300
}
```

Catalog `audit.json`, debug `result.json`, and `final-report.md` record measured agent tokens, judge tokens, and suite totals. The framework intentionally does not enforce token budgets or estimate dollar cost; token counts are a trend signal for comparing prompt and workflow-surface changes over time.

Missing sidecars are recorded as `usage.status: "unavailable"`; invalid sidecars are recorded as `usage.status: "invalid"` with warnings.

Use `--require-usage` for real model-comparison runs. In required-usage mode, missing or invalid usage data makes the run non-passing so usage regressions are not silently untracked.

Run one scenario only when debugging a specific failure, and mark it debug-only:

```bash
node scripts/workflow-eval-framwork/run-agent-scenario.mjs \
  --debug-scenario \
  --scenario workflow-eval-framwork/scenarios/truthmark-sync/docs-only-skip/scenario.yaml \
  --host fake \
  --agent-command "node workflow-eval-framwork/fake-agents/pass.mjs" \
  --agent-model "fake-agent" \
  --judge-command "node workflow-eval-framwork/fake-agents/judge-pass.mjs" \
  --judge-model "fake-judge"
```

By default, catalog artifacts are written under:

```text
workflow-eval-framwork/runs/<timestamp>-all-workflows-<host>/
```

Single-scenario debug runs still write detailed per-scenario files under the selected debug output directory because they are for harness repair and failure investigation, not normal full-evaluation reporting.

Use `failure-taxonomy.md` and `improvement-loop.md` when converting a failed run into a prompt/skill fix or a smaller regression scenario.

Real model runners and LLM judges are manual. Normal `truthmark check`, package install, downstream repository use, and default CI must not launch real agents or judges.

Deterministic gates catch objective failures first, but workflow quality claims require LLM judge output plus human review. Without semantic judge results, a run proves only harness mechanics and write-boundary behavior, and the runner records it as `not_evaluable`.
