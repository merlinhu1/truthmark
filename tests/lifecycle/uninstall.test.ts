import fs from "node:fs/promises";
import { describe, it } from "node:test";
import { posixOnlyIt } from "../helpers/platform.js";

import { expect } from "expect";

import { writeTruthmarkConfig } from "../helpers/truthmark-config.js";
import { loadConfig } from "../../src/config/load.js";
import { runInit } from "../../src/init/init.js";
import {
  applyLifecyclePlan,
  buildLifecyclePlan,
} from "../../src/init/lifecycle.js";
import { runUninstall } from "../../src/init/uninstall.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("generated surface lifecycle", () => {
  posixOnlyIt("follows an in-worktree managed instruction alias and preserves it on uninstall", async () => {
    const repo = await createTempRepo();
    try {
      await writeTruthmarkConfig(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      await repo.writeFile("shared.txt", "authored\n");
      await fs.symlink("shared.txt", `${repo.rootDir}/AGENTS.md`);
      await fs.symlink("shared.txt", `${repo.rootDir}/CLAUDE.md`);

      const result = await runInit(repo.rootDir);

      expect(result.summary).toContain("Initialized");
      expect(await repo.readFile("shared.txt")).toContain("Truthmark Workflow");

      await runUninstall(repo.rootDir, "apply");

      expect(await repo.readFile("shared.txt")).toBe("authored\n\n\n");
      expect((await fs.lstat(`${repo.rootDir}/AGENTS.md`)).isSymbolicLink()).toBe(
        true,
      );
      expect((await fs.lstat(`${repo.rootDir}/CLAUDE.md`)).isSymbolicLink()).toBe(
        true,
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("reconciles a disabled platform without touching sibling files", async () => {
    const repo = await createTempRepo();
    try {
      await writeTruthmarkConfig(repo.rootDir);
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

      await expect(
        fs.access(`${repo.rootDir}/.claude/rules/truthmark.md`),
      ).rejects.toThrow();
      expect(await repo.readFile(".claude/user.txt")).toBe("mine\n");
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            severity: "action",
            file: ".claude/rules/truthmark.md",
            message: expect.stringContaining("remove-file"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  posixOnlyIt("keeps an active target when an inactive managed alias points to it", async () => {
    const repo = await createTempRepo();
    try {
      await writeTruthmarkConfig(repo.rootDir);
      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [codex, claude-code]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      await repo.writeFile(".claude/rules/truthmark.md", "");
      await fs.symlink(
        ".claude/rules/truthmark.md",
        `${repo.rootDir}/AGENTS.md`,
      );
      await runInit(repo.rootDir);

      await repo.writeFile(
        ".truthmark/config.yml",
        "version: 2\nplatforms: [claude-code]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
      );
      const result = await runInit(repo.rootDir);

      expect(result.summary).not.toContain("preflight failed");
      expect(await repo.readFile(".claude/rules/truthmark.md")).toContain(
        "Truthmark Workflow",
      );
    } finally {
      await repo.cleanup();
    }
  });

  for (const target of ["external file", "Git metadata"] as const) {
    posixOnlyIt(`rejects a managed alias to ${target}`, async () => {
      const repo = await createTempRepo();
      const outsidePath = `${repo.rootDir}-outside.md`;
      try {
        await writeTruthmarkConfig(repo.rootDir);
        await repo.writeFile(
          ".truthmark/config.yml",
          "version: 2\nplatforms: [codex]\ntruthmark:\n  workspace: docs/truthmark\n  generated:\n    portal:\n      enabled: false\n",
        );
        const targetPath =
          target === "external file"
            ? outsidePath
            : `${repo.rootDir}/.git/HEAD`;
        if (target === "external file")
          await fs.writeFile(targetPath, "outside\n", "utf8");
        const before = await fs.readFile(targetPath, "utf8");
        await fs.symlink(targetPath, `${repo.rootDir}/AGENTS.md`);

        const result = await runInit(repo.rootDir);

        expect(result.summary).toContain("preflight failed");
        expect(await fs.readFile(targetPath, "utf8")).toBe(before);
      } finally {
        await fs.rm(outsidePath, { force: true });
        await repo.cleanup();
      }
    });
  }

  it("plans and applies uninstall while preserving authored files and Gemini", async () => {
    const repo = await createTempRepo();
    try {
      await writeTruthmarkConfig(repo.rootDir);
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
      await writeTruthmarkConfig(repo.rootDir);
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
      await writeTruthmarkConfig(repo.rootDir);
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
      await writeTruthmarkConfig(repo.rootDir);
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
