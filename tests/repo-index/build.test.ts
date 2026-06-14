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

  it("indexes package metadata, files, docs, tests, exports, symbols, and route ownership", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile(
      "package.json",
      JSON.stringify({ name: "sample", version: "1.0.0", scripts: { test: "vitest" } }, null, 2),
    );
    await repo.writeFile(
      "src/math.ts",
      "export function add(left: number, right: number) { return left + right; }\n",
    );
    await repo.writeFile("src/index.ts", "export { add } from './math.js';\n");
    await repo.writeFile("tests/math.test.ts", "import { add } from '../src/math.js';\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.schemaVersion).toBe("repo-index/v0");
    expect(result.packages).toContainEqual(
      expect.objectContaining({ name: "sample", version: "1.0.0", manager: "npm" }),
    );
    expect(result.files.map((file) => file.path)).toContain("src/math.ts");
    expect(result.docs.map((doc) => doc.path)).toContain("docs/truthmark/engineering/repository/overview.md");
    expect(result.files).toContainEqual(
      expect.objectContaining({ path: "AGENTS.md", kind: "generated" }),
    );
    expect(result.docs.map((doc) => doc.path)).not.toContain("AGENTS.md");
    expect(result.tests.map((file) => file.path)).toContain("tests/math.test.ts");
    expect(result.exports).toContainEqual({ path: "src/math.ts", name: "add", kind: "function" });
    expect(result.publicSymbols).toContainEqual({ path: "src/math.ts", name: "add", kind: "function" });
    expect(result.routeMap.routes.some((route) => route.truthDocs.length > 0)).toBe(true);
  });

  it("derives truth doc lane and doc type from truth_kind when frontmatter omits them", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile(
      "docs/truthmark/engineering/contracts/api.md",
      `---
status: active
truth_kind: engineering-contract
last_reviewed: 2026-05-14
source_of_truth:
  - docs/truthmark/routes/areas/repository.md
---

# API Contract
`,
    );

    const result = await buildRepoIndex(repo.rootDir);

    expect(result.docs).toContainEqual(
      expect.objectContaining({
        path: "docs/truthmark/engineering/contracts/api.md",
        docType: "contract",
        truthKind: "engineering-contract",
        truthLane: "engineering",
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

    expect(result.files.map((file) => file.path)).not.toContain("src/deleted.ts");
    expect(result.exports.map((entry) => entry.path)).not.toContain("src/deleted.ts");
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

    expect(result.files.map((file) => file.path)).not.toContain(".lean-ctx/graph.meta.json");
  });
});
