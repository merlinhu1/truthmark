#!/usr/bin/env node
import { writeFileSync } from "node:fs";

if (process.env.TRUTHMARK_EVAL_REPORT) {
  writeFileSync(process.env.TRUTHMARK_EVAL_REPORT, "invalid", "utf8");
}
console.log("fake agent wrote invalid report");
