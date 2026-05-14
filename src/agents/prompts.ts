import type { TruthmarkConfig } from "../config/schema.js";
import { renderTruthRealizeCompletedReport } from "../realize/report.js";
import { defaultAgentConfig, resolveTruthDocsRoot } from "./shared.js";

const renderMarkdownExample = (content: string): string => {
  return [`\`\`\`md`, content, `\`\`\``].join("\n");
};

export const renderTruthRealizePrompt = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const truthDocsRoot = resolveTruthDocsRoot(config);

  return `### Manual Truth Realize
Only run when the user explicitly asks to realize truth docs into code. This is a manual installed instruction or skill, not a dedicated CLI command.
Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.
Doc first:
- read the updated truth docs plus relevant code and routing metadata
- write functional code only
- do not edit truth docs or truth routing
Report changed code files and verification steps:
${renderMarkdownExample(
    renderTruthRealizeCompletedReport({
      truthDocsUsed: [`${truthDocsRoot}/authentication/session-timeout.md`],
      codeUpdated: ["src/auth/session.ts"],
      verification: ["npm test -- auth"],
    }),
  )}`;
};

export const renderTruthRealizeInstructions = (): string => {
  return `### Manual Truth Realize
Only run when the user explicitly asks to realize truth docs into code. This is a manual installed instruction or skill, not a dedicated CLI command.
Invocations: OpenCode /skill truthmark-realize; Codex /truthmark-realize or $truthmark-realize; Claude Code /truthmark-realize; GitHub Copilot /truthmark-realize; Gemini CLI /truthmark:realize.
Doc first: read truth docs, routing, and relevant code; write functional code only; do not edit truth docs or truth routing.
Report truth docs used, code updated, and verification.`;
};
