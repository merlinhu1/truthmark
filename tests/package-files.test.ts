import path from "node:path";
import { fileURLToPath } from "node:url";

import { execa } from "execa";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const localizedReadmeFiles = [
  "docs/README.ar.md",
  "docs/README.de.md",
  "docs/README.el.md",
  "docs/README.es.md",
  "docs/README.fr.md",
  "docs/README.id.md",
  "docs/README.it.md",
  "docs/README.ja.md",
  "docs/README.ko.md",
  "docs/README.md",
  "docs/README.pl.md",
  "docs/README.pt-BR.md",
  "docs/README.ru.md",
  "docs/README.tr.md",
  "docs/README.vi.md",
  "docs/README.zh.md",
];

const expectedPackageFiles = [
  "LICENSE",
  ...localizedReadmeFiles,
  "README.md",
  "dist/main.js",
  "dist/main.js.map",
  "package.json",
];

type PackFile = {
  path: string;
  mode: number;
};

const parsePackOutput = (
  stdout: string,
): Array<{
  files: PackFile[];
}> => {
  const jsonStartIndex = stdout.search(/^\s*\[\s*\{\s*$/m);

  if (jsonStartIndex === -1) {
    throw new SyntaxError("npm pack output did not include a JSON array");
  }

  return JSON.parse(stdout.slice(jsonStartIndex)) as Array<{
    files: PackFile[];
  }>;
};

const readPackageJson = async (): Promise<{
  scripts?: Record<string, string>;
}> => {
  const { stdout } = await execa(
    process.execPath,
    ["-e", "console.log(JSON.stringify(require('./package.json')))"],
    { cwd: repoRoot },
  );

  return JSON.parse(stdout) as { scripts?: Record<string, string> };
};

const readPackFiles = async (): Promise<PackFile[]> => {
  const { stdout } = await execa(
    "npm",
    ["pack", "--dry-run", "--json", "--silent"],
    {
      cwd: repoRoot,
    },
  );
  const packOutput = parsePackOutput(stdout);

  return packOutput[0]?.files ?? [];
};

describe("package and release integrity", () => {
  it("includes localized README files linked from the published README", async () => {
    const tarballPaths = (await readPackFiles()).map((file) => file.path);

    expect(tarballPaths).toEqual(
      expect.arrayContaining(localizedReadmeFiles),
    );
  });

  it("publishes only expected files with intentional executable modes", async () => {
    const packFiles = await readPackFiles();
    const modesByPath = new Map(
      packFiles.map((file) => [file.path, file.mode]),
    );

    expect(packFiles.map((file) => file.path).sort()).toEqual(
      [...expectedPackageFiles].sort(),
    );
    expect(modesByPath.get("dist/main.js")).toBe(0o755);

    for (const filePath of expectedPackageFiles.filter(
      (entry) => entry !== "dist/main.js",
    )) {
      expect(modesByPath.get(filePath)).toBe(0o644);
    }
  });

  it("exposes package validation scripts for local and release checks", async () => {
    const packageJson = await readPackageJson();

    expect(packageJson.scripts).toMatchObject({
      lint: expect.any(String),
      "format:check": expect.any(String),
      "package:check": expect.any(String),
      "release:check": expect.any(String),
    });
  });

  it("parses npm pack JSON after bracketed build output", () => {
    const packOutput = parsePackOutput(`build [1/2]
[
  {
    "files": []
  }
]`);

    expect(packOutput).toEqual([{ files: [] }]);
  });
});
