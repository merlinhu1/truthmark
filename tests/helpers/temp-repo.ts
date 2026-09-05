import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createCheckout, initializeGitRepository, type Checkout } from "./checkout.js";

export type TempRepo = Checkout & {
  cleanup: () => Promise<void>;
};

export const createTempRepo = async (): Promise<TempRepo> => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-"));

  await initializeGitRepository(rootDir);

  return {
    ...createCheckout(rootDir),
    async cleanup() {
      await fs.rm(rootDir, { recursive: true, force: true });
    },
  };
};
