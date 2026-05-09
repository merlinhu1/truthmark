export type TruthRealizeCompletedReportInput = {
  truthDocsUsed: string[];
  codeUpdated: string[];
  verification: string[];
};

const renderBulletSection = (title: string, items: string[]): string => {
  return `${title}:\n${items.map((item) => `- ${item}`).join("\n")}`;
};

export const renderTruthRealizeCompletedReport = (
  input: TruthRealizeCompletedReportInput,
): string => {
  return [
    "Truth Realize: completed",
    renderBulletSection("Truth docs used", input.truthDocsUsed),
    renderBulletSection("Code updated", input.codeUpdated),
    renderBulletSection("Verification", input.verification),
  ].join("\n\n");
};