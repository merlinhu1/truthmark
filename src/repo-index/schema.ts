export const REPO_INDEX_SCHEMA_VERSION = "repo-index/v0" as const;
export const ROUTE_MAP_SCHEMA_VERSION = "route-map/v0" as const;

export const repoIndexSchema = {
  schemaVersion: REPO_INDEX_SCHEMA_VERSION,
  required: [
    "schemaVersion",
    "repository",
    "packages",
    "files",
    "docs",
    "tests",
    "imports",
    "exports",
    "publicSymbols",
    "routeMap",
  ],
} as const;

export const routeMapSchema = {
  schemaVersion: ROUTE_MAP_SCHEMA_VERSION,
  required: ["schemaVersion", "routes"],
} as const;
