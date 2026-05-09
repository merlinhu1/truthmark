import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { TRUTHMARK_VERSION } from "../src/version.js";

describe("TRUTHMARK_VERSION", () => {
  it("matches package.json so generated workflow staleness markers track releases", async () => {
    const packageJson = JSON.parse(
      await fs.readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as { version: string };

    expect(TRUTHMARK_VERSION).toBe(packageJson.version);
  });
});
