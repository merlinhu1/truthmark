import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createCheckout, initializeGitRepository, type Checkout } from "./checkout.js";

export type TempRepo = Checkout & {
  cleanup: () => Promise<void>;
};

export const createTempRepo = async (): Promise<TempRepo> => {
  // Canonicalize: on Windows `os.tmpdir()` can hand back an 8.3 short path
  // (C:\Users\RUNNER~1\...) while the code under test resolves through
  // realpath, so an uncanonicalized root makes every path assertion mismatch.
  const rootDir = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), "truthmark-")),
  );

  await initializeGitRepository(rootDir);

  return {
    ...createCheckout(rootDir),
    async cleanup() {
      await fs.rm(rootDir, { recursive: true, force: true });
    },
  };
};
