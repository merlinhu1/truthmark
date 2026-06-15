import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderAgentsBlock } from "../../src/templates/agents-block.js";
import { renderGeneratedSurfaces } from "../../src/templates/generated-surfaces.js";

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
  it("omits generic optional CLI validation from generated user-facing workflow surfaces", () => {
    const config = createDefaultConfig();
    const generatedSurfaces = renderGeneratedSurfaces(config);
    const publicWorkflowSurfaces = generatedSurfaces.filter(
      (surface) =>
        surface.path.endsWith("/SKILL.md") ||
        surface.path.startsWith(".github/prompts/") ||
        surface.path.startsWith(".gemini/commands/"),
    );
    const forbiddenText = [
      "## Optional local CLI validation",
      "truthmark workflow instructions --json",
      ["truthmark", "workflow", "status", "--json"].join(" "),
      "workflow instructions --json",
      ["workflow", "status", "--json"].join(" "),
      "live preflight",
    ];

    expect(publicWorkflowSurfaces.length).toBeGreaterThan(0);
    for (const surface of publicWorkflowSurfaces) {
      for (const text of forbiddenText) {
        expect(surface.content, surface.path).not.toContain(text);
      }
    }
  });

  it("keeps compact workflow-specific validation and procedure guidance", () => {
    const config = createDefaultConfig();
    const byPath = new Map(
      renderGeneratedSurfaces(config).map((surface) => [
        surface.path,
        surface.content,
      ]),
    );

    const syncSkill = byPath.get(".agents/skills/truthmark-sync/SKILL.md") ?? "";
    const syncProcedure =
      byPath.get(".agents/skills/truthmark-sync/support/procedure.md") ?? "";
    const syncHelperManifest =
      byPath.get(".agents/skills/truthmark-sync/helper-manifest.yml") ?? "";
    const syncHelperPolicy =
      byPath.get(".agents/skills/truthmark-sync/support/helper-policy.md") ?? "";
    const previewSkill =
      byPath.get(".agents/skills/truthmark-preview/SKILL.md") ?? "";

    expect(syncSkill).toContain("Quick procedure:");
    expect(syncSkill).toContain("direct checkout inspection is the canonical path");
    expect(syncSkill).toContain("Read support/procedure.md before editing truth docs.");
    expect(syncProcedure).toContain("Code verification is parent-owned");
    expect(syncProcedure).toContain("Validate the report body before adding this validator's own success status");
    expect(syncHelperManifest).toContain("validate-sync-report");
    expect(syncHelperManifest).toContain("validate-write-lease");
    expect(syncHelperPolicy).toContain("Optional helper CLI commands may collect deterministic checkout facts");
    expect(syncHelperPolicy).toContain("truthmark validate ... --json");
    expect(previewSkill).toContain("Truth Preview is read-only");
    expect(previewSkill).not.toContain("CLI is unavailable");
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

    for (const text of [portalSkill, portalProcedure]) {
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

    expect(copilotPrompt).toContain(
      "Use this prompt as a light-weight adapter for Truthmark Portal",
    );
    expect(copilotPrompt).toContain(".github/skills/truthmark-portal/SKILL.md");
    expect(geminiCommand).toContain(
      "Use this prompt as a light-weight adapter for Truthmark Portal",
    );
    expect(geminiCommand).toContain(".gemini/skills/truthmark-portal/SKILL.md");

    expect(portalProcedure).toContain("replace the entire output directory");
    expect(portalProcedure).toContain("fixed Portal output directory only");
    expect(portalProcedure).not.toContain("custom Portal output");
    expect(agentsBlock).toContain("Truthmark Portal is a separate manual-only presentation workflow");
    expect(agentsBlock).toContain("docs/truthmark/generated/portal/");
    expect(agentsBlock).toContain("Markdown remains canonical");
  });
});
