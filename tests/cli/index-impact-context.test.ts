import { describe, it } from "node:test";
import { expect } from "expect";

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

      const result = await runCli(["impact", "--base", "main", "--json"], {
        cwd: repo.rootDir,
      });
      const output = JSON.parse(result.stdout) as {
        command: string;
        data: {
          impactSet: {
            schemaVersion: string;
            changedFiles: Array<{ path: string }>;
          };
        };
      };

      expect(output.command).toBe("impact");
      expect(output.data.impactSet.schemaVersion).toBe("impact-set/v0");
      expect(
        output.data.impactSet.changedFiles.map((file) => file.path),
      ).toContain("src/index.ts");
    } finally {
      await repo.cleanup();
    }
  });

  it("exposes compact ContextPack replacement data from workflow status", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile(
        "package.json",
        JSON.stringify(
          { name: "sample", scripts: { test: "vitest" } },
          null,
          2,
        ),
      );
      await repo.writeFile(
        "src/math.ts",
        "export function add(left: number, right: number) { return left + right; }\n",
      );
      await repo.writeFile(
        "tests/math.test.ts",
        "import { add } from '../src/math.js';\nvoid add;\n",
      );
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "initial"]);
      await repo.writeFile(
        "src/math.ts",
        "export function add(left: number, right: number) { return left + right + 0; }\n",
      );

      const result = await runCli(
        [
          "workflow",
          "status",
          "--workflow",
          "truthmark-sync",
          "--base",
          "main",
          "--json",
        ],
        { cwd: repo.rootDir },
      );
      const output = JSON.parse(result.stdout) as {
        command: string;
        data: {
          workflowState: {
            applicability: { state: string; reasons: string[] };
            actionContext: {
              allowedWritePaths: string[];
              primaryTruthDocs: string[];
              evidencePrompts: string[];
              requiredEvidence?: unknown;
            };
            targetTruthDocs: string[];
            changedFiles: Array<{ path: string }>;
            affectedRoutes: unknown[];
            workflowCard: {
              affectedFiles: string[];
              likelyRouteOwners: string[];
              suggestedTruthDocs: string[];
              openQuestions: string[];
              skippedHelperStatus: Array<{
                helper: string;
                status: string;
                reason: string;
              }>;
            };
            checks: {
              reviewChecklist: string[];
              reviewQuestions?: unknown;
              required?: unknown;
              recommended: string[];
              helpers: unknown[];
              affectedTests?: string[];
              testCommands?: string[];
            };
            nextSteps: string[];
            diagnostics: unknown[];
          };
        };
      };
      const state = output.data.workflowState;
      const compactTestGuidance = [
        ...(state.checks.affectedTests ?? []),
        ...(state.checks.testCommands ?? []),
      ];

      expect(result.exitCode).toBe(0);
      expect(output.command).toBe("workflow status");
      expect(state.applicability.state).toBe("ready");
      expect(state.applicability.reasons).toEqual([]);
      expect(state.actionContext.allowedWritePaths).toEqual(
        expect.arrayContaining(state.targetTruthDocs),
      );
      expect(state.actionContext.primaryTruthDocs).toEqual(
        state.targetTruthDocs,
      );
      expect(state.actionContext.allowedWritePaths).toContain(
        "docs/truthmark/routes/areas.md",
      );
      expect(state.targetTruthDocs.length).toBeGreaterThan(0);
      expect(state.changedFiles.map((file) => file.path)).toContain(
        "src/math.ts",
      );
      expect(state.affectedRoutes.length).toBeGreaterThan(0);
      expect(state.actionContext.evidencePrompts.length).toBeGreaterThan(0);
      expect(state.actionContext.requiredEvidence).toBeUndefined();
      expect(state.checks.reviewChecklist.length).toBeGreaterThan(0);
      expect(state.checks.reviewQuestions).toBeUndefined();
      expect(state.checks.required).toBeUndefined();
      expect(state.checks.helpers.length).toBeGreaterThan(0);
      expect(state.workflowCard.affectedFiles).toContain("src/math.ts");
      expect(state.workflowCard.likelyRouteOwners.length).toBeGreaterThan(0);
      expect(state.workflowCard.suggestedTruthDocs).toEqual(
        state.targetTruthDocs,
      );
      expect(state.workflowCard.openQuestions).toEqual([]);
      expect(state.workflowCard.skippedHelperStatus).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            helper: "validate-sync-report",
            status: "skipped",
          }),
        ]),
      );
      expect(Array.isArray(state.nextSteps)).toBe(true);
      expect(Array.isArray(state.diagnostics)).toBe(true);
      expect(compactTestGuidance.join("\n")).toContain("tests/math.test.ts");
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps workflow status and impact JSON free of ContextPack content", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);
      await repo.runGit(["add", "."]);
      await repo.runGit(["commit", "-m", "initial"]);
      await repo.writeFile("src/index.ts", "export const value = 2;\n");

      const statusResult = await runCli(
        [
          "workflow",
          "status",
          "--workflow",
          "truthmark-sync",
          "--base",
          "main",
          "--json",
        ],
        { cwd: repo.rootDir },
      );
      const statusOutput = JSON.parse(statusResult.stdout) as {
        command: string;
        data: {
          workflowState: {
            schemaVersion: string;
            workflow: string;
            contextPack?: unknown;
            sourceFiles?: unknown;
            truthDocs?: Array<{ content?: string }>;
            actionContext: { helperValidationCommands: unknown[] };
            checks: { helpers: unknown[] };
          };
        };
      };
      const statusJson = JSON.stringify(statusOutput.data.workflowState);

      expect(statusResult.exitCode).toBe(0);
      expect(statusOutput.command).toBe("workflow status");
      expect(statusOutput.data.workflowState.schemaVersion).toBe(
        "truthmark-workflow/v0",
      );
      expect(statusOutput.data.workflowState.workflow).toBe("truthmark-sync");
      expect(statusOutput.data.workflowState.contextPack).toBeUndefined();
      expect(
        statusOutput.data.workflowState.actionContext.helperValidationCommands
          .length,
      ).toBeGreaterThan(0);
      expect(
        statusOutput.data.workflowState.checks.helpers.length,
      ).toBeGreaterThan(0);
      expect(statusJson).not.toContain('"contextPack"');
      expect(statusJson).not.toContain('"sourceFiles"');
      expect(statusJson).not.toContain('"truthDocs":[{');
      expect(statusJson).not.toContain('"routeMap"');
      expect(statusJson).not.toContain('"content":');

      const impactResult = await runCli(
        ["impact", "--base", "main", "--json"],
        { cwd: repo.rootDir },
      );
      const impactOutput = JSON.parse(impactResult.stdout) as {
        data: {
          impactSet: {
            contextPack?: unknown;
            sourceFiles?: unknown;
            truthDocs?: unknown;
          };
        };
      };
      const impactJson = JSON.stringify(impactOutput.data.impactSet);

      expect(impactResult.exitCode).toBe(0);
      expect(impactOutput.data.impactSet.contextPack).toBeUndefined();
      expect(impactOutput.data.impactSet.truthDocs).toBeUndefined();
      expect(impactOutput.data.impactSet.sourceFiles).toBeUndefined();
      expect(impactJson).not.toContain('"contextPack"');
      expect(impactJson).not.toContain('"sourceFiles"');
      expect(impactJson).not.toContain('"truthDocs":[{');
      expect(impactJson).not.toContain('"content":');
    } finally {
      await repo.cleanup();
    }
  });

  it("retires truthmark context as a hard-removed command", async () => {
    const repo = await createTempRepo();
    try {
      await repo.writeFile("src/index.ts", "export const value = 1;\n");
      await runConfig(repo.rootDir, { force: false, stdout: false });
      await runInit(repo.rootDir);

      const result = await runCli(
        ["context", "--workflow", "truth-sync", "--base", "main", "--json"],
        {
          cwd: repo.rootDir,
        },
      );

      expect(result.exitCode).toBe(1);
      expect(`${result.stdout}\n${result.stderr}`).toContain("unknown command");
      expect(result.stdout).not.toContain("contextPack");
      expect(result.stdout).not.toContain("ContextPack");
    } finally {
      await repo.cleanup();
    }
  });
});
