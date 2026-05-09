import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_CATEGORIES,
  type CommandResult,
} from "../../src/output/diagnostic.js";
import { renderHuman, renderJson } from "../../src/output/render.js";

describe("output rendering", () => {
  it("renders the command name and summary first for human output", () => {
    const result: CommandResult = {
      command: "check",
      summary: "Found 2 issues to review.",
      diagnostics: [
        {
          category: "config",
          severity: "action",
          message: "Created .truthmark/config.yml.",
        },
      ],
    };

    const output = renderHuman(result);
    const lines = output.split("\n");

    expect(lines[0]).toBe("truthmark check");
    expect(lines[1]).toBe("Found 2 issues to review.");
  });

  it("renders action, review, and error diagnostics consistently", () => {
    const result: CommandResult = {
      command: "check",
      summary: "Found issues.",
      diagnostics: [
        {
          category: "config",
          severity: "action",
          message: "Created .truthmark/config.yml.",
          file: ".truthmark/config.yml",
        },
        {
          category: "coverage",
          severity: "review",
          message: "No truth docs are mapped for src/auth/**.",
          area: "Authentication",
        },
        {
          category: "links",
          severity: "error",
          message: "Broken link to docs/api/authentication.md.",
        },
      ],
    };

    expect(renderHuman(result)).toContain(
      "[ACTION] config: Created .truthmark/config.yml. (file: .truthmark/config.yml)",
    );
    expect(renderHuman(result)).toContain(
      "[REVIEW] coverage: No truth docs are mapped for src/auth/**. (area: Authentication)",
    );
    expect(renderHuman(result)).toContain(
      "[ERROR] links: Broken link to docs/api/authentication.md.",
    );
  });

  it("renders deterministic JSON that round-trips to the command result", () => {
    const result: CommandResult = {
      command: "init",
      summary: "Created Truthmark files.",
      diagnostics: [
        {
          category: "config",
          severity: "action",
          message: "Created .truthmark/config.yml.",
          data: {
            created: true,
          },
        },
      ],
      data: {
        files: [".truthmark/config.yml", "TRUTHMARK.md"],
      },
    };

    const parsed = JSON.parse(renderJson(result)) as CommandResult;

    expect(parsed).toEqual(result);
  });

  it("exports the V1 diagnostic category list", () => {
    expect(DIAGNOSTIC_CATEGORIES).toEqual([
      "config",
      "authority",
      "frontmatter",
      "links",
      "area-index",
      "coverage",
      "truth-sync",
      "realization",
      "doc-structure",
      "generated-surface",
    ]);
  });
});
