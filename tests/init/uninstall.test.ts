import fs from "node:fs/promises";
import path from "node:path";

import { describe, it } from "node:test";
import { expect } from "expect";

import { writeTruthmarkConfig } from "../helpers/truthmark-config.js";
import { runInit } from "../../src/init/init.js";
import { runUninstall } from "../../src/init/uninstall.js";
import type { LifecyclePlan, LifecyclePlanEntry } from "../../src/init/lifecycle.js";
import { TRUTHMARK_BLOCK_START } from "../../src/templates/agents-block.js";

import { createTempRepo } from "../helpers/temp-repo.js";

const getLifecyclePlan = (
  result: Awaited<ReturnType<typeof runUninstall>>,
): LifecyclePlan | undefined =>
  (result.data?.lifecyclePlan as LifecyclePlan | undefined);

describe("uninstall command", () => {
  it("fails fast with missing configuration and applies no writes", async () => {
    const repo = await createTempRepo();

    try {
      const result = await runUninstall(repo.rootDir, "dry-run");
      const lifecyclePlan = getLifecyclePlan(result);

      expect(result.summary).toContain("Truthmark uninstall requires a valid");
      expect(lifecyclePlan?.applicable).toBe(false);
      expect(lifecyclePlan?.applied).toBe(false);
      await expect(
        fs.access(`${repo.rootDir}/AGENTS.md`),
      ).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });

  it("reconciles install output with dry-run then apply with shared preservation of authored files", async () => {
    const repo = await createTempRepo();

    try {
      await writeTruthmarkConfig(repo.rootDir);
      const configPath = `${repo.rootDir}/.truthmark/config.yml`;
      const configFile = await fs.readFile(configPath, "utf8");
      await fs.writeFile(
        configPath,
        configFile.replace("version: 2\n", "version: 2\nplatforms:\n  - codex\n"),
        "utf8",
      );
      await runInit(repo.rootDir);

      await fs.writeFile(`${repo.rootDir}/AGENTS.md`, "manual\n", "utf8");
      await fs.writeFile(
        `${repo.rootDir}/.agents/user.txt`,
        "authored\n",
        "utf8",
      );
      const dryRun = await runUninstall(repo.rootDir, "dry-run");
      const apply = await runUninstall(repo.rootDir, "apply");
      const dryPlan = getLifecyclePlan(dryRun);
      const applyPlan = getLifecyclePlan(apply);

      expect(dryPlan?.entries).toEqual(applyPlan?.entries);
      expect(dryPlan?.applicable).toBe(true);
      expect(dryPlan?.applied).toBe(false);
      expect(applyPlan?.applied).toBe(true);
      await expect(fs.access(`${repo.rootDir}/AGENTS.md`)).resolves.toBeUndefined();
      expect(await fs.readFile(`${repo.rootDir}/.agents/user.txt`, "utf8")).toBe(
        "authored\n",
      );
      expect(await fs.readFile(`${repo.rootDir}/.truthmark/config.yml`, "utf8")).toContain(
        "platforms:\n  - codex",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("blocks uninstall when managed instruction markers are malformed", async () => {
    const repo = await createTempRepo();

    try {
      await writeTruthmarkConfig(repo.rootDir);
      const configPath = `${repo.rootDir}/.truthmark/config.yml`;
      const configFile = await fs.readFile(configPath, "utf8");
      await fs.writeFile(
        configPath,
        configFile.replace("version: 2\n", "version: 2\nplatforms:\n  - codex\n"),
        "utf8",
      );
      await runInit(repo.rootDir);

      const malformed = `${TRUTHMARK_BLOCK_START}\nalpha\n${TRUTHMARK_BLOCK_START}\nbeta\n`;
      await fs.writeFile(`${repo.rootDir}/AGENTS.md`, malformed, "utf8");
      const before = await fs.readFile(`${repo.rootDir}/AGENTS.md`, "utf8");

      const result = await runUninstall(repo.rootDir, "apply");
      const plan = getLifecyclePlan(result);

      expect(plan?.applicable).toBe(false);
      expect(plan?.applied).toBe(false);
      expect(await fs.readFile(`${repo.rootDir}/AGENTS.md`, "utf8")).toBe(before);
      expect(plan?.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: "manual-review",
            path: "AGENTS.md",
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("runs the same lifecycle plan for nested invocation and preserves config", async () => {
    const repo = await createTempRepo();

    try {
      await writeTruthmarkConfig(repo.rootDir);
      const configPath = `${repo.rootDir}/.truthmark/config.yml`;
      const configFile = await fs.readFile(configPath, "utf8");
      await fs.writeFile(
        configPath,
        configFile.replace("version: 2\n", "version: 2\nplatforms:\n  - codex\n"),
        "utf8",
      );
      await runInit(repo.rootDir);

      await fs.mkdir(`${repo.rootDir}/nested`);
      const nested = `${repo.rootDir}/nested`;

      const dry = await runUninstall(nested, "dry-run");
      const apply = await runUninstall(nested, "apply");
      const dryPlan = getLifecyclePlan(dry);
      const applyPlan = getLifecyclePlan(apply);

      expect(dryPlan?.mode).toBe("dry-run");
      expect(applyPlan?.mode).toBe("apply");
      expect(dryPlan?.entries).toEqual(applyPlan?.entries);
      expect(applyPlan?.applicable).toBe(true);
      expect(applyPlan?.applied).toBe(true);
      expect(await fs.readFile(configPath, "utf8")).toContain(
        "platforms:\n  - codex",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("does not remove unsafe generated files when a managed surface escapes containment", async () => {
    const repo = await createTempRepo();

    try {
      await writeTruthmarkConfig(repo.rootDir);
      const configPath = `${repo.rootDir}/.truthmark/config.yml`;
      const configFile = await fs.readFile(configPath, "utf8");
      await fs.writeFile(
        configPath,
        configFile.replace("version: 2\n", "version: 2\nplatforms:\n  - codex\n"),
        "utf8",
      );
      await runInit(repo.rootDir);

      const outsideAgents = path.join(repo.rootDir, "..", "truthmark-uninstall-unsafe-agents");
      await fs.mkdir(outsideAgents, { recursive: true });
      const outsideTarget = path.join(outsideAgents, "AGENTS.md");
      await fs.writeFile(outsideTarget, "# outside\n", "utf8");
      await fs.rm(`${repo.rootDir}/AGENTS.md`);
      await fs.symlink(outsideTarget, `${repo.rootDir}/AGENTS.md`);

      const result = await runUninstall(repo.rootDir, "apply");
      const plan = getLifecyclePlan(result);
      const agentsEntry = plan?.entries.find(
        (entry: LifecyclePlanEntry) => entry.path === "AGENTS.md",
      );

      expect(plan?.applicable).toBe(false);
      expect(plan?.applied).toBe(false);
      expect(agentsEntry).toEqual(
        expect.objectContaining({
          action: "manual-review",
          path: "AGENTS.md",
        }),
      );
    } finally {
      await repo.cleanup();
      await fs.rm(path.join(path.dirname(repo.rootDir), "truthmark-uninstall-unsafe-agents"), {
        force: true,
        recursive: true,
      });
    }
  });
});
