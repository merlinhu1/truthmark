import { afterEach, describe, it } from "node:test";
import { expect } from "expect";

import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { buildRouteMap } from "../../src/repo-index/route-map.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

describe("buildRouteMap", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("projects Truthmark area routing into route-map/v0", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);

    const routeMap = await buildRouteMap(repo.rootDir);

    expect(routeMap.schemaVersion).toBe("route-map/v0");
    expect(routeMap.routes.length).toBeGreaterThan(0);
    expect(routeMap.routes[0]).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        codeSurface: expect.any(Array),
        truthDocs: expect.any(Array),
      }),
    );
  });

  it("emits merged relationship metadata for duplicate route entries", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);
    await repo.writeFile(
      "docs/truthmark/product/payments/checkout.md",
      "# Checkout Capability\n",
    );
    await repo.writeFile(
      "docs/truthmark/product/payments/refunds.md",
      "# Refunds Capability\n",
    );
    await repo.writeFile(
      "docs/truthmark/engineering/behaviors/checkout.md",
      "# Checkout Behavior\n",
    );
    await repo.writeFile(
      "docs/truthmark/routes/areas.md",
      `# Truthmark Areas

## Checkout

Truth documents:
\`\`\`yaml
truth_documents:
  - path: docs/truthmark/product/payments/checkout.md
    kind: product-capability
  - path: docs/truthmark/product/payments/refunds.md
    kind: product-capability
  - path: docs/truthmark/engineering/behaviors/checkout.md
    kind: engineering-behavior
    realizes:
      - docs/truthmark/product/payments/refunds.md
  - path: docs/truthmark/engineering/behaviors/checkout.md
    kind: engineering-behavior
    realizes:
      - docs/truthmark/product/payments/checkout.md
\`\`\`

Code surface:
- src/checkout/**

Update truth when:
- checkout behavior changes
`,
    );

    const routeMap = await buildRouteMap(repo.rootDir);
    const checkoutRoute = routeMap.routes.find(
      (route) => route.name === "Checkout",
    );
    const checkoutEntry = checkoutRoute?.truthDocumentEntries.find(
      (entry) =>
        entry.path === "docs/truthmark/engineering/behaviors/checkout.md",
    );

    expect(checkoutEntry?.realizes).toEqual([
      "docs/truthmark/product/payments/checkout.md",
      "docs/truthmark/product/payments/refunds.md",
    ]);
  });
});
