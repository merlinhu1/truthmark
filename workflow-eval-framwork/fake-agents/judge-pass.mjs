#!/usr/bin/env node
import { writeFileSync } from "node:fs";

const judgeInputTokens = Number(process.env.TRUTHMARK_EVAL_FAKE_JUDGE_INPUT_TOKENS ?? 500);

if (process.env.TRUTHMARK_EVAL_JUDGE_USAGE) {
  writeFileSync(
    process.env.TRUTHMARK_EVAL_JUDGE_USAGE,
    `${JSON.stringify({
      schemaVersion: 1,
      source: "fake-judge",
      model: process.env.TRUTHMARK_EVAL_JUDGE_MODEL || "fake-judge",
      inputTokens: judgeInputTokens,
      cachedInputTokens: 50,
      outputTokens: 125,
      reasoningOutputTokens: 25,
      totalTokens: judgeInputTokens + 150,
    }, null, 2)}\n`,
    "utf8",
  );
}

const result = {
  status: "passed",
  judges: [
    {
      id: "fake-llm-judge",
      status: "passed",
      summary: "Fake judge for harness tests only; real workflow-quality claims require a maintainer-configured LLM judge.",
    },
  ],
};
console.log(JSON.stringify(result));
