import { parse } from "yaml";
import { describe, expect, it } from "vitest";

import { createTempRepo } from "../helpers/temp-repo.js";
import { discoverMarkdownDocuments } from "../../src/markdown/discovery.js";
import {
  renderConfigTemplate,
  renderAreasTemplate,
} from "../../src/templates/init-files.js";
import { renderDefaultStandards } from "../../src/templates/default-standards.js";
import { renderAgentsBlock } from "../../src/templates/agents-block.js";

describe("discoverMarkdownDocuments", () => {
  it("finds repository markdown docs and ignores common derived directories", async () => {
    const repo = await createTempRepo();

    try {
      await repo.writeFile(
        "docs/architecture/system.md",
        "---\nstatus: active\n---\n# System Architecture\n",
      );
      await repo.writeFile(
        "docs/truth/authentication.md",
        "# Authentication\n",
      );
      await repo.writeFile("README.md", "# Truthmark\n");
      await repo.writeFile("node_modules/example/ignored.md", "# Ignore me\n");
      await repo.writeFile("dist/generated.md", "# Ignore me\n");
      await repo.writeFile("vendor/copied.md", "# Ignore me\n");
      await repo.writeFile("build/output.md", "# Ignore me\n");
      await repo.writeFile(
        ".codex/skills/truthmark-sync/SKILL.md",
        "# Ignore me\n",
      );
      await repo.writeFile(
        ".codex/skills/truthmark-structure/SKILL.md",
        "# Ignore me\n",
      );
      await repo.writeFile(
        ".codex/skills/truthmark-realize/SKILL.md",
        "# Ignore me\n",
      );
      await repo.writeFile(
        ".codex/skills/truthmark-check/SKILL.md",
        "# Ignore me\n",
      );
      await repo.writeFile(
        ".opencode/skills/truthmark-sync/SKILL.md",
        "# Ignore me\n",
      );
      await repo.writeFile(
        ".claude/skills/truthmark-sync/SKILL.md",
        "# Ignore me\n",
      );
      await repo.writeFile(".github/copilot-instructions.md", "# Ignore me\n");
      await repo.writeFile(
        ".github/prompts/truthmark-sync.prompt.md",
        "# Ignore me\n",
      );
      await repo.writeFile("CLAUDE.md", "# Ignore me\n");
      await repo.writeFile("GEMINI.md", "# Ignore me\n");
      await repo.writeFile(
        ".gemini/commands/truthmark/sync.toml",
        'description = "Ignore me"\n',
      );
      await repo.writeFile("skills/truthmark-sync/SKILL.md", "# Ignore me\n");
      await repo.writeFile(
        "skills/truthmark-structure/SKILL.md",
        "# Ignore me\n",
      );
      await repo.writeFile("skills/truthmark-check/SKILL.md", "# Ignore me\n");
      await repo.writeFile("commands/truthmark-realize.md", "# Ignore me\n");
      await repo.runGit(["add", "README.md", "docs"]);
      await repo.runGit(["commit", "-m", "test: add markdown docs"]);

      const documents = await discoverMarkdownDocuments(repo.rootDir);

      expect(documents.map((document) => document.path)).toEqual([
        "README.md",
        "docs/architecture/system.md",
        "docs/truth/authentication.md",
      ]);
      expect(documents[1]).toMatchObject({
        path: "docs/architecture/system.md",
        title: "System Architecture",
        hasFrontmatter: true,
      });
    } finally {
      await repo.cleanup();
    }
  });
});

describe("init templates", () => {
  it("renders the V1 config template fields", () => {
    const config = parse(renderConfigTemplate()) as {
      docs: {
        roots: Record<string, string>;
      };
      frontmatter: {
        required: string[];
        recommended: string[];
      };
    } & Record<string, unknown>;

    expect(config).toMatchObject({
      version: 1,
      platforms: [
        "codex",
        "opencode",
        "claude-code",
        "github-copilot",
        "gemini-cli",
      ],
      authority: expect.any(Array),
      instruction_targets: expect.any(Array),
      frontmatter: expect.any(Object),
      ignore: expect.any(Array),
    });
    expect(config.frontmatter).toMatchObject({
      required: [],
      recommended: ["status", "doc_type", "last_reviewed", "source_of_truth"],
    });
    expect(config.docs.roots).toEqual({
      ai: "docs/ai",
      standards: "docs/standards",
      architecture: "docs/architecture",
      truth: "docs/truth",
    });
  });

  it("seeds docs/truthmark/areas.md from discovered docs without moving them", () => {
    const areas = renderAreasTemplate([
      {
        path: "docs/truth/authentication.md",
        title: "Authentication",
        hasFrontmatter: false,
      },
      {
        path: "docs/api/authentication.md",
        title: "Authentication API",
        hasFrontmatter: false,
      },
    ]);

    expect(areas).toContain("docs/truth/authentication.md");
    expect(areas).toContain("docs/api/authentication.md");
    expect(areas).toContain("Truth documents:");
    expect(areas).toContain("```yaml");
    expect(areas).toContain("kind: behavior");
    expect(areas).toContain("kind: contract");
    expect(areas).toContain("Code surface:");
    expect(areas).toContain("Update truth when:");
    expect(areas).not.toContain("- docs/truth/authentication.md");
  });

  it("renders a managed AGENTS.md block with stable markers and workflow boundaries", () => {
    const agentsBlock = renderAgentsBlock();

    expect(agentsBlock).toContain("<!-- truthmark:start -->");
    expect(agentsBlock).toContain("<!-- truthmark:end -->");
    expect(agentsBlock.split("\n").length).toBeLessThanOrEqual(20);
    expect(agentsBlock).not.toContain("### Manual Truth Realize");
    expect(agentsBlock).not.toContain("### Truth Structure");
    expect(agentsBlock).not.toContain("### Truth Check");
    expect(agentsBlock).toContain(
      "Explicit workflows: Truth Structure, Truth Document, Truth Realize, Truth Check",
    );
    expect(agentsBlock).toContain(
      "may write truth docs and docs/truthmark/areas.md only",
    );
    expect(agentsBlock).toContain(
      "Support new or changed behavior-bearing truth claims with checkout evidence",
    );
    expect(agentsBlock).toContain("must not rewrite functional code");
    expect(agentsBlock).toContain(
      "If routing cannot map changed code to a bounded truth owner",
    );
    expect(agentsBlock).toContain(
      "otherwise block and recommend Truth Structure",
    );
    expect(agentsBlock).not.toContain("write functional code only");
    expect(agentsBlock).not.toContain("do not edit truth docs or truth routing");
    expect(agentsBlock).not.toContain("Explicit invocation:");
    expect(agentsBlock).not.toContain("/skill truthmark-sync");
  });

  it("renders default standards only when comparable standards are missing", () => {
    const missingStandards = renderDefaultStandards([]);

    expect(missingStandards.map((template) => template.path)).toEqual([
      "docs/standards/default-principles.md",
      "docs/standards/documentation-governance.md",
    ]);
    expect(missingStandards.map((template) => template.content).join("\n")).toContain(
      "Architecture docs describe system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, and generated-surface ownership.",
    );
    expect(missingStandards.map((template) => template.content).join("\n")).toContain(
      "Do not put ordinary feature behavior in architecture docs.",
    );

    const existingStandards = renderDefaultStandards([
      {
        path: "docs/standards/default-principles.md",
        title: "Default Principles",
        hasFrontmatter: true,
      },
      {
        path: "docs/standards/documentation-governance.md",
        title: "Documentation Governance",
        hasFrontmatter: true,
      },
    ]);

    expect(existingStandards).toEqual([]);
  });
});
