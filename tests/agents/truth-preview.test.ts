import { describe, expect, it } from "vitest";
import {
  TRUTH_PREVIEW_EXPLICIT_INVOCATIONS,
  renderTruthPreviewSkillBody,
} from "../../src/agents/truth-preview.js";
import {
  renderTruthmarkSkillPackage,
  renderTruthmarkPreviewLocalSkill,
  renderTruthmarkPreviewSkill,
  renderTruthmarkPreviewSkillMetadata,
} from "../../src/templates/workflow-surfaces.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthPreviewSkillBody", () => {
  it("renders a thin explicit read-only preview workflow", () => {
    const skill = renderTruthPreviewSkillBody();

    expect(TRUTH_PREVIEW_EXPLICIT_INVOCATIONS).toContain("/truthmark:preview");
    expect(skill).toContain("name: truthmark-preview");
    expect(skill).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
    expect(skill).toContain("Truth Preview is read-only");
    expect(skill).toContain("intended, not authorized");
    expect(skill).toContain("must not edit files");
    expect(skill).toContain("must not create truth docs");
    expect(skill).toContain("must not update routing");
    expect(skill).toContain("must not run Truth Sync automatically");
    expect(skill).toContain("must not replace Truth Check");
    expect(skill).toContain("must not claim final correctness");
    expect(skill).toContain("must not issue write leases");
    expect(skill).toContain("must not mutate code");
    expect(skill).toContain("Likely workflow");
    expect(skill).toContain("Likely route owner");
    expect(skill).toContain("Expected write classes");
    expect(skill).toContain("Suggested subagent use");
    expect(skill).toContain("Blocking ambiguity");
    expect(skill).toContain("Handoff:");
    expect(skill).toContain("truth_route_auditor");
    expect(skill).not.toContain("truth_doc_writer");
  });

  it("bounds route reads to the root route index and relevant child route files", () => {
    const skill = renderTruthPreviewSkillBody();
    const packageEntrypoint = renderTruthmarkSkillPackage({
      skillPath: ".agents/skills/truthmark-preview/SKILL.md",
      workflowId: "truthmark-preview",
      host: "codex",
    }).find((file) => file.path.endsWith("/SKILL.md"))?.content;

    expect(skill).toContain(
      "- docs/truthmark/routes/areas.md, first, only when present",
    );
    expect(skill).toContain(
      "- relevant child route files under docs/truthmark/routes/areas/ for the selected scope or changed paths, only when present",
    );
    expect(packageEntrypoint).toContain(
      "the root route index (docs/truthmark/routes/areas.md) first when present",
    );
    expect(packageEntrypoint).toContain(
      "only child route files under docs/truthmark/routes/areas/ that are relevant to the selected scope or changed paths",
    );
    expect(packageEntrypoint).not.toContain(
      "configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/)",
    );
  });
});

describe("Truth Preview generated surfaces", () => {
  it("renders Codex skill and metadata without implicit invocation", () => {
    expect(renderTruthmarkPreviewSkill()).toContain("name: truthmark-preview");
    expect(renderTruthmarkPreviewSkill()).toContain("Truth Preview: completed");
    expect(renderTruthmarkPreviewLocalSkill()).toContain("/skill truthmark-preview");
    expect(renderTruthmarkPreviewSkillMetadata()).toContain(
      'display_name: "Truthmark Preview"',
    );
    expect(renderTruthmarkPreviewSkillMetadata()).toContain(
      "allow_implicit_invocation: false",
    );
  });
});
