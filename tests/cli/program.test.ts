import { describe, it } from "node:test";
import { expect } from "expect";

import { buildProgram } from "../../src/cli/program.js";

describe("CLI program", () => {
  it("describes index as workflow routing metadata instead of semantic code indexing", () => {
    const program = buildProgram();
    const indexCommand = program.commands.find(
      (command) => command.name() === "index",
    );

    expect(indexCommand?.description()).toBe(
      "Inspect derived Truthmark workflow routing metadata for the current checkout.",
    );
  });
});
