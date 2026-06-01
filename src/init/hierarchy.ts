import fs from "node:fs/promises";
import type { TruthmarkConfig } from "../config/schema.js";
import type { FileWriteResult } from "../fs/paths.js";
import { ensureRepoFile, resolveRepoPath, writeRepoFile } from "../fs/paths.js";
import { parseAreasMarkdown } from "../routing/areas.js";
import { resolveTruthDocsRoot } from "../truth/docs.js";
import {
  renderChildAreaTemplate,
  mergeTruthDocTemplate,
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

const truthTemplatePath = (config: TruthmarkConfig, fileName: string): string => {
  return `${config.truthmark.paths.templatesRoot}/${fileName}`;
};

const readBehaviorDocTemplate = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<string> => {
  try {
    return await fs.readFile(
      resolveRepoPath(rootDir, truthTemplatePath(config, "behavior-doc.md")),
      "utf8",
    );
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return renderBehaviorDocTemplateFile();
    }
    throw error;
  }
};

const ensureOrUpdateTruthDocTemplate = async (
  rootDir: string,
  templatePath: string,
  defaultTemplate: string,
): Promise<FileWriteResult> => {
  const seededResult = await ensureRepoFile(rootDir, templatePath, defaultTemplate);

  if (seededResult.status !== "unchanged") {
    return seededResult;
  }

  const existingTemplate = await fs.readFile(resolveRepoPath(rootDir, templatePath), "utf8");
  const mergedTemplate = mergeTruthDocTemplate(existingTemplate, defaultTemplate);

  return writeRepoFile(rootDir, templatePath, mergedTemplate);
};

export const scaffoldHierarchy = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<FileWriteResult[]> => {
  const results: FileWriteResult[] = [];
  const truthDocsRoot = truthRoot(config);
  const truthDomainRoot = `${truthDocsRoot}/${config.truthmark.routes.defaultArea}`;
  const childRoutePath = `${config.truthmark.paths.routeAreasRoot}/${config.truthmark.routes.defaultArea}.md`;

  results.push(
    await ensureRepoFile(
      rootDir,
      config.truthmark.paths.routesIndex,
      renderHierarchicalAreasIndexTemplate(config),
    ),
  );
  if (
    await rootIndexReferencesChildRoute(rootDir, config.truthmark.paths.routesIndex, childRoutePath)
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
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, "behavior-doc.md"),
      renderBehaviorDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, "contract-doc.md"),
      renderContractDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, "architecture-doc.md"),
      renderArchitectureDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, "workflow-doc.md"),
      renderWorkflowDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, "operations-doc.md"),
      renderOperationsDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, "test-behavior-doc.md"),
      renderTestBehaviorDocTemplateFile(),
    ),
  );
  const behaviorDocTemplate = await readBehaviorDocTemplate(rootDir, config);
  results.push(
    await ensureRepoFile(
      rootDir,
      `${truthDomainRoot}/overview.md`,
      renderBehaviorLeafDocTemplate(config, behaviorDocTemplate),
    ),
  );
  return results;
};
