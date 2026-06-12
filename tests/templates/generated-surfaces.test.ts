import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderAgentsBlock } from "../../src/templates/agents-block.js";
import { renderGeneratedSurfaces } from "../../src/templates/generated-surfaces.js";
import { renderWorkflowCliPreflight } from "../../src/templates/workflow-surfaces.js";

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
  it("renders sync preflight as non-blocking one-call instructions preflight when no base is supplied", () => {
    const preflight = renderWorkflowCliPreflight("truthmark-sync");

    expect(preflight).toContain("cheap local base selection");
    expect(preflight).toContain("do not stop solely because the caller omitted --base");
    expect(preflight).toContain("canonical one-call live workflow preflight");
    expect(preflight).toContain("truthmark workflow instructions --workflow truthmark-sync --json");
    expect(preflight).toContain("workflow instructions` already returns both `data.instructions` and the source `data.workflowState`");
    expect(preflight).toContain("Use `truthmark workflow status` only for status-only/debug inspection");
    expect(preflight).not.toContain("truthmark workflow status --workflow truthmark-sync --json");
    expect(preflight).not.toContain("workflow status/instructions: skipped");
  });

  it("bounds manual fallback for write workflows when live instructions are unavailable", () => {
    for (const workflow of [
      "truthmark-sync",
      "truthmark-document",
      "truthmark-structure",
      "truthmark-realize",
    ] as const) {
      const preflight = renderWorkflowCliPreflight(workflow);

      expect(preflight).toContain("read only the workflow-owned support files named by that entrypoint for the current step");
      expect(preflight).toContain("do not read every support file, every route file, or every truth doc by default");
      expect(preflight).toContain("block as ambiguous");
      expect(preflight).toContain("instead of scanning the repository until sure");
      expect(preflight).toContain("workflow instructions: skipped");
    }
  });

  it("does not give read-only workflow preflight the heavier write-workflow fallback", () => {
    for (const workflow of ["truthmark-preview", "truthmark-check"] as const) {
      const preflight = renderWorkflowCliPreflight(workflow);

      expect(preflight).toContain("continue only with the committed generated entrypoint");
      expect(preflight).toContain("do not broaden into support-file or repo-wide scans solely to replace the CLI");
      expect(preflight).not.toContain("read only the workflow-owned support files named by that entrypoint for the current step");
      expect(preflight).not.toContain("do not read every support file, every route file, or every truth doc by default");
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
