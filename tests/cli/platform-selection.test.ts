import { PassThrough, Readable, Writable } from "node:stream";
import { describe, it } from "node:test";
import { expect } from "expect";

import {
  parsePlatformSelection,
  promptForPlatforms,
  renderPlatformChoices,
} from "../../src/cli/platform-selection.js";

describe("interactive platform selection", () => {
  it("renders the authoritative catalog in stable order", () => {
    const output = renderPlatformChoices(["opencode", "cursor"]);

    expect(output).toContain("1. Codex [codex]");
    expect(output).toContain("2. OpenCode [opencode] (selected)");
    expect(output).toContain("6. Cursor [cursor] (selected)");
  });

  it("parses, deduplicates, and normalizes numbered choices", () => {
    expect(parsePlatformSelection("6, 1, 6", [])).toEqual([
      "codex",
      "cursor",
    ]);
  });

  it("keeps defaults on blank input", () => {
    expect(parsePlatformSelection("", ["cursor", "codex"])).toEqual([
      "codex",
      "cursor",
    ]);
  });

  it("supports an explicit host-neutral selection", () => {
    expect(parsePlatformSelection("none", ["codex"])).toEqual([]);
  });

  it("supports cancellation", () => {
    expect(parsePlatformSelection("q", ["codex"])).toBeNull();
  });

  it("rejects unsupported choice numbers", () => {
    expect(() => parsePlatformSelection("1,7", [])).toThrow(
      "Unsupported platform choice: 7",
    );
  });

  it("re-prompts after invalid interactive input", async () => {
    let output = "";
    const input = new PassThrough();
    setImmediate(() => input.write("9\n"));
    setTimeout(() => input.end("1\n"), 10);
    const selected = await promptForPlatforms({
      defaults: [],
      input,
      output: new Writable({
        write(chunk, _encoding, callback) {
          output += chunk.toString();
          callback();
        },
      }),
    });

    expect(selected).toEqual(["codex"]);
    expect(output).toContain("Unsupported platform choice: 9");
  });

  it("prompts through injected streams", async () => {
    let output = "";
    const selected = await promptForPlatforms({
      defaults: [],
      input: Readable.from(["2,5\n"]),
      output: new Writable({
        write(chunk, _encoding, callback) {
          output += chunk.toString();
          callback();
        },
      }),
    });

    expect(selected).toEqual(["opencode", "antigravity"]);
    expect(output).toContain("Select platforms");
  });
});
