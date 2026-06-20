import { describe, expect, it } from "vitest";

import { loadConfig } from "../../src/config/load.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const validConfig = (portalProperties = "") => `version: 2
platforms:
  - codex
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: true
${portalProperties}instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended: []
ignore: []
`;

describe("loadConfig", () => {
  it("rejects legacy config shape", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 1\ndocs:\n  roots:\n    - docs/truth\n",
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics.map((diagnostic) => diagnostic.message).join("\n")).toContain(
        "Unsupported Truthmark config shape",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects unsupported truth config blocks", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig().replace(
          "  generated:\n",
          "  truth:\n    root: truth\n    product_root: custom-product\n    engineering_root: custom-engineering\n  generated:\n",
        ),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("additional property truth is not allowed"),
        }),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects unsupported routes and templates config blocks", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig().replace(
          "  generated:\n",
          "  routes:\n    index: routes/custom.md\n    areas: routes/custom\n    default_area: custom\n    max_delegation_depth: 1\n  templates:\n    root: custom-templates\n  generated:\n",
        ),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining("additional property routes is not allowed"),
          }),
          expect.objectContaining({
            message: expect.stringContaining("additional property templates is not allowed"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects unsafe workspace paths", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig().replace("workspace: docs/truthmark", "workspace: ../truthmark"),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("truthmark.workspace must be a non-empty repo-relative directory"),
        }),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects custom Portal output and template properties", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig("      output: docs/custom-portal\n      template: docs/custom-template.md\n"),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining("additional property output is not allowed"),
          }),
          expect.objectContaining({
            message: expect.stringContaining("additional property template is not allowed"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("derives Portal paths from the Truthmark workspace defaults", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(".truthmark/config.yml", validConfig());

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("loaded");
      expect(result.config?.truthmark.generated.portal).toEqual({ enabled: true });
      expect(result.config?.truthmark.paths.portalOutput).toBe("docs/truthmark/generated/portal");
      expect(result.config?.truthmark.paths.portalTemplate).toBe("docs/truthmark/templates/portal.html");
    } finally {
      await repo.cleanup();
    }
  });


  it("accepts active platform support values", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig().replace(
          "platforms:\n  - codex\n",
          [
            "platforms:",
            "  - codex",
            "  - opencode",
            "  - claude-code",
            "  - github-copilot",
            "  - antigravity",
            "  - cursor",
            "",
          ].join("\n"),
        ),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("loaded");
      expect(result.config?.platforms).toEqual([
        "codex",
        "opencode",
        "claude-code",
        "github-copilot",
        "antigravity",
        "cursor",
      ]);
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects retired Gemini CLI platform support", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig().replace("  - codex", "  - gemini-cli"),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("invalid");
      expect(result.config).toBeNull();
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("must be equal to one of the allowed values"),
        }),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("does not assume a host platform when platforms are omitted", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig().replace("platforms:\n  - codex\n", ""),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("loaded");
      expect(result.config?.platforms).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });

  it("derives fixed internal paths from a custom workspace", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        validConfig().replace("workspace: docs/truthmark", "workspace: docs/custom-truthmark"),
      );

      const result = await loadConfig(repo.rootDir);

      expect(result.status).toBe("loaded");
      expect(result.config?.truthmark.routes).toEqual({
        index: "routes/areas.md",
        areas: "routes/areas",
        defaultArea: "repository",
        maxDelegationDepth: 1,
      });
      expect(result.config?.truthmark.truth.productRoot).toBe("product");
      expect(result.config?.truthmark.truth.engineeringRoot).toBe("engineering");
      expect(result.config?.truthmark.templates.root).toBe("templates");
      expect(result.config?.truthmark.paths.routesIndex).toBe(
        "docs/custom-truthmark/routes/areas.md",
      );
      expect(result.config?.truthmark.paths.routeAreasRoot).toBe(
        "docs/custom-truthmark/routes/areas",
      );
      expect(result.config?.truthmark.paths.productTruthRoot).toBe("docs/custom-truthmark/product");
      expect(result.config?.truthmark.paths.engineeringTruthRoot).toBe(
        "docs/custom-truthmark/engineering",
      );
      expect(result.config?.truthmark.paths.templatesRoot).toBe(
        "docs/custom-truthmark/templates",
      );
      expect(result.config?.truthmark.paths.portalOutput).toBe(
        "docs/custom-truthmark/generated/portal",
      );
      expect(result.config?.truthmark.paths.portalTemplate).toBe(
        "docs/custom-truthmark/templates/portal.html",
      );
    } finally {
      await repo.cleanup();
    }
  });
});
