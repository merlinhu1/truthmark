import { describe, it } from "node:test";
import { expect } from "expect";

import { parseTruthDocUpdateDraft } from "../../src/generation/validate.js";
import type { ContentPromptContext } from "../../src/generation/types.js";

const promptContext = {
  task: "truth-sync",
  changedFiles: ["src/auth/session.ts"],
  owningAreas: ["Authentication"],
  relevantDocs: ["docs/truthmark/truth/authentication/session-timeout.md"],
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
} satisfies ContentPromptContext;

const validDraft = {
  status: "drafted",
  targetDocs: ["docs/truthmark/truth/authentication/session-timeout.md"],
  claims: [
    {
      text: "Session timeout is 15 minutes.",
      evidenceIds: ["E1"],
      support: "supported",
    },
  ],
  patches: [
    {
      path: "docs/truthmark/truth/authentication/session-timeout.md",
      section: "Current Behavior",
      operation: "append",
      markdown: "- Sessions expire after 15 minutes of inactivity.",
    },
  ],
  openQuestions: [],
};

describe("parseTruthDocUpdateDraft", () => {
  it("accepts a valid evidence-backed draft", () => {
    const draft = parseTruthDocUpdateDraft(
      JSON.stringify(validDraft),
      promptContext,
    );

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
      promptContext,
    );

    expect(draft.status).toBe("blocked");
    expect(draft.openQuestions).toEqual([
      "Which bounded doc owns this behavior?",
    ]);
  });

  it("rejects non-json output", () => {
    expect(() => parseTruthDocUpdateDraft("not json", promptContext)).toThrow(
      "Invalid JSON",
    );
  });

  it("rejects claims without evidence IDs", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          claims: [{ ...validDraft.claims[0], evidenceIds: [] }],
        }),
        promptContext,
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
        promptContext,
      ),
    ).toThrow("unknown evidence id");
  });

  it("rejects patch paths outside relevant docs", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          targetDocs: ["docs/truthmark/truth/other.md"],
          patches: [
            { ...validDraft.patches[0], path: "docs/truthmark/truth/other.md" },
          ],
        }),
        promptContext,
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
        promptContext,
      ),
    ).toThrow("unsafe doc path");
  });

  it("rejects targetDocs that do not match patch paths", () => {
    expect(() =>
      parseTruthDocUpdateDraft(
        JSON.stringify({
          ...validDraft,
          targetDocs: [
            "docs/truthmark/truth/authentication/session-timeout.md",
          ],
          patches: [],
        }),
        promptContext,
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
        promptContext,
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
        promptContext,
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
        promptContext,
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
        promptContext,
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
        promptContext,
      ),
    ).toThrow("blocked output requires at least one open question");
  });
});
