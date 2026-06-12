import { describe, expect, it } from "vitest";

import { runCli } from "../helpers/run-cli.js";

describe("truthmark check workflow options", () => {
  it("does not expose workflow helper mode", async () => {
    const help = await runCli(["check", "--help"]);

    expect(help.exitCode).toBe(0);
    expect(help.stdout).not.toContain("--workflow");
  });

  it("rejects old workflow helper invocations as unsupported", async () => {
    const result = await runCli(["check", "--json", "--workflow", "truth-sync"]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr.toLowerCase()).toContain("unknown option");
  });
});

describe("truthmark workflow command surface", () => {
  it("exposes workflow status without workflow instructions", async () => {
    const help = await runCli(["workflow", "--help"]);

    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain("status");
    expect(help.stdout).not.toContain("instructions");
  });

  it("rejects removed workflow instructions invocations as unsupported", async () => {
    const result = await runCli([
      "workflow",
      "instructions",
      "--workflow",
      "truthmark-sync",
      "--json",
    ]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr.toLowerCase()).toContain("unknown command");
  });
});
