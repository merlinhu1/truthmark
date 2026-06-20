import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderAgentsBlock } from "../../src/templates/agents-block.js";
import { renderGeneratedSurfaces } from "../../src/templates/generated-surfaces.js";

const allPlatforms = [
  "codex",
  "opencode",
  "claude-code",
  "github-copilot",
  "antigravity",
  "cursor",
] as const;

const portalPaths = [
  ".agents/skills/truthmark-portal/SKILL.md",
  ".agents/skills/truthmark-portal/agents/openai.yaml",
  ".opencode/skills/truthmark-portal/SKILL.md",
  ".claude/skills/truthmark-portal/SKILL.md",
  ".github/skills/truthmark-portal/SKILL.md",
  ".github/prompts/truthmark-portal.prompt.md",
  ".antigravity/rules/truthmark-portal.md",
  ".cursor/rules/truthmark-portal.mdc",
];

const readOnlyProcedurePaths = [
  ".agents/skills/truthmark-check/support/procedure.md",
  ".opencode/skills/truthmark-check/support/procedure.md",
  ".claude/skills/truthmark-check/support/procedure.md",
  ".github/skills/truthmark-check/support/procedure.md",
];

const syncProcedurePaths = [
  ".agents/skills/truthmark-sync/support/procedure.md",
  ".opencode/skills/truthmark-sync/support/procedure.md",
  ".claude/skills/truthmark-sync/support/procedure.md",
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
      expect(content, procedurePath).toContain(
        "User-provided decisions/rationale",
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
    config.platforms = [...allPlatforms];
    const generatedSurfaces = renderGeneratedSurfaces(config);
    const publicWorkflowSurfaces = generatedSurfaces.filter(
      (surface) =>
        surface.path.endsWith("/SKILL.md") ||
        surface.path.startsWith(".github/prompts/") ||
        surface.path.startsWith(".antigravity/rules/") ||
        surface.path.startsWith(".cursor/rules/"),
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

  it("keeps generated runtime surfaces free of repeated host/support overhead", () => {
    const config = createDefaultConfig();
    config.platforms = [...allPlatforms];
    const surfaces = renderGeneratedSurfaces(config);
    const runtimeSurfaces = surfaces.filter(
      (surface) =>
        surface.path.startsWith(".agents/") ||
        surface.path.startsWith(".opencode/") ||
        surface.path.startsWith(".claude/") ||
        surface.path.startsWith(".github/") ||
        surface.path.startsWith(".antigravity/") ||
        surface.path.startsWith(".cursor/"),
    );
    const crossHostInvocationText = [
      "Invocations:",
      "OpenCode /skill truthmark-",
      "Codex /truthmark-",
      "Claude Code /truthmark-",
      "GitHub Copilot /truthmark-",
      "Antigravity @truthmark-",
      "Cursor @truthmark-",
    ];

    for (const surface of runtimeSurfaces) {
      for (const text of crossHostInvocationText) {
        expect(surface.content, surface.path).not.toContain(text);
      }
    }

    const skillEntrypoints = runtimeSurfaces.filter((surface) =>
      surface.path.endsWith("/SKILL.md"),
    );
    for (const surface of skillEntrypoints) {
      expect(surface.content, surface.path).toContain("Progressive disclosure:");
      expect(surface.content, surface.path).not.toContain("Read support/");
    }

    const flatRules = runtimeSurfaces.filter(
      (surface) =>
        surface.path.startsWith(".antigravity/rules/") ||
        surface.path.startsWith(".cursor/rules/"),
    );
    expect(flatRules.length).toBeGreaterThan(0);
    for (const surface of flatRules) {
      expect(surface.content, surface.path).not.toContain("Quick procedure:");
      expect(surface.content, surface.path).not.toContain("support/procedure.md");
      expect(surface.content, surface.path).not.toContain(
        "support/report-template.md",
      );
      expect(surface.content, surface.path).not.toContain(
        "support/subagents-and-leases.md",
      );
      expect(surface.content, surface.path).toContain("## Procedure");
      expect(surface.content, surface.path).toContain("## Report Template");
    }
  });

  it("keeps compact workflow-specific validation and procedure guidance", () => {
    const config = createDefaultConfig();
    config.platforms = [...allPlatforms];
    const byPath = new Map(
      renderGeneratedSurfaces(config).map((surface) => [
        surface.path,
        surface.content,
      ]),
    );

    const syncSkill =
      byPath.get(".agents/skills/truthmark-sync/SKILL.md") ?? "";
    const syncProcedure =
      byPath.get(".agents/skills/truthmark-sync/support/procedure.md") ?? "";

    expect(syncSkill).toContain("Use this skill automatically before finishing");
    expect(syncSkill).not.toContain("Parent workflow:");
    expect(syncSkill).toContain("support/procedure.md");
    expect(syncSkill).toContain("support/report-template.md");
    expect(byPath.get(".opencode/skills/truthmark-sync/SKILL.md")).toContain(
      "Use this skill automatically before finishing",
    );
    expect(syncProcedure).toContain("Code verification is parent-owned");
    expect(syncProcedure).toContain(
      "truthmark validate sync-report <report-file> --json",
    );
    expect(byPath.has(".agents/skills/truthmark-sync/helper-manifest.yml")).toBe(false);
    expect(byPath.has(".agents/skills/truthmark-sync/support/helper-policy.md")).toBe(false);
    expect(byPath.has(".agents/skills/truthmark-preview/SKILL.md")).toBe(false);
    expect(byPath.has(".github/prompts/truthmark-preview.prompt.md")).toBe(false);
    expect(byPath.has(".gemini/commands/truthmark/preview.toml")).toBe(false);
    expect(byPath.has("GEMINI.md")).toBe(false);
    expect(byPath.has(".gemini/skills/truthmark-sync/SKILL.md")).toBe(false);
    expect(byPath.has(".gemini/commands/truthmark/sync.toml")).toBe(false);
    expect(byPath.has(".antigravity/rules/truthmark-sync.md")).toBe(true);
    expect(byPath.has(".cursor/rules/truthmark-sync.mdc")).toBe(true);
    expect(byPath.has(".agents/skills/truthmark-preview/agents/openai.yaml")).toBe(
      false,
    );
  });

  it("does not render unused repo-local agent package copies", () => {
    const config = createDefaultConfig();
    config.platforms = [...allPlatforms];
    const paths = renderGeneratedSurfaces(config).map((surface) => surface.path);

    expect(paths.some((path) => path.startsWith(".truthmark/agent/"))).toBe(false);
    expect(paths).toContain(".agents/skills/truthmark-sync/SKILL.md");
    expect(paths).toContain(".agents/skills/truthmark-sync/support/procedure.md");
    expect(paths).toContain(".opencode/skills/truthmark-sync/support/procedure.md");
  });

  it("renders host skill packages with colocated native resources", () => {
    const config = createDefaultConfig();
    config.platforms = [...allPlatforms];
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
    expect(opencodeReport).toContain("Decision/rationale captured:");
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
    config.platforms = [...allPlatforms];
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
      byPath.get(".agents/skills/truthmark-portal/SKILL.md") ?? "";
    const portalProcedure =
      byPath.get(".agents/skills/truthmark-portal/support/procedure.md") ?? "";
    const copilotPrompt =
      byPath.get(".github/prompts/truthmark-portal.prompt.md") ?? "";
    const antigravityRule =
      byPath.get(".antigravity/rules/truthmark-portal.md") ?? "";
    const cursorRule = byPath.get(".cursor/rules/truthmark-portal.mdc") ?? "";
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
    expect(antigravityRule).toContain(
      "This rule is the Antigravity entrypoint for Truthmark Portal.",
    );
    expect(cursorRule).toContain(
      "This rule is the Cursor entrypoint for Truthmark Portal.",
    );
    expect(cursorRule).toContain("alwaysApply: false");

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
