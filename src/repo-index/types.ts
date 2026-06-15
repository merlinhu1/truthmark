import type { Diagnostic } from "../output/diagnostic.js";
import type { TruthDocumentEntry } from "../routing/areas.js";

export type PackageMetadata = {
  path: string;
  manager: "npm" | "pnpm" | "yarn" | "bun" | "unknown";
  name: string | null;
  version: string | null;
  private: boolean | null;
  scripts: string[];
};

export type RepoFileKind = "source" | "test" | "doc" | "config" | "generated" | "other";

export type RepoFileEntry = {
  path: string;
  kind: RepoFileKind;
  language: string | null;
};

export type RepoDocEntry = {
  path: string;
  title: string | null;
  docType: string | null;
  truthKind: string | null;
  truthLane: string | null;
  sourceOfTruth: string[];
  realizedBy: string[];
  realizes: string[];
  dependsOn: string[];
};

export type RepoTestEntry = {
  path: string;
  targetHints: string[];
};

export type RouteMapRoute = {
  id: string;
  name: string;
  key: string;
  sourcePath: string;
  parentName?: string;
  codeSurface: string[];
  truthDocs: string[];
  truthDocumentEntries: TruthDocumentEntry[];
  updateTruthWhen: string[];
};

export type RouteMap = {
  schemaVersion: "route-map/v0";
  routes: RouteMapRoute[];
  diagnostics: Diagnostic[];
};

export type RepoIndex = {
  schemaVersion: "repo-index/v0";
  repository: {
    root: string;
    branchName: string | null;
    headSha: string | null;
  };
  packages: PackageMetadata[];
  files: RepoFileEntry[];
  docs: RepoDocEntry[];
  tests: RepoTestEntry[];
  routeMap: RouteMap;
  diagnostics: Diagnostic[];
};
