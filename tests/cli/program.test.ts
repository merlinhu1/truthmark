import fs from "node:fs/promises";

import { describe, it } from "node:test";
import { expect } from "expect";

import { TRUTHMARK_BLOCK_START } from "../../src/templates/agents-block.js";
import { runCli } from "../helpers/run-cli.js";
import { buildProgram } from "../../src/cli/program.js";
import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("CLI program", () => {
  it("describes index as workflow routing metadata instead of semantic code indexing", () => {
    const program = buildProgram();
    const indexCommand = program.commands.find(
      (command) => command.name() === "index",
    );

    expect(indexCommand?.description()).toBe(
      "Inspect derived Truthmark workflow routing metadata for the current checkout.",
    );
  });

  it("requires exactly one uninstall execution mode", async () => {
    const noMode = await runCli(["uninstall"]);
    const dualMode = await runCli(["uninstall", "--dry-run", "--apply"]);

    expect(noMode.exitCode).not.toBe(0);
    expect(noMode.stderr).toContain("exactly one");
    expect(dualMode.exitCode).not.toBe(0);
    expect(dualMode.stderr).toContain("exactly one");
  });

  it("supports uninstall --dry-run and --apply JSON output", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir);
      const configPath = `${repo.rootDir}/.truthmark/config.yml`;
      const configFile = await fs.readFile(configPath, "utf8");
      await fs.writeFile(
        configPath,
        configFile.replace("version: 2\n", "version: 2\nplatforms:\n  - codex\n"),
        "utf8",
      );
      await runInit(repo.rootDir);

      const dryResult = await runCli(["uninstall", "--dry-run", "--json"], {
        cwd: repo.rootDir,
      });
      const applyResult = await runCli(["uninstall", "--apply", "--json"], {
        cwd: repo.rootDir,
      });
      const dryPayload = JSON.parse(dryResult.stdout) as {
        command: string;
        data: { lifecyclePlan: { mode: string } };
      };
      const applyPayload = JSON.parse(applyResult.stdout) as {
        command: string;
        data: { lifecyclePlan: { mode: string; applied: boolean } };
      };

      expect(dryResult.exitCode).toBe(0);
      expect(applyResult.exitCode).toBe(0);
      expect(dryPayload.command).toBe("uninstall");
      expect(applyPayload.command).toBe("uninstall");
      expect(dryPayload.data.lifecyclePlan.mode).toBe("dry-run");
      expect(applyPayload.data.lifecyclePlan.mode).toBe("apply");
      expect(applyPayload.data.lifecyclePlan.applied).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("fails uninstall when config is missing before planning", async () => {
    const repo = await createTempRepo();

    try {
      const result = await runCli(["uninstall", "--dry-run", "--json"], {
        cwd: repo.rootDir,
      });
      const payload = JSON.parse(result.stdout) as {
        command: string;
        diagnostics: Array<{ message: string }>;
        data: { lifecyclePlan: { applicable: boolean; applied: boolean } };
      };

      expect(result.exitCode).not.toBe(0);
      expect(payload.command).toBe("uninstall");
      expect(
        payload.diagnostics.some((diagnostic) =>
          diagnostic.message.includes("Missing .truthmark/config.yml."),
        ),
      ).toBe(true);
      expect(payload.data.lifecyclePlan.applicable).toBe(false);
      expect(payload.data.lifecyclePlan.applied).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("does not apply lifecycle mutations when uninstall encounters malformed markers", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir);
      const configPath = `${repo.rootDir}/.truthmark/config.yml`;
      const configFile = await fs.readFile(configPath, "utf8");
      await fs.writeFile(
        configPath,
        configFile.replace(
          "version: 2\n",
          "version: 2\nplatforms:\n  - codex\n",
        ),
        "utf8",
      );
      await runInit(repo.rootDir);

      const agentsPath = `${repo.rootDir}/AGENTS.md`;
      const malformed = `${TRUTHMARK_BLOCK_START}\nmanual\n${TRUTHMARK_BLOCK_START}\n`;
      const before = await fs.readFile(agentsPath, "utf8");
      await fs.writeFile(agentsPath, malformed, "utf8");

      const result = await runCli(["uninstall", "--apply", "--json"], {
        cwd: repo.rootDir,
      });
      const payload = JSON.parse(result.stdout) as {
        command: string;
        data: {
          lifecyclePlan: {
            applicable: boolean;
            applied: boolean;
            entries: Array<{ action: string; path: string }>;
          };
        };
      };

      expect(result.exitCode).not.toBe(0);
      expect(payload.command).toBe("uninstall");
      expect(payload.data.lifecyclePlan.applicable).toBe(false);
      expect(payload.data.lifecyclePlan.applied).toBe(false);
      expect(payload.data.lifecyclePlan.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: "manual-review",
            path: "AGENTS.md",
          }),
        ]),
      );
      expect(await fs.readFile(agentsPath, "utf8")).toBe(malformed);
      expect(before).toContain("Truthmark Workflow");
    } finally {
      await repo.cleanup();
    }
  });
});
