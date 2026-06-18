import fs from "node:fs/promises";
import type { TruthmarkConfig } from "../config/schema.js";
import type { FileWriteResult } from "../fs/paths.js";
import { ensureRepoFile, resolveRepoPath, writeRepoFile } from "../fs/paths.js";
import { parseAreasMarkdown } from "../routing/areas.js";
import {
  resolveEngineeringTruthRoot,
  resolveTruthDocsRoot,
} from "../truth/docs.js";
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
  renderProductCapabilityDocTemplateFile,
  renderBootstrapRoutingDocTemplate,
  renderTestBehaviorDocTemplateFile,
  renderWorkflowDocTemplateFile,
} from "../templates/init-files.js";

const truthRoot = resolveTruthDocsRoot;
const BEHAVIOR_DOC_TEMPLATE_FILE_NAME = "engineering-behavior.md";
const CONTRACT_DOC_TEMPLATE_FILE_NAME = "engineering-contract.md";
const ARCHITECTURE_DOC_TEMPLATE_FILE_NAME = "engineering-architecture.md";
const WORKFLOW_DOC_TEMPLATE_FILE_NAME = "engineering-workflow.md";
const OPERATIONS_DOC_TEMPLATE_FILE_NAME = "engineering-operations.md";
const TEST_BEHAVIOR_DOC_TEMPLATE_FILE_NAME = "engineering-test-behavior.md";
const PRODUCT_CAPABILITY_DOC_TEMPLATE_FILE_NAME = "product-capability.md";

const rootIndexReferencesChildRoute = async (
  rootDir: string,
  rootIndexPath: string,
  childRoutePath: string,
): Promise<boolean> => {
  const rootIndexSource = await fs.readFile(
    resolveRepoPath(rootDir, rootIndexPath),
    "utf8",
  );
  const parsedRootIndex = parseAreasMarkdown(rootIndexSource);

  return parsedRootIndex.areaFileReferences.some((areaReference) =>
    areaReference.areaFiles.includes(childRoutePath),
  );
};

const truthTemplatePath = (
  config: TruthmarkConfig,
  fileName: string,
): string => {
  return `${config.truthmark.paths.templatesRoot}/${fileName}`;
};

const ensureOrUpdateTruthDocTemplate = async (
  rootDir: string,
  templatePath: string,
  defaultTemplate: string,
): Promise<FileWriteResult> => {
  const seededResult = await ensureRepoFile(
    rootDir,
    templatePath,
    defaultTemplate,
  );

  if (seededResult.status !== "unchanged") {
    return seededResult;
  }

  const existingTemplate = await fs.readFile(
    resolveRepoPath(rootDir, templatePath),
    "utf8",
  );
  const mergedTemplate = mergeTruthDocTemplate(
    existingTemplate,
    defaultTemplate,
  );

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
    await rootIndexReferencesChildRoute(
      rootDir,
      config.truthmark.paths.routesIndex,
      childRoutePath,
    )
  ) {
    results.push(
      await ensureRepoFile(
        rootDir,
        childRoutePath,
        renderChildAreaTemplate(config),
      ),
    );
  }
  results.push(
    await ensureRepoFile(
      rootDir,
      `${resolveEngineeringTruthRoot(config)}/README.md`,
      renderTruthRootReadmeTemplate(config, "engineering"),
    ),
  );
  results.push(
    await ensureRepoFile(
      rootDir,
      `${config.truthmark.paths.productTruthRoot}/README.md`,
      renderTruthRootReadmeTemplate(config, "product"),
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
      truthTemplatePath(config, BEHAVIOR_DOC_TEMPLATE_FILE_NAME),
      renderBehaviorDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, CONTRACT_DOC_TEMPLATE_FILE_NAME),
      renderContractDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, ARCHITECTURE_DOC_TEMPLATE_FILE_NAME),
      renderArchitectureDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, WORKFLOW_DOC_TEMPLATE_FILE_NAME),
      renderWorkflowDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, OPERATIONS_DOC_TEMPLATE_FILE_NAME),
      renderOperationsDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, TEST_BEHAVIOR_DOC_TEMPLATE_FILE_NAME),
      renderTestBehaviorDocTemplateFile(),
    ),
  );
  results.push(
    await ensureOrUpdateTruthDocTemplate(
      rootDir,
      truthTemplatePath(config, PRODUCT_CAPABILITY_DOC_TEMPLATE_FILE_NAME),
      renderProductCapabilityDocTemplateFile(),
    ),
  );
  results.push(
    await ensureRepoFile(
      rootDir,
      `${truthDomainRoot}/bootstrap-routing.md`,
      renderBootstrapRoutingDocTemplate(config),
    ),
  );
  return results;
};
