import { loadConfig } from "../config/load.js";
import { resolveAreaRouting } from "../routing/area-resolver.js";
import {
  mergeTruthDocumentEntryRelationships,
  type TruthDocumentEntry,
} from "../routing/areas.js";
import {
  resolveEngineeringTruthRoot,
  resolveProductTruthRoot,
} from "../truth/docs.js";
import type { RouteMap } from "./types.js";

const mergedEntryMap = (
  entries: TruthDocumentEntry[],
): Map<string, TruthDocumentEntry> => {
  const byPath = new Map<string, TruthDocumentEntry>();

  for (const entry of entries) {
    const existingEntry = byPath.get(entry.path);
    if (
      existingEntry &&
      existingEntry.kind === entry.kind &&
      existingEntry.lane === entry.lane
    ) {
      byPath.set(
        entry.path,
        mergeTruthDocumentEntryRelationships(existingEntry, entry),
      );
    } else if (!existingEntry) {
      byPath.set(entry.path, entry);
    }
  }

  return byPath;
};

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
    rootIndex: loadResult.config.truthmark.paths.routesIndex,
    areaFilesRoot: loadResult.config.truthmark.paths.routeAreasRoot,
    productTruthRoot: resolveProductTruthRoot(loadResult.config),
    engineeringTruthRoot: resolveEngineeringTruthRoot(loadResult.config),
  });

  const mergedTruthDocumentEntries = mergedEntryMap(
    routing.areas.flatMap((area) => area.truthDocumentEntries),
  );

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
        truthDocumentEntries: [
          ...new Map(
            area.truthDocumentEntries.map((entry) => [
              entry.path,
              mergedTruthDocumentEntries.get(entry.path) ?? entry,
            ]),
          ).values(),
        ].sort((left, right) => left.path.localeCompare(right.path)),
        updateTruthWhen: [...area.updateTruthWhen],
      }))
      .sort((left, right) => left.key.localeCompare(right.key)),
    diagnostics: routing.diagnostics,
  };
};
