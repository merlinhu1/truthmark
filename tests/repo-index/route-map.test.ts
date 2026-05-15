import { afterEach, describe, expect, it } from "vitest";

import { runConfig } from "../../src/config/command.js";
import { runInit } from "../../src/init/init.js";
import { buildRouteMap } from "../../src/repo-index/route-map.js";
import { createTempRepo, type TempRepo } from "../helpers/temp-repo.js";

describe("buildRouteMap", () => {
  const repos: TempRepo[] = [];

  afterEach(async () => {
    await Promise.all(repos.splice(0).map((repo) => repo.cleanup()));
  });

  it("projects Truthmark area routing into route-map/v0", async () => {
    const repo = await createTempRepo();
    repos.push(repo);
    await repo.writeFile("src/index.ts", "export const value = 1;\n");
    await runConfig(repo.rootDir, { force: false, stdout: false });
    await runInit(repo.rootDir);

    const routeMap = await buildRouteMap(repo.rootDir);

    expect(routeMap.schemaVersion).toBe("route-map/v0");
    expect(routeMap.routes.length).toBeGreaterThan(0);
    expect(routeMap.routes[0]).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        codeSurface: expect.any(Array),
        truthDocs: expect.any(Array),
      }),
    );
  });
});
