import fs from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { runInit } from "../../src/init/init.js";
import { runCheck } from "../../src/checks/check.js";
import { runConfig } from "../../src/config/command.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";
import { createTempRepo } from "../helpers/temp-repo.js";

const initializeRepo = async (rootDir: string): Promise<void> => {
  await runConfig(rootDir, {});
  await runInit(rootDir);
};

describe("runCheck", () => {
  it("returns no error diagnostics for a healthy initialized repository", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);

      const result = await runCheck(repo.rootDir);

      expect(result.command).toBe("check");
      expect(
        result.diagnostics.filter(
          (diagnostic) => diagnostic.severity === "error",
        ),
      ).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });

  it("resolves the repository root when check runs from a subdirectory", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "src/auth/session.ts",
        "export const session = true;\n",
      );

      const result = await runCheck(path.join(repo.rootDir, "src"));

      expect(
        result.diagnostics.some(
          (diagnostic) => diagnostic.category === "config",
        ),
      ).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns links diagnostics for broken internal markdown links", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "TRUTHMARK.md",
        `${await repo.readFile("TRUTHMARK.md")}\nSee [Missing](docs/missing.md).\n`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) => diagnostic.category === "links",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns links diagnostics instead of accepting links that escape the repo", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await initializeRepo(repo.rootDir);
      await fs.writeFile(
        path.resolve(repo.rootDir, "..", "truthmark-outside-link.md"),
        "# Outside Link\n",
        "utf8",
      );
      await repo.writeFile(
        "TRUTHMARK.md",
        `${await repo.readFile("TRUTHMARK.md")}\nSee [Outside](../truthmark-outside-link.md).\n`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "links" &&
            diagnostic.file === "TRUTHMARK.md",
        ),
      ).toBe(true);
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-outside-link.md"),
        {
          force: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("returns links diagnostics for symlink targets that resolve outside the repo", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await initializeRepo(repo.rootDir);
      await fs.writeFile(
        path.resolve(repo.rootDir, "..", "truthmark-symlink-link-target.md"),
        "# Outside Link\n",
        "utf8",
      );
      await fs.mkdir(path.resolve(repo.rootDir, "docs"), { recursive: true });
      await fs.symlink(
        path.resolve(repo.rootDir, "..", "truthmark-symlink-link-target.md"),
        path.resolve(repo.rootDir, "docs", "linked-outside.md"),
      );
      await repo.writeFile(
        "TRUTHMARK.md",
        `${await repo.readFile("TRUTHMARK.md")}\nSee [Outside](docs/linked-outside.md).\n`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "links" &&
            diagnostic.file === "TRUTHMARK.md",
        ),
      ).toBe(true);
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-symlink-link-target.md"),
        {
          force: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("returns authority errors for missing literal authority files", async () => {
    const repo = await createTempRepo();

    try {
      await runConfig(repo.rootDir, {});
      await initializeRepo(repo.rootDir);
      await fs.rm(`${repo.rootDir}/TRUTHMARK.md`);

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "authority" &&
            diagnostic.severity === "error",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns authority diagnostics instead of throwing when authority entries escape the repo", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await fs.writeFile(
        path.resolve(repo.rootDir, "..", "truthmark-outside-authority.md"),
        "# Outside Authority\n",
        "utf8",
      );
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
authority:
  - TRUTHMARK.md
  - ../truthmark-outside-authority.md
  - ../truthmark-outside-*.md
instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended:
    - status
ignore: []
realization:
  enabled: true
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "authority" &&
            diagnostic.file === "../truthmark-outside-authority.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "authority" &&
            diagnostic.file === "../truthmark-outside-*.md",
        ),
      ).toBe(true);
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-outside-authority.md"),
        {
          force: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("returns authority diagnostics for symlinked authority docs that resolve outside the repo", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await fs.writeFile(
        path.resolve(
          repo.rootDir,
          "..",
          "truthmark-symlink-authority-target.md",
        ),
        "# Outside Authority\n",
        "utf8",
      );
      await fs.mkdir(path.resolve(repo.rootDir, "docs", "custom"), {
        recursive: true,
      });
      await fs.symlink(
        path.resolve(
          repo.rootDir,
          "..",
          "truthmark-symlink-authority-target.md",
        ),
        path.resolve(repo.rootDir, "docs", "custom", "outside-authority.md"),
      );
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
authority:
  - TRUTHMARK.md
  - docs/custom/outside-authority.md
instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended:
    - status
ignore: []
realization:
  enabled: true
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "authority" &&
            diagnostic.file === "docs/custom/outside-authority.md",
        ),
      ).toBe(true);
    } finally {
      await fs.rm(
        path.resolve(
          repo.rootDir,
          "..",
          "truthmark-symlink-authority-target.md",
        ),
        {
          force: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("reports unmatched optional authority globs as review diagnostics, not errors", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      const config = await repo.readFile(".truthmark/config.yml");
      await repo.writeFile(
        ".truthmark/config.yml",
        config.replace(
          "  - docs/features/**/*.md\n",
          "  - docs/features/**/*.md\n  - docs/optional/**/*.md\n",
        ),
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "authority" &&
            diagnostic.severity === "review" &&
            diagnostic.message.includes("docs/optional/**/*.md"),
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "authority" &&
            diagnostic.severity === "error" &&
            diagnostic.message.includes("docs/optional/**/*.md"),
        ),
      ).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns area-index diagnostics for malformed areas and coverage diagnostics for unmapped code", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "src/auth/session.ts",
        "export const session = true;\n",
      );
      await repo.writeFile(
        "docs/features/authentication.md",
        "---\nstatus: active\n---\n\n# Authentication\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md
`,
      );

      const malformedResult = await runCheck(repo.rootDir);

      expect(
        malformedResult.diagnostics.some(
          (diagnostic) => diagnostic.category === "area-index",
        ),
      ).toBe(true);

      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md

Code surface:
- src/billing/**

Update truth when:
- authentication behavior changes
`,
      );

      const weakResult = await runCheck(repo.rootDir);

      expect(
        weakResult.diagnostics.some(
          (diagnostic) => diagnostic.category === "coverage",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("reports coverage diagnostics for unmapped Go, Python, C#, and Java code", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/features/platform.md",
        "---\nstatus: active\n---\n\n# Platform\n",
      );
      await repo.writeFile(
        "cmd/server/main.go",
        "package main\n\nfunc main() {}\n",
      );
      await repo.writeFile("scripts/task.py", "print('task')\n");
      await repo.writeFile(
        "src/App/Program.cs",
        "namespace App;\n\npublic class Program {}\n",
      );
      await repo.writeFile(
        "src/main/java/com/example/App.java",
        "package com.example;\n\npublic class App {}\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Platform

Truth documents:
- docs/features/platform.md

Code surface:
- web/**

Update truth when:
- platform behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);
      const coverageFiles = result.diagnostics
        .filter((diagnostic) => diagnostic.category === "coverage")
        .map((diagnostic) => diagnostic.file);

      expect(coverageFiles).toEqual(
        expect.arrayContaining([
          "cmd/server/main.go",
          "scripts/task.py",
          "src/App/Program.cs",
          "src/main/java/com/example/App.java",
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("reports coverage diagnostics for unmapped IaC, API schema, frontend, workflow, and monorepo code", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/features/platform.md",
        "---\nstatus: active\n---\n\n# Platform\n",
      );
      await repo.writeFile(
        "infra/main.tf",
        'resource "null_resource" "example" {}\n',
      );
      await repo.writeFile(
        "k8s/deployment.yaml",
        "apiVersion: apps/v1\nkind: Deployment\n",
      );
      await repo.writeFile(
        "api/openapi.yaml",
        "openapi: 3.1.0\ninfo:\n  title: API\n",
      );
      await repo.writeFile("schema/user.graphql", "type User { id: ID! }\n");
      await repo.writeFile(
        "proto/user.proto",
        'syntax = "proto3";\nmessage User {}\n',
      );
      await repo.writeFile(
        "frontend/components/Login.tsx",
        "export const Login = () => null;\n",
      );
      await repo.writeFile(
        ".github/workflows/ci.yml",
        "name: CI\non: [push]\n",
      );
      await repo.writeFile(
        "apps/web/src/App.tsx",
        "export const App = () => null;\n",
      );
      await repo.writeFile(
        "packages/auth/src/session.ts",
        "export const session = true;\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Platform

Truth documents:
- docs/features/platform.md

Code surface:
- src/**

Update truth when:
- platform behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);
      const coverageFiles = result.diagnostics
        .filter((diagnostic) => diagnostic.category === "coverage")
        .map((diagnostic) => diagnostic.file);

      expect(coverageFiles).toEqual(
        expect.arrayContaining([
          "infra/main.tf",
          "k8s/deployment.yaml",
          "api/openapi.yaml",
          "schema/user.graphql",
          "proto/user.proto",
          "frontend/components/Login.tsx",
          ".github/workflows/ci.yml",
          "apps/web/src/App.tsx",
          "packages/auth/src/session.ts",
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("uses delegated route files when checking coverage", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
docs:
  layout: hierarchical
  roots:
    features: docs/features
  routing:
    root_index: docs/truthmark/areas.md
    area_files_root: docs/truthmark/areas
    default_area: repository
    max_delegation_depth: 1
authority:
  - TRUTHMARK.md
  - docs/truthmark/areas.md
  - docs/truthmark/areas/**/*.md
  - docs/features/**/*.md
realization:
  enabled: true
`,
      );
      await repo.writeFile("TRUTHMARK.md", "# Truthmark\n");
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
- docs/features/payments/checkout.md

Code surface:
- services/payments/checkout/**

Update truth when:
- checkout behavior changes
`,
      );
      await repo.writeFile(
        "docs/features/payments/checkout.md",
        "# Checkout\n",
      );
      await repo.writeFile(
        "services/payments/checkout/handler.ts",
        "export const handler = () => 'ok';\n",
      );

      const result = await runCheck(repo.rootDir);

      expect(result.diagnostics).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "coverage",
            file: "services/payments/checkout/handler.ts",
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("reports stale generated workflow surfaces and version mismatches", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        ".codex/skills/truthmark-sync/SKILL.md",
        `${(
          await repo.readFile(".codex/skills/truthmark-sync/SKILL.md")
        ).replace(
          `truthmark-version: ${TRUTHMARK_VERSION}`,
          "truthmark-version: 0.9.0",
        )}\n`,
      );
      const result = await runCheck(repo.rootDir);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "generated-surface",
            severity: "review",
            file: ".codex/skills/truthmark-sync/SKILL.md",
            message: expect.stringContaining("stale"),
          }),
          expect.objectContaining({
            category: "generated-surface",
            severity: "review",
            file: ".codex/skills/truthmark-sync/SKILL.md",
            message: expect.stringContaining("version"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("ignores manual version notes outside managed instruction blocks", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "AGENTS.md",
        `${await repo.readFile("AGENTS.md")}\n\nManual notes:\n- Keep legacy host bridge pinned at version: "0.9.0"\n`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.filter(
          (diagnostic) =>
            diagnostic.category === "generated-surface" &&
            diagnostic.file === "AGENTS.md",
        ),
      ).toEqual([]);
    } finally {
      await repo.cleanup();
    }
  });

  it("reports stale generated Gemini command surfaces when configured", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
platforms:
  - gemini-cli
authority:
  - TRUTHMARK.md
  - docs/truthmark/areas.md
instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended: []
ignore: []
realization:
  enabled: true
`,
      );
      await repo.writeFile("TRUTHMARK.md", "# Truthmark\n");
      await repo.writeFile("docs/truthmark/areas.md", "# Truthmark Areas\n");
      await runInit(repo.rootDir);
      await repo.writeFile(
        ".gemini/commands/truthmark/sync.toml",
        `${await repo.readFile(".gemini/commands/truthmark/sync.toml")}\n# stale\n`,
      );

      const result = await runCheck(repo.rootDir);

      expect(result.diagnostics).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "generated-surface",
            severity: "review",
            file: ".gemini/commands/truthmark/sync.toml",
            message: expect.stringContaining("stale"),
          }),
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("returns truth visibility quality metrics in JSON data", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "apps/web/src/unmapped.ts",
        "export const unmapped = true;\n",
      );
      const result = await runCheck(repo.rootDir);

      expect(result.data?.truthVisibility).toEqual(
        expect.objectContaining({
          routePrecision: expect.objectContaining({
            leafAreaCount: expect.any(Number),
            broadAreaCount: expect.any(Number),
          }),
          unmappedSurfaceCount: expect.any(Number),
          staleGeneratedSurfaceCount: expect.any(Number),
          syncCompletenessIssueCount: expect.any(Number),
          topologyPressureCount: expect.any(Number),
        }),
      );
      expect(
        (
          result.data?.truthVisibility as {
            unmappedSurfaceCount?: number;
          }
        ).unmappedSurfaceCount,
      ).toBeGreaterThan(0);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns area-index diagnostics for missing truth documents referenced by areas", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/features/missing-authentication.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "area-index" &&
            diagnostic.message.includes("missing-authentication.md"),
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns area-index diagnostics for unmatched code surface globs", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md

Code surface:
- src/typo/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "area-index" &&
            diagnostic.file === "src/typo/**",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps valid code-surface entries active when a sibling code-surface glob is stale", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "src/auth/session.ts",
        "export const session = true;\n",
      );
      await repo.writeFile(
        "docs/features/authentication.md",
        "---\nstatus: active\n---\n\n# Authentication\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md

Code surface:
- src/auth/**
- src/stale/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "area-index" &&
            diagnostic.file === "src/stale/**",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "coverage" &&
            diagnostic.file === "src/auth/session.ts",
        ),
      ).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("reports missing recommended frontmatter as review and missing required frontmatter as error", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/features/authentication.md",
        "# Authentication\n",
      );

      const recommendedResult = await runCheck(repo.rootDir);

      expect(
        recommendedResult.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "frontmatter" &&
            diagnostic.severity === "review",
        ),
      ).toBe(true);

      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
authority:
  - TRUTHMARK.md
  - docs/truthmark/areas.md
  - docs/features/**/*.md
instruction_targets:
  - AGENTS.md
frontmatter:
  required:
    - status
  recommended: []
ignore: []
realization:
  enabled: true
`,
      );

      const requiredResult = await runCheck(repo.rootDir);

      expect(
        requiredResult.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "frontmatter" &&
            diagnostic.severity === "error",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("runs frontmatter and link checks across routed truth docs that are outside authority globs", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/custom/auth-guidance.md",
        "# Auth Guidance\n\nSee [Missing](missing.md).\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/custom/auth-guidance.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "frontmatter" &&
            diagnostic.file === "docs/custom/auth-guidance.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "links" &&
            diagnostic.file === "docs/custom/auth-guidance.md",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns diagnostics instead of throwing when a routed markdown doc has invalid frontmatter", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/custom/broken-frontmatter.md",
        "---\nstatus: [broken\n---\n# Broken\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Custom

Truth documents:
- docs/custom/broken-frontmatter.md

Code surface:
- src/custom/**

Update truth when:
- custom behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "frontmatter" &&
            diagnostic.severity === "error" &&
            diagnostic.file === "docs/custom/broken-frontmatter.md",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("still checks valid routed docs when another area is malformed", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/custom/auth-guidance.md",
        "# Auth Guidance\n\nSee [Missing](missing.md).\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Broken Area

Truth documents:
- docs/features/authentication.md

## Valid Area

Truth documents:
- docs/custom/auth-guidance.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) => diagnostic.category === "area-index",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "links" &&
            diagnostic.file === "docs/custom/auth-guidance.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "frontmatter" &&
            diagnostic.file === "docs/custom/auth-guidance.md",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns diagnostics instead of throwing when an area truth document path escapes the repo", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Unsafe Area

Truth documents:
- ../outside.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "area-index" &&
            diagnostic.file === "../outside.md",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("returns area-index diagnostics for symlinked truth docs that resolve outside the repo", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await fs.writeFile(
        path.resolve(repo.rootDir, "..", "truthmark-symlink-area-target.md"),
        "---\nstatus: active\n---\n\n# Outside Area Doc\n",
        "utf8",
      );
      await fs.mkdir(path.resolve(repo.rootDir, "docs", "custom"), {
        recursive: true,
      });
      await fs.symlink(
        path.resolve(repo.rootDir, "..", "truthmark-symlink-area-target.md"),
        path.resolve(repo.rootDir, "docs", "custom", "outside-area-doc.md"),
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Unsafe Area

Truth documents:
- docs/custom/outside-area-doc.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "area-index" &&
            diagnostic.file === "docs/custom/outside-area-doc.md",
        ),
      ).toBe(true);
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-symlink-area-target.md"),
        {
          force: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("returns diagnostics instead of throwing when an area truth document glob escapes the repo", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await fs.writeFile(
        path.resolve(repo.rootDir, "..", "truthmark-outside-shared.md"),
        "---\ntitle: Shared\nstatus: active\n---\n\n# Shared\n",
        "utf8",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Unsafe Area

Truth documents:
- ../truthmark-outside-*.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "area-index" &&
            diagnostic.file === "../truthmark-outside-shared.md",
        ),
      ).toBe(true);
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-outside-shared.md"),
        {
          force: true,
        },
      );
      await repo.cleanup();
    }
  });

  it("still validates truth docs referenced by a malformed area", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/custom/malformed-area-doc.md",
        "# Custom Guidance\n\nSee [Missing](missing.md).\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Broken Area

Truth documents:
- docs/custom/malformed-area-doc.md
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) => diagnostic.category === "area-index",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "frontmatter" &&
            diagnostic.file === "docs/custom/malformed-area-doc.md",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "links" &&
            diagnostic.file === "docs/custom/malformed-area-doc.md",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("does not count an area with broken truth documents toward code coverage", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "src/auth/session.ts",
        "export const session = true;\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Broken Area

Truth documents:
- docs/truthmark/missing.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "coverage" &&
            diagnostic.file === "src/auth/session.ts",
        ),
      ).toBe(true);
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps colliding area slugs from corrupting coverage state", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "src/auth/session.ts",
        "export const session = true;\n",
      );
      await repo.writeFile(
        "docs/features/authentication.md",
        "---\nstatus: active\n---\n\n# Authentication\n",
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Auth API

Truth documents:
- docs/features/authentication.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes

## Auth/API

Truth documents:
- docs/features/missing-authentication.md

Code surface:
- src/billing/**

Update truth when:
- billing behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "coverage" &&
            diagnostic.file === "src/auth/session.ts",
        ),
      ).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("does not report coverage for files matched by ignore globs", async () => {
    const repo = await createTempRepo();

    try {
      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/features/authentication.md",
        "---\nstatus: active\n---\n\n# Authentication\n",
      );
      await repo.writeFile(
        "src/auth/session.ts",
        "export const session = true;\n",
      );
      await repo.writeFile(
        "src/generated/out.ts",
        "export const generated = true;\n",
      );
      await repo.writeFile(
        ".truthmark/config.yml",
        `version: 1
authority:
  - TRUTHMARK.md
  - docs/truthmark/areas.md
  - docs/features/**/*.md
instruction_targets:
  - AGENTS.md
frontmatter:
  required: []
  recommended:
    - status
ignore:
  - src/generated/**
realization:
  enabled: true
`,
      );
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

  ## Authentication

  Truth documents:
  - docs/features/authentication.md

  Code surface:
  - src/auth/**

  Update truth when:
  - authentication behavior changes
  `,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "coverage" &&
            diagnostic.file === "src/generated/out.ts",
        ),
      ).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("does not treat symlinked source directories outside the repo as live code coverage", async () => {
    const repo = await createTempRepo();

    try {
      const outsideDir = path.resolve(
        repo.rootDir,
        "..",
        "truthmark-coverage-outside-dir",
      );

      await initializeRepo(repo.rootDir);
      await repo.writeFile(
        "docs/features/authentication.md",
        "---\nstatus: active\n---\n\n# Authentication\n",
      );
      await fs.mkdir(outsideDir, { recursive: true });
      await fs.writeFile(
        path.join(outsideDir, "outside.ts"),
        "export const outside = true;\n",
        "utf8",
      );
      await fs.mkdir(path.join(repo.rootDir, "src"), { recursive: true });
      await fs.symlink(outsideDir, path.join(repo.rootDir, "src", "external"));
      await repo.writeFile(
        "docs/truthmark/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/features/authentication.md

Code surface:
- src/external/**

Update truth when:
- authentication behavior changes
`,
      );

      const result = await runCheck(repo.rootDir);

      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "area-index" &&
            diagnostic.file === "src/external/**",
        ),
      ).toBe(true);
      expect(
        result.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "coverage" &&
            diagnostic.file === "src/external/outside.ts",
        ),
      ).toBe(false);
    } finally {
      await fs.rm(
        path.resolve(repo.rootDir, "..", "truthmark-coverage-outside-dir"),
        {
          force: true,
          recursive: true,
        },
      );
      await repo.cleanup();
    }
  });
});
