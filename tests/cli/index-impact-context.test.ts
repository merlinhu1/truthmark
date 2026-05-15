import { describe, expect, it } from "vitest";

import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { runCli } from "../helpers/run-cli.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("repository intelligence CLI commands", () => {
  it("renders RepoIndex and RouteMap data from truthmark index --json", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);

      const result = await runCli(["index", "--json"], { cwd: repo.rootDir });
      const output = JSON.parse(result.stdout) as {
        command: string;
        diagnostics: unknown[];
        data: {
          repoIndex: { schemaVersion: string };
          routeMap: { schemaVersion: string };
        };
      };

      expect(output.command).toBe("index");
      expect(output.data.repoIndex.schemaVersion).toBe("repo-index/v0");
      expect(output.data.routeMap.schemaVersion).toBe("route-map/v0");
      expect(output.diagnostics).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });

  it("renders ImpactSet from truthmark impact --base main --json", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "initial"]);
      await repo.writeFile("src/index.ts", "export const value = 2;\n");

      const result = await runCli(["impact", "--base", "main", "--json"], { cwd: repo.rootDir });
      const output = JSON.parse(result.stdout) as {
        command: string;
        data: { impactSet: { schemaVersion: string; changedFiles: Array<{ path: string }> } };
      };

      expect(output.command).toBe("impact");
      expect(output.data.impactSet.schemaVersion).toBe("impact-set/v0");
      expect(output.data.impactSet.changedFiles.map((file) => file.path)).toContain("src/index.ts");
    } finally {
      await repo.cleanup();
    }
  });

  it("renders ContextPack from truthmark context --workflow truth-sync --base main --json", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "initial"]);
      await repo.writeFile("src/index.ts", "export const value = 2;\n");

      const result = await runCli(["context", "--workflow", "truth-sync", "--base", "main", "--json"], {
        cwd: repo.rootDir,
      });
      const output = JSON.parse(result.stdout) as {
        command: string;
        data: { contextPack: { schemaVersion: string; workflow: string } };
      };

      expect(output.command).toBe("context");
      expect(output.data.contextPack.schemaVersion).toBe("context-pack/v0");
      expect(output.data.contextPack.workflow).toBe("truth-sync");
    } finally {
      await repo.cleanup();
    }
  });

  it("renders ContextPack markdown when --format markdown is requested", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);

      const result = await runCli(["context", "--workflow", "truth-document", "--format", "markdown"], {
        cwd: repo.rootDir,
      });

      expect(result.stdout).toContain("# Truthmark ContextPack (truth-document)");
      expect(result.stdout).toContain("## Allowed Write Paths");
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects unsupported ContextPack formats", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);

      const result = await runCli(["context", "--workflow", "truth-sync", "--format", "typo", "--json"], {
        cwd: repo.rootDir,
      });
      const output = JSON.parse(result.stdout) as {
        diagnostics: Array<{ category: string; severity: string; message: string }>;
      };

      expect(output.diagnostics).toContainEqual(
        expect.objectContaining({
          category: "context-pack",
          severity: "error",
          message: expect.stringContaining("--format json or markdown"),
        }),
      );
    } finally {
      await repo.cleanup();
    }
  });
});
