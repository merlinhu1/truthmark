import { execa } from "execa";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspaceRoot = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const cliEntrypoint = path.resolve(
  fileURLToPath(new URL("../../src/cli/main.ts", import.meta.url)),
);
const tsxLoader = pathToFileURL(
  path.resolve(fileURLToPath(new URL("../../node_modules/tsx/dist/loader.mjs", import.meta.url))),
).href;

export const runCli = async (args: string[], options: { cwd?: string } = {}) => {
  return execa(process.execPath, ["--import", tsxLoader, cliEntrypoint, ...args], {
    cwd: options.cwd ?? workspaceRoot,
    reject: false,
  });
};