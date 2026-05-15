import type { Diagnostic } from "../output/diagnostic.js";
import type { ExportKind } from "../repo-index/types.js";

export type ChangedFileStatus = "added" | "modified" | "deleted" | "renamed" | "copied" | "type-changed";

export type ImpactFile = {
  path: string;
  previousPath?: string;
  status: ChangedFileStatus;
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
  deleted: boolean;
};

export type ImpactRoute = {
  id: string;
  name: string;
  key: string;
  sourcePath: string;
  truthDocs: string[];
  codeSurface: string[];
};

export type PublicSymbolChange = {
  path: string;
  name: string;
  kind: ExportKind;
  change: "added" | "removed";
};

export type ImpactSet = {
  schemaVersion: "impact-set/v0";
  base: string;
  headSha: string | null;
  changedFiles: ImpactFile[];
  affectedRoutes: ImpactRoute[];
  affectedTruthDocs: string[];
  affectedTests: string[];
  changedPublicSymbols: PublicSymbolChange[];
  diagnostics: Diagnostic[];
};

export type ImpactOptions = {
  base: string;
};
