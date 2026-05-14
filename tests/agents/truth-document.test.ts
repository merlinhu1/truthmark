import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import { createDefaultConfig } from "../../src/config/defaults.js";
import {
  TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS,
  renderTruthDocumentReportExample,
  renderTruthDocumentSkillBody,
} from "../../src/agents/truth-document.js";
import {
  renderTruthmarkDocumentLocalSkill,
  renderTruthmarkDocumentSkill,
  renderTruthmarkDocumentSkillMetadata,
} from "../../src/templates/codex-skills.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthDocumentSkillBody", () => {
  it("renders parseable skill frontmatter", () => {
    const parsed = matter(renderTruthDocumentSkillBody());

    expect(parsed.data.name).toBe("truthmark-document");
    expect(parsed.data["user-invocable"]).toBe(true);
    expect(parsed.data.description).toContain(
      "when Truth Sync, Truth Check, or Truth Structure reports implemented behavior that lacks canonical truth docs",
    );
    expect(parsed.data.description).not.toContain("when an update finds");
    expect(parsed.content).toContain(
      "Use this skill to document existing implemented behavior",
    );
  });

  it("renders the manual existing-implementation documentation workflow", () => {
    const skill = renderTruthDocumentSkillBody();

    expect(TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS).toContain("/truthmark:document");
    expect(skill).toContain("name: truthmark-document");
    expect(skill).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
    expect(skill).toContain("manual and implementation-first");
    expect(skill).toContain("existing implemented behavior");
    expect(skill).toContain("no functional-code changes");
    expect(skill).toContain("must not write functional code");
    expect(skill).toContain("docs/templates/behavior-doc.md");
    expect(skill).toContain("When creating or updating a truth doc");
    expect(skill).toContain("Truth-doc restructure gate");
    expect(skill).toContain(
      "Truth Document may restructure only truth docs for the implemented behavior being documented.",
    );
    expect(skill).toContain(
      "if a narrow append or section replacement would make truth worse",
    );
    expect(skill).toContain("behavior-oriented, not endpoint-oriented");
    expect(skill).toContain(
      "Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.",
    );
    expect(skill).toContain(
      "Do not put ordinary product behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.",
    );
    expect(skill).toContain(
      "run Truth Structure first when routing repair is safe and in scope",
    );
    expect(skill).toContain(
      "block and recommend Truth Structure when routing repair is unsafe, ambiguous, or outside the task boundary",
    );
    expect(skill).toContain(
      "Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.",
    );
    expect(skill).toContain("Evidence Gate");
    expect(skill).toContain(
      "perform a route-first impacted-doc check",
    );
    expect(skill).toContain(
      "support each claim with primary evidence from implementation code, config files, routing files, generated surface templates, schemas, or contract definitions in the active checkout",
    );
    expect(skill).toContain(
      "remove, narrow, or block unsupported claims",
    );
    expect(skill).toContain("Truth Document: completed");
    expect(skill).toContain("Implementation reviewed");
    expect(skill).toContain("Truth docs created");
    expect(skill).toContain("Truth docs updated");
    expect(skill).toContain("Routing updated");
    expect(skill).toContain("Evidence checked");
    expect(skill).toContain("docs restructured");
    expect(skill).toContain("Notes");
  });

  it("renders the report example", () => {
    const report = renderTruthDocumentReportExample();

    expect(report).toContain("Truth Document: completed");
    expect(report).toContain("src/routing/area-resolver.ts");
    expect(report).toContain("docs/truth/contracts.md");
    expect(report).toContain("Evidence checked");
    expect(report).toContain("Claim:");
  });

  it("uses the provided hierarchy config in embedded report examples", () => {
    const baseConfig = createDefaultConfig();
    const config = {
      ...baseConfig,
      docs: {
        ...baseConfig.docs,
        roots: {
          ...baseConfig.docs.roots,
          truth: "docs/truth",
        },
        routing: {
          ...baseConfig.docs.routing,
          rootIndex: "docs/routes/index.md",
          areaFilesRoot: "docs/routes/areas",
        },
      },
    };

    const skill = renderTruthDocumentSkillBody(config);

    expect(skill).toContain("docs/truth/contracts.md");
    expect(skill).toContain("docs/truth/check-diagnostics.md");
    expect(skill).toContain("docs/routes/index.md");
  });
});

describe("Truth Document generated surfaces", () => {
  it("renders Codex metadata and OpenCode skill content", () => {
    expect(renderTruthmarkDocumentSkill()).toContain("name: truthmark-document");
    expect(renderTruthmarkDocumentLocalSkill()).toContain(
      "/skill truthmark-document",
    );
    expect(renderTruthmarkDocumentLocalSkill()).toContain("/truthmark:document");
    expect(renderTruthmarkDocumentSkillMetadata()).toContain(
      'display_name: "Truthmark Document"',
    );
    expect(renderTruthmarkDocumentSkillMetadata()).toContain(
      "allow_implicit_invocation: false",
    );
    expect(renderTruthmarkDocumentSkillMetadata()).toContain(
      `version: "${TRUTHMARK_VERSION}"`,
    );
  });
});
