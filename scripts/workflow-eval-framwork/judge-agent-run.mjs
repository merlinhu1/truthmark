#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${item}`);
    }
    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args.set(key, value);
    index += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const run = args.get("run");
  if (!run) {
    throw new Error("Missing required --run");
  }
  const runDir = path.resolve(process.cwd(), run);
  const result = JSON.parse(await readFile(path.join(runDir, "result.json"), "utf8"));
  const judgeResult = {
    status: "not_evaluable",
    judges: [],
    sourceStatus: result.status,
    note: "Configure a maintainer-local LLM judge provider before using semantic judging.",
  };
  const outputPath = path.join(runDir, "judge-results.json");
  await writeFile(outputPath, `${JSON.stringify(judgeResult, null, 2)}\n`, "utf8");
  console.log(`judgeResults=${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
