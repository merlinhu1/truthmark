import { loadConfig } from "../config/load.js";
import { resolveAreaRouting } from "../routing/area-resolver.js";
import { resolveTruthDocsRoot } from "../truth/docs.js";
import type { RouteMap } from "./types.js";

export const buildRouteMap = async (rootDir: string): Promise<RouteMap> => {
  const loadResult = await loadConfig(rootDir);

  if (!loadResult.config) {
    return {
      schemaVersion: "route-map/v0",
      routes: [],
      diagnostics: loadResult.diagnostics,
    };
  }

  const routing = await resolveAreaRouting(rootDir, {
    rootIndex: loadResult.config.docs.routing.rootIndex,
    areaFilesRoot: loadResult.config.docs.routing.areaFilesRoot,
    truthDocsRoot: resolveTruthDocsRoot(loadResult.config),
  });

  return {
    schemaVersion: "route-map/v0",
    routes: routing.areas
      .map((area) => ({
        id: area.id,
        name: area.name,
        key: area.key,
        sourcePath: area.sourcePath,
        parentName: area.parentName,
        codeSurface: [...area.codeSurface].sort(),
        truthDocs: [...area.truthDocuments].sort(),
        updateTruthWhen: [...area.updateTruthWhen],
      }))
      .sort((left, right) => left.key.localeCompare(right.key)),
    diagnostics: routing.diagnostics,
  };
};
