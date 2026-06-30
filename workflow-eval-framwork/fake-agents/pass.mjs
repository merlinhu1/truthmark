#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { parse as parseYaml } from "yaml";

const expectedPath = process.env.TRUTHMARK_EVAL_EXPECTED;
const expected = expectedPath ? parseYaml(readFileSync(expectedPath, "utf8")) : {};
const mustChange = Array.isArray(expected.must_change) ? expected.must_change : [];
const mustRead = Array.isArray(expected.must_read) ? expected.must_read : [];

for (const file of mustChange) {
  if (typeof file !== "string" || file.includes("*")) {
    continue;
  }
  const target = path.resolve(process.cwd(), file);
  if (!target.startsWith(`${process.cwd()}${path.sep}`)) {
    continue;
  }
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, `fake-agent touched ${file}\n`, "utf8");
}

if (process.env.TRUTHMARK_EVAL_REPORT) {
  writeFileSync(
    process.env.TRUTHMARK_EVAL_REPORT,
    `# Fake Agent Report\n\nResult: completed\nWorkflow: ${process.env.TRUTHMARK_EVAL_WORKFLOW ?? "unknown"}\n`,
    "utf8",
  );
}

const agentInputTokens = Number(process.env.TRUTHMARK_EVAL_FAKE_AGENT_INPUT_TOKENS ?? 1000);

if (process.env.TRUTHMARK_EVAL_AGENT_USAGE) {
  writeFileSync(
    process.env.TRUTHMARK_EVAL_AGENT_USAGE,
    `${JSON.stringify({
      schemaVersion: 1,
      source: "fake-agent",
      model: process.env.TRUTHMARK_EVAL_AGENT_MODEL || "fake-agent",
      inputTokens: agentInputTokens,
      cachedInputTokens: 100,
      outputTokens: 250,
      reasoningOutputTokens: 50,
      totalTokens: agentInputTokens + 300,
    }, null, 2)}\n`,
    "utf8",
  );
}

for (const file of mustRead) {
  console.log(`fake agent read ${file}`);
}
console.log("fake agent completed; skipped npx tsx src/cli/main.ts check --json because this is a fake-agent smoke test");
