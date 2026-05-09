import path from "node:path";
import { fileURLToPath } from "node:url";

import { execa } from "execa";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("package tarball contents", () => {
  it("includes localized README files linked from the published README", async () => {
    const { stdout } = await execa("npm", ["pack", "--dry-run", "--json"], {
      cwd: repoRoot,
    });
    const packOutput = JSON.parse(stdout) as Array<{ files: Array<{ path: string }> }>;
    const tarballPaths = packOutput[0]?.files.map((file) => file.path) ?? [];

    expect(tarballPaths).toEqual(
      expect.arrayContaining([
        "README.de.md",
        "README.es.md",
        "README.ru.md",
        "README.zh.md",
      ]),
    );
  });
});
