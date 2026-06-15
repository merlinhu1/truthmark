import { describe, expect, it } from "vitest";

import { parseAreasMarkdown } from "../../src/routing/areas.js";

describe("parseAreasMarkdown", () => {
  it("parses Truth documents, Code surface, and Update truth when sections", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Authentication

Truth documents:
${"```"}yaml
truth_documents:
  - path: docs/truthmark/engineering/authentication.md
    kind: engineering-behavior
    lane: engineering
  - path: docs/api/authentication.md
    kind: engineering-contract
    lane: engineering
${"```"}

Code surface:
- src/auth/**
- src/session/**

Update truth when:
- authentication behavior changes
- permissions change
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.areas).toEqual([
      expect.objectContaining({
        id: "authentication",
        name: "Authentication",
        key: "authentication",
        truthDocuments: [
          "docs/truthmark/engineering/authentication.md",
          "docs/api/authentication.md",
        ],
        truthDocumentEntries: [
          expect.objectContaining({
            path: "docs/truthmark/engineering/authentication.md",
            kind: "engineering-behavior",
            kindSource: "explicit",
          }),
          expect.objectContaining({
            path: "docs/api/authentication.md",
            kind: "engineering-contract",
            kindSource: "explicit",
          }),
        ],
        codeSurface: ["src/auth/**", "src/session/**"],
        updateTruthWhen: ["authentication behavior changes", "permissions change"],
      }),
    ]);
  });

  it("returns area-index diagnostics for malformed areas", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Authentication

Truth documents:
- docs/truthmark/engineering/authentication.md
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
      "- docs/truthmark/engineering/authentication.md",
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
- docs/truthmark/engineering/payments.md

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

  it("parses structured truth document metadata from a fenced YAML block", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Billing

Truth documents:
${"```"}yaml
truth_documents:
  - path: docs/truthmark/engineering/billing/checkout.md
    kind: engineering-behavior
    lane: engineering
  - path: docs/contracts/billing/api.md
    kind: engineering-contract
    lane: engineering
${"```"}

Code surface:
- src/billing/**

Update truth when:
- billing behavior changes
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.areas).toEqual([
      expect.objectContaining({
        truthDocuments: [
          "docs/truthmark/engineering/billing/checkout.md",
          "docs/contracts/billing/api.md",
        ],
        truthDocumentEntries: [
          expect.objectContaining({
            path: "docs/truthmark/engineering/billing/checkout.md",
            kind: "engineering-behavior",
            kindSource: "explicit",
          }),
          expect.objectContaining({
            path: "docs/contracts/billing/api.md",
            kind: "engineering-contract",
            kindSource: "explicit",
          }),
        ],
      }),
    ]);
  });

  it("uses explicit clean path inference and default-review expectations when metadata is absent", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Repository

Truth documents:
- docs/truthmark/engineering/repository/overview.md
- docs/architecture/module-map.md
- docs/api/contracts.md

Code surface:
- src/**

Update truth when:
- repository behavior changes
`);

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "area-index",
          severity: "review",
          message: expect.stringContaining("defaulting to behavior"),
        }),
      ]),
    );
    expect(result.areas).toEqual([
      expect.objectContaining({
        truthDocumentEntries: [
          expect.objectContaining({
            path: "docs/truthmark/engineering/repository/overview.md",
            kind: "engineering-behavior",
            kindSource: "inferred",
          }),
          expect.objectContaining({
            path: "docs/architecture/module-map.md",
            kind: "engineering-behavior",
            kindSource: "defaulted",
          }),
          expect.objectContaining({
            path: "docs/api/contracts.md",
            kind: "engineering-behavior",
            kindSource: "defaulted",
          }),
        ],
      }),
    ]);
  });

  it("uses explicit YAML truth_documents metadata instead of legacy list entries", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Installed Workflows

Truth documents:
${"```"}yaml
truth_documents:
  - path: docs/truthmark/engineering/contracts/routing.md
    kind: engineering-contract
    lane: engineering
${"```"}

- docs/truthmark/engineering/installed-workflows.md
- docs/architecture/overview.md

Code surface:
- src/agents/**

Update truth when:
- workflow guidance changes
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.areas).toEqual([
      expect.objectContaining({
        truthDocuments: ["docs/truthmark/engineering/contracts/routing.md"],
        truthDocumentEntries: [
          expect.objectContaining({
            path: "docs/truthmark/engineering/contracts/routing.md",
            kind: "engineering-contract",
            kindSource: "explicit",
          }),
        ],
      }),
    ]);
  });

  it("marks unknown legacy truth document paths as defaulted", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Documentation Governance

Truth documents:
- docs/README.md

Code surface:
- docs/**

Update truth when:
- canonical docs topology changes
`);

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        category: "area-index",
        severity: "review",
        message: expect.stringContaining("defaulting to behavior"),
      }),
    ]);
    expect(result.areas).toEqual([
      expect.objectContaining({
        truthDocumentEntries: [
          expect.objectContaining({
            path: "docs/README.md",
            kind: "engineering-behavior",
            kindSource: "defaulted",
          }),
        ],
      }),
    ]);
  });
});
