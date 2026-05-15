import { afterEach, describe, expect, it } from "vitest";

import { runConfig } from "../../src/config/command.js";
import { buildImpactSet } from "../../src/impact/build.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

describe("buildImpactSet", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("maps changed files to routes, truth docs, and tests", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/math.ts", "export function add(left: number, right: number) { return left + right; }\n");
    await repo.writeFile("tests/math.test.ts", "import { add } from '../src/math.js';\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);

    await repo.writeFile(
      "src/math.ts",
      "export function add(left: number, right: number) { return left + right + 0; }\n",
    );

    const impact = await buildImpactSet(repo.rootDir, { base: "main" });

    expect(impact.schemaVersion).toBe("impact-set/v0");
    expect(impact.changedFiles).toContainEqual(expect.objectContaining({ path: "src/math.ts", status: "modified" }));
    expect(impact.affectedTruthDocs.length).toBeGreaterThan(0);
    expect(impact.affectedTests).toContain("tests/math.test.ts");
  });

  it("maps changed routed truth docs to affected routes and truth docs", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);

    const truthDocPath = "docs/truth/repository/overview.md";
    await repo.writeFile(
      truthDocPath,
      `${await repo.readFile(truthDocPath)}\nUpdated direct truth-doc edit.\n`,
    );

    const impact = await buildImpactSet(repo.rootDir, { base: "main" });

    expect(impact.changedFiles).toContainEqual(
      expect.objectContaining({ path: truthDocPath, status: "modified" }),
    );
    expect(impact.affectedTruthDocs).toContain(truthDocPath);
    expect(impact.affectedRoutes.some((route) => route.truthDocs.includes(truthDocPath))).toBe(
      true,
    );
  });

  it("reports when a base ref cannot be compared", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });

    const impact = await buildImpactSet(repo.rootDir, { base: "missing-ref" });

    expect(impact.diagnostics).toContainEqual(
      expect.objectContaining({
        category: "impact",
        severity: "error",
        message: expect.stringContaining("Unable to compare base ref missing-ref"),
      }),
    );
  });

  it("reports public API changes when affected truth docs were not changed", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("src/index.ts", "export const changedValue = 2;\n");

    const impact = await buildImpactSet(repo.rootDir, { base: "main" });

    expect(impact.diagnostics).toContainEqual(
      expect.objectContaining({
        category: "impact",
        severity: "review",
        file: "src/index.ts",
        message: expect.stringContaining("affected truth docs but none were changed"),
      }),
    );
  });

  it("treats changed test files as affected tests instead of unrouted code", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await repo.writeFile("tests/index.test.ts", "import { value } from '../src/index.js';\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("tests/index.test.ts", "import { value } from '../src/index.js';\nvoid value;\n");

    const impact = await buildImpactSet(repo.rootDir, { base: "main" });

    expect(impact.affectedTests).toContain("tests/index.test.ts");
    expect(impact.diagnostics).not.toContainEqual(
      expect.objectContaining({
        category: "impact",
        file: "tests/index.test.ts",
      }),
    );
  });

  it("selects package-level tests for changed package files", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/repo-index/package-metadata.ts", "export const manager = 'npm';\n");
    await repo.writeFile(
      "tests/repo-index/build.test.ts",
      "import { describe, it } from 'vitest';\ndescribe('repo index package', () => { it('builds', () => undefined); });\n",
    );
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);

    await repo.writeFile(
      "src/repo-index/package-metadata.ts",
      "export const manager = 'pnpm';\n",
    );

    const impact = await buildImpactSet(repo.rootDir, { base: "main" });

    expect(impact.affectedTests).toContain("tests/repo-index/build.test.ts");
  });

  it("keeps old and new route ownership for renamed files", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/old/api.ts", "export const oldApi = 1;\n");
    await repo.writeFile("src/new/.gitkeep", "\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.writeFile(
      "docs/truthmark/areas.md",
      `# Truthmark Areas

## Old

Truth documents:
- docs/truth/old.md

Code surface:
- src/old/**

Update truth when:
- old behavior changes

## New

Truth documents:
- docs/truth/new.md

Code surface:
- src/new/**

Update truth when:
- new behavior changes
`,
    );
    await repo.writeFile("docs/truth/old.md", "# Old\n");
    await repo.writeFile("docs/truth/new.md", "# New\n");
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.runGit(["branch", "baseline"]);
    await repo.runGit(["mv", "src/old/api.ts", "src/new/api.ts"]);
    await repo.runGit(["commit", "-m", "move api"]);

    const impact = await buildImpactSet(repo.rootDir, { base: "baseline" });

    expect(impact.changedFiles).toContainEqual(
      expect.objectContaining({
        path: "src/new/api.ts",
        previousPath: "src/old/api.ts",
        status: "renamed",
      }),
    );
    expect(impact.affectedTruthDocs).toEqual(["docs/truth/new.md", "docs/truth/old.md"]);
    expect(impact.changedPublicSymbols).toContainEqual({
      path: "src/old/api.ts",
      name: "oldApi",
      kind: "const",
      change: "removed",
    });
  });
});
