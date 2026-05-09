import { describe, expect, it } from "vitest";

import { parseAreasMarkdown } from "../../src/routing/areas.js";

describe("parseAreasMarkdown", () => {
  it("parses Truth documents, Code surface, and Update truth when sections", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md
- docs/api/authentication.md

Code surface:
- src/auth/**
- src/session/**

Update truth when:
- authentication behavior changes
- permissions change
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.areas).toEqual([
      {
        id: "authentication",
        name: "Authentication",
        key: "authentication",
        truthDocuments: [
          "docs/features/authentication.md",
          "docs/api/authentication.md",
        ],
        codeSurface: ["src/auth/**", "src/session/**"],
        updateTruthWhen: ["authentication behavior changes", "permissions change"],
      },
    ]);
  });

  it("returns area-index diagnostics for malformed areas", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md
`);

    expect(result.areas).toEqual([]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "area-index",
          severity: "error",
        }),
      ]),
    );
  });

  it("parses area headings with up to three leading spaces", () => {
    const source = [
      "# Truthmark Areas",
      "",
      "   ## Authentication",
      "",
      "Truth documents:",
      "- docs/features/authentication.md",
      "",
      "Code surface:",
      "- src/auth/**",
      "",
      "Update truth when:",
      "- authentication behavior changes",
    ].join("\n");

    const result = parseAreasMarkdown(source);

    expect(result.diagnostics).toEqual([]);
    expect(result.areas).toHaveLength(1);
    expect(result.areas[0]?.name).toBe("Authentication");
  });

  it("parses delegated area files", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Payments

Area files:
- docs/truthmark/areas/payments.md

Code surface:
- services/payments/**

Update truth when:
- payment behavior changes
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.areas).toEqual([]);
    expect(result.areaFileReferences).toEqual([
      {
        id: "payments",
        name: "Payments",
        key: "payments",
        areaFiles: ["docs/truthmark/areas/payments.md"],
        codeSurface: ["services/payments/**"],
        updateTruthWhen: ["payment behavior changes"],
      },
    ]);
  });

  it("rejects mixed leaf and delegated area blocks", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Payments

Truth documents:
- docs/features/payments.md

Area files:
- docs/truthmark/areas/payments.md

Code surface:
- services/payments/**

Update truth when:
- payment behavior changes
`);

    expect(result.areas).toEqual([]);
    expect(result.areaFileReferences).toEqual([]);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "area-index",
          severity: "error",
          message: expect.stringContaining("exactly one of Truth documents or Area files"),
        }),
      ]),
    );
  });
});
