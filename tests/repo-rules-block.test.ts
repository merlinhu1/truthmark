import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, it } from "node:test";
import { expect } from "expect";

import { createDefaultConfig } from "../src/config/defaults.js";
import { upsertManagedBlock } from "../src/managed-block.js";
import { renderAgentsBlock } from "../src/templates/agents-block.js";
import {
  INSTRUCTION_FILES,
  REPO_RULES_BLOCK_END,
  REPO_RULES_BLOCK_START,
  extractRepoRulesBlock,
  renderRepoRulesBlock,
  upsertRepoRulesBlock,
} from "../scripts/repo-rules-block.js";

const readInstructionFile = (relativePath: string): string => {
  return readFileSync(join(process.cwd(), relativePath), "utf8");
};

describe("repo-local rules block", () => {
  it("keeps every instruction file in sync with the source doc", () => {
    const expected = renderRepoRulesBlock(process.cwd());
    const stale = INSTRUCTION_FILES.filter(
      (instructionFile) =>
        extractRepoRulesBlock(readInstructionFile(instructionFile)) !== expected,
    );

    expect(stale).toEqual([]);
  });

  it("keeps the instruction files identical to each other", () => {
    const contents = INSTRUCTION_FILES.map((instructionFile) =>
      readInstructionFile(instructionFile),
    );

    expect(new Set(contents).size).toBe(1);
  });

  it("places the repo-local region before the Truthmark managed block", () => {
    for (const instructionFile of INSTRUCTION_FILES) {
      const content = readInstructionFile(instructionFile);

      expect(content.indexOf(REPO_RULES_BLOCK_START)).toBeGreaterThan(-1);
      expect(content.indexOf(REPO_RULES_BLOCK_END)).toBeLessThan(
        content.indexOf("<!-- truthmark:start -->"),
      );
    }
  });

  it("rewrites source-relative links to resolve from the repository root", () => {
    const block = renderRepoRulesBlock(process.cwd());

    expect(block).toContain("(docs/repo/architecture/product-boundary.md)");
    expect(block).toContain("(.truthmark/config.yml)");
    expect(block).not.toContain("(../");
  });

  it("rejects duplicated markers instead of corrupting the region", () => {
    const content = readInstructionFile(INSTRUCTION_FILES[0]);
    const duplicated = `${content}\n${REPO_RULES_BLOCK_END}\n`;

    expect(() => extractRepoRulesBlock(duplicated)).toThrow(/malformed/u);
  });

  it("survives a Truthmark managed-block refresh", () => {
    const block = renderRepoRulesBlock(process.cwd());

    for (const instructionFile of INSTRUCTION_FILES) {
      const content = readInstructionFile(instructionFile);
      const refreshed = upsertManagedBlock(
        content,
        renderAgentsBlock(createDefaultConfig()),
      );

      expect(extractRepoRulesBlock(refreshed)).toBe(block);
    }
  });

  it("is idempotent when re-applied to an already-rendered file", () => {
    const block = renderRepoRulesBlock(process.cwd());

    for (const instructionFile of INSTRUCTION_FILES) {
      const content = readInstructionFile(instructionFile);

      expect(upsertRepoRulesBlock(content, block)).toBe(content);
    }
  });
});
