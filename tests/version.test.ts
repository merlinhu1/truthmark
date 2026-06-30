import fs from "node:fs/promises";

import { describe, it } from "node:test";
import { expect } from "expect";

import { TRUTHMARK_VERSION } from "../src/version.js";

describe("TRUTHMARK_VERSION", () => {
  it("is read from package.json so generated workflow staleness markers track releases", async () => {
    const packageJson = JSON.parse(
      await fs.readFile(new URL("../package.json", import.meta.url), "utf8"),
    ) as { version: string };
    const versionSource = await fs.readFile(
      new URL("../src/version.ts", import.meta.url),
      "utf8",
    );

    expect(TRUTHMARK_VERSION).toBe(packageJson.version);
    expect(versionSource).not.toContain(`"${packageJson.version}"`);
  });
});
