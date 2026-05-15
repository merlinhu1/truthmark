import type { Diagnostic } from "../output/diagnostic.js";

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
  sourceOfTruth: string[];
};

export type RepoTestEntry = {
  path: string;
  targetHints: string[];
};

export type ImportEdge = {
  from: string;
  specifier: string;
  imported: string[];
};

export type ExportKind =
  | "class"
  | "function"
  | "const"
  | "type"
  | "interface"
  | "enum"
  | "re-export"
  | "unknown";

export type ExportEntry = {
  path: string;
  name: string;
  kind: ExportKind;
};

export type PublicSymbolEntry = ExportEntry;

export type RouteMapRoute = {
  id: string;
  name: string;
  key: string;
  sourcePath: string;
  parentName?: string;
  codeSurface: string[];
  truthDocs: string[];
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
  imports: ImportEdge[];
  exports: ExportEntry[];
  publicSymbols: PublicSymbolEntry[];
  routeMap: RouteMap;
  diagnostics: Diagnostic[];
};
