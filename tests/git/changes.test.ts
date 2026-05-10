import fs from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { getUncommittedChanges } from "../../src/git/changes.js";
import { classifyPath } from "../../src/sync/classify.js";
import { createTempRepo } from "../helpers/temp-repo.js";

describe("getUncommittedChanges", () => {
  it("returns staged, unstaged, and untracked paths without duplicates", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/changed.ts", "export const changed = 1;\n");
      await repo.runGit(["add", "src/changed.ts"]);
      await repo.runGit(["commit", "-m", "test: baseline tracked file"]);

      await repo.writeFile("src/staged.ts", "export const staged = true;\n");
      await repo.runGit(["add", "src/staged.ts"]);

      await repo.writeFile("src/changed.ts", "export const changed = 2;\n");
      await repo.runGit(["add", "src/changed.ts"]);
      await repo.writeFile("src/changed.ts", "export const changed = 3;\n");

      await repo.writeFile("src/untracked.ts", "export const untracked = true;\n");

      const changes = await getUncommittedChanges(repo.rootDir);

      expect(changes).toEqual(
        expect.arrayContaining([
          {
            path: "src/changed.ts",
            staged: true,
            unstaged: true,
            untracked: false,
            deleted: false,
          },
          {
            path: "src/staged.ts",
            staged: true,
            unstaged: false,
            untracked: false,
            deleted: false,
          },
          {
            path: "src/untracked.ts",
            staged: false,
            unstaged: false,
            untracked: true,
            deleted: false,
          },
        ]),
      );
      expect(changes.filter((change) => change.path === "src/changed.ts")).toHaveLength(1);
    } finally {
      await repo.cleanup();
    }
  });

  it("includes deleted tracked files and marks them as deleted", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile("src/deleted.ts", "export const deleted = true;\n");
      await repo.runGit(["add", "src/deleted.ts"]);
      await repo.runGit(["commit", "-m", "test: baseline deleted source"]);

      await fs.rm(`${repo.rootDir}/src/deleted.ts`);

      const changes = await getUncommittedChanges(repo.rootDir);

      expect(changes).toEqual(
        expect.arrayContaining([
          {
            path: "src/deleted.ts",
            staged: false,
            unstaged: true,
            untracked: false,
            deleted: true,
          },
        ]),
      );
    } finally {
      await repo.cleanup();
    }
  });
});

describe("classifyPath", () => {
  it("treats markdown docs and config files as non-functional", () => {
    expect(classifyPath("docs/guides/authentication.md", [])).toBe("markdown");
    expect(classifyPath("TRUTHMARK.md", [])).toBe("markdown");
    expect(classifyPath(".truthmark/config.yml", [])).toBe("config");
    expect(classifyPath("package.json", [])).toBe("config");
    expect(classifyPath("src/auth/session.ts", [])).toBe("functional-code");
  });

  it("respects ignore globs and treats generated Truthmark paths as derived", () => {
    expect(classifyPath("dist/main.js", ["dist/**"])).toBe("ignored");
    expect(classifyPath("vendor/lib/index.rb", ["vendor/**"])).toBe("ignored");
    expect(classifyPath(".truthmark/cache/state.json", [])).toBe("derived");
    expect(classifyPath(".truthmark/sync/report.md", [])).toBe("derived");
    expect(classifyPath(".claude/skills/truthmark-sync/SKILL.md", [])).toBe(
      "derived",
    );
    expect(classifyPath(".codex/skills/truthmark-sync/SKILL.md", [])).toBe("derived");
    expect(classifyPath(".opencode/skills/truthmark-sync/SKILL.md", [])).toBe("derived");
    expect(classifyPath("skills/truthmark-sync/SKILL.md", [])).toBe("markdown");
    expect(classifyPath(".github/copilot-instructions.md", [])).toBe("derived");
    expect(classifyPath(".github/prompts/truthmark-sync.prompt.md", [])).toBe(
      "derived",
    );
    expect(classifyPath("CLAUDE.md", [])).toBe("derived");
    expect(classifyPath("GEMINI.md", [])).toBe("derived");
    expect(classifyPath(".gemini/commands/truthmark/sync.toml", [])).toBe("derived");
  });

  it("stays conservative for source-like paths in polyglot repos", () => {
    expect(classifyPath("cmd/server.go", [])).toBe("functional-code");
    expect(classifyPath("lib/session.rs", [])).toBe("functional-code");
    expect(classifyPath("scripts/release.py", [])).toBe("functional-code");
    expect(classifyPath("notes/todo.txt", [])).toBe("other");
  });

  it("classifies IaC, API schema, frontend, workflow, and monorepo surfaces as functional", () => {
    expect(classifyPath("infra/main.tf", [])).toBe("functional-code");
    expect(classifyPath("k8s/deployment.yaml", [])).toBe("functional-code");
    expect(classifyPath("api/openapi.yaml", [])).toBe("functional-code");
    expect(classifyPath("schema/user.graphql", [])).toBe("functional-code");
    expect(classifyPath("proto/user.proto", [])).toBe("functional-code");
    expect(classifyPath("frontend/components/Login.tsx", [])).toBe("functional-code");
    expect(classifyPath(".github/workflows/ci.yml", [])).toBe("functional-code");
    expect(classifyPath("apps/web/src/App.tsx", [])).toBe("functional-code");
    expect(classifyPath("packages/auth/src/session.ts", [])).toBe("functional-code");
  });
});
