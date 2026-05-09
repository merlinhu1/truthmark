import { describe, expect, it } from "vitest";

import { runCli } from "../helpers/run-cli.js";

const forbiddenCommands = [
  "packet",
  "review",
  "scan",
  "doctor",
  "build",
  "context",
  "realize",
];

describe("truthmark CLI", () => {
  it("lists config, init, and check in top-level help", async () => {
    const result = await runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("config");
    expect(result.stdout).toContain("init");
    expect(result.stdout).toContain("check");

    for (const command of forbiddenCommands) {
      expect(result.stdout).not.toContain(command);
    }
  });

  it("shows init help", async () => {
    const result = await runCli(["init", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: truthmark init");
    expect(result.stdout).toContain("--json");
  });

  it("shows config help", async () => {
    const result = await runCli(["config", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: truthmark config");
    expect(result.stdout).toContain("--json");
    expect(result.stdout).toContain("--stdout");
    expect(result.stdout).toContain("--force");
  });

  it("shows check help", async () => {
    const result = await runCli(["check", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Usage: truthmark check");
    expect(result.stdout).toContain("--json");
    expect(result.stdout).not.toContain("--workflow");
  });

  it("returns valid JSON for check", async () => {
    const result = await runCli(["check", "--json"]);

    expect(result.exitCode).toBe(0);

    const payload = JSON.parse(result.stdout) as {
      command: string;
      summary: string;
      diagnostics: unknown[];
    };

    expect(payload.command).toBe("check");
    expect(typeof payload.summary).toBe("string");
    expect(payload.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(payload.diagnostics)).toBe(true);
  });
});
