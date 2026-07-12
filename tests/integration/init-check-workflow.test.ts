import fs from "node:fs/promises";

import { describe, it } from "node:test";
import { expect } from "expect";

import { createTempRepo } from "../helpers/temp-repo.js";
import { runCli } from "../helpers/run-cli.js";

describe("init and check workflow acceptance", () => {
  it("creates usable workflow files and reports no error diagnostics in a healthy repository", async () => {
    const repo = await createTempRepo();

    try {
      const configResult = await runCli(["config", "--json"], {
        cwd: repo.rootDir,
      });
      expect(configResult.exitCode).toBe(0);
      const configFile = await repo.readFile(".truthmark/config.yml");
      await repo.writeFile(
        ".truthmark/config.yml",
        configFile.replace(
          "version: 2\n",
          "version: 2\nplatforms:\n  - codex\n  - claude-code\n",
        ),
      );

      const initResult = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });

      expect(initResult.exitCode).toBe(0);

      const initPayload = JSON.parse(initResult.stdout) as {
        command: string;
      };

      expect(initPayload.command).toBe("init");

      await expect(
        fs.stat(`${repo.rootDir}/.truthmark/config.yml`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/docs/truthmark/routes/areas.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/product-capability.md`,
        ),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/engineering-behavior.md`,
        ),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/engineering-contract.md`,
        ),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/engineering-architecture.md`,
        ),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/engineering-workflow.md`,
        ),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/engineering-operations.md`,
        ),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/engineering-test-behavior.md`,
        ),
      ).resolves.toBeTruthy();
      const oldBehaviorTemplateName = ["behavior", "doc.md"].join("-");
      const oldProductBoundaryTemplateName = [
        "product",
        "boundary",
        "doc.md",
      ].join("-");
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/${oldBehaviorTemplateName}`,
        ),
      ).rejects.toThrow();
      await expect(
        fs.stat(
          `${repo.rootDir}/docs/truthmark/templates/${oldProductBoundaryTemplateName}`,
        ),
      ).rejects.toThrow();
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.agents/skills/truthmark-structure/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.agents/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.agents/skills/truthmark-realize/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.agents/skills/truthmark-check/SKILL.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/.claude/skills/truthmark-sync/SKILL.md`),
      ).resolves.toBeTruthy();

      const checkResult = await runCli(["check", "--json"], {
        cwd: repo.rootDir,
      });

      expect(checkResult.exitCode).toBe(0);

      const checkPayload = JSON.parse(checkResult.stdout) as {
        command: string;
        diagnostics: Array<{ severity: string }>;
        data?: {
          branchScope?: {
            identity: string;
            worktreePath: string;
          };
        };
      };

      expect(checkPayload.command).toBe("check");
      expect(
        checkPayload.diagnostics.filter(
          (diagnostic) => diagnostic.severity === "error",
        ),
      ).toHaveLength(0);
      expect(checkPayload.data?.branchScope?.identity).toBe("unborn:main");
      expect(checkPayload.data?.branchScope?.worktreePath).toBe(repo.rootDir);
    } finally {
      await repo.cleanup();
    }
  });

  it("keeps check validation-only after init when functional code changes exist", async () => {
    const repo = await createTempRepo();

    try {
      const configResult = await runCli(["config", "--json"], {
        cwd: repo.rootDir,
      });
      expect(configResult.exitCode).toBe(0);
      const configFile = await repo.readFile(".truthmark/config.yml");
      await repo.writeFile(
        ".truthmark/config.yml",
        configFile.replace(
          "version: 2\n",
          "version: 2\nplatforms:\n  - codex\n  - claude-code\n",
        ),
      );

      const initResult = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });

      expect(initResult.exitCode).toBe(0);

      await repo.writeFile(
        "docs/truthmark/engineering/behaviors/authentication.md",
        "---\nstatus: active\ndoc_type: behavior\ntruth_kind: engineering-behavior\nlast_reviewed: 2026-05-06\nsource_of_truth:\n  - ../../../../src/auth/session.ts\n---\n\n# Authentication\n",
      );
      await repo.writeFile(
        "docs/truthmark/routes/areas.md",
        `# Truthmark Areas

## Authentication

Truth documents:
- docs/truthmark/engineering/behaviors/authentication.md

Code surface:
- src/auth/**

Update truth when:
- authentication behavior changes
`,
      );
      await repo.writeFile(
        "src/auth/session.ts",
        "export const session = true;\n",
      );

      const checkResult = await runCli(["check", "--json"], {
        cwd: repo.rootDir,
      });

      expect(checkResult.exitCode).toBe(0);

      const payload = JSON.parse(checkResult.stdout) as {
        command: string;
        data?: {
          branchScope?: {
            identity: string;
          };
          truthSync?: unknown;
        };
      };

      expect(payload.command).toBe("check");
      expect(payload.data?.branchScope?.identity).toBe("unborn:main");
      expect(payload.data?.truthSync).toBeUndefined();
    } finally {
      await repo.cleanup();
    }
  });

  it("reconciles disabled platforms while preserving siblings and reporting generated diagnostics", async () => {
    const repo = await createTempRepo();

    try {
      const configResult = await runCli(["config", "--json"], {
        cwd: repo.rootDir,
      });
      expect(configResult.exitCode).toBe(0);
      await runCli(["config", "--force"], { cwd: repo.rootDir });
      await fs.writeFile(
        `${repo.rootDir}/.truthmark/config.yml`,
        `version: 2
platforms:
  - codex
  - claude-code
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
frontmatter:
  required: []
  recommended:
    - status
ignore: []
`,
      );

      const enableBoth = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      expect(enableBoth.exitCode).toBe(0);
      await expect(
        fs.stat(`${repo.rootDir}/AGENTS.md`),
      ).resolves.toBeTruthy();
      await expect(
        fs.stat(`${repo.rootDir}/CLAUDE.md`),
      ).resolves.toBeTruthy();
      await fs.writeFile(
        `${repo.rootDir}/.claude/surviving.txt`,
        "keep this\n",
        "utf8",
      );

      await fs.writeFile(
        `${repo.rootDir}/.truthmark/config.yml`,
        `version: 2
platforms:
  - codex
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
frontmatter:
  required: []
  recommended:
    - status
ignore: []
`,
      );
      const disableClaude = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      expect(disableClaude.exitCode).toBe(0);

      await expect(
        fs.stat(`${repo.rootDir}/CLAUDE.md`),
      ).rejects.toThrow();
      await expect(
        fs.readFile(`${repo.rootDir}/.claude/surviving.txt`, "utf8"),
      ).resolves.toBe("keep this\n");

      const checkResult = await runCli(["check", "--json"], {
        cwd: repo.rootDir,
      });
      const payload = JSON.parse(checkResult.stdout) as {
        diagnostics: Array<{ file?: string }>;
      };
      expect(
        payload.diagnostics.some(
          (diagnostic) => diagnostic.file === "CLAUDE.md",
        ),
      ).toBe(false);
    } finally {
      await repo.cleanup();
    }
  });

  it("reconciles to a single AGENTS owner without removing shared user-facing content", async () => {
    const repo = await createTempRepo();

    try {
      const configFile = `version: 2
platforms:
  - codex
  - opencode
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
frontmatter:
  required: []
  recommended: []
ignore: []
`;
      await repo.writeFile(".truthmark/config.yml", configFile);

      const first = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      expect(first.exitCode).toBe(0);
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).resolves.toBeTruthy();
      await fs.writeFile(
        `${repo.rootDir}/.opencode/retained.txt`,
        "keep this\n",
        "utf8",
      );

      await repo.writeFile(
        ".truthmark/config.yml",
        configFile.replace("  - opencode\n", ""),
      );
      const second = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });

      expect(second.exitCode).toBe(0);
      await expect(fs.stat(`${repo.rootDir}/AGENTS.md`)).resolves.toBeTruthy();
      await expect(
        fs.access(`${repo.rootDir}/.opencode/skills/truthmark-structure/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.stat(`${repo.rootDir}/.opencode/retained.txt`),
      ).resolves.toBeTruthy();
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves diverged generated surfaces with review diagnostics while disabling a platform", async () => {
    const repo = await createTempRepo();

    try {
      const twoPlatformConfig = `version: 2
platforms:
  - codex
  - github-copilot
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
frontmatter:
  required: []
  recommended: []
ignore: []
`;
      await repo.writeFile(".truthmark/config.yml", twoPlatformConfig);
      const initResult = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      expect(initResult.exitCode).toBe(0);

      const githubSurface = `${repo.rootDir}/.github/skills/truthmark-sync/SKILL.md`;
      const sourceSurface = await fs.readFile(githubSurface, "utf8");
      await fs.writeFile(
        githubSurface,
        `${sourceSurface}\nDiverged by user.\n`,
        "utf8",
      );

      await repo.writeFile(
        ".truthmark/config.yml",
        twoPlatformConfig.replace("  - github-copilot\n", ""),
      );
      const reconcileResult = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      const reconcilePayload = JSON.parse(reconcileResult.stdout) as {
        diagnostics: Array<{ category: string; file: string; severity: string }>;
      };

      expect(reconcileResult.exitCode).toBe(0);
      expect(
        reconcilePayload.diagnostics.some(
          (diagnostic) =>
            diagnostic.category === "generated-surface" &&
            diagnostic.severity === "review" &&
            diagnostic.file === ".github/skills/truthmark-sync/SKILL.md",
        ),
      ).toBe(true);
      expect(await fs.readFile(githubSurface, "utf8")).toContain(
        "Diverged by user.",
      );
    } finally {
      await repo.cleanup();
    }
  });

  it("reconciles portal lifecycle changes while preserving unrelated siblings and authored Gemini output", async () => {
    const repo = await createTempRepo();

    try {
      await runCli(["config", "--json"], { cwd: repo.rootDir });
      await fs.writeFile(
        `${repo.rootDir}/.truthmark/config.yml`,
        `version: 2
platforms:
  - codex
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: true
frontmatter:
  required: []
  recommended: []
ignore: []
`,
      );

      const portalEnabled = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      expect(portalEnabled.exitCode).toBe(0);

      await expect(
        fs.stat(`${repo.rootDir}/.agents/skills/truthmark-portal/SKILL.md`),
      ).resolves.toBeTruthy();
      await fs.writeFile(
        `${repo.rootDir}/.agents/notes.txt`,
        "custom note\n",
        "utf8",
      );
      await fs.writeFile(`${repo.rootDir}/GEMINI.md`, "manual review\n", "utf8");

      await fs.writeFile(
        `${repo.rootDir}/.truthmark/config.yml`,
        `version: 2
platforms:
  - codex
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
frontmatter:
  required: []
  recommended: []
ignore: []
`,
      );
      const portalDisabled = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      expect(portalDisabled.exitCode).toBe(0);
      await expect(
        fs.stat(`${repo.rootDir}/.agents/notes.txt`),
      ).resolves.toBeTruthy();
      await expect(
        fs.access(`${repo.rootDir}/.agents/skills/truthmark-portal/SKILL.md`),
      ).rejects.toThrow();
      await expect(
        fs.readFile(`${repo.rootDir}/GEMINI.md`, "utf8"),
      ).resolves.toBe("manual review\n");
    } finally {
      await repo.cleanup();
    }
  });

  it("preserves authored content and converges to stable init state across repeated runs", async () => {
    const repo = await createTempRepo();

    try {
      const configResult = await runCli(["config", "--json"], {
        cwd: repo.rootDir,
      });
      expect(configResult.exitCode).toBe(0);
      await fs.writeFile(
        `${repo.rootDir}/.truthmark/config.yml`,
        `version: 2
platforms:
  - codex
truthmark:
  workspace: docs/truthmark
  generated:
    portal:
      enabled: false
frontmatter:
  required: []
  recommended: []
ignore: []
`,
      );
      const first = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      const second = await runCli(["init", "--json"], {
        cwd: repo.rootDir,
      });
      expect(first.exitCode).toBe(0);
      expect(second.exitCode).toBe(0);
      const firstPayload = JSON.parse(first.stdout) as { summary: string };
      const secondPayload = JSON.parse(second.stdout) as { summary: string };
      expect(secondPayload.summary).toBe(
        "Truthmark repository scaffold is already up to date.",
      );
      expect(firstPayload.summary).toContain("Initialized or updated");

      await expect(
        fs.stat(`${repo.rootDir}/.truthmark/config.yml`),
      ).resolves.toBeTruthy();
    } finally {
      await repo.cleanup();
    }
  });
});
