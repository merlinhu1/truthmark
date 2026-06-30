---
status: draft
doc_type: research-index
last_reviewed: 2026-06-29
source_of_truth:
  - ../../workflow-eval-framwork/README.md
  - ../../workflow-eval-framwork/catalog.yaml
  - ../../scripts/workflow-eval-framwork/run-agent-scenario.mjs
  - ../../tests/evals/workflow-eval-framwork.test.ts
---

# Manual Agent Skill And Prompt Quality Eval Framework

The implemented manual evaluation framework lives under `workflow-eval-framwork/`.

Use these artifacts:

- Framework README: [`../../workflow-eval-framwork/README.md`](../../workflow-eval-framwork/README.md)
- Catalog: [`../../workflow-eval-framwork/catalog.yaml`](../../workflow-eval-framwork/catalog.yaml)
- Manual runner: [`../../scripts/workflow-eval-framwork/run-agent-scenario.mjs`](../../scripts/workflow-eval-framwork/run-agent-scenario.mjs)
- Schema and fake-runner tests: [`../../tests/evals/workflow-eval-framwork.test.ts`](../../tests/evals/workflow-eval-framwork.test.ts)

The requested framework folder name is intentionally spelled `workflow-eval-framwork`.

The key invariant is that Truthmark's generated-surface tests prove injection and freshness, while this framework tests actual agent behavior when workflow skills and prompts are used.

The framework is manual and token-expensive. It must not become a default CI gate, hosted service, daemon, database, hidden memory layer, or required downstream runtime.
