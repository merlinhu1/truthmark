export type EvidenceReference = {
  truthDocPath: string;
  path: string;
  symbol?: string;
  startLine?: number;
  endLine?: number;
  contentHash?: string;
  source: "frontmatter" | "evidence-block";
};
