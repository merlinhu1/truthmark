import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { resolveTruthDocsRoot } from "../../src/truth/docs.js";

describe("resolveTruthDocsRoot", () => {
  it("returns the normalized configured truth root", () => {
    const config = createDefaultConfig();

    expect(resolveTruthDocsRoot(config)).toBe("docs/truthmark/engineering");
  });
});
