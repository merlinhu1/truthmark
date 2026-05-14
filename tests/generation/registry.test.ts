import { describe, expect, it } from "vitest";

import { getContentPrompt, listContentPrompts } from "../../src/generation/registry.js";
import { CONTENT_PROMPT_IDS } from "../../src/generation/types.js";

describe("generation prompt ids", () => {
  it("exposes runtime prompt ids", () => {
    expect(CONTENT_PROMPT_IDS).toEqual(["truth-doc-update"]);
  });
});

describe("content prompt registry", () => {
  it("lists registered prompts", () => {
    expect(listContentPrompts().map((prompt) => prompt.id)).toEqual(["truth-doc-update"]);
  });

  it("returns a prompt by id", () => {
    expect(getContentPrompt("truth-doc-update").title).toBe("Truth Doc Update");
  });
});