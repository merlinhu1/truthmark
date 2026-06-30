#!/usr/bin/env node
import { appendFileSync, writeFileSync } from "node:fs";

appendFileSync("README.md", "\nForbidden write from fake agent.\n", "utf8");
if (process.env.TRUTHMARK_EVAL_REPORT) {
  writeFileSync(process.env.TRUTHMARK_EVAL_REPORT, "# Fake Agent Report\n\nResult: completed with forbidden write\n", "utf8");
}
console.log("fake agent made forbidden write");
