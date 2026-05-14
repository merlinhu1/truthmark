import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import {
  TRUTHMARK_WORKFLOW_IDS,
  TRUTHMARK_WORKFLOW_MANIFEST,
  getTruthmarkWorkflow,
} from "../../src/agents/workflow-manifest.js";
import { renderTruthCheckSkillBody } from "../../src/agents/truth-check.js";
import { renderTruthDocumentSkillBody } from "../../src/agents/truth-document.js";
import { renderTruthStructureSkillBody } from "../../src/agents/truth-structure.js";
import { renderTruthSyncSkillBody } from "../../src/agents/truth-sync.js";
import { renderTruthmarkRealizeSkill } from "../../src/templates/codex-skills.js";

const renderWorkflowSkill = (id: (typeof TRUTHMARK_WORKFLOW_IDS)[number]) => {
  switch (id) {
    case "truthmark-sync":
      return renderTruthSyncSkillBody();
    case "truthmark-structure":
      return renderTruthStructureSkillBody();
    case "truthmark-document":
      return renderTruthDocumentSkillBody();
    case "truthmark-realize":
      return renderTruthmarkRealizeSkill();
    case "truthmark-check":
      return renderTruthCheckSkillBody();
  }
};

describe("Truthmark workflow manifest", () => {
  it("is the source for generated skill frontmatter descriptions", () => {
    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      const parsed = matter(renderWorkflowSkill(id));

      expect(parsed.data.name).toBe(id);
      expect(parsed.data.description).toBe(getTruthmarkWorkflow(id).description);
    }
  });

  it("defines routing eval cases for every workflow", () => {
    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      const workflow = TRUTHMARK_WORKFLOW_MANIFEST[id];

      expect(workflow.positiveTriggers.length).toBeGreaterThan(0);
      expect(workflow.negativeTriggers.length).toBeGreaterThan(0);
      expect(workflow.forbiddenAdjacency.length).toBeGreaterThan(0);
      expect(workflow.requiredGates.length).toBeGreaterThan(0);
      expect(workflow.allowedWrites.length).toBeGreaterThan(0);
      expect(workflow.reportSections.length).toBeGreaterThan(0);
    }
  });

  it("keeps routing descriptions focused on trigger selection", () => {
    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      const { description } = getTruthmarkWorkflow(id);

      expect(description).toMatch(/^Use (automatically|when)/);
      expect(description).toContain("Not for");
      expect(description.split(/\s+/u).length).toBeLessThanOrEqual(50);
      expect(description).not.toContain("Report ");
      expect(description).not.toContain("Workflow:");
    }
  });
});
