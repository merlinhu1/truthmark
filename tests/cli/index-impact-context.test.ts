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

  it("renders markdown-only context data from truthmark context --workflow truth-sync --base main --json", async () => {
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
        data: {
          contextPack?: unknown;
          markdown: string;
          summary: string;
          truthDocs?: Array<{ content?: string }>;
          sourceFiles?: Array<{ content?: string }>;
        };
        summary: string;
      };

      expect(output.command).toBe("context");
      expect(output.data.contextPack).toBeUndefined();
      expect(output.data.truthDocs).toBeUndefined();
      expect(output.data.sourceFiles).toBeUndefined();
      expect(output.data.markdown).toContain("# Truthmark ContextPack (truth-sync)");
      expect(output.data.summary).toBe(output.summary);
      expect(JSON.stringify(output.data)).not.toContain('"truthDocs":[{');
      expect(JSON.stringify(output.data)).not.toContain('"sourceFiles":[{');
      expect(JSON.stringify(output.data)).not.toContain('"content":');
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps workflow status and context JSON free of ContextPack content", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "initial"]);
      await repo.writeFile("src/index.ts", "export const value = 2;\n");

      const statusResult = await runCli(
        ["workflow", "status", "--workflow", "truthmark-sync", "--base", "main", "--json"],
        { cwd: repo.rootDir },
      );
      const statusOutput = JSON.parse(statusResult.stdout) as {
        command: string;
        data: {
          workflowState: {
            schemaVersion: string;
            workflow: string;
            contextPack?: unknown;
            actionContext: { helperValidationCommands: unknown[] };
            checks: { helpers: unknown[] };
          };
        };
      };
      const statusJson = JSON.stringify(statusOutput.data.workflowState);

      expect(statusResult.exitCode).toBe(0);
      expect(statusOutput.command).toBe("workflow status");
      expect(statusOutput.data.workflowState.schemaVersion).toBe("truthmark-workflow/v0");
      expect(statusOutput.data.workflowState.workflow).toBe("truthmark-sync");
      expect(statusOutput.data.workflowState.contextPack).toBeUndefined();
      expect(statusOutput.data.workflowState.actionContext.helperValidationCommands.length).toBeGreaterThan(0);
      expect(statusOutput.data.workflowState.checks.helpers.length).toBeGreaterThan(0);
      expect(statusJson).not.toContain('"routeMap"');
      expect(statusJson).not.toContain('"content"');

      const contextResult = await runCli(
        ["context", "--workflow", "truth-sync", "--base", "main", "--json"],
        { cwd: repo.rootDir },
      );
      const contextOutput = JSON.parse(contextResult.stdout) as {
        data: {
          contextPack?: unknown;
          markdown?: string;
          truthDocs?: Array<{ content?: string }>;
          sourceFiles?: Array<{ content?: string }>;
        };
      };
      const contextJson = JSON.stringify(contextOutput.data);

      expect(contextResult.exitCode).toBe(0);
      expect(contextOutput.data.contextPack).toBeUndefined();
      expect(contextOutput.data.truthDocs).toBeUndefined();
      expect(contextOutput.data.sourceFiles).toBeUndefined();
      expect(contextOutput.data.markdown).toContain("# Truthmark ContextPack (truth-sync)");
      expect(contextJson).not.toContain('"content":');
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
      expect(result.stdout.trim()).not.toContain('"contextPack"');
    } finally {
      await repo.cleanup();
    }
  });

  it("renders ContextPack markdown by default", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);

      const result = await runCli(["context", "--workflow", "truth-document"], {
        cwd: repo.rootDir,
      });

      expect(result.stdout).toContain("# Truthmark ContextPack (truth-document)");
      expect(result.stdout).toContain("## Allowed Write Paths");
      expect(result.stdout.trim()).not.toContain('"contextPack"');
    } finally {
      await repo.cleanup();
    }
  });

  it("renders markdown-only JSON data when --json and --format markdown are combined", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);

      const result = await runCli(
        ["context", "--workflow", "truth-document", "--format", "markdown", "--json"],
        { cwd: repo.rootDir },
      );
      const output = JSON.parse(result.stdout) as {
        command: string;
        data: { contextPack?: unknown; markdown?: string; summary?: string };
        summary: string;
      };

      expect(output.command).toBe("context");
      expect(output.data.contextPack).toBeUndefined();
      expect(output.data.markdown).toContain("# Truthmark ContextPack (truth-document)");
      expect(output.data.markdown).toContain("## Allowed Write Paths");
      expect(output.data.summary).toBe(output.summary);
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects JSON ContextPack format output", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);

      const result = await runCli(["context", "--workflow", "truth-sync", "--format", "json", "--json"], {
        cwd: repo.rootDir,
      });
      const output = JSON.parse(result.stdout) as {
        diagnostics: Array<{ category: string; severity: string; message: string }>;
      };

      expect(result.exitCode).toBe(1);
      expect(output.diagnostics).toContainEqual(
        expect.objectContaining({
          category: "context-pack",
          severity: "error",
          message: expect.stringContaining("JSON ContextPack output was removed in v2"),
        }),
      );
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

      expect(result.exitCode).toBe(1);
      expect(output.diagnostics).toContainEqual(
        expect.objectContaining({
          category: "context-pack",
          severity: "error",
          message: expect.stringContaining("supports only --format markdown"),
        }),
      );
    } finally {
      await repo.cleanup();
    }
  });
});
