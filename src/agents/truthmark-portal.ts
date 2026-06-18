import type { TruthmarkConfig } from "../config/schema.js";
import { defaultAgentConfig, renderHierarchySummary } from "./shared.js";
import { getTruthmarkWorkflow } from "./workflow-manifest.js";

export const TRUTHMARK_PORTAL_EXPLICIT_INVOCATIONS =
  "OpenCode /skill truthmark-portal; Codex /truthmark-portal or $truthmark-portal; Claude Code /truthmark-portal; GitHub Copilot /truthmark-portal; Gemini CLI /truthmark:portal.";

export const renderTruthmarkPortalProcedureBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const output = config.truthmark.paths.portalOutput;
  const template = config.truthmark.paths.portalTemplate;

  return `# Truthmark Portal

Truthmark Portal is a manual-only presentation workflow. It is never an automatic completion workflow, never Truth Sync, and runs only when the user explicitly asks to generate, refresh, or update the committed static HTML Portal.

Invocations: ${TRUTHMARK_PORTAL_EXPLICIT_INVOCATIONS}

Core rules:

- Markdown remains canonical; generated HTML is presentation only.
- Read Markdown directly from the checkout; the workflow does not require the truthmark CLI or package.
- truthmark check/index may be used only as optional supporting evidence when available.
- Determined Portal output is ${output}.
- Determined Portal template path is ${template}; use built-in template instructions if that file is absent.
- The workflow may replace the entire output directory, but writes are limited to the fixed Portal output directory only.
- Portal writes are generated non-canonical static files for human browsing.
- Generate a committed multi-page static HTML site with local CSS, JavaScript, assets, and search metadata under the output directory.
- Use no remote dependencies by default: no remote scripts, analytics, fonts, CSS, or CDN assets.
- Include source provenance and the Markdown canonical disclaimer on every page.
- Store manifest and search data under output/assets only.
- There is no .truthmark/index.json dependency; do not require or create it as infrastructure.
- Pictures and screenshots require an explicit user or template request.

Workflow:

1. Confirm the user explicitly requested Portal generation or refresh.
2. Inspect .truthmark/config.yml and configured route docs only when they exist; read repository instruction files when present, truth docs, architecture docs, standards docs, and the determined Portal template when present.
3. Validate the determined output path is repo-relative, non-empty, inside the repository, and does not overlap canonical docs, source roots, routing files, or instruction targets.
4. Plan the generated page inventory, diagrams/assets, source docs reviewed, and skipped or ambiguous docs.
5. Replace or write only under ${output}; do not edit canonical Markdown, routing, source code, or instruction files unless the user explicitly changes scope.
6. Generate the multi-page static site with local assets/search metadata and visible source provenance.
7. Validate entry page, links where practical, provenance/disclaimers, local-only assets, and that metadata remains under ${output}/assets.
${renderHierarchySummary(config)}`;
};

export const renderTruthmarkPortalSkillBody = (
  config: TruthmarkConfig = defaultAgentConfig(),
): string => {
  const workflow = getTruthmarkWorkflow("truthmark-portal");
  const output = config.truthmark.paths.portalOutput;

  return `---
name: truthmark-portal
description: ${workflow.description}
argument-hint: Optional portal generation focus
user-invocable: true
---

${renderTruthmarkPortalProcedureBody(config)}
Report completion in this shape:

\`\`\`md
Truthmark Portal: completed

Output path:
- ${output}

Page count:
- <count>

Diagrams/assets:
- <generated diagrams/assets or none>

Source docs reviewed:
- <source markdown paths>

Skipped/ambiguous docs:
- <paths and reason, or none>

Validation:
- <checks performed>

Markdown canonical statement:
- Markdown remains canonical; generated Portal HTML is non-canonical presentation only.
\`\`\`
`;
};
