import type { TruthmarkConfig } from "../config/schema.js";
import { renderTruthRealizeCompletedReport } from "../realize/report.js";
import {
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  LANE_CLASSIFICATION_INSTRUCTIONS,
  REPOSITORY_INTELLIGENCE_INSTRUCTIONS,
  defaultAgentConfig,
  renderHierarchySummary,
  renderTruthDocOwnershipGateSection,
  resolveEngineeringTruthRoot,
  resolveProductTruthRoot,
} from "./shared.js";

const renderMarkdownExample = (content: string): string => {
  return [`\`\`\`md`, content, `\`\`\``].join("\n");
};

export const renderTruthRealizePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const productTruthRoot = resolveProductTruthRoot(config);
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);

  return `### Manual Truth Realize
Only run when the user explicitly asks to realize truth docs into code. This is a manual installed instruction or skill, not a dedicated CLI command.
Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.
Doc first:
- read the updated truth docs plus any present Truthmark config, route files, relevant code, and tests
- ${EVIDENCE_AUTHORITY_INSTRUCTIONS}
- ${REPOSITORY_INTELLIGENCE_INSTRUCTIONS}
- ${LANE_CLASSIFICATION_INSTRUCTIONS}
- use product truth as requirements and engineering truth as current implementation context; do not redefine product truth inside engineering docs
${renderTruthDocOwnershipGateSection(
    "source truth docs before writing code",
    "if a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence, block before writing code and recommend Truth Structure or Truth Document",
  )}
- write functional code only
- do not edit truth docs or truth routing
- implement only bounded, current truth claims from the source docs
- after code changes, run Truth Sync to update engineering truth and reconcile product truth only for current implemented behavior or explicit product truth changes
${renderHierarchySummary(config)}
Report changed code files and verification steps:
${renderMarkdownExample(
    renderTruthRealizeCompletedReport({
      truthDocsUsed: [
        `${productTruthRoot}/capabilities/authentication-session.md`,
        `${engineeringTruthRoot}/behaviors/authentication-session.md`,
      ],
      codeUpdated: ["src/auth/session.ts"],
      verification: ["npm test -- auth"],
    }),
  )}`;
};
