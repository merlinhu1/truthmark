import { describe, it } from "node:test";
import { expect } from "expect";
import { parse } from "yaml";

import {
  renderConfig,
  updateConfigPlatforms,
} from "../../src/config/render.js";

describe("config rendering", () => {
  it("renders the existing host-neutral version-2 defaults", () => {
    const text = renderConfig([]);
    const config = parse(text) as Record<string, unknown>;

    expect(config.version).toBe(2);
    expect(config).not.toHaveProperty("platforms");
    expect(config.truthmark).toEqual({
      workspace: "docs/truthmark",
      generated: { portal: { enabled: false } },
    });
  });

  it("renders selected platforms in catalog order", () => {
    const config = parse(renderConfig(["cursor", "codex"])) as {
      platforms: string[];
    };

    expect(config.platforms).toEqual(["codex", "cursor"]);
  });

  it("updates only platforms while preserving comments and supported values", () => {
    const source = `# repository config
version: 2
# host ownership
platforms:
  - codex
truthmark:
  workspace: custom/truth
  generated:
    portal:
      enabled: true
frontmatter:
  required:
    - status
ignore:
  - output/**
`;

    const updated = updateConfigPlatforms(source, ["cursor"]);
    const config = parse(updated) as {
      platforms: string[];
      truthmark: { workspace: string };
      ignore: string[];
    };

    expect(updated).toContain("# repository config");
    expect(updated).toContain("# host ownership");
    expect(config.platforms).toEqual(["cursor"]);
    expect(config.truthmark.workspace).toBe("custom/truth");
    expect(config.ignore).toEqual(["output/**"]);
  });

  it("removes the platforms key for host-neutral selection", () => {
    const source = renderConfig(["codex"]);
    const config = parse(updateConfigPlatforms(source, [])) as Record<
      string,
      unknown
    >;

    expect(config).not.toHaveProperty("platforms");
  });

  it("keeps source bytes when normalized selection is unchanged", () => {
    const source = `# keep bytes
version: 2
platforms: [codex, cursor]
truthmark:
  workspace: docs/truthmark
  generated:
    portal: { enabled: false }
`;

    expect(updateConfigPlatforms(source, ["cursor", "codex"])).toBe(source);
  });
});
