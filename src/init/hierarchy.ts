import fs from "node:fs/promises";
import fg from "fast-glob";
import { DEFAULT_DOCS_HIERARCHY } from "../config/defaults.js";
import type { TruthmarkConfig } from "../config/schema.js";
import type { FileWriteResult } from "../fs/paths.js";
import { ensureRepoFile, resolveRepoPath } from "../fs/paths.js";
import type { Diagnostic } from "../output/diagnostic.js";
import { parseAreasMarkdown } from "../routing/areas.js";
import { resolveTruthDocsRoot } from "../truth/docs.js";
import {
  ARCHITECTURE_DOC_TEMPLATE_PATH,
  BEHAVIOR_DOC_TEMPLATE_PATH,
  CONTRACT_DOC_TEMPLATE_PATH,
  OPERATIONS_DOC_TEMPLATE_PATH,
  TEST_BEHAVIOR_DOC_TEMPLATE_PATH,
  WORKFLOW_DOC_TEMPLATE_PATH,
  renderChildAreaTemplate,
  renderArchitectureDocTemplateFile,
  renderBehaviorDocTemplateFile,
  renderContractDocTemplateFile,
  renderTruthDomainReadmeTemplate,
  renderTruthRootReadmeTemplate,
  renderHierarchicalAreasIndexTemplate,
  renderOperationsDocTemplateFile,
  renderBehaviorLeafDocTemplate,
  renderTestBehaviorDocTemplateFile,
  renderWorkflowDocTemplateFile,
} from "../templates/init-files.js";

const KNOWN_DEFAULT_ROOTS = [
  DEFAULT_DOCS_HIERARCHY.roots.truth,
  "docs/api",
  DEFAULT_DOCS_HIERARCHY.roots.architecture,
  DEFAULT_DOCS_HIERARCHY.roots.standards,
  "docs/guides",
] as const;

const hasMarkdownFiles = async (rootDir: string, root: string): Promise<boolean> => {
  const matches = await fg([`${root}/**/*.md`], {
    cwd: rootDir,
    onlyFiles: true,
    followSymbolicLinks: false,
  });
  return matches.length > 0;
};

const truthRoot = resolveTruthDocsRoot;

const rootIndexReferencesChildRoute = async (
  rootDir: string,
  rootIndexPath: string,
  childRoutePath: string,
): Promise<boolean> => {
  const rootIndexSource = await fs.readFile(resolveRepoPath(rootDir, rootIndexPath), "utf8");
  const parsedRootIndex = parseAreasMarkdown(rootIndexSource);

  return parsedRootIndex.areaFileReferences.some((areaReference) =>
    areaReference.areaFiles.includes(childRoutePath),
  );
};

const readBehaviorDocTemplate = async (rootDir: string): Promise<string> => {
  try {
    return await fs.readFile(resolveRepoPath(rootDir, BEHAVIOR_DOC_TEMPLATE_PATH), "utf8");
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return renderBehaviorDocTemplateFile();
    }
    throw error;
  }
};

export const scaffoldHierarchy = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<FileWriteResult[]> => {
  const results: FileWriteResult[] = [];
  const truthDocsRoot = truthRoot(config);
  const truthDomainRoot = `${truthDocsRoot}/${config.docs.routing.defaultArea}`;
  const childRoutePath = `${config.docs.routing.areaFilesRoot}/${config.docs.routing.defaultArea}.md`;

  results.push(
    await ensureRepoFile(
      rootDir,
      config.docs.routing.rootIndex,
      renderHierarchicalAreasIndexTemplate(config),
    ),
  );
  if (
    await rootIndexReferencesChildRoute(rootDir, config.docs.routing.rootIndex, childRoutePath)
  ) {
    results.push(await ensureRepoFile(rootDir, childRoutePath, renderChildAreaTemplate(config)));
  }
  results.push(
    await ensureRepoFile(
      rootDir,
      `${truthDocsRoot}/README.md`,
      renderTruthRootReadmeTemplate(config),
    ),
  );
  results.push(
    await ensureRepoFile(
      rootDir,
      `${truthDomainRoot}/README.md`,
      renderTruthDomainReadmeTemplate(config),
    ),
  );
  results.push(
    await ensureRepoFile(rootDir, BEHAVIOR_DOC_TEMPLATE_PATH, renderBehaviorDocTemplateFile()),
  );
  results.push(
    await ensureRepoFile(rootDir, CONTRACT_DOC_TEMPLATE_PATH, renderContractDocTemplateFile()),
  );
  results.push(
    await ensureRepoFile(
      rootDir,
      ARCHITECTURE_DOC_TEMPLATE_PATH,
      renderArchitectureDocTemplateFile(),
    ),
  );
  results.push(
    await ensureRepoFile(rootDir, WORKFLOW_DOC_TEMPLATE_PATH, renderWorkflowDocTemplateFile()),
  );
  results.push(
    await ensureRepoFile(rootDir, OPERATIONS_DOC_TEMPLATE_PATH, renderOperationsDocTemplateFile()),
  );
  results.push(
    await ensureRepoFile(
      rootDir,
      TEST_BEHAVIOR_DOC_TEMPLATE_PATH,
      renderTestBehaviorDocTemplateFile(),
    ),
  );
  const behaviorDocTemplate = await readBehaviorDocTemplate(rootDir);
  results.push(
    await ensureRepoFile(
      rootDir,
      `${truthDomainRoot}/overview.md`,
      renderBehaviorLeafDocTemplate(config, behaviorDocTemplate),
    ),
  );
  return results;
};

export const detectHierarchyMigrationDiagnostics = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<Diagnostic[]> => {
  const configuredRoots = new Set(Object.values(config.docs.roots));
  const diagnostics: Diagnostic[] = [];
  for (const defaultRoot of KNOWN_DEFAULT_ROOTS) {
    if (configuredRoots.has(defaultRoot)) {
      continue;
    }
    if (await hasMarkdownFiles(rootDir, defaultRoot)) {
      diagnostics.push({
        category: "config",
        severity: "review",
        message: `Configured hierarchy no longer includes ${defaultRoot}, but markdown still exists there. Perform manual migration before relying on the new hierarchy.`,
        file: ".truthmark/config.yml",
      });
    }
  }
  return diagnostics;
};
