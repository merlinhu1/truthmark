import type { ContentPromptSpec } from "../types.js";

export const truthDocUpdatePrompt: ContentPromptSpec<"truth-doc-update"> = {
  id: "truth-doc-update",
  version: 1,
  title: "Truth Doc Update",
  purpose: "Draft evidence-backed canonical truth doc updates from bounded prompt context.",
  outputSchemaId: "truth-doc-update-draft",
  render: (context) => {
    return [
      "Content prompt: truth-doc-update",
      "Purpose: draft evidence-backed canonical truth doc content from the supplied prompt context.",
      "Boundary: produce a draft only. Workflow prompts decide whether any file may be changed.",
      "Return only JSON matching the truth-doc-update-draft schema.",
      "",
      "Prompt context JSON:",
      JSON.stringify(context, null, 2),
      "",
      "Drafting rules:",
      "- Every claim must include at least one evidence ID from promptContext.evidenceSnippets.",
      "- Patch paths must be listed in promptContext.relevantDocs.",
      "- targetDocs must match the unique set of patch paths.",
      "- Use support: supported only when evidence directly states the behavior.",
      "- Use support: inferred only for conservative implementation-backed inferences.",
      "- Use status: blocked when evidence is insufficient.",
      "- When blocked, leave targetDocs, claims, and patches empty and capture uncertainty in openQuestions.",
      "- Do not include markdown fences around the JSON response.",
    ].join("\n");
  },
};
