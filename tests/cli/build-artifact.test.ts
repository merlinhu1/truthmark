import fs from "node:fs/promises";
import os from "node:os";
import { execa } from "execa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { createTempRepo } from "../helpers/temp-repo.js";

const workspaceRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const builtCliEntrypoint = path.resolve(
  fileURLToPath(new URL("../../dist/main.js", import.meta.url)),
);

describe("built truthmark CLI", () => {
  it("renders top-level help from the built artifact", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(buildResult.exitCode).toBe(0);

    const result = await execa(process.execPath, [builtCliEntrypoint, "--help"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: truthmark");
  });

  it("renders top-level help when invoked through a linked path", async () => {
    const buildResult = await execa("npm", ["run", "build"], {
      cwd: workspaceRoot,
      reject: false,
    });

    expect(buildResult.exitCode).toBe(0);

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-cli-"));
    const linkedCliEntrypoint = path.join(tempDir, "truthmark");

    await fs.symlink(builtCliEntrypoint, linkedCliEntrypoint);

    try {
      const result = await execa(process.execPath, [linkedCliEntrypoint, "--help"], {
        cwd: workspaceRoot,
        reject: false,
      });

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

    const result = await execa(process.execPath, [builtCliEntrypoint, "check", "--help"], {
      cwd: workspaceRoot,
      reject: false,
    });

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
});
