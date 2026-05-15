import type { Diagnostic } from "../output/diagnostic.js";
import type { ImpactSet } from "../impact/types.js";
import type { RouteMap } from "../repo-index/types.js";

export type ContextPackWorkflow = "truth-sync" | "truth-document" | "truth-realize";

export type ContextDocument = {
  path: string;
  content: string;
};

export type ContextSourceFile = {
  path: string;
  content: string;
  truncated: boolean;
};

export type ContextPack = {
  schemaVersion: "context-pack/v0";
  workflow: ContextPackWorkflow;
  base: string | null;
  impactSet: ImpactSet | null;
  routeMap: RouteMap;
  allowedWritePaths: string[];
  truthDocs: ContextDocument[];
  sourceFiles: ContextSourceFile[];
  testCommands: string[];
  warnings: Diagnostic[];
};

export type ContextPackOptions = {
  workflow: ContextPackWorkflow;
  base?: string;
};
