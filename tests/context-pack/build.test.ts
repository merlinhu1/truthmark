import { afterEach, describe, expect, it } from "vitest";

import { buildContextPack } from "../../src/context-pack/build.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

describe("buildContextPack", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("builds a bounded Truth Sync context pack from an impact set", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("src/index.ts", "export const value = 2;\n");

    const pack = await buildContextPack(repo.rootDir, { workflow: "truth-sync", base: "main" });

    expect(pack.schemaVersion).toBe("context-pack/v0");
    expect(pack.workflow).toBe("truth-sync");
    expect(pack.allowedWritePaths).toContain("docs/truthmark/areas.md");
    expect(pack.truthDocs.length).toBeGreaterThan(0);
    expect(pack.sourceFiles.map((file) => file.path)).toContain("src/index.ts");
  });

  it("bounds Truth Realize writes to matched code surfaces", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("src/index.ts", "export const value = 2;\n");

    const pack = await buildContextPack(repo.rootDir, { workflow: "truth-realize", base: "main" });

    expect(pack.allowedWritePaths).toContain("src/**");
  });

  it("does not widen no-base Truth Realize context packs to every code surface", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/owned/index.ts", "export const owned = 1;\n");
    await repo.writeFile("src/other/index.ts", "export const other = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.writeFile(
      "docs/truthmark/areas.md",
      `# Truthmark Areas

## Owned

Truth documents:
- docs/truth/owned.md

Code surface:
- src/owned/**

Update truth when:
- owned behavior changes

## Other

Truth documents:
- docs/truth/other.md

Code surface:
- src/other/**

Update truth when:
- other behavior changes
`,
    );
    await repo.writeFile(
      "docs/truth/owned.md",
      `---
source_of_truth:
  - ../../src/owned/index.ts
---
# Owned
`,
    );
    await repo.writeFile(
      "docs/truth/other.md",
      `---
source_of_truth:
  - ../../src/other/index.ts
---
# Other
`,
    );

    const pack = await buildContextPack(repo.rootDir, { workflow: "truth-realize" });

    expect(pack.allowedWritePaths).toEqual([]);
    expect(pack.truthDocs).toEqual([]);
    expect(pack.sourceFiles).toEqual([]);
    expect(pack.warnings).toContainEqual(
      expect.objectContaining({
        category: "context-pack",
        severity: "review",
        message: expect.stringContaining("truth-realize requires --base"),
      }),
    );
  });

  it("includes source_of_truth files for Truth Document context without a base ref", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.writeFile(
      "docs/truth/repository/overview.md",
      `---
status: active
doc_type: behavior
truth_kind: behavior
source_of_truth:
  - ../../../src/index.ts
---
# Repository Overview
`,
    );

    const pack = await buildContextPack(repo.rootDir, { workflow: "truth-document" });

    expect(pack.sourceFiles.map((file) => file.path)).toContain("src/index.ts");
  });
});
