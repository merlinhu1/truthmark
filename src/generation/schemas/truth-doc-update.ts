import type { JSONSchemaType } from "ajv";

import type { TruthDocUpdateDraft } from "../types.js";

export const truthDocUpdateDraftSchema: JSONSchemaType<TruthDocUpdateDraft> = {
  type: "object",
  additionalProperties: false,
  required: ["status", "targetDocs", "claims", "patches", "openQuestions"],
  properties: {
    status: { type: "string", enum: ["drafted", "blocked"] },
    targetDocs: { type: "array", items: { type: "string" } },
    claims: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "evidenceIds", "support"],
        properties: {
          text: { type: "string" },
          evidenceIds: { type: "array", minItems: 1, items: { type: "string" } },
          support: { type: "string", enum: ["supported", "inferred", "unsupported"] },
        },
      },
    },
    patches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "section", "operation", "markdown"],
        properties: {
          path: { type: "string" },
          section: {
            type: "string",
            enum: ["Current Behavior", "Product Decisions", "Rationale"],
          },
          operation: { type: "string", enum: ["replace-section", "append"] },
          markdown: { type: "string" },
        },
      },
    },
    openQuestions: { type: "array", items: { type: "string" } },
  },
};