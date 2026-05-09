export const DIAGNOSTIC_CATEGORIES = [
  "config",
  "authority",
  "frontmatter",
  "links",
  "area-index",
  "coverage",
  "truth-sync",
  "realization",
  "doc-structure",
  "generated-surface",
] as const;

export type DiagnosticCategory = (typeof DIAGNOSTIC_CATEGORIES)[number];

export type DiagnosticSeverity = "info" | "action" | "review" | "error";

export type Diagnostic = {
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  message: string;
  file?: string;
  area?: string;
  data?: Record<string, unknown>;
};

export type CommandResult = {
  command: string;
  summary: string;
  diagnostics: Diagnostic[];
  data?: Record<string, unknown>;
};
