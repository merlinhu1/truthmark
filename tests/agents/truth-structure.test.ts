import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import {
  TRUTH_STRUCTURE_EXPLICIT_INVOCATIONS,
  renderTruthStructureSkillBody,
} from "../../src/agents/truth-structure.js";
import {
  renderTruthmarkStructureLocalSkill,
  renderTruthmarkStructureSkill,
  renderTruthmarkStructureSkillMetadata,
} from "../../src/templates/codex-skills.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthStructureSkillBody", () => {
  it("renders parseable skill frontmatter", () => {
    const parsed = matter(renderTruthStructureSkillBody());

    expect(parsed.data.name).toBe("truthmark-structure");
    expect(parsed.data["user-invocable"]).toBe(true);
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
    expect(skill).toContain("When creating or updating a feature doc");
    expect(skill).toContain("read docs/templates/feature-doc.md");
    expect(skill).toContain("follow its frontmatter, heading order, and section intent");
    expect(skill).toContain("align existing feature docs to the template standard");
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
    expect(skill).toContain("docs/features/**");
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
    expect(skill).toContain("Date active decisions inline when added or changed");
    expect(skill).toContain("Topology Governance");
    expect(skill).toContain("Topology pressure signals");
    expect(skill).toContain("one area maps broad code");
    expect(skill).toContain("unrouteable Truthmark area routing");
    expect(skill).toContain("infer product and domain ownership");
    expect(skill).toContain(
      "feature docs behavior-oriented, not endpoint-oriented",
    );
    expect(skill).toContain(
      "Maintain architecture docs when a code change alters system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, or generated-surface ownership.",
    );
    expect(skill).toContain(
      "Do not put ordinary feature behavior, endpoint details, UI copy, validation rules, or bug fixes in architecture docs unless they change those architecture boundaries.",
    );
    expect(skill).toContain(
      "README.md files are indexes, not Truth Sync targets",
    );
    expect(skill).toContain("bounded leaf truth docs");
    expect(skill).toContain("<feature-root>/<domain>/<behavior>.md");
    expect(skill).toContain("If this skill surface is unavailable");
    expect(skill).toContain("Topology decisions");
    expect(skill).toContain("Truth Structure: completed");
    expect(skill).toContain("Areas reviewed");
    expect(skill).toContain("Routing updated");
    expect(skill).toContain("Truth docs created");
    expect(skill).toContain("Notes");
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
