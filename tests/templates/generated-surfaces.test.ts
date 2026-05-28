import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderAgentsBlock } from "../../src/templates/agents-block.js";
import { renderGeneratedSurfaces } from "../../src/templates/generated-surfaces.js";

const portalPaths = [
  ".codex/skills/truthmark-portal/SKILL.md",
  ".codex/skills/truthmark-portal/agents/openai.yaml",
  ".opencode/skills/truthmark-portal/SKILL.md",
  ".claude/skills/truthmark-portal/SKILL.md",
  ".github/skills/truthmark-portal/SKILL.md",
  ".github/prompts/truthmark-portal.prompt.md",
  ".gemini/skills/truthmark-portal/SKILL.md",
  ".gemini/commands/truthmark/portal.toml",
];

describe("Truthmark Portal generated surfaces", () => {
  it("omits Portal surfaces and AGENTS wording when disabled", () => {
    const config = createDefaultConfig();
    const paths = renderGeneratedSurfaces(config).map((surface) => surface.path);

    expect(config.truthmarkPortal.enabled).toBe(false);
    for (const portalPath of portalPaths) {
      expect(paths).not.toContain(portalPath);
    }
    expect(renderAgentsBlock(config)).not.toContain("Truthmark Portal");
  });

  it("renders Portal surfaces for all configured platforms when enabled", () => {
    const config = createDefaultConfig();
    config.truthmarkPortal = {
      enabled: true,
      output: "docs/project-map",
      template: "docs/truthmark/portal-templates/product.md",
    };

    const surfaces = renderGeneratedSurfaces(config);
    const byPath = new Map(surfaces.map((surface) => [surface.path, surface.content]));

    for (const portalPath of portalPaths) {
      expect(byPath.has(portalPath)).toBe(true);
    }

    const portalSkill = byPath.get(".codex/skills/truthmark-portal/SKILL.md") ?? "";
    const portalProcedure =
      byPath.get(".codex/skills/truthmark-portal/support/procedure.md") ?? "";
    const copilotPrompt = byPath.get(".github/prompts/truthmark-portal.prompt.md") ?? "";
    const geminiCommand = byPath.get(".gemini/commands/truthmark/portal.toml") ?? "";
    const agentsBlock = renderAgentsBlock(config);

    for (const text of [portalSkill, portalProcedure, copilotPrompt, geminiCommand]) {
      expect(text).toContain("manual-only");
      expect(text).toContain("Markdown remains canonical");
      expect(text).toContain("does not require the truthmark CLI");
      expect(text).toContain("docs/truthmark-portal");
      expect(text).toContain("docs/project-map");
      expect(text).toContain("docs/truthmark/portal-templates/product.md");
      expect(text).toContain("no remote dependencies");
      expect(text).toContain("no .truthmark/index.json dependency");
      expect(text).toContain("source provenance");
      expect(text).toContain("generated non-canonical static files");
    }

    expect(portalProcedure).toContain("replace the entire output directory");
    expect(portalProcedure).toContain("configured Portal output directory only");
    expect(portalProcedure).toContain("explicit user or template request");
    expect(agentsBlock).toContain("Truthmark Portal is a separate manual-only presentation workflow");
    expect(agentsBlock).toContain("default `docs/truthmark-portal/`");
    expect(agentsBlock).toContain("Markdown remains canonical");
  });
});
