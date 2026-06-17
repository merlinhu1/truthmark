import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { TRUTHMARK_WORKFLOW_IDS } from "../../src/agents/workflow-manifest.js";
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

const readOnlyProcedurePaths = [
  ".truthmark/agent/workflows/truthmark-check/support/procedure.md",
  ".truthmark/agent/workflows/truthmark-preview/support/procedure.md",
  ".claude/skills/truthmark-check/support/procedure.md",
  ".claude/skills/truthmark-preview/support/procedure.md",
  ".gemini/skills/truthmark-check/support/procedure.md",
  ".gemini/skills/truthmark-preview/support/procedure.md",
  ".github/skills/truthmark-check/support/procedure.md",
  ".github/skills/truthmark-preview/support/procedure.md",
];

const syncProcedurePaths = [
  ".truthmark/agent/workflows/truthmark-sync/support/procedure.md",
  ".claude/skills/truthmark-sync/support/procedure.md",
  ".gemini/skills/truthmark-sync/support/procedure.md",
  ".github/skills/truthmark-sync/support/procedure.md",
];

const staleWriteAuthorizingLaneText =
  "before writing canonical truth docs, classify the request or change as product-lane, engineering-lane, both-lane, or ambiguous";

describe("Truthmark Portal generated surfaces", () => {
  it("keeps checked-in read-only procedures free of write-authorizing lane wording", () => {
    for (const procedurePath of readOnlyProcedurePaths) {
      const content = readFileSync(join(process.cwd(), procedurePath), "utf8");

      expect(content, procedurePath).not.toContain(
        staleWriteAuthorizingLaneText,
      );
      expect(content, procedurePath).toContain(
        "classify the request or changed surface as product-lane, engineering-lane, both-lane, or ambiguous for reporting only",
      );
    }
  });

  it("keeps checked-in Sync procedures on the cheap product-truth decision", () => {
    for (const procedurePath of syncProcedurePaths) {
      const content = readFileSync(join(process.cwd(), procedurePath), "utf8");

      expect(content, procedurePath).toContain("Product truth decision");
      expect(content, procedurePath).toContain(
        "ask whether a user-visible promise, capability boundary, API contract, acceptance criterion, or explicit user/product evidence changed",
      );
      expect(content, procedurePath).toContain(
        "if no, default to engineering truth under docs/truthmark/engineering for internal implementation changes",
      );
      expect(content, procedurePath).toContain(
        "Product truth is opt-in for externally visible promises, product boundaries, APIs, acceptance criteria, or explicit user/product evidence.",
      );
      expect(content, procedurePath).not.toContain(
        staleWriteAuthorizingLaneText,
      );
      expect(content, procedurePath).not.toContain(
        "classify lane impact as product-lane, engineering-lane, both-lane, or ambiguous before writing",
      );
    }
  });

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
      "OpenSpec-style",
      "proposal/spec/task",
      "spec lifecycle",
      "archive/apply",
      "truthmark/changes",
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

    const syncSkill =
      byPath.get(".agents/skills/truthmark-sync/SKILL.md") ?? "";
    const syncProcedure =
      byPath.get(
        ".truthmark/agent/workflows/truthmark-sync/support/procedure.md",
      ) ?? "";
    const syncHelperManifest =
      byPath.get(
        ".truthmark/agent/workflows/truthmark-sync/helper-manifest.yml",
      ) ?? "";
    const syncHelperPolicy =
      byPath.get(
        ".truthmark/agent/workflows/truthmark-sync/support/helper-policy.md",
      ) ?? "";
    const previewSkill =
      byPath.get(".agents/skills/truthmark-preview/SKILL.md") ?? "";

    expect(syncSkill).toContain("Use this skill automatically before finishing");
    expect(syncSkill).not.toContain("Parent workflow:");
    expect(syncSkill).toContain("support/procedure.md");
    expect(syncSkill).toContain("support/report-template.md");
    expect(byPath.get(".opencode/skills/truthmark-sync/SKILL.md")).toContain(
      "Use this skill automatically before finishing",
    );
    expect(syncProcedure).toContain("Code verification is parent-owned");
    expect(syncProcedure).toContain(
      "Validate the report body before adding this validator's own success status",
    );
    expect(syncHelperManifest).toContain("validate-sync-report");
    expect(syncHelperManifest).toContain("validate-write-lease");
    expect(syncHelperPolicy).toContain(
      "Optional helper CLI commands may collect deterministic checkout facts",
    );
    expect(syncHelperPolicy).toContain("truthmark validate ... --json");
    expect(previewSkill).toContain("Truth Preview is read-only");
    expect(previewSkill).not.toContain("CLI is unavailable");
  });

  it("renders canonical agent package manifest and workflow entrypoints", () => {
    const config = createDefaultConfig();
    const byPath = new Map(
      renderGeneratedSurfaces(config).map((surface) => [
        surface.path,
        surface.content,
      ]),
    );
    const manifest = JSON.parse(
      byPath.get(".truthmark/agent/manifest.json") ?? "{}",
    );

    expect(manifest.schemaVersion).toBe("truthmark-agent-package/v1");
    expect(manifest.packageRoot).toBe(".truthmark/agent");
    expect(JSON.stringify(manifest)).not.toContain(process.cwd());

    for (const workflowId of TRUTHMARK_WORKFLOW_IDS) {
      const canonicalPath = `.truthmark/agent/workflows/${workflowId}/SKILL.md`;
      const workflow = manifest.workflows[workflowId];

      expect(byPath.has(canonicalPath), canonicalPath).toBe(true);
      expect(workflow.entrypoint.path).toBe(canonicalPath);
      expect(workflow.entrypoint.sha256).toMatch(/^[a-f0-9]{64}$/u);
    }
  });

  it("renders host skill packages with colocated native resources", () => {
    const config = createDefaultConfig();
    const byPath = new Map(
      renderGeneratedSurfaces(config).map((surface) => [
        surface.path,
        surface.content,
      ]),
    );
    const claudeProcedure =
      byPath.get(".claude/skills/truthmark-sync/support/procedure.md") ?? "";
    const codexProcedure =
      byPath.get(".agents/skills/truthmark-sync/support/procedure.md") ?? "";
    const opencodeReport =
      byPath.get(".opencode/skills/truthmark-sync/support/report-template.md") ??
      "";

    expect(claudeProcedure).toContain("Parent workflow:");
    expect(codexProcedure).toContain("Parent workflow:");
    expect(opencodeReport).toContain("Changed code reviewed:");
    expect(claudeProcedure).not.toContain("truthmark:adapter-mode=expanded-adapter");
  });

  it("omits Portal surfaces and AGENTS wording when disabled", () => {
    const config = createDefaultConfig();
    const paths = renderGeneratedSurfaces(config).map(
      (surface) => surface.path,
    );

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
    const byPath = new Map(
      surfaces.map((surface) => [surface.path, surface.content]),
    );

    for (const portalPath of portalPaths) {
      expect(byPath.has(portalPath)).toBe(true);
    }

    const portalSkill =
      byPath.get(".truthmark/agent/workflows/truthmark-portal/SKILL.md") ??
      "";
    const portalProcedure =
      byPath.get(
        ".truthmark/agent/workflows/truthmark-portal/support/procedure.md",
      ) ?? "";
    const copilotPrompt =
      byPath.get(".github/prompts/truthmark-portal.prompt.md") ?? "";
    const geminiCommand =
      byPath.get(".gemini/commands/truthmark/portal.toml") ?? "";
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
      "This prompt is the GitHub Copilot entrypoint for Truthmark Portal.",
    );
    expect(copilotPrompt).toContain(".github/skills/truthmark-portal/SKILL.md");
    expect(geminiCommand).toContain(
      "This command is the Gemini CLI entrypoint for Truthmark Portal.",
    );
    expect(geminiCommand).toContain(".gemini/skills/truthmark-portal/SKILL.md");

    expect(portalProcedure).toContain("replace the entire output directory");
    expect(portalProcedure).toContain("fixed Portal output directory only");
    expect(portalProcedure).not.toContain("custom Portal output");
    expect(agentsBlock).toContain(
      "Truthmark Portal is a separate manual-only presentation workflow",
    );
    expect(agentsBlock).toContain("docs/truthmark/generated/portal/");
    expect(agentsBlock).toContain("Markdown remains canonical");
  });
});
