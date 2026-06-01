import { describe, expect, it } from "vitest";

import { buildContextPack } from "../../src/context-pack/build.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("buildContextPack", () => {
  it("does not grant default write paths when .truthmark/config.yml is invalid", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("package.json", JSON.stringify({ name: "sample" }, null, 2));
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\ntruthmark:\n  workspace: ../outside\n",
      );

      const contextPack = await buildContextPack(repo.rootDir, { workflow: "truth-sync" });

      expect(contextPack.allowedWritePaths).toEqual([]);
      expect(contextPack.warnings).toContainEqual(
        expect.objectContaining({
          category: "config",
          file: ".truthmark/config.yml",
        }),
      );
      expect(contextPack.allowedWritePaths).not.toContain("docs/truthmark/routes/areas.md");
    } finally {
      await repo.cleanup();
    }
  });
});
