import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { createTempRepo } from "../helpers/temp-repo.js";
import { runCli } from "../helpers/run-cli.js";

describe("init and check workflow acceptance", () => {
  it("creates usable workflow files and reports no error diagnostics in a healthy repository", async () => {
    const repo = await createTempRepo();

    try {
      const configResult = await runCli(["config", "--json"], { cwd: repo.rootDir });
      expect(configResult.exitCode).toBe(0);

      const initResult = await runCli(["init", "--json"], { cwd: repo.rootDir });

      expect(initResult.exitCode).toBe(0);

      const initPayload = JSON.parse(initResult.stdout) as {
        command: string;
      };

      expect(initPayload.command).toBe("init");

      await expect(fs.stat(`${repo.rootDir}/.truthmark/config.yml`)).resolves.toBeTruthy();
      await expect(fs.stat(`${repo.rootDir}/docs/truthmark/areas.md`)).resolves.toBeTruthy();
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.codex/skills/truthmark-structure/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.codex/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.codex/skills/truthmark-realize/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.codex/skills/truthmark-check/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.claude/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();

      const checkResult = await runCli(["check", "--json"], { cwd: repo.rootDir });

      expect(checkResult.exitCode).toBe(0);

      const checkPayload = JSON.parse(checkResult.stdout) as {
        command: string;
        diagnostics: Array<{ severity: string }>;
        data?: {
          branchScope?: {
            identity: string;
            worktreePath: string;
          };
        };
      };

      expect(checkPayload.command).toBe("check");
      expect(checkPayload.diagnostics.filter((diagnostic) => diagnostic.severity === "error")).toHaveLength(
        0,
      );
      expect(checkPayload.data?.branchScope?.identity).toBe("unborn:main");
      expect(checkPayload.data?.branchScope?.worktreePath).toBe(repo.rootDir);
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps check validation-only after init when functional code changes exist", async () => {
    const repo = await createTempRepo();

    try {
      const configResult = await runCli(["config", "--json"], { cwd: repo.rootDir });
      expect(configResult.exitCode).toBe(0);

      const initResult = await runCli(["init", "--json"], { cwd: repo.rootDir });

      expect(initResult.exitCode).toBe(0);

      await repo.writeFile(
        "docs/features/authentication.md",
        "---\nstatus: active\ndoc_type: feature\nlast_reviewed: 2026-05-06\nsource_of_truth:\n  - ../../../src/auth/session.ts\n---\n\n# Authentication\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );
      await repo.writeFile("src/auth/session.ts", "export const session = true;\n");

      const checkResult = await runCli(["check", "--json"], { cwd: repo.rootDir });

      expect(checkResult.exitCode).toBe(0);

      const payload = JSON.parse(checkResult.stdout) as {
        command: string;
        data?: {
          branchScope?: {
            identity: string;
          };
          truthSync?: unknown;
        };
      };

      expect(payload.command).toBe("check");
      expect(payload.data?.branchScope?.identity).toBe("unborn:main");
      expect(payload.data?.truthSync).toBeUndefined();
    } finally {
      await repo.cleanup();
    }
  });
});
