import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderAgentsBlock } from "../../src/templates/agents-block.js";
import { renderGeneratedSurfaces } from "../../src/templates/generated-surfaces.js";
import { renderOptionalLocalCliValidation } from "../../src/templates/workflow-surfaces.js";

const portalPaths = [
  ".agents/skills/truthmark-portal/SKILL.md",
  ".agents/skills/truthmark-portal/agents/openai.yaml",
  ".opencode/skills/truthmark-portal/SKILL.md",
  ".claude/skills/truthmark-portal/SKILL.md",
  ".github/skills/truthmark-portal/SKILL.md",
  ".github/prompts/truthmark-portal.prompt.md",
  ".gemini/skills/truthmark-portal/SKILL.md",
  ".gemini/commands/truthmark/portal.toml",
];

describe("Truthmark Portal generated surfaces", () => {
  it("renders optional local CLI validation without live workflow preflight", () => {
    const validation = renderOptionalLocalCliValidation("truthmark-sync");

    expect(validation).toContain("Optional local CLI validation");
    expect(validation).toContain("direct checkout inspection");
    expect(validation).toContain("progressive-disclosure support files");
    expect(validation).toContain("truthmark check --json");
    expect(validation).toContain("truthmark index --json");
    expect(validation).toContain("helper-manifest.yml");
    expect(validation).not.toContain("truthmark workflow instructions --workflow");
    expect(validation).not.toContain("workflow instructions: skipped");
    expect(validation).not.toContain("workflow status/instructions: skipped");
  });

  it("bounds direct checkout inspection for write workflows", () => {
    for (const workflow of [
      "truthmark-sync",
      "truthmark-document",
      "truthmark-structure",
      "truthmark-realize",
    ] as const) {
      const validation = renderOptionalLocalCliValidation(workflow);

      expect(validation).toContain("route-first procedure");
      expect(validation).toContain("read only the config, route files, truth docs, and source evidence needed for the current changed surface");
      expect(validation).toContain("stop on missing or ambiguous ownership instead of broadening reads or writes");
    }
  });

  it("does not give read-only workflows the heavier write-workflow fallback", () => {
    for (const workflow of ["truthmark-preview", "truthmark-check"] as const) {
      const validation = renderOptionalLocalCliValidation(workflow);

      expect(validation).toContain("keep inspection focused on the requested report");
      expect(validation).toContain("do not broaden into support-file or repo-wide scans");
      expect(validation).not.toContain("route-first procedure");
    }
  });

  it("omits Portal surfaces and AGENTS wording when disabled", () => {
    const config = createDefaultConfig();
    const paths = renderGeneratedSurfaces(config).map((surface) => surface.path);

    expect(config.truthmark.generated.portal.enabled).toBe(false);
    for (const portalPath of portalPaths) {
      expect(paths).not.toContain(portalPath);
    }
    expect(renderAgentsBlock(config)).not.toContain("Truthmark Portal");
  });

  it("renders Portal surfaces for all configured platforms when enabled", () => {
    const config = createDefaultConfig();
    config.truthmark.generated.portal = {
      enabled: true,
    };

    const surfaces = renderGeneratedSurfaces(config);
    const byPath = new Map(surfaces.map((surface) => [surface.path, surface.content]));

    for (const portalPath of portalPaths) {
      expect(byPath.has(portalPath)).toBe(true);
    }

    const portalSkill = byPath.get(".agents/skills/truthmark-portal/SKILL.md") ?? "";
    const portalProcedure =
      byPath.get(".agents/skills/truthmark-portal/support/procedure.md") ?? "";
    const copilotPrompt = byPath.get(".github/prompts/truthmark-portal.prompt.md") ?? "";
    const geminiCommand = byPath.get(".gemini/commands/truthmark/portal.toml") ?? "";
    const agentsBlock = renderAgentsBlock(config);

    for (const text of [portalSkill, portalProcedure, copilotPrompt, geminiCommand]) {
      expect(text).toContain("manual-only");
      expect(text).toContain("Markdown remains canonical");
      expect(text).toContain("does not require the truthmark CLI");
      expect(text).toContain("docs/truthmark/generated/portal");
      expect(text).toContain("docs/truthmark/templates/portal.html");
      expect(text).toContain("no remote dependencies");
      expect(text).toContain("no .truthmark/index.json dependency");
      expect(text).toContain("source provenance");
      expect(text).toContain("generated non-canonical static files");
    }

    expect(portalProcedure).toContain("replace the entire output directory");
    expect(portalProcedure).toContain("fixed Portal output directory only");
    expect(portalProcedure).not.toContain("custom Portal output");
    expect(agentsBlock).toContain("Truthmark Portal is a separate manual-only presentation workflow");
    expect(agentsBlock).toContain("docs/truthmark/generated/portal/");
    expect(agentsBlock).toContain("Markdown remains canonical");
  });
});
