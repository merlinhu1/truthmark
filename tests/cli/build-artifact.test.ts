import fs from "node:fs/promises";
import os from "node:os";
import { execa } from "execa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { posixOnlyIt } from "../helpers/platform.js";
import { expect } from "expect";
import { parse } from "yaml";

import { writeTruthmarkConfig } from "../helpers/truthmark-config.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const workspaceRoot = path.resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const builtCliEntrypoint = path.resolve(
  fileURLToPath(new URL("../../dist/main.js", import.meta.url)),
);

const runBuiltCli = async (
  repoDir: string,
  args: string[],
): Promise<Awaited<ReturnType<typeof execa>>> => {
  return execa(process.execPath, [builtCliEntrypoint, ...args], {
    cwd: repoDir,
    reject: false,
  });
};

describe("built truthmark CLI", () => {
  it("renders top-level help from the built artifact", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(buildResult.exitCode).toBe(0);

    const result = await execa(
      process.execPath,
      [builtCliEntrypoint, "--help"],
      {
        cwd: workspaceRoot,
        reject: false,
      },
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: truthmark");
  });

  it("initializes a fresh external repository and rejects config", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });
    expect(buildResult.exitCode).toBe(0);

    const repo = await createTempRepo();
    try {
      const initResult = await runBuiltCli(repo.rootDir, [
        "init",
        "--platform",
        "codex",
        "--json",
      ]);
      const config = parse(await repo.readFile(".truthmark/config.yml")) as {
        version: number;
        platforms: string[];
      };
      const removedResult = await runBuiltCli(repo.rootDir, ["config"]);

      expect(initResult.exitCode).toBe(0);
      if (typeof initResult.stdout !== "string") {
        throw new Error("Built CLI init JSON output should be a string.");
      }
      expect(JSON.parse(initResult.stdout)).toMatchObject({ command: "init" });
      expect(config).toMatchObject({ version: 2, platforms: ["codex"] });
      expect(await repo.readFile("AGENTS.md")).toContain("Truthmark Workflow");
      expect(removedResult.exitCode).not.toBe(0);
      expect(removedResult.stderr).toContain("unknown command 'config'");
    } finally {
      await repo.cleanup();
    }
  });

  posixOnlyIt("renders top-level help when invoked through a linked path", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(buildResult.exitCode).toBe(0);

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-cli-"));
    const linkedCliEntrypoint = path.join(tempDir, "truthmark");

    await fs.symlink(builtCliEntrypoint, linkedCliEntrypoint);

    try {
      const result = await execa(
        process.execPath,
        [linkedCliEntrypoint, "--help"],
        {
          cwd: workspaceRoot,
          reject: false,
        },
      );

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Usage: truthmark");
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders check help without workflow helper mode from the built artifact", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(buildResult.exitCode).toBe(0);

    const result = await execa(
      process.execPath,
      [builtCliEntrypoint, "check", "--help"],
      {
        cwd: workspaceRoot,
        reject: false,
      },
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain("--workflow");
  });

  it("rejects old helper-mode invocations through the built CLI artifact", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(buildResult.exitCode).toBe(0);

    const repo = await createTempRepo();

    try {
      await writeTruthmarkConfig(repo.rootDir);
      await runInit(repo.rootDir);
      const result = await execa(
        process.execPath,
        [builtCliEntrypoint, "check", "--json", "--workflow", "truth-sync"],
        {
          cwd: repo.rootDir,
          reject: false,
        },
      );

      expect(result.exitCode).not.toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr.toLowerCase()).toContain("unknown option");
    } finally {
      await repo.cleanup();
    }
  });

  it("runs workflow status from the built artifact outside the source repo cwd", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(buildResult.exitCode).toBe(0);
    expect(path.isAbsolute(builtCliEntrypoint)).toBe(true);

    const repo = await createTempRepo();

    try {
      await writeTruthmarkConfig(repo.rootDir);
      await runInit(repo.rootDir);
      const result = await execa(
        process.execPath,
        [
          builtCliEntrypoint,
          "workflow",
          "status",
          "--workflow",
          "truthmark-check",
          "--json",
        ],
        {
          cwd: repo.rootDir,
          reject: false,
        },
      );
      const output = JSON.parse(result.stdout) as {
        command: string;
        data: { workflowState: { schemaVersion: string; workflow: string } };
      };

      expect(result.exitCode).toBe(0);
      expect(output.command).toBe("workflow status");
      expect(output.data.workflowState.schemaVersion).toBe(
        "truthmark-workflow/v0",
      );
      expect(output.data.workflowState.workflow).toBe("truthmark-check");
    } finally {
      await repo.cleanup();
    }
  });

  it("supports uninstall dry-run and apply from the built artifact without mutating on dry-run", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });
    expect(buildResult.exitCode).toBe(0);

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

      await fs.writeFile(`${repo.rootDir}/GEMINI.md`, "manual\n", "utf8");
      await fs.writeFile(`${repo.rootDir}/.agents/user.txt`, "authored\n", "utf8");

      const managedBefore = await fs.readFile(
        `${repo.rootDir}/AGENTS.md`,
        "utf8",
      );

      const dryRunResult = await runBuiltCli(repo.rootDir, [
        "uninstall",
        "--dry-run",
        "--json",
      ]);
      expect(dryRunResult.exitCode).toBe(0);
      const managedAfterDryRun = await fs.readFile(
        `${repo.rootDir}/AGENTS.md`,
        "utf8",
      );
      expect(managedAfterDryRun).toBe(managedBefore);

      const applyResult = await runBuiltCli(repo.rootDir, [
        "uninstall",
        "--apply",
        "--json",
      ]);
      expect(applyResult.exitCode).toBe(0);
      if (typeof applyResult.stdout !== "string") {
        throw new Error("Built CLI uninstall json output should be a string.");
      }

      const payload = JSON.parse(applyResult.stdout) as {
        data: { lifecyclePlan: { mode: string; applied: boolean } };
      };
      expect(payload.data.lifecyclePlan.mode).toBe("apply");
      expect(payload.data.lifecyclePlan.applied).toBe(true);
      expect(await fs.readFile(`${repo.rootDir}/GEMINI.md`, "utf8")).toBe("manual\n");
      expect(await fs.readFile(`${repo.rootDir}/.agents/user.txt`, "utf8")).toBe(
        "authored\n",
      );
      await expect(fs.access(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });
});
