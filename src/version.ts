import fs from "node:fs";

type TruthmarkPackageJson = {
  version: string;
};

const packageJson = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as TruthmarkPackageJson;

export const TRUTHMARK_VERSION = packageJson.version;
