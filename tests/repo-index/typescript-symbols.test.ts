import { describe, expect, it } from "vitest";

import { analyzeTypeScriptSource } from "../../src/repo-index/typescript-symbols.js";

describe("analyzeTypeScriptSource", () => {
  it("extracts imports, exports, and public symbols from TypeScript source", () => {
    const result = analyzeTypeScriptSource(
      "src/service.ts",
      [
        "import defaultThing, { readFile as read } from 'node:fs/promises';",
        "import * as pathTools from 'node:path';",
        "export class Service {}",
        "export const value = 1;",
        "export function run() { return value; }",
        "export interface Options { enabled: boolean }",
        "export type Mode = 'auto';",
        "export enum State { Ready }",
        "export { helper } from './helper.js';",
      ].join("\n"),
    );

    expect(result.imports).toContainEqual({
      from: "src/service.ts",
      specifier: "node:fs/promises",
      imported: ["default", "readFile"],
    });
    expect(result.imports).toContainEqual({
      from: "src/service.ts",
      specifier: "node:path",
      imported: ["*"],
    });
    expect(result.exports).toContainEqual({ path: "src/service.ts", name: "Service", kind: "class" });
    expect(result.exports).toContainEqual({ path: "src/service.ts", name: "value", kind: "const" });
    expect(result.exports).toContainEqual({ path: "src/service.ts", name: "run", kind: "function" });
    expect(result.exports).toContainEqual({ path: "src/service.ts", name: "Options", kind: "interface" });
    expect(result.exports).toContainEqual({ path: "src/service.ts", name: "Mode", kind: "type" });
    expect(result.exports).toContainEqual({ path: "src/service.ts", name: "State", kind: "enum" });
    expect(result.exports).toContainEqual({ path: "src/service.ts", name: "helper", kind: "re-export" });
    expect(result.publicSymbols).toContainEqual({ path: "src/service.ts", name: "run", kind: "function" });
  });
});
