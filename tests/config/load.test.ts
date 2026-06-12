import { describe, expect, it } from "vitest";

import { loadConfig } from "../../src/config/load.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const validConfig = (portalProperties = "") => `version: 2
platforms:
  - codex
truthmark:
  workspace: docs/truthmark
  routes:
    index: routes/areas.md
    areas: routes/areas
    default_area: repository
    max_delegation_depth: 1
  truth:
    root: truth
  templates:
    root: templates
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

  it("rejects unsafe workspace and child paths", async () => {
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
});
