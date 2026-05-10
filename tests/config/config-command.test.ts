import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { runConfig } from "../../src/config/command.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("runConfig", () => {
  it("creates only .truthmark/config.yml by default", async () => {
    const repo = await createTempRepo();

    try {
      const result = await runConfig(repo.rootDir, {});

      expect(result.command).toBe("config");
      expect(await repo.readFile(".truthmark/config.yml")).toContain("layout: hierarchical");
      expect(await repo.readFile(".truthmark/config.yml")).toContain(
        "area_files_root: docs/truthmark/areas",
      );
      const config = await repo.readFile(".truthmark/config.yml");
      expect(config).toContain("  - github-copilot");
      expect(config).toContain("  - gemini-cli");
      expect(config).toContain("features: docs/features");
      expect(config).toContain("docs/features/**/*.md");
      expect(config).not.toContain("features_current");
      expect(config).not.toContain("docs/features/current");
      expect(config).not.toContain("api: docs/api");
      expect(config).not.toContain("guides: docs/guides");
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/TRUTHMARK.md`)).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/docs/truthmark/areas.md`)).rejects.toThrow();
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "action",
            file: ".truthmark/config.yml",
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("does not overwrite an existing config without force", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(".truthmark/config.yml", "version: 1\ncustom: true\n");

      const result = await runConfig(repo.rootDir, {});

      expect(await repo.readFile(".truthmark/config.yml")).toBe("version: 1\ncustom: true\n");
      expect(result.summary).toContain("already exists");
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "config",
            severity: "review",
            file: ".truthmark/config.yml",
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("overwrites config only with force", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(".truthmark/config.yml", "version: 1\ncustom: true\n");

      const result = await runConfig(repo.rootDir, { force: true });

      expect(await repo.readFile(".truthmark/config.yml")).toContain("layout: hierarchical");
      expect(await repo.readFile(".truthmark/config.yml")).not.toContain("custom: true");
      expect(result.summary).toContain("Wrote");
    } finally {
      await repo.cleanup();
    }
  });

  it("renders config to stdout data without writing when stdout is requested", async () => {
    const repo = await createTempRepo();

    try {
      const result = await runConfig(repo.rootDir, { stdout: true });

      expect(result.data).toMatchObject({
        path: ".truthmark/config.yml",
      });
      expect(String(result.data?.content)).toContain("layout: hierarchical");
      await expect(fs.stat(`${repo.rootDir}/.truthmark/config.yml`)).rejects.toThrow();
    } finally {
      await repo.cleanup();
    }
  });
});
