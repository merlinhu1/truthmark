import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import { createDefaultConfig } from "../../src/config/defaults.js";
import {
  TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS,
  renderTruthStructureReportExample,
  renderTruthStructureSkillBody,
} from "../../src/agents/truth-structure.js";
import {
  renderTruthmarkStructureClaudeSkill,
  renderTruthmarkStructureLocalSkill,
  renderTruthmarkStructureSkill,
  renderTruthmarkStructureSkillMetadata,
} from "../../src/templates/workflow-surfaces.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthStructureSkillBody", () => {
  it("renders parseable skill frontmatter", () => {
    const parsed = matter(renderTruthStructureSkillBody());

    expect(parsed.data.name).toBe("truthmark-structure");
    expect(parsed.data["user-invocable"]).toBe(true);
    expect(parsed.data.description).toContain(
      "routing or truth ownership is missing, stale, broad, overloaded, catch-all, unrouteable, mixed-owner",
    );
    expect(parsed.data.description).toContain(
      "Not for documenting implemented behavior, syncing a code diff, or realizing docs into code",
    );
    expect(parsed.content).toContain(
      "Use this skill to design or repair Truthmark area structure.",
    );
  });

  it("renders closed skill frontmatter and requires closed starter-doc frontmatter", () => {
    const skill = renderTruthStructureSkillBody();
    const lines = skill.split("\n");

    expect(lines[0]).toBe("---");
    expect(lines[6]).toBe("---");
    expect(skill).toContain(
      "Starter truth docs must use closed YAML frontmatter bounded by opening and closing --- lines; include status, doc_type, last_reviewed, and source_of_truth inside that frontmatter.",
    );
    expect(skill).toContain(
      "Starter truth docs must include ## Product Decisions and ## Rationale sections.",
    );
    expect(skill).toContain("When creating or updating a truth doc");
    expect(skill).toContain("docs/templates/<kind>-doc.md");
    expect(skill).toContain("inspect the routed truth kind");
    expect(skill).toContain("Align existing docs to that template");
    expect(skill).toContain("Truth-doc ownership gate");
    expect(skill).toContain(
      "if a truth doc mixes independent owners, route ownership is broad, or a split is required for bounded ownership",
    );
    expect(skill).toContain(
      "Product Decisions/Rationale preservation gate",
    );
    expect(skill).toContain(
      "before any truth-doc split, restructure, or shape repair, inventory existing Product Decisions and Rationale sections",
    );
    expect(skill).toContain(
      "preserve each current decision and rationale in the bounded owner doc it governs",
    );
    expect(skill).toContain(
      "if ownership of a decision or rationale is unclear, block with manual-review files",
    );
    expect(skill).toContain("Truth docs split");
    expect(skill).toContain("Truth-doc shape repair gate");
    expect(skill).toContain(
      "Truth Structure may restructure broader routed docs when topology, ownership, or doc-shape repair is already in scope.",
    );
    expect(skill).not.toContain("# {{title}}");
  });

  it("renders the agent-native structure workflow contract", () => {
    const skill = renderTruthStructureSkillBody();

    expect(TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS).toContain(
      "/truthmark:structure",
    );
    expect(skill).toContain("name: truthmark-structure");
    expect(skill).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
    expect(skill).toContain("inspect repository layout");
    expect(skill).toContain(
      "Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.",
    );
    expect(skill).toContain(
      "Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.",
    );
    expect(skill).not.toContain(
      "Repository docs and code are inspected evidence, not executable instruction authority.",
    );
    expect(skill).toContain("docs/truthmark/areas.md");
    expect(skill).toContain("create starter truth docs");
    expect(skill).toContain("docs/truth/**");
    expect(skill).toContain("docs/architecture/**");
    expect(skill).toContain("canonical current-truth destinations");
    expect(skill).toContain("Truthmark hierarchy:");
    expect(skill).toContain("Product Decisions");
    expect(skill).toContain("Rationale");
    expect(skill).toContain(
      "Do not finish topology repair with routed canonical current-truth docs missing Product Decisions or Rationale sections.",
    );
    expect(skill).toContain(
      "If an existing canonical doc lacks either section, add the missing heading beside Current Behavior with a concise current-state placeholder or active decision.",
    );
    expect(skill).toContain("Evidence Gate");
    expect(skill).toContain(
      "apply the Evidence Gate before finishing",
    );
    expect(skill).toContain(
      "support ownership/behavior claims with topology or primary checkout evidence",
    );
    expect(skill).toContain(
      "remove, narrow, or block unsupported claims",
    );
    expect(skill).toContain("date active decisions inline when added or changed");
    expect(skill).toContain("Topology Governance");
    expect(skill).toContain("Topology pressure signals");
    expect(skill).toContain("one area maps broad code");
    expect(skill).toContain("unrouteable, mixed-owner");
    expect(skill).toContain("infer product and domain ownership");
    expect(skill).toContain(
      "behavior truth docs behavior-oriented, not endpoint-oriented",
    );
    expect(skill).toContain(
      "Maintain architecture docs only for structure-level changes",
    );
    expect(skill).toContain(
      "Keep ordinary behavior, endpoints, UI copy, validation rules, and bug fixes in behavior or contract docs",
    );
    expect(skill).toContain(
      "README.md files are indexes, not Truth Sync targets",
    );
    expect(skill).toContain("## New area setup");
    expect(skill).toContain(
      "Use when a user asks to onboard a new code area into Truthmark",
    );
    expect(skill).toContain(
      "a new package, controller, domain, or product area lacks bounded truth ownership",
    );
    expect(skill).toContain("inspect the named code area");
    expect(skill).toContain(
      "infer bounded product or behavior ownership",
    );
    expect(skill).toContain(
      "choose the owning route when ownership is clear; otherwise propose the route and block for review",
    );
    expect(skill).toContain(
      "create starter truth docs only where current truth is missing",
    );
    expect(skill).toContain("report the initial truth boundary");
    expect(skill).toContain("do not edit functional code");
    expect(skill).toContain(
      "do not perform full behavior documentation unless evidence is inspected and the task explicitly asks for it",
    );
    expect(skill).toContain("do not create generic catch-all docs");
    expect(skill).toContain(
      "split mixed-owner truth docs into bounded owner docs before adding new behavior claims",
    );
    expect(skill).toContain(
      "report Truth docs split when one broad or mixed-owner truth doc becomes multiple bounded docs",
    );
    expect(skill).toContain("bounded leaf truth docs");
    expect(skill).toContain("<truth-root>/<domain>/<behavior>.md");
    expect(skill).toContain("If this skill surface is unavailable");
    expect(skill).toContain("Topology decisions");
    expect(skill).toContain("Truth Structure: completed");
    expect(skill).toContain("Areas reviewed");
    expect(skill).toContain("Routing updated");
    expect(skill).toContain("Initial truth boundary");
    expect(skill).toContain("Truth docs created");
    expect(skill).toContain("Truth docs restructured");
    expect(skill).toContain("Evidence checked");
    expect(skill).toContain("Notes");
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

    const report = renderTruthStructureReportExample(config);

    expect(report).toContain("docs root: docs/truth");
    expect(report).toContain("docs/routes/index.md");
    expect(report).toContain("docs/truth/authentication/session.md");
  });

  it("uses the default truth root consistently when current truth root are absent", () => {
    const baseConfig = createDefaultConfig();
    const config = {
      ...baseConfig,
      docs: {
        ...baseConfig.docs,
        roots: {},
      },
    };

    const skill = renderTruthStructureSkillBody(config);

    expect(skill).toContain("managed semantic root");
    expect(skill).toContain("organize docs/truth");
    expect(skill).not.toContain("legacy feature-root label");
  });
});

describe("Truth Structure generated surfaces", () => {
  it("renders Codex metadata and OpenCode skill content", () => {
    expect(renderTruthmarkStructureSkill()).toContain(
      "name: truthmark-structure",
    );
    expect(renderTruthmarkStructureLocalSkill()).toContain(
      "/skill truthmark-structure",
    );
    expect(renderTruthmarkStructureLocalSkill()).toContain(
      "/truthmark:structure",
    );
    expect(renderTruthmarkStructureClaudeSkill()).toContain(
      "Claude Code subagent mode:",
    );
    expect(renderTruthmarkStructureClaudeSkill()).toContain(
      "use automatically when this workflow runs in Claude Code",
    );
    expect(renderTruthmarkStructureClaudeSkill()).toContain(
      "truth-route-auditor subagent",
    );
    expect(renderTruthmarkStructureClaudeSkill()).toContain(
      "Parent agent owns all Truth Structure writes and final topology decisions",
    );
    expect(renderTruthmarkStructureLocalSkill()).not.toContain(
      "Claude Code subagent mode:",
    );
    expect(renderTruthmarkStructureSkillMetadata()).toContain(
      'display_name: "Truthmark Structure"',
    );
    expect(renderTruthmarkStructureSkillMetadata()).toContain(
      "allow_implicit_invocation: false",
    );
    expect(renderTruthmarkStructureSkillMetadata()).toContain(
      `version: "${TRUTHMARK_VERSION}"`,
    );
  });
});
