import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli/main.ts"],
  format: ["esm"],
  platform: "node",
  skipNodeModulesBundle: true,
  target: "node20",
  clean: true,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});