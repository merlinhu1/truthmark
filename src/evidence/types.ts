export type EvidenceReference = {
  truthDocPath: string;
  path: string;
  symbol?: string;
  startLine?: number;
  endLine?: number;
  contentHash?: string;
  source: "frontmatter" | "source-references" | "evidence-block";
};
