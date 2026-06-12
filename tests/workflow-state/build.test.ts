import fs from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { TRUTHMARK_WORKFLOW_MANIFEST } from "../../src/agents/workflow-manifest.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { buildWorkflowActionContext } from "../../src/workflow-state/action-context.js";
import { buildWorkflowState } from "../../src/workflow-state/build.js";
import { buildWorkflowInstructions } from "../../src/workflow-state/instructions.js";
import type { WorkflowState } from "../../src/workflow-state/types.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

const readTree = async (rootDir: string, relativeRoot: string): Promise<Record<string, string>> => {
  const absoluteRoot = path.join(rootDir, relativeRoot);
  const snapshot: Record<string, string> = {};

  const visit = async (directory: string): Promise<void> => {
    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(rootDir, absolutePath).replace(/\\/gu, "/");
        snapshot[relativePath] = await fs.readFile(absolutePath, "utf8");
      }
    }
  };

  await visit(absoluteRoot);
  return snapshot;
};

const setupConfiguredRepo = async (): Promise<TempRepo> => {
  const repo = await createTempRepo();
  await repo.writeFile(
    "package.json",
    JSON.stringify({ name: "sample", scripts: { test: "vitest" } }, null, 2),
  );
  await repo.writeFile(
    "src/math.ts",
    "export function add(left: number, right: number) { return left + right; }\n",
  );
  await repo.writeFile("tests/math.test.ts", "import { add } from '../src/math.js';\nvoid add;\n");
  await runConfig(repo.rootDir, { force: false, stdout: false });
  await runInit(repo.rootDir);
  await repo.runGit(["add", "."]);
  await repo.runGit(["commit", "-m", "initial"]);
  await repo.writeFile(
    "src/math.ts",
    "export function add(left: number, right: number) { return left + right + 0; }\n",
  );
  return repo;
};

describe("workflow state contract", () => {
  it("constructs minimal schema-versioned state with full manifest workflow id", () => {
    const state: WorkflowState = {
      schemaVersion: "truthmark-workflow/v0",
      workflow: "truthmark-check",
      applicability: {
        state: "applicable",
        reasons: [],
      },
      actionContext: {
        mode: "read-only",
        allowedWritePaths: [],
        forbiddenWritePaths: [],
        stopConditions: [],
        requiredEvidence: [],
        helperValidationCommands: [],
        writeLeaseRequired: false,
      },
      changedFiles: [],
      affectedRoutes: [],
      targetTruthDocs: [],
      diagnostics: [],
      checks: {
        required: [],
        recommended: [],
        helpers: [],
      },
      nextSteps: [],
      reportSections: [],
    };

    expect(state.schemaVersion).toBe("truthmark-workflow/v0");
    expect(state.workflow).toBe("truthmark-check");
    expect(state.workflow).not.toBe("truth-check");
  });
});

describe("action context", () => {
  it("maps read-only workflows to no allowed writes", () => {
    for (const workflow of ["truthmark-preview", "truthmark-check"] as const) {
      const context = buildWorkflowActionContext(TRUTHMARK_WORKFLOW_MANIFEST[workflow]);

      expect(context.mode).toBe("read-only");
      expect(context.allowedWritePaths).toEqual([]);
      expect(context.writeLeaseRequired).toBe(false);
    }
  });

  it("restricts sync and document to routed truth and route writes", () => {
    for (const workflow of ["truthmark-sync", "truthmark-document"] as const) {
      const context = buildWorkflowActionContext(TRUTHMARK_WORKFLOW_MANIFEST[workflow], {
        routeIndexPath: "docs/truthmark/routes/areas.md",
        routeFiles: ["docs/truthmark/routes/areas/repository.md"],
        truthDocs: ["docs/truthmark/truth/repository/overview.md"],
      });

      expect(context.mode).toBe("truth-doc-write");
      expect(context.allowedWritePaths).toEqual([
        "docs/truthmark/routes/areas.md",
        "docs/truthmark/routes/areas/repository.md",
        "docs/truthmark/truth/repository/overview.md",
      ]);
      expect(context.allowedWritePaths).not.toContain("*");
      expect(context.writeLeaseRequired).toBe(true);
      expect(context.helperValidationCommands.length).toBeGreaterThan(0);
    }
  });

  it("restricts structure to route files and starter truth docs", () => {
    const context = buildWorkflowActionContext(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-structure"], {
      routeIndexPath: "docs/truthmark/routes/areas.md",
      routeFiles: ["docs/truthmark/routes/areas/new-area.md"],
      starterTruthDocs: ["docs/truthmark/truth/new-area.md"],
    });

    expect(context.mode).toBe("route-write");
    expect(context.allowedWritePaths).toEqual([
      "docs/truthmark/routes/areas.md",
      "docs/truthmark/routes/areas/new-area.md",
      "docs/truthmark/truth/new-area.md",
    ]);
    expect(context.allowedWritePaths).not.toContain("*");
  });

  it("forbids truth documentation writes for realize", () => {
    const context = buildWorkflowActionContext(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-realize"], {
      routeIndexPath: "docs/truthmark/routes/areas.md",
      routeFiles: ["docs/truthmark/routes/areas/repository.md"],
      truthRoot: "docs/truthmark/truth",
      truthDocs: ["docs/truthmark/truth/repository/overview.md"],
      codeWritePaths: ["src/**/*.ts"],
    });

    expect(context.mode).toBe("code-write");
    expect(context.allowedWritePaths).toEqual(["src/**/*.ts"]);
    expect(context.forbiddenWritePaths).toEqual([
      "docs/truthmark/routes/areas.md",
      "docs/truthmark/routes/areas/repository.md",
      "docs/truthmark/truth/**/*.md",
      "docs/truthmark/truth/repository/overview.md",
    ]);
  });

  it("restricts portal writes to configured output when enabled", () => {
    const enabled = buildWorkflowActionContext(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-portal"], {
      portalEnabled: true,
      portalOutputPath: "docs/truthmark/generated/portal",
    });
    const disabled = buildWorkflowActionContext(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-portal"], {
      portalEnabled: false,
      portalOutputPath: "docs/truthmark/generated/portal",
    });

    expect(enabled.mode).toBe("portal-write");
    expect(enabled.allowedWritePaths).toEqual(["docs/truthmark/generated/portal/**"]);
    expect(disabled.allowedWritePaths).toEqual([]);
  });

  it("does not grant wildcard writes without config or route data", () => {
    for (const workflow of [
      "truthmark-sync",
      "truthmark-document",
      "truthmark-structure",
      "truthmark-portal",
    ] as const) {
      const context = buildWorkflowActionContext(TRUTHMARK_WORKFLOW_MANIFEST[workflow]);

      expect(context.allowedWritePaths).toEqual([]);
      expect(context.allowedWritePaths).not.toContain("*");
      expect(context.allowedWritePaths).not.toContain("**/*");
    }
  });
});

describe("buildWorkflowState", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("composes repo index, impact, context pack, checks, and manifest sections", async () => {
    const repo = await setupConfiguredRepo();
    repos.push(repo);

    const state = await buildWorkflowState(repo.rootDir, {
      workflow: "truthmark-sync",
      base: "main",
    });

    expect(state.schemaVersion).toBe("truthmark-workflow/v0");
    expect(state.workflow).toBe("truthmark-sync");
    expect("base" in state).toBe(false);
    expect(state.workflow).not.toBe("truth-sync");
    expect(state.changedFiles).toContainEqual(expect.objectContaining({ path: "src/math.ts" }));
    expect(state.affectedRoutes.length).toBeGreaterThan(0);
    expect(state.targetTruthDocs.length).toBeGreaterThan(0);
    expect(state.actionContext.mode).toBe("truth-doc-write");
    expect(state.actionContext.allowedWritePaths).toEqual(
      expect.arrayContaining(state.targetTruthDocs),
    );
    expect(state.checks.required).toEqual(
      expect.arrayContaining(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-sync"].requiredGates),
    );
    expect(state.checks.helpers.map((helper) => helper.id)).toContain("validate-sync-report");
    expect(state.reportSections).toEqual(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-sync"].reportSections);
    expect(Array.isArray(state.diagnostics)).toBe(true);

    const instructions = buildWorkflowInstructions(
      state,
      TRUTHMARK_WORKFLOW_MANIFEST["truthmark-sync"],
      { base: "main" },
    );
    expect(instructions.commandSequence.map((step) => step.command)).toEqual(
      expect.arrayContaining([
        "truthmark workflow status --workflow truthmark-sync --base main --json",
        "truthmark workflow instructions --workflow truthmark-sync --base main --json",
      ]),
    );
    expect("base" in state).toBe(false);
  });

  it("selects a simple local comparison base for sync when none is supplied", async () => {
    const repo = await setupConfiguredRepo();
    repos.push(repo);

    const state = await buildWorkflowState(repo.rootDir, { workflow: "truthmark-sync" });

    expect(state.applicability.state).not.toBe("blocked");
    expect(state.changedFiles).toContainEqual(expect.objectContaining({ path: "src/math.ts" }));
    expect(state.targetTruthDocs.length).toBeGreaterThan(0);
    expect(state.nextSteps.join("\n")).not.toContain("--base");
  });

  it("blocks sync without a supplied or discoverable comparison base", async () => {
    const repo = await setupConfiguredRepo();
    repos.push(repo);
    await repo.runGit(["branch", "-m", "feature/no-base"]);

    const state = await buildWorkflowState(repo.rootDir, { workflow: "truthmark-sync" });

    expect(state.applicability.state).toBe("blocked");
    expect(state.applicability.reasons.join("\n")).toContain("truthmark-sync requires --base");
    expect(state.actionContext.allowedWritePaths).toEqual([]);
    expect(state.changedFiles).toEqual([]);
    expect(state.targetTruthDocs).toEqual([]);
    expect(state.nextSteps.join("\n")).toContain("--base <ref>");
  });

  it("blocks write-capable workflows when config is missing", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");

    const state = await buildWorkflowState(repo.rootDir, { workflow: "truthmark-sync" });

    expect(["blocked", "not_applicable"]).toContain(state.applicability.state);
    expect(state.applicability.reasons.join("\n")).toContain("Missing .truthmark/config.yml");
    expect(state.actionContext.allowedWritePaths).toEqual([]);
  });

  it("surfaces ambiguous routing for changed functional files without target guesses", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/unmapped.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.writeFile(
      "docs/truthmark/routes/areas.md",
      "# Truthmark Areas\n\n## Docs Only\n\nTruth documents:\n- docs/truthmark/truth/docs-only.md\n\nCode surface:\n- docs/**\n\nUpdate truth when:\n- docs change\n",
    );
    await repo.writeFile("docs/truthmark/truth/docs-only.md", "# Docs Only\n");
    await repo.runGit(["add", "."]);
    await repo.runGit(["commit", "-m", "initial"]);
    await repo.writeFile("src/unmapped.ts", "export const value = 2;\n");

    const state = await buildWorkflowState(repo.rootDir, {
      workflow: "truthmark-sync",
      base: "main",
    });

    expect(["ambiguous", "blocked"]).toContain(state.applicability.state);
    expect(state.targetTruthDocs).toEqual([]);
    expect(state.nextSteps.join("\n")).toMatch(/Truth Structure|route repair/u);
  });

  it("rejects invalid workflow ids without falling back", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await expect(
      buildWorkflowState(repo.rootDir, { workflow: "truth-sync" as never }),
    ).rejects.toThrow(/Unknown Truthmark workflow/u);
  });


  it("does not mutate truth, route, or generated files", async () => {
    const repo = await setupConfiguredRepo();
    repos.push(repo);
    const before = await readTree(repo.rootDir, "docs/truthmark");

    await buildWorkflowState(repo.rootDir, {
      workflow: "truthmark-sync",
      base: "main",
    });

    const after = await readTree(repo.rootDir, "docs/truthmark");
    expect(after).toEqual(before);
  });
});
