import { afterEach, describe, expect, it } from "vitest";

import { validateEvidenceReferences } from "../../src/evidence/validate.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

describe("validateEvidenceReferences", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("reports deleted referenced files", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile(
      "docs/truth/sample.md",
      "---\nstatus: active\nsource_of_truth:\n  - ../../src/missing.ts\n---\n# Sample\n",
    );

    const diagnostics = await validateEvidenceReferences(repo.rootDir, ["docs/truth/sample.md"]);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        category: "freshness",
        severity: "error",
        file: "docs/truth/sample.md",
      }),
    );
  });

  it("accepts source_of_truth glob references that match repository files", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await repo.writeFile(
      "docs/truth/sample.md",
      "---\nstatus: active\nsource_of_truth:\n  - ../../src/**/*.ts\n---\n# Sample\n",
    );

    const diagnostics = await validateEvidenceReferences(repo.rootDir, ["docs/truth/sample.md"]);

    expect(diagnostics).toEqual([]);
  });

  it("resolves bare source_of_truth filenames relative to the truth doc", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await repo.writeFile("docs/truth/overview.md", "# Overview\n");
    await repo.writeFile(
      "docs/truth/sample.md",
      "---\nstatus: active\nsource_of_truth:\n  - overview.md\n---\n# Sample\n",
    );

    const diagnostics = await validateEvidenceReferences(repo.rootDir, ["docs/truth/sample.md"]);

    expect(diagnostics).toEqual([]);
  });

  it("reports evidence line spans outside the file even without a content hash", async () => {
    const repo = await createTempRepo();
    repos.push(repo);

    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await repo.writeFile(
      "docs/truth/sample.md",
      `---
status: active
---
# Sample

\`\`\`yaml
evidence:
  - path: ../../src/index.ts
    start_line: 10
    end_line: 12
\`\`\`
`,
    );

    const diagnostics = await validateEvidenceReferences(repo.rootDir, ["docs/truth/sample.md"]);

    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        category: "freshness",
        severity: "error",
        file: "docs/truth/sample.md",
        message: expect.stringContaining("outside the file"),
      }),
    );
  });
});
