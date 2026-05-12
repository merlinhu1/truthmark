import fs from "node:fs/promises";
import fg from "fast-glob";
import { DEFAULT_DOCS_HIERARCHY } from "../config/defaults.js";
import type { TruthmarkConfig } from "../config/schema.js";
import type { FileWriteResult } from "../fs/paths.js";
import { ensureRepoFile, resolveRepoPath } from "../fs/paths.js";
import type { Diagnostic } from "../output/diagnostic.js";
import {
  FEATURE_DOC_TEMPLATE_PATH,
  renderChildAreaTemplate,
  renderFeatureDocTemplateFile,
  renderFeatureDomainReadmeTemplate,
  renderFeatureLeafDocTemplate,
  renderFeatureRootReadmeTemplate,
  renderHierarchicalAreasIndexTemplate,
} from "../templates/init-files.js";

const KNOWN_DEFAULT_ROOTS = [
  DEFAULT_DOCS_HIERARCHY.roots.features,
  "docs/features/current",
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

const readFeatureDocTemplate = async (rootDir: string): Promise<string> => {
  try {
    return await fs.readFile(resolveRepoPath(rootDir, FEATURE_DOC_TEMPLATE_PATH), "utf8");
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return renderFeatureDocTemplateFile();
    }
    throw error;
  }
};

export const scaffoldHierarchy = async (
  rootDir: string,
  config: TruthmarkConfig,
): Promise<FileWriteResult[]> => {
  const results: FileWriteResult[] = [];
  const featureRoot = config.docs.roots.features ?? config.docs.roots.features_current ?? "docs/features";
  const featureDomainRoot = `${featureRoot}/${config.docs.routing.defaultArea}`;
  const childRoutePath = `${config.docs.routing.areaFilesRoot}/${config.docs.routing.defaultArea}.md`;

  results.push(
    await ensureRepoFile(
      rootDir,
      config.docs.routing.rootIndex,
      renderHierarchicalAreasIndexTemplate(config),
    ),
  );
  results.push(await ensureRepoFile(rootDir, childRoutePath, renderChildAreaTemplate(config)));
  results.push(
    await ensureRepoFile(
      rootDir,
      `${featureRoot}/README.md`,
      renderFeatureRootReadmeTemplate(),
    ),
  );
  results.push(
    await ensureRepoFile(
      rootDir,
      `${featureDomainRoot}/README.md`,
      renderFeatureDomainReadmeTemplate(config),
    ),
  );
  results.push(
    await ensureRepoFile(rootDir, FEATURE_DOC_TEMPLATE_PATH, renderFeatureDocTemplateFile()),
  );
  const featureDocTemplate = await readFeatureDocTemplate(rootDir);
  results.push(
    await ensureRepoFile(
      rootDir,
      `${featureDomainRoot}/overview.md`,
      renderFeatureLeafDocTemplate(config, featureDocTemplate),
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
