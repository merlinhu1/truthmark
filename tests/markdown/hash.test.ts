import { describe, expect, it } from "vitest";

import { hashJsonLike, hashText } from "../../src/markdown/hash.js";

describe("hash helpers", () => {
  it("produces stable text hashes", () => {
    expect(hashText("Truthmark")).toBe(hashText("Truthmark"));
    expect(hashText("Truthmark")).not.toBe(hashText("truthmark"));
  });

  it("produces stable JSON-like hashes regardless of key order", () => {
    expect(hashJsonLike({ b: 2, a: 1, nested: { y: 2, x: 1 } })).toBe(
      hashJsonLike({ nested: { x: 1, y: 2 }, a: 1, b: 2 }),
    );
  });
});