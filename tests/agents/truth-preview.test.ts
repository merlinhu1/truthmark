import { describe, expect, it } from "vitest";

import {
  TRUTH_PREVIEW_EXPLICIT_INVOCATIONS,
  renderTruthPreviewSkillBody,
} from "../../src/agents/truth-preview.js";
import {
  renderTruthmarkCopilotPreviewPrompt,
  renderTruthmarkGeminiPreviewCommand,
} from "../../src/templates/workflow-surfaces.js";

describe("renderTruthPreviewSkillBody", () => {
  it("renders a thin explicit read-only preview workflow", () => {
    const skill = renderTruthPreviewSkillBody();

    expect(TRUTH_PREVIEW_EXPLICIT_INVOCATIONS.copilot).toContain(
      "/truthmark-preview",
    );
    expect(TRUTH_PREVIEW_EXPLICIT_INVOCATIONS.gemini).toContain(
      "/truthmark:preview",
    );
    expect(skill).toContain("name: truthmark-preview");
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
    expect(skill).toContain("Manual handoff questions");
    expect(skill).toContain("Handoff:");
    expect(skill).toContain("truth_route_auditor");
    expect(skill).not.toContain("truth_doc_writer");
  });

  it("bounds route reads to the root route index and relevant child route files", () => {
    const skill = renderTruthPreviewSkillBody();

    expect(skill).toContain(
      "- docs/truthmark/routes/areas.md, first, only when present",
    );
    expect(skill).toContain(
      "- relevant child route files under docs/truthmark/routes/areas/ for the selected scope or changed paths, only when present",
    );
    expect(skill).not.toContain(
      "configured route files (docs/truthmark/routes/areas.md; docs/truthmark/routes/areas/)",
    );
  });
});

describe("Truth Preview generated surfaces", () => {
  it("renders Copilot/Gemini adapter surfaces only", () => {
    const copilotPrompt = renderTruthmarkCopilotPreviewPrompt();
    const geminiCommand = renderTruthmarkGeminiPreviewCommand();

    expect(copilotPrompt).toContain(TRUTH_PREVIEW_EXPLICIT_INVOCATIONS.copilot);
    expect(copilotPrompt).not.toContain(
      TRUTH_PREVIEW_EXPLICIT_INVOCATIONS.gemini,
    );
    expect(geminiCommand).toContain(TRUTH_PREVIEW_EXPLICIT_INVOCATIONS.gemini);
    expect(geminiCommand).not.toContain(
      TRUTH_PREVIEW_EXPLICIT_INVOCATIONS.copilot,
    );
    expect(copilotPrompt).not.toContain("OpenCode /skill truthmark-preview");
    expect(copilotPrompt).not.toContain("Codex /truthmark-preview");
    expect(copilotPrompt).not.toContain("Claude Code /truthmark-preview");
    expect(geminiCommand).not.toContain("OpenCode /skill truthmark-preview");
    expect(geminiCommand).not.toContain("Codex /truthmark-preview");
    expect(geminiCommand).not.toContain("Claude Code /truthmark-preview");
    expect(geminiCommand).not.toContain("GitHub Copilot /truthmark:preview");
  });
});
