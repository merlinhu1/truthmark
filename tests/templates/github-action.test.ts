import { describe, expect, it } from "vitest";

import { renderGitHubActionExample } from "../../src/templates/github-action.js";

describe("renderGitHubActionExample", () => {
  it("documents non-blocking and blocking Truthmark impact modes", () => {
    const content = renderGitHubActionExample();

    expect(content).toContain("truthmark impact --base");
    expect(content).toContain("truthmark check --base");
    expect(content).toContain("TRUTHMARK_BLOCKING");
    expect(content).toContain("github-script");
  });
});
