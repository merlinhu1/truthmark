import fs from "node:fs/promises";

import { afterEach, describe, expect, it } from "vitest";

import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { buildRepoIndex } from "../../src/repo-index/build.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

describe("buildRepoIndex", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("indexes workflow metadata without language-semantic fields", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile(
      "package.json",
      JSON.stringify(
        { name: "sample", version: "1.0.0", scripts: { test: "vitest" } },
        null,
        2,
      ),
    );
    await repo.writeFile(
      "src/math.ts",
      "export function add(left: number, right: number) { return left + right; }\n",
    );
    await repo.writeFile("src/index.ts", "export { add } from './math.js';\n");
    await repo.writeFile(
      "tests/math.test.ts",
      "import { add } from '../src/math.js';\n",
    );
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.schemaVersion).toBe("repo-index/v0");
    expect(result.packages).toContainEqual(
      expect.objectContaining({
        name: "sample",
        version: "1.0.0",
        manager: "npm",
      }),
    );
    expect(result.files.map((file) => file.path)).toContain("src/math.ts");
    expect(result.docs.map((doc) => doc.path)).toContain(
      "docs/truthmark/engineering/repository/bootstrap-routing.md",
    );
    expect(result.files).toContainEqual(
      expect.objectContaining({ path: "AGENTS.md", kind: "generated" }),
    );
    expect(result.docs.map((doc) => doc.path)).not.toContain("AGENTS.md");
    expect(result.tests.map((file) => file.path)).toContain(
      "tests/math.test.ts",
    );
    expect(result).not.toHaveProperty("imports");
    expect(result).not.toHaveProperty("exports");
    expect(result).not.toHaveProperty("publicSymbols");
    expect(
      result.routeMap.routes.some((route) => route.truthDocs.length > 0),
    ).toBe(true);
  });

  it("keeps polyglot source files visible as workflow files without semantic distinctions", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile(
      "cmd/server/main.go",
      "package main\n\nfunc main() {}\n",
    );
    await repo.writeFile("scripts/task.py", "print('task')\n");
    await repo.writeFile(
      "src/App/Program.cs",
      "namespace App;\n\npublic class Program {}\n",
    );
    await repo.writeFile(
      "src/main/java/com/example/App.java",
      "package com.example;\n\npublic class App {}\n",
    );
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await repo.writeFile("src/index.js", "export const value = 1;\n");

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "cmd/server/main.go",
          kind: "source",
          language: null,
        }),
        expect.objectContaining({
          path: "scripts/task.py",
          kind: "source",
          language: null,
        }),
        expect.objectContaining({
          path: "src/App/Program.cs",
          kind: "source",
          language: null,
        }),
        expect.objectContaining({
          path: "src/main/java/com/example/App.java",
          kind: "source",
          language: null,
        }),
        expect.objectContaining({
          path: "src/index.ts",
          kind: "source",
          language: "typescript",
        }),
        expect.objectContaining({
          path: "src/index.js",
          kind: "source",
          language: "javascript",
        }),
      ]),
    );
    expect(result).not.toHaveProperty("imports");
    expect(result).not.toHaveProperty("exports");
    expect(result).not.toHaveProperty("publicSymbols");
  });

  it("derives truth doc lane, doc type, and source references from compact truth docs", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile(
      "docs/truthmark/routes/areas/repository.md",
      "# Repository Route\n",
    );
    await repo.writeFile(
      "docs/truthmark/engineering/contracts/api.md",
      `---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-05-14
---

# API Contract

## Source References

- ../../routes/areas/repository.md
`,
    );

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.docs).toContainEqual(
      expect.objectContaining({
        path: "docs/truthmark/engineering/contracts/api.md",
        docType: "contract",
        truthKind: "engineering-contract",
        truthLane: "engineering",
        sourceOfTruth: ["docs/truthmark/routes/areas/repository.md"],
      }),
    );
  });

  it("does not treat relationship frontmatter as canonical repo-index metadata", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile(
      "docs/truthmark/engineering/contracts/api.md",
      `---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-05-14
realizes:
  - docs/truthmark/product/capabilities/api.md
depends_on:
  - docs/truthmark/engineering/contracts/shared.md
---

# API Contract
`,
    );

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.docs).toContainEqual(
      expect.objectContaining({
        path: "docs/truthmark/engineering/contracts/api.md",
        realizedBy: [],
        realizes: [],
        dependsOn: [],
      }),
    );
  });

  it("skips tracked files that are deleted from the worktree", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/deleted.ts", "export const deleted = true;\n");
    await repo.runGit(["add", "src/deleted.ts"]);
    await repo.runGit(["commit", "-m", "track deleted fixture"]);
    await fs.rm(`${repo.rootDir}/src/deleted.ts`);

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.files.map((file) => file.path)).not.toContain(
      "src/deleted.ts",
    );
    expect(result).not.toHaveProperty("exports");
  });

  it("excludes files ignored by gitignore", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await repo.writeFile(".gitignore", ".lean-ctx/\n");
    await repo.writeFile(".lean-ctx/graph.meta.json", "{}\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.files.map((file) => file.path)).not.toContain(
      ".lean-ctx/graph.meta.json",
    );
  });
});
