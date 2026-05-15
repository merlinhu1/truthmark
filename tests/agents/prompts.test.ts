import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { renderTruthRealizePrompt } from "../../src/agents/prompts.js";
import { renderTruthmarkRealizeSkill } from "../../src/templates/codex-skills.js";

describe("renderTruthRealizePrompt", () => {
  it("renders manual doc-first realization guidance without a dedicated CLI command", () => {
    const prompt = renderTruthRealizePrompt();

    expect(prompt).toContain("### Manual Truth Realize");
    expect(prompt).toContain("Only run when the user explicitly asks");
    expect(prompt).toContain(
      "read the updated truth docs plus .truthmark/config.yml, route files, relevant code, and tests",
    );
    expect(prompt).toContain("Truth-doc ownership gate");
    expect(prompt).toContain(
      "if a source truth doc is broad, mixed-owner, index-like, unrouteable, stale, or conflicts with implementation evidence",
    );
    expect(prompt).toContain(
      "implement only bounded, current truth claims from the source docs",
    );
    expect(prompt).toContain("RepoIndex, RouteMap, ImpactSet, and ContextPack");
    expect(prompt).toContain("workflow write boundaries");
    expect(prompt).toContain("write functional code only");
    expect(prompt).toContain("do not edit truth docs or truth routing");
    expect(prompt).not.toContain("Truth-doc restructure gate");
    expect(prompt).not.toContain("Truth-doc shape repair gate");
    expect(prompt).not.toContain("restructure truth docs");
    expect(prompt).toContain("Report changed code files and verification steps");
    expect(prompt).toContain("installed instruction or skill");
    expect(prompt).toContain("/truthmark-realize");
    expect(prompt).toContain("$truthmark-realize");
    expect(prompt).toContain("/truthmark:realize");
    expect(prompt).toContain("OpenCode");
    expect(prompt).toContain("/skill truthmark-realize");
    expect(prompt).not.toContain("truthmark realize");
  });

  it("uses the configured truth root in its example report", () => {
    const config = createDefaultConfig();
    config.docs.roots.truth = "docs/product";

    const prompt = renderTruthRealizePrompt(config);

    expect(prompt).toContain("docs/product/authentication/session-timeout.md");
    expect(prompt).not.toContain("docs/truth/authentication/session-timeout.md");
  });

  it("renders adjacent-workflow exclusions in generated skill metadata", () => {
    const skill = renderTruthmarkRealizeSkill();

    expect(skill).toContain(
      "description: Use when the user explicitly asks to realize Truthmark truth docs into code",
    );
    expect(skill).toContain(
      "Not for syncing docs after code changes, documenting existing code, topology repair, or truth audits.",
    );
  });
});
