import { describe, expect, it } from "vitest";

import { parseTruthDocUpdateDraft } from "../../src/generation/validate.js";
import type { ContextPack } from "../../src/generation/types.js";

const contextPack = {
  task: "truth-sync",
  changedFiles: ["src/auth/session.ts"],
  owningAreas: ["Authentication"],
  relevantDocs: ["docs/truth/authentication/session-timeout.md"],
  evidenceSnippets: [
    {
      id: "E1",
      path: "src/auth/session.ts",
      startLine: 10,
      endLine: 18,
      reason: "changed timeout behavior",
      text: "export const SESSION_TIMEOUT_MS = 900000;",
    },
  ],
  openQuestions: [],
} satisfies ContextPack;

const validDraft = {
  status: "drafted",
  targetDocs: ["docs/truth/authentication/session-timeout.md"],
  claims: [
    {
      text: "Session timeout is 15 minutes.",
      evidenceIds: ["E1"],
      support: "supported",
    },
  ],
  patches: [
    {
      path: "docs/truth/authentication/session-timeout.md",
      section: "Current Behavior",
      operation: "append",
      markdown: "- Sessions expire after 15 minutes of inactivity.",
    },
  ],
  openQuestions: [],
};

describe("parseTruthDocUpdateDraft", () => {
  it("accepts a valid evidence-backed draft", () => {
    const draft = parseTruthDocUpdateDraft(JSON.stringify(validDraft), contextPack);

    expect(draft.status).toBe("drafted");
    expect(draft.claims[0]?.evidenceIds).toEqual(["E1"]);
  });

  it("accepts blocked output with open questions and no doc changes", () => {
    const draft = parseTruthDocUpdateDraft(
      JSON.stringify({
        status: "blocked",
        targetDocs: [],
        claims: [],
        patches: [],
        openQuestions: ["Which bounded doc owns this behavior?"],
      }),
      contextPack,
    );

    expect(draft.status).toBe("blocked");
    expect(draft.openQuestions).toEqual(["Which bounded doc owns this behavior?"]);
  });

  it("rejects non-json output", () => {
    expect(() => parseTruthDocUpdateDraft("not json", contextPack)).toThrow("Invalid JSON");
  });

  it("rejects claims without evidence IDs", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          claims: [{ ...validDraft.claims[0], evidenceIds: [] }],
        }),
        contextPack,
      ),
    ).toThrow("truth-doc-update-draft validation failed");
  });

  it("rejects unknown evidence IDs", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          claims: [{ ...validDraft.claims[0], evidenceIds: ["E2"] }],
        }),
        contextPack,
      ),
    ).toThrow("unknown evidence id");
  });

  it("rejects patch paths outside relevant docs", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          targetDocs: ["docs/truth/other.md"],
          patches: [{ ...validDraft.patches[0], path: "docs/truth/other.md" }],
        }),
        contextPack,
      ),
    ).toThrow("patch path is not in relevant docs");
  });

  it("rejects path traversal", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          targetDocs: ["../outside.md"],
          patches: [{ ...validDraft.patches[0], path: "../outside.md" }],
        }),
        contextPack,
      ),
    ).toThrow("unsafe doc path");
  });

  it("rejects targetDocs that do not match patch paths", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          targetDocs: ["docs/truth/authentication/session-timeout.md"],
          patches: [],
        }),
        contextPack,
      ),
    ).toThrow("targetDocs must match patch paths");
  });

  it("rejects drafted outputs without claims", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          claims: [],
        }),
        contextPack,
      ),
    ).toThrow("drafted output requires at least one claim");
  });

  it("rejects drafted outputs without patches", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          targetDocs: [],
          patches: [],
        }),
        contextPack,
      ),
    ).toThrow("drafted output requires at least one patch");
  });

  it("rejects drafted outputs with unsupported claims", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          claims: [{ ...validDraft.claims[0], support: "unsupported" }],
        }),
        contextPack,
      ),
    ).toThrow("drafted output cannot contain unsupported claims");
  });

  it("rejects blocked outputs with claims or patches", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          status: "blocked",
          openQuestions: ["Need more evidence"],
        }),
        contextPack,
      ),
    ).toThrow("blocked output cannot include claims, target docs, or patches");
  });

  it("rejects blocked outputs without open questions", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          status: "blocked",
          targetDocs: [],
          claims: [],
          patches: [],
          openQuestions: [],
        }),
        contextPack,
      ),
    ).toThrow("blocked output requires at least one open question");
  });
});