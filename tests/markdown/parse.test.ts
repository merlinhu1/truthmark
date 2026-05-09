import { describe, expect, it } from "vitest";

import { createTempRepo } from "../helpers/temp-repo.js";
import { parseMarkdownDocument } from "../../src/markdown/parse.js";
import { resolveAuthorityPaths } from "../../src/routing/authority.js";

describe("parseMarkdownDocument", () => {
  it("extracts frontmatter, headings, and internal links", () => {
    const document = parseMarkdownDocument(`---
status: active
---

# Authentication

See [Auth API](docs/api/authentication.md) and [anchor](#timeouts).

## Timeouts

Ignore [external](https://example.com).
`);

    expect(document.frontmatter).toMatchObject({
      status: "active",
    });
    expect(document.headings).toEqual([
      { depth: 1, text: "Authentication" },
      { depth: 2, text: "Timeouts" },
    ]);
    expect(document.internalLinks).toEqual(["docs/api/authentication.md", "#timeouts"]);
  });
});

describe("resolveAuthorityPaths", () => {
  it("preserves declared authority order while expanding globs deterministically", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("TRUTHMARK.md", "# Truthmark\n");
      await repo.writeFile("docs/guides/beta.md", "# Beta\n");
      await repo.writeFile("docs/guides/alpha.md", "# Alpha\n");
      await repo.writeFile("docs/api/authentication.md", "# Auth API\n");

      const result = await resolveAuthorityPaths(repo.rootDir, [
        "TRUTHMARK.md",
        "docs/guides/*.md",
        "docs/api/*.md",
      ]);

      expect(result.diagnostics).toEqual([]);
      expect(result.paths).toEqual([
        "TRUTHMARK.md",
        "docs/guides/alpha.md",
        "docs/guides/beta.md",
        "docs/api/authentication.md",
      ]);
    } finally {
      await repo.cleanup();
    }
  });
});
