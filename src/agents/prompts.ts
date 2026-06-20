import type { TruthmarkConfig } from "../config/schema.js";
import { renderTruthRealizeCompletedReport } from "../realize/report.js";
import {
  EVIDENCE_AUTHORITY_INSTRUCTIONS,
  REPOSITORY_INTELLIGENCE_INSTRUCTIONS,
  defaultAgentConfig,
  renderBulletBlock,
  renderHierarchySummary,
  renderTruthDocOwnershipGateSection,
  resolveEngineeringTruthRoot,
  resolveProductTruthRoot,
} from "./shared.js";

const renderMarkdownExample = (content: string): string => {
  return [`\`\`\`md`, content, `\`\`\``].join("\n");
};

const renderTruthRealizeLaneClassificationRuleBlock = (
  config: TruthmarkConfig,
): string => {
  const productTruthRoot = resolveProductTruthRoot(config);
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);

  return renderBulletBlock(
    [
      "classify the source truth docs and requested code change as product-lane, engineering-lane, both-lane, or ambiguous before writing code",
      `read product truth under ${productTruthRoot} as requirements: product promises, boundaries, rationale, decisions, and success criteria`,
      `read engineering truth under ${engineeringTruthRoot} as implementation context: source-backed current realization, contracts, architecture, workflows, operations, or tests`,
      "do not write truth docs or truth routing; leave route YAML, realized_by, and realizes updates to Truth Structure, Truth Document, or finish-time Truth Sync",
      "ambiguous lane ownership should stop before code changes or route to Truth Structure",
    ].join("\n"),
  );
};

export const renderTruthRealizePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const productTruthRoot = resolveProductTruthRoot(config);
  const engineeringTruthRoot = resolveEngineeringTruthRoot(config);

  return `### Manual Truth Realize
Only run when the user explicitly asks to realize truth docs into code. This is a manual installed instruction or skill, not a dedicated CLI command.
Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Antigravity @truthmark-realize; Cursor @truthmark-realize.
Doc first:
- read the updated truth docs plus any present Truthmark config, route files, relevant code, and tests
- Evidence authority:
${renderBulletBlock(EVIDENCE_AUTHORITY_INSTRUCTIONS)}
- ${REPOSITORY_INTELLIGENCE_INSTRUCTIONS}
- Lane classification:
${renderTruthRealizeLaneClassificationRuleBlock(config)}
- use product truth as requirements and engineering truth as current implementation context; do not redefine product truth inside engineering docs
${renderTruthDocOwnershipGateSection(
    "source truth docs before writing code",
    "if a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence, stop before writing code and recommend Truth Structure or Truth Document",
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
