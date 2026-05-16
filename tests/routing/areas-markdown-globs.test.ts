import { describe, expect, it } from "vitest";

import { parseAreasMarkdown } from "../../src/routing/areas.js";

describe("parseAreasMarkdown Markdown glob handling", () => {
  it("normalizes Prettier-escaped Markdown glob values", () => {
    const result = parseAreasMarkdown(`# Truthmark Areas

## Authentication

Truth documents:
- docs/truth/authentication.md

Code surface:
- src/auth/\\*\\*
- src/session/\\*\\*

Update truth when:
- authentication behavior changes
`);

    expect(result.diagnostics).toEqual([]);
    expect(result.areas[0]?.codeSurface).toEqual([
      "src/auth/**",
      "src/session/**",
    ]);
  });
});
