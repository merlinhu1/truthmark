import type { CommandResult } from "../output/diagnostic.js";
import { loadConfig } from "../config/load.js";
import { getGitRepository } from "../git/repository.js";
import { getBranchScopeData } from "./branch-scope.js";
import { checkAuthority } from "./authority.js";
import { checkFrontmatter } from "./frontmatter.js";
import { checkLinks } from "./links.js";
import { checkAreas } from "./areas.js";
import { checkDecisionSections } from "./decisions.js";
import { checkGeneratedSurfaces } from "./generated-surfaces.js";

const summarizeDiagnostics = (diagnostics: CommandResult["diagnostics"]): string => {
  const errorCount = diagnostics.filter((diagnostic) => diagnostic.severity === "error").length;
  const reviewCount = diagnostics.filter((diagnostic) => diagnostic.severity === "review").length;

  if (diagnostics.length === 0) {
    return "Truthmark check completed with no diagnostics.";
  }

  return `Truthmark check completed with ${errorCount} error diagnostics and ${reviewCount} review diagnostics.`;
};

export const runCheck = async (cwd: string): Promise<CommandResult> => {
  const repository = await getGitRepository(cwd);
  const rootDir = repository.worktreePath;
  const branchScope = await getBranchScopeData(rootDir);
  const loadResult = await loadConfig(rootDir);

  if (!loadResult.config) {
    return {
      command: "check",
      summary: summarizeDiagnostics(loadResult.diagnostics),
      diagnostics: loadResult.diagnostics,
      data: {
        branchScope,
      },
    };
  }

  const authority = await checkAuthority(rootDir, loadResult.config);
  const areas = await checkAreas(rootDir, loadResult.config);
  const markdownPaths = [...new Set([...authority.paths, ...areas.truthDocumentPaths])];
  const frontmatter = await checkFrontmatter(rootDir, loadResult.config, markdownPaths);
  const links = await checkLinks(rootDir, markdownPaths);
  const decisionSections = await checkDecisionSections(rootDir, loadResult.config, markdownPaths);
  const generatedSurfaces = await checkGeneratedSurfaces(rootDir, loadResult.config);
  const diagnostics = [
    ...loadResult.diagnostics,
    ...authority.diagnostics,
    ...frontmatter,
    ...links,
    ...areas.diagnostics,
    ...decisionSections,
    ...generatedSurfaces,
  ];
  const truthVisibility = {
    routePrecision: areas.routePrecision,
    unmappedSurfaceCount: diagnostics.filter((diagnostic) => diagnostic.category === "coverage")
      .length,
    staleGeneratedSurfaceCount: new Set(
      generatedSurfaces.map((diagnostic) => diagnostic.file).filter(Boolean),
    ).size,
    syncCompletenessIssueCount: diagnostics.filter(
      (diagnostic) =>
        diagnostic.category === "doc-structure" || diagnostic.category === "generated-surface",
    ).length,
    topologyPressureCount: areas.topologyPressureCount,
  };

  return {
    command: "check",
    summary: summarizeDiagnostics(diagnostics),
    diagnostics,
    data: {
      branchScope,
      truthVisibility,
    },
  };
};
