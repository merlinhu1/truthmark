export type ClaimEvidenceResult = "supported" | "narrowed" | "removed" | "blocked";

export type ClaimEvidenceItem = {
  claim: string;
  evidence: string[];
  result: ClaimEvidenceResult;
};

export type AuditEvidenceConfidence = "high" | "medium" | "low";

export type AuditEvidenceItem = {
  finding: string;
  evidence: string[];
  suggestedFix: string;
  confidence: AuditEvidenceConfidence;
};

export const renderClaimEvidenceCheckedSection = (
  items: ClaimEvidenceItem[],
): string => {
  return [
    "Evidence checked:",
    ...items.map((item) => {
      return [
        `- Claim: ${item.claim}`,
        `  Evidence: ${item.evidence.join(" / ")}`,
        `  Result: ${item.result}`,
      ].join("\n");
    }),
  ].join("\n");
};

export const renderAuditEvidenceCheckedSection = (
  items: AuditEvidenceItem[],
): string => {
  return [
    "Evidence checked:",
    ...items.map((item) => {
      return [
        `- Finding: ${item.finding}`,
        `  Evidence: ${item.evidence.join(" / ")}`,
        `  Suggested fix: ${item.suggestedFix}`,
        `  Confidence: ${item.confidence}`,
      ].join("\n");
    }),
  ].join("\n");
};
