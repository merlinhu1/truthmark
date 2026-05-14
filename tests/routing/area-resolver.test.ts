import { describe, expect, it } from "vitest";

import { resolveAreaRouting } from "../../src/routing/area-resolver.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const config = {
  rootIndex: "docs/truthmark/areas.md",
  areaFilesRoot: "docs/truthmark/areas",
};

describe("resolveAreaRouting", () => {
  it("loads leaf areas from delegated child route files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Payments

Area files:
- docs/truthmark/areas/payments.md

Code surface:
- services/payments/**

Update truth when:
- payment behavior changes
`,
      );
      await repo.writeFile(
        "docs/truthmark/areas/payments.md",
        `# Payments Areas

## Checkout

Truth documents:
- docs/truth/payments/checkout.md

Code surface:
- services/payments/checkout/**

Update truth when:
- checkout behavior changes
`,
      );

      const result = await resolveAreaRouting(repo.rootDir, config);

      expect(result.diagnostics).toEqual([]);
      expect(result.routeFiles).toEqual([
        "docs/truthmark/areas.md",
        "docs/truthmark/areas/payments.md",
      ]);
      expect(result.areas).toEqual([
        expect.objectContaining({
          name: "Checkout",
          truthDocuments: ["docs/truth/payments/checkout.md"],
          sourcePath: "docs/truthmark/areas/payments.md",
          parentName: "Payments",
        }),
      ]);
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects child route files outside the configured area files root", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Payments

Area files:
- docs/payments.md

Code surface:
- services/payments/**

Update truth when:
- payment behavior changes
`,
      );

      const result = await resolveAreaRouting(repo.rootDir, config);

      expect(result.areas).toEqual([]);
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "area-index",
            severity: "error",
            file: "docs/payments.md",
            message: expect.stringContaining("must live under docs/truthmark/areas"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("rejects nested delegation inside child route files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Payments

Area files:
- docs/truthmark/areas/payments.md

Code surface:
- services/payments/**

Update truth when:
- payment behavior changes
`,
      );
      await repo.writeFile(
        "docs/truthmark/areas/payments.md",
        `# Payments Areas

## Checkout

Area files:
- docs/truthmark/areas/payments/checkout.md

Code surface:
- services/payments/checkout/**

Update truth when:
- checkout behavior changes
`,
      );

      const result = await resolveAreaRouting(repo.rootDir, config);

      expect(result.areas).toEqual([]);
      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "area-index",
            severity: "error",
            file: "docs/truthmark/areas/payments.md",
            message: expect.stringContaining("Child area files must contain leaf areas only"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("reports duplicate leaf area keys across route files", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Payments

Area files:
- docs/truthmark/areas/payments.md

Code surface:
- services/payments/**

Update truth when:
- payment behavior changes
`,
      );
      await repo.writeFile(
        "docs/truthmark/areas/payments.md",
        `# Payments Areas

## Checkout

Truth documents:
- docs/truth/payments.md

Code surface:
- services/payments/checkout/**

Update truth when:
- checkout behavior changes

## Checkout

Truth documents:
- docs/truth/payments-legacy.md

Code surface:
- services/payments/legacy-checkout/**

Update truth when:
- legacy checkout behavior changes
`,
      );

      const result = await resolveAreaRouting(repo.rootDir, config);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "area-index",
            severity: "error",
            message: expect.stringContaining("Duplicate area key checkout"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("reports child code surfaces that are outside the delegated parent surface", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Payments

Area files:
- docs/truthmark/areas/payments.md

Code surface:
- services/payments/**

Update truth when:
- payment behavior changes
`,
      );
      await repo.writeFile(
        "docs/truthmark/areas/payments.md",
        `# Payments Areas

## Checkout

Truth documents:
- docs/truth/payments.md

Code surface:
- services/orders/**

Update truth when:
- checkout behavior changes
`,
      );

      const result = await resolveAreaRouting(repo.rootDir, config);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "area-index",
            severity: "review",
            file: "docs/truthmark/areas/payments.md",
            message: expect.stringContaining("outside parent area Payments code surface"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("does not treat wildcard parent prefixes as implicit child containment", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Apps

Area files:
- docs/truthmark/areas/apps.md

Code surface:
- apps/*/src/**

Update truth when:
- app behavior changes
`,
      );
      await repo.writeFile(
        "docs/truthmark/areas/apps.md",
        `# Apps Areas

## Admin Docs

Truth documents:
- docs/truth/apps/admin-docs.md

Code surface:
- apps/admin/docs/**

Update truth when:
- admin docs behavior changes
`,
      );

      const result = await resolveAreaRouting(repo.rootDir, config);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "area-index",
            severity: "review",
            file: "docs/truthmark/areas/apps.md",
            message: expect.stringContaining("outside parent area Apps code surface"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });
});
