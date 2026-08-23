import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  INSTRUCTION_FILES,
  renderRepoRulesBlock,
  upsertRepoRulesBlock,
} from "./repo-rules-block.js";

const rootDir = process.cwd();
const block = renderRepoRulesBlock(rootDir);

for (const instructionFile of INSTRUCTION_FILES) {
  const filePath = path.join(rootDir, instructionFile);
  const existing = readFileSync(filePath, "utf8");
  const updated = upsertRepoRulesBlock(existing, block);

  if (updated === existing) {
    console.log(`unchanged ${instructionFile}`);
    continue;
  }

  writeFileSync(filePath, updated);
  console.log(`updated   ${instructionFile}`);
}
