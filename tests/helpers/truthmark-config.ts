import fs from "node:fs/promises";
import path from "node:path";

import type { TruthmarkPlatform } from "../../src/config/schema.js";
import { renderConfig } from "../../src/config/render.js";

export const writeTruthmarkConfig = async (
  rootDir: string,
  platforms: readonly TruthmarkPlatform[] = [],
): Promise<void> => {
  const configPath = path.join(rootDir, ".truthmark/config.yml");
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, renderConfig(platforms), "utf8");
};
