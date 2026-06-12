import { afterEach, describe, expect, it } from "vitest";

import { buildContextPack } from "../../src/context-pack/build.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

const longDocument = (): string =>
  Array.from({ length: 241 }, (_, index) => `Line ${index + 1}`).join("\n");

describe("buildContextPack", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("does not grant default write paths when .truthmark/config.yml is invalid", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

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
  });

  it("bounds selected truth docs in generated context", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("package.json", JSON.stringify({ name: "sample" }, null, 2));
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.writeFile(
      "docs/truthmark/routes/areas.md",
      "# Truthmark Areas\n\n## Runtime\n\nTruth documents:\n- docs/truthmark/truth/runtime.md\n\nCode surface:\n- src/**\n\nUpdate truth when:\n- runtime code changes\n",
    );
    await repo.writeFile("docs/truthmark/truth/runtime.md", longDocument());
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("src/index.ts", "export const value = 2;\n");

    const contextPack = await buildContextPack(repo.rootDir, {
      workflow: "truth-sync",
      base: "main",
    });

    expect(contextPack.truthDocs).toEqual([
      expect.objectContaining({
        path: "docs/truthmark/truth/runtime.md",
        truncated: true,
      }),
    ]);
    expect(contextPack.truthDocs[0]?.content.split("\n")).toHaveLength(121);
    expect(contextPack.truthDocs[0]?.content).toContain("\n...\n");
    expect(contextPack.truthDocs[0]?.content).not.toContain("Line 121\n");
    expect(contextPack.warnings).toContainEqual(
      expect.objectContaining({
        category: "context-pack",
        file: "docs/truthmark/truth/runtime.md",
        message:
          "Context truth doc docs/truthmark/truth/runtime.md was truncated to fit ContextPack v0 bounds.",
      }),
    );
  });
});
