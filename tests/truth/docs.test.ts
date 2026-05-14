import { describe, expect, it } from "vitest";

import { createDefaultConfig } from "../../src/config/defaults.js";
import { resolveTruthDocsRoot } from "../../src/truth/docs.js";

describe("resolveTruthDocsRoot", () => {
  it("falls back to the default truth root when the truth root is omitted", () => {
    const config = createDefaultConfig();
    delete config.docs.roots.truth;

    expect(resolveTruthDocsRoot(config)).toBe("docs/truth");
  });
});
