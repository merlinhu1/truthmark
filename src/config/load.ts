import fs from "node:fs/promises";
import path from "node:path";

import { Ajv, type ErrorObject } from "ajv";
import { parse } from "yaml";

import type { Diagnostic } from "../output/diagnostic.js";
import { resolveRepoPath } from "../fs/paths.js";
import { DEFAULT_INSTRUCTION_TARGETS } from "./defaults.js";
import {
  DEFAULT_PLATFORMS,
  type RawTruthmarkConfig,
  type TruthmarkConfig,
  truthmarkConfigSchema,
} from "./schema.js";

const ajv = new Ajv({ allErrors: true });
const validateTruthmarkConfig = ajv.compile(truthmarkConfigSchema);

export type LoadConfigResult = {
  status: "loaded" | "missing" | "invalid";
  config: TruthmarkConfig | null;
  diagnostics: Diagnostic[];
  configPath: string;
};

const toConfigDiagnostic = (message: string, file: string): Diagnostic => ({
  category: "config",
  severity: "error",
  message,
  file,
});

export const normalizeRepoRelativePath = (value: string): string => {
  const slashNormalized = value.replace(/\\/gu, "/");
  return path.posix.normalize(slashNormalized).replace(/\/+$/u, "");
};

const isUnsafeRepoRelativePath = (value: string): boolean => {
  const slashNormalized = value.replace(/\\/gu, "/");
  const normalized = normalizeRepoRelativePath(value);
  const parts = slashNormalized.split("/");

  return (
    normalized.length === 0 ||
    normalized === "." ||
    normalized === ".." ||
    path.isAbsolute(value) ||
    path.posix.isAbsolute(slashNormalized) ||
    path.win32.isAbsolute(value) ||
    /^[A-Za-z]:/u.test(value) ||
    normalized.startsWith("../") ||
    parts.includes("..")
  );
};

const joinWorkspacePath = (workspace: string, childPath: string): string => {
  return normalizeRepoRelativePath(`${workspace}/${childPath}`);
};

const portalOutputFor = (workspace: string): string => joinWorkspacePath(workspace, "generated/portal");

const portalTemplateFor = (templatesRoot: string): string => joinWorkspacePath(templatesRoot, "portal.html");

const PRODUCT_TRUTH_ROOT = "product";
const ENGINEERING_TRUTH_ROOT = "engineering";

const pathsOverlap = (left: string, right: string): boolean => {
  const normalizedLeft = normalizeRepoRelativePath(left);
  const normalizedRight = normalizeRepoRelativePath(right);

  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.startsWith(`${normalizedRight}/`) ||
    normalizedRight.startsWith(`${normalizedLeft}/`)
  );
};

const CONFIG_PATH = ".truthmark/config.yml";
const FORBIDDEN_WORKSPACE_OVERLAPS = [
  ".git",
  ".truthmark",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "src",
  "tests",
] as const;

const unsupportedShapeDiagnostics = (parsedConfig: unknown, configPath: string): Diagnostic[] => {
  if (!parsedConfig || typeof parsedConfig !== "object" || Array.isArray(parsedConfig)) {
    return [];
  }

  const record = parsedConfig as Record<string, unknown>;
  const diagnostics: Diagnostic[] = [];

  if (record.version !== 2) {
    diagnostics.push(
      toConfigDiagnostic(
        "Unsupported Truthmark config shape. This release requires version: 2 with a truthmark workspace block.",
        configPath,
      ),
    );
  }

  if ("docs" in record || "authority" in record) {
    diagnostics.push(
      toConfigDiagnostic(
        "Unsupported Truthmark config shape. Remove old docs.roots and legacy authority settings; use version: 2 truthmark.workspace paths.",
        configPath,
      ),
    );
  }

  return diagnostics;
};

const validateWorkspacePaths = (
  rawConfig: RawTruthmarkConfig,
  configPath: string,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const workspace = normalizeRepoRelativePath(rawConfig.truthmark.workspace);
  const childPaths = [
    ["truthmark.routes.index", rawConfig.truthmark.routes.index],
    ["truthmark.routes.areas", rawConfig.truthmark.routes.areas],
    ["truthmark.templates.root", rawConfig.truthmark.templates.root],
  ] as const;

  if (
    isUnsafeRepoRelativePath(rawConfig.truthmark.workspace) ||
    FORBIDDEN_WORKSPACE_OVERLAPS.some((forbidden) => pathsOverlap(workspace, forbidden))
  ) {
    diagnostics.push(
      toConfigDiagnostic(
        "truthmark.workspace must be a non-empty repo-relative directory that does not overlap repository control, package, source, test, or instruction paths.",
        configPath,
      ),
    );
  }

  for (const [name, value] of childPaths) {
    if (isUnsafeRepoRelativePath(value)) {
      diagnostics.push(
        toConfigDiagnostic(
          `${name} must be a non-empty path relative to truthmark.workspace without absolute or parent traversal segments.`,
          configPath,
        ),
      );
    }
  }

  const portalOutput = normalizeRepoRelativePath("generated/portal");
  const controlledWorkspaceChildren = [
    ["truthmark.routes.index", rawConfig.truthmark.routes.index],
    ["truthmark.routes.areas", rawConfig.truthmark.routes.areas],
    ["truthmark.paths.productTruthRoot", PRODUCT_TRUTH_ROOT],
    ["truthmark.paths.engineeringTruthRoot", ENGINEERING_TRUTH_ROOT],
    ["truthmark.templates.root", rawConfig.truthmark.templates.root],
  ] as const;

  for (const [name, value] of controlledWorkspaceChildren) {
    if (pathsOverlap(portalOutput, value)) {
      diagnostics.push(
        toConfigDiagnostic(
          `Truthmark Portal output ${portalOutputFor(workspace)} must not overlap ${name}; Portal output is generated and must stay outside controlled truth, routing, and template paths.`,
          configPath,
        ),
      );
    }
  }

  for (const target of rawConfig.instruction_targets ?? DEFAULT_INSTRUCTION_TARGETS) {
    if (isUnsafeRepoRelativePath(target) || pathsOverlap(workspace, target)) {
      diagnostics.push(
        toConfigDiagnostic(
          "instruction_targets must be repo-relative files outside truthmark.workspace.",
          configPath,
        ),
      );
    }
  }

  return diagnostics;
};

const normalizeConfig = (rawConfig: RawTruthmarkConfig): TruthmarkConfig => {
  const workspace = normalizeRepoRelativePath(rawConfig.truthmark.workspace);
  const routesIndex = joinWorkspacePath(workspace, rawConfig.truthmark.routes.index);
  const routeAreasRoot = joinWorkspacePath(workspace, rawConfig.truthmark.routes.areas);
  const productTruthRoot = joinWorkspacePath(workspace, PRODUCT_TRUTH_ROOT);
  const engineeringTruthRoot = joinWorkspacePath(workspace, ENGINEERING_TRUTH_ROOT);
  const templatesRoot = joinWorkspacePath(workspace, rawConfig.truthmark.templates.root);
  const portalOutput = portalOutputFor(workspace);
  const portalTemplate = portalTemplateFor(templatesRoot);

  return {
    version: rawConfig.version,
    platforms: rawConfig.platforms ?? [...DEFAULT_PLATFORMS],
    truthmark: {
      workspace,
      routes: {
        index: normalizeRepoRelativePath(rawConfig.truthmark.routes.index),
        areas: normalizeRepoRelativePath(rawConfig.truthmark.routes.areas),
        defaultArea: rawConfig.truthmark.routes.default_area,
        maxDelegationDepth: rawConfig.truthmark.routes.max_delegation_depth,
      },
      truth: {
        productRoot: PRODUCT_TRUTH_ROOT,
        engineeringRoot: ENGINEERING_TRUTH_ROOT,
      },
      templates: {
        root: normalizeRepoRelativePath(rawConfig.truthmark.templates.root),
      },
      generated: {
        portal: {
          enabled: rawConfig.truthmark.generated.portal.enabled,
        },
      },
      paths: {
        routesIndex,
        routeAreasRoot,
        productTruthRoot,
        engineeringTruthRoot,
        templatesRoot,
        portalOutput,
        portalTemplate,
      },
      controlledPaths: [
        routesIndex,
        `${routeAreasRoot}/**/*.md`,
        `${productTruthRoot}/**/*.md`,
        `${engineeringTruthRoot}/**/*.md`,
        `${templatesRoot}/*.md`,
      ],
    },
    instructionTargets: rawConfig.instruction_targets ?? [...DEFAULT_INSTRUCTION_TARGETS],
    frontmatter: {
      required: rawConfig.frontmatter?.required ?? [],
      recommended: rawConfig.frontmatter?.recommended ?? [],
    },
    ignore: rawConfig.ignore ?? [],
  };
};

export const loadConfig = async (rootDir: string): Promise<LoadConfigResult> => {
  const absolutePath = resolveRepoPath(rootDir, CONFIG_PATH);

  let source: string;

  try {
    source = await fs.readFile(absolutePath, "utf8");
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {
        status: "missing",
        config: null,
        diagnostics: [toConfigDiagnostic("Missing .truthmark/config.yml.", CONFIG_PATH)],
        configPath: CONFIG_PATH,
      };
    }

    throw error;
  }

  let parsedConfig: unknown;

  try {
    parsedConfig = parse(source);
  } catch (error: unknown) {
    return {
      status: "invalid",
      config: null,
      diagnostics: [
        toConfigDiagnostic(
          `Invalid YAML: ${error instanceof Error ? error.message : String(error)}`,
          CONFIG_PATH,
        ),
      ],
      configPath: CONFIG_PATH,
    };
  }

  const unsupportedDiagnostics = unsupportedShapeDiagnostics(parsedConfig, CONFIG_PATH);
  if (unsupportedDiagnostics.length > 0) {
    return {
      status: "invalid",
      config: null,
      diagnostics: unsupportedDiagnostics,
      configPath: CONFIG_PATH,
    };
  }

  if (!validateTruthmarkConfig(parsedConfig)) {
    return {
      status: "invalid",
      config: null,
      diagnostics: (validateTruthmarkConfig.errors ?? []).map((error: ErrorObject) => {
        const propertyPath = error.instancePath || "/";
        const additionalProperty =
          error.keyword === "additionalProperties" &&
          error.params &&
          "additionalProperty" in error.params
            ? String(error.params.additionalProperty)
            : null;
        const message = additionalProperty
          ? `${propertyPath} additional property ${additionalProperty} is not allowed`
          : `${propertyPath} ${error.message ?? "is invalid"}`.trim();

        return toConfigDiagnostic(message, CONFIG_PATH);
      }),
      configPath: CONFIG_PATH,
    };
  }

  const pathDiagnostics = validateWorkspacePaths(parsedConfig as RawTruthmarkConfig, CONFIG_PATH);

  if (pathDiagnostics.length > 0) {
    return {
      status: "invalid",
      config: null,
      diagnostics: pathDiagnostics,
      configPath: CONFIG_PATH,
    };
  }

  return {
    status: "loaded",
    config: normalizeConfig(parsedConfig as RawTruthmarkConfig),
    diagnostics: [],
    configPath: CONFIG_PATH,
  };
};
