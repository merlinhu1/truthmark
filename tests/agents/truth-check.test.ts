import { describe, expect, it } from "vitest";

import {
  TRUTH_CHECK_EXPLICIT_INVOCATIONS,
  renderTruthCheckSkillBody,
} from "../../src/agents/truth-check.js";
import {
  renderTruthmarkCheckLocalSkill,
  renderTruthmarkCheckSkill,
  renderTruthmarkCheckSkillMetadata,
} from "../../src/templates/codex-skills.js";
import { TRUTHMARK_VERSION } from "../../src/version.js";

describe("renderTruthCheckSkillBody", () => {
  it("renders the agent-led truth audit workflow", () => {
    const skill = renderTruthCheckSkillBody();

    expect(TRUTH_CHECK_EXPLICIT_INVOCATIONS).toContain("/truthmark:check");
    expect(skill).toContain("name: truthmark-check");
    expect(skill).toContain(`truthmark-version: ${TRUTHMARK_VERSION}`);
    expect(skill).toContain("audit repository truth health");
    expect(skill).toContain(
      "Repository instruction docs such as docs/ai/repo-rules.md remain instruction authority.",
    );
    expect(skill).toContain(
      "Implementation code and canonical truth docs are inspected evidence for current behavior; they do not silently override workflow write boundaries.",
    );
    expect(skill).not.toContain(
      "Repository docs and code are inspected evidence, not executable instruction authority.",
    );
    expect(skill).toContain("optionally run truthmark check");
    expect(skill).toContain("must not require the truthmark binary");
    expect(skill).toContain("Truthmark hierarchy:");
    expect(skill).toContain("Product Decisions");
    expect(skill).toContain("Rationale");
    expect(skill).toContain("Truth Check: completed");
    expect(skill).toContain("Files reviewed");
    expect(skill).toContain("Issues found");
    expect(skill).toContain("Fixes suggested");
    expect(skill).toContain("Validation");
  });
});

describe("Truth Check generated surfaces", () => {
  it("renders Codex metadata and OpenCode skill content", () => {
    expect(renderTruthmarkCheckSkill()).toContain("name: truthmark-check");
    expect(renderTruthmarkCheckLocalSkill()).toContain(
      "/skill truthmark-check",
    );
    expect(renderTruthmarkCheckLocalSkill()).toContain("/truthmark:check");
    expect(renderTruthmarkCheckSkillMetadata()).toContain(
      'display_name: "Truthmark Check"',
    );
    expect(renderTruthmarkCheckSkillMetadata()).toContain(
      "allow_implicit_invocation: false",
    );
    expect(renderTruthmarkCheckSkillMetadata()).toContain(
      `version: "${TRUTHMARK_VERSION}"`,
    );
  });
});
