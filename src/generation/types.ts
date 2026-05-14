export const CONTENT_PROMPT_IDS = ["truth-doc-update"] as const;

export type ContentPromptId = (typeof CONTENT_PROMPT_IDS)[number];

export type OutputSchemaId = "truth-doc-update-draft";

export type EvidenceSnippet = {
  id: string;
  path: string;
  startLine: number;
  endLine: number;
  reason: string;
  text: string;
};

export type ContextPack = {
  task: "truth-sync" | "truth-document";
  changedFiles: string[];
  owningAreas: string[];
  relevantDocs: string[];
  evidenceSnippets: EvidenceSnippet[];
  openQuestions: string[];
};

export type TruthDocUpdateDraft = {
  status: "drafted" | "blocked";
  targetDocs: string[];
  claims: Array<{
    text: string;
    evidenceIds: string[];
    support: "supported" | "inferred" | "unsupported";
  }>;
  patches: Array<{
    path: string;
    section: "Current Behavior" | "Product Decisions" | "Rationale";
    operation: "replace-section" | "append";
    markdown: string;
  }>;
  openQuestions: string[];
};

export type ContentPromptSpec<TId extends ContentPromptId = ContentPromptId> = {
  id: TId;
  version: number;
  title: string;
  purpose: string;
  outputSchemaId: OutputSchemaId;
  render: (context: ContextPack) => string;
};