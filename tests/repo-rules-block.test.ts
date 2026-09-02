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

const normalizeLineEndings = (content: string): string =>
  content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

describe("repo-local rules block", () => {
  it("keeps every instruction file in sync with the source doc", () => {
    const expected = renderRepoRulesBlock(process.cwd());
    const stale = INSTRUCTION_FILES.filter(
      (instructionFile) =>
        normalizeLineEndings(extractRepoRulesBlock(readInstructionFile(instructionFile)) ?? "") !==
        expected,
    );

    expect(stale).toEqual([]);
  });

  it("places the repo-local region before a Truthmark managed block when present", () => {
    for (const instructionFile of INSTRUCTION_FILES) {
      const content = readInstructionFile(instructionFile);
      const truthmarkStart = content.indexOf("<!-- truthmark:start -->");

      expect(content.indexOf(REPO_RULES_BLOCK_START)).toBeGreaterThan(-1);
      if (truthmarkStart !== -1)
        expect(content.indexOf(REPO_RULES_BLOCK_END)).toBeLessThan(
          truthmarkStart,
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

  it("writes replacement text literally when rules contain $ substitution patterns", () => {
    const content = readInstructionFile(INSTRUCTION_FILES[0]);
    const literalBlock = [
      REPO_RULES_BLOCK_START,
      "Escaping check: $& $1 $` $' $$",
      REPO_RULES_BLOCK_END,
    ].join("\n");

    expect(extractRepoRulesBlock(upsertRepoRulesBlock(content, literalBlock))).toBe(
      literalBlock,
    );
  });

  it("keeps CRLF instruction files homogeneous and semantically synchronized", () => {
    const block = renderRepoRulesBlock(process.cwd());
    const content = readInstructionFile(INSTRUCTION_FILES[0]);
    const crlfContent = content.replace(/\n/g, "\r\n");
    const updated = upsertRepoRulesBlock(crlfContent, block);

    expect(updated).toBe(crlfContent);
    expect(normalizeLineEndings(extractRepoRulesBlock(updated) ?? "")).toBe(block);
    expect(updated.replace(/\r\n/g, "")).not.toContain("\n");
  });
});
