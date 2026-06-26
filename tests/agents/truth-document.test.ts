import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "../../src/markdown/frontmatter.js";

import { createDefaultConfig } from "../../src/config/defaults.js";
import {
  TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS,
  renderTruthDocumentReportExample,
  renderTruthDocumentSkillBody,
} from "../../src/agents/truth-document.js";
import {
  renderTruthmarkDocumentClaudeSkill,
  renderTruthmarkCopilotDocumentPrompt,
  renderTruthmarkDocumentLocalSkill,
  renderTruthmarkDocumentSkill,
  renderTruthmarkDocumentSkillMetadata,
  renderTruthmarkSkillPackage,
} from "../../src/templates/workflow-surfaces.js";

describe("renderTruthDocumentSkillBody", () => {
  it("renders parseable skill frontmatter", () => {
    const parsed = parseFrontmatter(renderTruthDocumentSkillBody());

    expect(parsed.data.name).toBe("truthmark-document");
    expect(parsed.data["user-invocable"]).toBe(true);
    expect(parsed.data.description).toContain(
      "finds implemented behavior missing canonical truth",
    );
    expect(parsed.data.description).toContain(
      "Not for functional-code changes, doc-first implementation, or topology repair that needs Structure",
    );
    expect(parsed.data.description).not.toContain("when an update finds");
    expect(parsed.content).toContain(
      "Use this skill to document existing implemented behavior",
    );
  });

  it("renders the manual existing-implementation documentation workflow", () => {
    const skill = renderTruthDocumentSkillBody();

    expect(TRUTH_DOCUMENT_EXPLICIT_INVOCATIONS).toContain("Cursor /truthmark-document");
    expect(skill).toContain("name: truthmark-document");
    expect(skill).toContain("manual and implementation-first");
    expect(skill).toContain("existing implemented behavior");
    expect(skill).toContain("no functional-code changes");
    expect(skill).toContain("must not write functional code");
    expect(skill).toContain("configured Truthmark templates root");
    expect(skill).toContain("When creating or updating a truth doc");
    expect(skill).toContain("Truth-doc prose style:");
    expect(skill).toContain("Use professional, plain technical prose");
    expect(skill).toContain("Prefer specific current-state claims over promotional, symbolic, or generic significance language");
    expect(skill).toContain("Avoid common AI-writing tells");
    expect(skill).toContain(
      "one durable claim per bullet or line; paragraphs should be no longer than one or two short sentences",
    );
    expect(skill).toContain("Do not add personality, rhetorical flourish, first-person commentary, or marketing tone");
    expect(skill).toContain("without removing scope, evidence, decisions, or source references");
    expect(skill).not.toContain("PERSONALITY AND SOUL");
    expect(skill).not.toContain("What makes the below so obviously AI generated?");
    expect(skill).toContain("HTML comments under each template section");
    expect(skill).toContain("normative authoring guidance");
    expect(skill).toContain("Truth-doc ownership review");
    expect(skill).toContain(
      "if the target doc is broad, mixed-owner, index-like, or the documented behavior spans independent owners",
    );
    expect(skill).toContain(
      "report Ownership reviewed, Structure required, Truth docs split, Truth docs restructured, or Manual handoff reason",
    );
    expect(skill).toContain(
      "Decision/Rationale preservation review",
    );
    expect(skill).toContain(
      "before any truth-doc split, restructure, or shape repair, inventory existing Product Decisions, Engineering Decisions, and Rationale sections",
    );
    expect(skill).toContain(
      "preserve each current decision and rationale in the correct product or engineering lane owner",
    );
    expect(skill).toContain(
      "if ownership of a decision or rationale is unclear, stop with manual-review files",
    );
    expect(skill).toContain("Truth-doc shape repair review");
    expect(skill).toContain(
      "Truth Document may restructure only truth docs for the implemented behavior being documented.",
    );
    expect(skill).toContain("use Truth Structure for ownership splits");
    expect(skill).toContain(
      "repair shape when a narrow edit would make truth worse",
    );
    expect(skill).toContain("behavior-oriented, not endpoint-oriented");
    expect(skill).toContain(
      "Maintain architecture docs only for structure-level changes",
    );
    expect(skill).toContain(
      "Keep ordinary behavior, endpoints, UI copy, validation rules, and bug fixes in behavior or contract docs",
    );
    expect(skill).toContain(
      "run Truth Structure first when routing repair is safe and in scope",
    );
    expect(skill).toContain(
      "stop and recommend Truth Structure when routing repair is unsafe, ambiguous, or outside the task boundary",
    );
    expect(skill).toContain(
      "Repository instruction files and explicitly configured policy docs remain instruction authority when present; do not assume a repository uses any particular policy path.",
    );
    expect(skill).toContain("RepoIndex, RouteMap, ImpactSet, and WorkflowState/action context");
    expect(skill).toContain("repository-intelligence artifacts were not generated");
    expect(skill).toContain("Evidence checklist");
    expect(skill).toContain(
      "route-first: map the documented behavior to bounded route owners and primary canonical docs",
    );
    expect(skill).toContain(
      "support claims with primary checkout evidence",
    );
    expect(skill).toContain(
      "remove, narrow, or record unsupported claims for manual handoff",
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
    expect(report).toContain("docs/truthmark/engineering/contracts/routing.md");
    expect(report).toContain("Evidence checked");
    expect(report).toContain("Claim:");
  });

  it("uses the provided hierarchy config in embedded report examples", () => {
    const config = createDefaultConfig();
    config.truthmark.paths.routesIndex = "docs/routes/index.md";
    config.truthmark.paths.routeAreasRoot = "docs/routes/areas";

    const skill = renderTruthDocumentSkillBody(config);

    expect(skill).toContain("docs/truthmark/engineering/contracts/routing.md");
    expect(skill).toContain("docs/truthmark/engineering/behaviors/check-diagnostics.md");
    expect(skill).toContain("docs/routes/index.md");
  });
});

describe("Truth Document generated surfaces", () => {
  it("renders Codex metadata and OpenCode skill content", () => {
    expect(renderTruthmarkDocumentSkill()).toContain("name: truthmark-document");
    expect(renderTruthmarkDocumentSkill()).toContain("Codex subagent mode:");
    expect(renderTruthmarkDocumentSkill()).toContain(
      "use automatically when this workflow runs in Codex",
    );
    expect(renderTruthmarkDocumentSkill()).toContain("truth_route_auditor");
    expect(renderTruthmarkDocumentSkill()).toContain("truth_claim_verifier");
    expect(renderTruthmarkDocumentSkill()).toContain("truth_doc_writer");
    expect(renderTruthmarkDocumentSkill()).toContain(
      "Parent agent owns Truth Document acceptance, lease validation, and final report",
    );
    expect(renderTruthmarkDocumentSkill()).toContain(
      "validate the worker report against the actual worker diff",
    );
    expect(renderTruthmarkDocumentClaudeSkill()).toContain(
      "Claude Code subagent mode:",
    );
    expect(renderTruthmarkDocumentClaudeSkill()).toContain(
      "use automatically when this workflow runs in Claude Code",
    );
    expect(renderTruthmarkDocumentClaudeSkill()).toContain(
      "truth-route-auditor subagent",
    );
    expect(renderTruthmarkDocumentClaudeSkill()).toContain(
      "truth-claim-verifier subagent",
    );
    expect(renderTruthmarkDocumentClaudeSkill()).toContain(
      "truth-doc-writer subagent",
    );
    expect(renderTruthmarkDocumentClaudeSkill()).toContain(
      "Parent agent owns Truth Document acceptance, lease validation, and final report",
    );
    expect(renderTruthmarkDocumentLocalSkill()).not.toContain(
      "Codex subagent mode:",
    );
    expect(renderTruthmarkDocumentLocalSkill()).not.toContain(
      "Claude Code subagent mode:",
    );
    expect(renderTruthmarkDocumentLocalSkill()).not.toContain("OpenCode /skill truthmark-document");
    expect(renderTruthmarkDocumentLocalSkill()).not.toContain("Cursor /truthmark-document");
    expect(renderTruthmarkDocumentSkillMetadata()).toContain(
      'display_name: "Truthmark Document"',
    );
    expect(renderTruthmarkDocumentSkillMetadata()).toContain(
      "allow_implicit_invocation: false",
    );
    expect(renderTruthmarkDocumentSkillMetadata()).toContain(
      'refresh_command: "truthmark init"',
    );
    const cursorDocumentPackage = renderTruthmarkSkillPackage({
      skillPath: ".cursor/skills/truthmark-document/SKILL.md",
      workflowId: "truthmark-document",
      host: "cursor",
    });
    const cursorDocumentSkill =
      cursorDocumentPackage.find((file) => file.path.endsWith("/SKILL.md"))?.content ?? "";
    const cursorDocumentProcedure =
      cursorDocumentPackage.find((file) => file.path.endsWith("/support/procedure.md"))
        ?.content ?? "";
    const cursorDocumentReportTemplate =
      cursorDocumentPackage.find((file) => file.path.endsWith("/support/report-template.md"))
        ?.content ?? "";

    expect(cursorDocumentSkill).toContain("Use as a Cursor Agent Skill.");
    expect(cursorDocumentSkill).toContain(".cursor/skills/");
    expect(cursorDocumentSkill).toContain("Progressive disclosure:");
    expect(cursorDocumentSkill).toContain("support/procedure.md");
    expect(cursorDocumentSkill).toContain("support/report-template.md");
    expect(renderTruthmarkCopilotDocumentPrompt()).toContain(
      "This prompt is the GitHub Copilot entrypoint for Truthmark Document.",
    );
    for (const surface of [renderTruthmarkCopilotDocumentPrompt()]) {
      expect(surface).toContain("Do not invoke another Truthmark command from here.");
      expect(surface).toContain(
        "If skill entrypoints are unavailable, use the host's direct evidence-first manual fallback procedure.",
      );
      expect(surface).not.toContain("render the full workflow");
    }

    expect(renderTruthmarkCopilotDocumentPrompt()).toContain(
      "support/procedure.md",
    );
    expect(renderTruthmarkCopilotDocumentPrompt()).toContain(
      "support/report-template.md",
    );
    expect(cursorDocumentProcedure).toContain("Truthmark Document Procedure");
    expect(cursorDocumentProcedure).not.toContain("Report completion in this shape:");
    expect(cursorDocumentReportTemplate).toContain("Report completion in this shape:");
  });
});
