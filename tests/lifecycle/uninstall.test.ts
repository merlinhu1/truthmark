import fs from "node:fs/promises";
import { describe, it } from "node:test";

import { expect } from "expect";

import { runConfig } from "../../src/config/command.js";
import { loadConfig } from "../../src/config/load.js";
import { runInit } from "../../src/init/init.js";
import {
  applyLifecyclePlan,
  buildLifecyclePlan,
} from "../../src/init/lifecycle.js";
import { runUninstall } from "../../src/init/uninstall.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("generated surface lifecycle", () => {
  it("rejects an aliased desired instruction before scaffolding", async () => {
    const repo = await createTempRepo();
    try {
      await runConfig(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      await repo.writeFile("alias.md", "authored\n");
      await fs.symlink("alias.md", `${repo.rootDir}/AGENTS.md`);

      const result = await runInit(repo.rootDir);

      expect(result.summary).toContain("preflight failed");
      expect(await repo.readFile("alias.md")).toBe("authored\n");
      await expect(
        fs.access(`${repo.rootDir}/docs/truthmark`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("reconciles a disabled platform without touching sibling files", async () => {
    const repo = await createTempRepo();
    try {
      await runConfig(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex, claude-code]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      await runInit(repo.rootDir);
      await repo.writeFile(".claude/user.txt", "mine\n");
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );

      const result = await runInit(repo.rootDir);

      await expect(fs.access(`${repo.rootDir}/CLAUDE.md`)).rejects.toThrow();
      expect(await repo.readFile(".claude/user.txt")).toBe("mine\n");
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: "action",
            file: "CLAUDE.md",
            message: expect.stringContaining("remove-managed-block"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("plans and applies uninstall while preserving authored files and Gemini", async () => {
    const repo = await createTempRepo();
    try {
      await runConfig(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      await runInit(repo.rootDir);
      await repo.writeFile("GEMINI.md", "manual\n");
      await repo.writeFile(".agents/user.txt", "mine\n");

      const dryRun = await runUninstall(repo.rootDir, "dry-run");
      const applied = await runUninstall(repo.rootDir, "apply");
      const dryPlan = dryRun.data?.lifecyclePlan as Record<string, unknown>;
      const applyPlan = applied.data?.lifecyclePlan as Record<string, unknown>;

      expect(dryPlan.schemaVersion).toBe("truthmark-lifecycle/v0");
      expect(dryPlan.applied).toBe(false);
      expect(applyPlan.applied).toBe(true);
      expect(applyPlan.entries).toEqual(dryPlan.entries);
      await expect(fs.access(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
      expect(await repo.readFile("GEMINI.md")).toBe("manual\n");
      expect(await repo.readFile(".agents/user.txt")).toBe("mine\n");
      expect(await repo.readFile(".truthmark/config.yml")).toContain(
        "version: 2",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("revalidates every removal before mutating the first one", async () => {
    const repo = await createTempRepo();
    try {
      await runConfig(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      await runInit(repo.rootDir);
      const planned = await buildLifecyclePlan(
        repo.rootDir,
        (await loadConfig(repo.rootDir)).config!,
        "apply",
        [],
      );
      const removals = planned.entries.filter(
        ({ action }) => action === "remove-file",
      );
      expect(removals.length).toBeGreaterThan(1);
      const first = removals[0];
      const later = removals.at(-1)!;
      const firstBytes = await repo.readFile(first.path);
      await repo.writeFile(later.path, "changed after planning\n");

      const applied = await applyLifecyclePlan(repo.rootDir, planned);

      expect(applied.applicable).toBe(false);
      expect(applied.applied).toBe(false);
      expect(await repo.readFile(first.path)).toBe(firstBytes);
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves user bytes around a managed block", async () => {
    const repo = await createTempRepo();
    try {
      await runConfig(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      await runInit(repo.rootDir);
      const generated = await repo.readFile("AGENTS.md");
      const prefix = "  before\r\n";
      const suffix = "\r\n  after  \r\n\r\n";
      await repo.writeFile(
        "AGENTS.md",
        `${prefix}${generated.trimEnd().replace(/\n/g, "\r\n")}${suffix}`,
      );

      await runUninstall(repo.rootDir, "apply");

      expect(await repo.readFile("AGENTS.md")).toBe(`${prefix}${suffix}`);
    } finally {
      await repo.cleanup();
    }
  });

  it("plans retired preview and helper artifacts without deleting siblings", async () => {
    const repo = await createTempRepo();
    try {
      await runConfig(repo.rootDir);
      await repo.writeFile(
        ".agents/skills/truthmark-preview/SKILL.md",
        "legacy preview\n",
      );
      await repo.writeFile(
        ".agents/skills/truthmark-sync/helper-manifest.yml",
        "legacy helper\n",
      );
      await repo.writeFile(".agents/skills/user/SKILL.md", "mine\n");

      const dryRun = await runUninstall(repo.rootDir, "dry-run");
      const result = await runUninstall(repo.rootDir, "apply");
      const dryPlan = dryRun.data?.lifecyclePlan as {
        entries: { path: string; action: string }[];
      };
      const plan = result.data?.lifecyclePlan as {
        entries: { path: string; action: string }[];
      };

      expect(plan.entries).toEqual(dryPlan.entries);
      expect(plan.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ".agents/skills/truthmark-preview/SKILL.md",
          }),
          expect.objectContaining({
            path: ".agents/skills/truthmark-sync/helper-manifest.yml",
          }),
        ]),
      );
      expect(await repo.readFile(".agents/skills/user/SKILL.md")).toBe(
        "mine\n",
      );
    } finally {
      await repo.cleanup();
    }
  });
});
