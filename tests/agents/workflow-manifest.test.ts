import { describe, expect, it } from "vitest";
import matter from "gray-matter";

import {
  TRUTHMARK_WORKFLOW_IDS,
  TRUTHMARK_WORKFLOW_MANIFEST,
  getTruthmarkWorkflow,
} from "../../src/agents/workflow-manifest.js";
import { renderTruthCheckSkillBody } from "../../src/agents/truth-check.js";
import { renderTruthDocumentSkillBody } from "../../src/agents/truth-document.js";
import { renderTruthPreviewSkillBody } from "../../src/agents/truth-preview.js";
import { renderTruthStructureSkillBody } from "../../src/agents/truth-structure.js";
import { renderTruthSyncSkillBody } from "../../src/agents/truth-sync.js";
import {
  renderTruthmarkPortalSkill,
  renderTruthmarkRealizeSkill,
} from "../../src/templates/workflow-surfaces.js";

const renderWorkflowSkill = (id: (typeof TRUTHMARK_WORKFLOW_IDS)[number]) => {
  switch (id) {
    case "truthmark-sync":
      return renderTruthSyncSkillBody();
    case "truthmark-structure":
      return renderTruthStructureSkillBody();
    case "truthmark-document":
      return renderTruthDocumentSkillBody();
    case "truthmark-preview":
      return renderTruthPreviewSkillBody();
    case "truthmark-realize":
      return renderTruthmarkRealizeSkill();
    case "truthmark-check":
      return renderTruthCheckSkillBody();
    case "truthmark-portal":
      return renderTruthmarkPortalSkill();
  }
};

describe("Truthmark workflow manifest", () => {
  it("is the source for generated skill frontmatter descriptions", () => {
    for (const id of TRUTHMARK_WORKFLOW_IDS) {
      const parsed = matter(renderWorkflowSkill(id));

      expect(parsed.data.name).toBe(id);
      expect(parsed.data.description).toBe(
        getTruthmarkWorkflow(id).description,
      );
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

  it("declares optional helper metadata with manual fallbacks", () => {
    const sync = getTruthmarkWorkflow("truthmark-sync");
    const document = getTruthmarkWorkflow("truthmark-document");

    expect(sync.helpers?.map((helper) => helper.id)).toEqual([
      "validate-sync-report",
      "validate-write-lease",
    ]);
    expect(document.helpers?.map((helper) => helper.id)).toEqual([
      "validate-document-report",
      "validate-write-lease",
    ]);

    for (const workflow of [sync, document]) {
      expect(workflow.reportSections).toContain("Helper scripts");

      for (const helper of workflow.helpers ?? []) {
        expect(helper.optional).toBe(true);
        expect(helper.runner).toMatch(/^truthmark>=/u);
        expect(helper.command.argv).toEqual(
          expect.arrayContaining(["truthmark", "validate", "--json"]),
        );
        expect(helper.command.argv.join(" ")).not.toContain("node scripts/");
        expect(helper.inputs.length).toBeGreaterThan(0);
        expect(helper.output).toBe("json");
        expect(helper.writes).toBe(false);
        expect(helper.fallback).toMatch(/manual/i);
      }
    }

    expect(getTruthmarkWorkflow("truthmark-preview").helpers).toBeUndefined();
  });

  it("defines read-only and write-capable subagent recommendations by workflow", () => {
    expect(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-preview"].subagents).toEqual([
      "truth_route_auditor",
    ]);
    expect(
      getTruthmarkWorkflow("truthmark-preview").writeSubagents,
    ).toBeUndefined();
    expect(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-check"].subagents).toEqual([
      "truth_route_auditor",
      "truth_claim_verifier",
      "truth_doc_reviewer",
    ]);
    expect(
      getTruthmarkWorkflow("truthmark-check").writeSubagents,
    ).toBeUndefined();
    expect(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-document"].subagents).toEqual(
      ["truth_route_auditor", "truth_claim_verifier"],
    );
    expect(
      TRUTHMARK_WORKFLOW_MANIFEST["truthmark-document"].writeSubagents,
    ).toEqual(["truth_doc_writer"]);
    expect(TRUTHMARK_WORKFLOW_MANIFEST["truthmark-sync"].subagents).toEqual([
      "truth_route_auditor",
      "truth_claim_verifier",
    ]);
    expect(
      TRUTHMARK_WORKFLOW_MANIFEST["truthmark-sync"].writeSubagents,
    ).toEqual(["truth_doc_writer"]);
    expect(
      TRUTHMARK_WORKFLOW_MANIFEST["truthmark-structure"].subagents,
    ).toEqual(["truth_route_auditor"]);
    expect(
      getTruthmarkWorkflow("truthmark-structure").writeSubagents,
    ).toBeUndefined();
    expect(getTruthmarkWorkflow("truthmark-realize").subagents).toBeUndefined();
    expect(
      getTruthmarkWorkflow("truthmark-realize").writeSubagents,
    ).toBeUndefined();
  });
  it("defines Truth Preview as an explicit read-only planning surface", () => {
    const workflow = getTruthmarkWorkflow(
      "truthmark-preview" as (typeof TRUTHMARK_WORKFLOW_IDS)[number],
    );

    expect(workflow.displayName).toBe("Truthmark Preview");
    expect(workflow.allowImplicitInvocation).toBe(false);
    expect(workflow.allowedWrites).toEqual(["none by default"]);
    expect(workflow.reportSections).toEqual([
      "Requested outcome",
      "Likely workflow",
      "Why this workflow",
      "Likely route owner",
      "Expected write classes",
      "Expected target files",
      "Suggested subagent use",
      "Blocking ambiguity",
      "Handoff",
    ]);
  });

  it("defines Truthmark Portal as a manual-only presentation workflow", () => {
    const workflow = getTruthmarkWorkflow("truthmark-portal");

    expect(workflow.displayName).toBe("Truthmark Portal");
    expect(workflow.allowImplicitInvocation).toBe(false);
    expect(workflow.positiveTriggers).toEqual(
      expect.arrayContaining([
        "generate the Truthmark Portal",
        "refresh the committed HTML docs site",
        "update docs/truthmark-portal",
      ]),
    );
    expect(workflow.negativeTriggers).toEqual(
      expect.arrayContaining([
        "code change sync",
        "route ownership repair",
        "truth validation or checking",
        "machine-readable agent context",
      ]),
    );
    expect(workflow.allowedWrites).toEqual(["configured Portal output directory only"]);
    expect(workflow.reportSections).toEqual([
      "Output path",
      "Page count",
      "Diagrams/assets",
      "Source docs reviewed",
      "Skipped/ambiguous docs",
      "Validation",
      "Markdown canonical statement",
    ]);
    expect(workflow.subagents).toBeUndefined();
    expect(workflow.writeSubagents).toBeUndefined();
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
