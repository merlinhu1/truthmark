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

for (const file of mustRead) {
  console.log(`fake agent read ${file}`);
}
console.log("fake agent completed without usage sidecar for required-usage tests");
