import fs from "node:fs/promises";
import path from "node:path";

import { Ajv, type ErrorObject } from "ajv";
import { parse } from "yaml";

import type { Diagnostic } from "../output/diagnostic.js";
import { resolveRepoPath } from "../fs/paths.js";
import {
  DEFAULT_DOCS_HIERARCHY,
  DEFAULT_INSTRUCTION_TARGETS,
  DEFAULT_TRUTHMARK_PORTAL,
} from "./defaults.js";
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

const toConfigDiagnostic = (message: string, file: string): Diagnostic => {
  return {
    category: "config",
    severity: "error",
    message,
    file,
  };
};

const normalizeRepoRelativePath = (value: string): string => {
  const slashNormalized = value.replace(/\\/gu, "/");
  const pathNormalized = path.posix.normalize(slashNormalized).replace(/\/+$/u, "");

  return pathNormalized;
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

const pathsOverlap = (left: string, right: string): boolean => {
  const normalizedLeft = normalizeRepoRelativePath(left);
  const normalizedRight = normalizeRepoRelativePath(right);

  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.startsWith(`${normalizedRight}/`) ||
    normalizedRight.startsWith(`${normalizedLeft}/`)
  );
};

const portalForbiddenOutputRoots = (rawConfig: RawTruthmarkConfig): string[] => {
  const rawDocs = rawConfig.docs;
  const docsRoots = rawDocs?.roots ?? {};
  const routing = rawDocs?.routing ?? DEFAULT_DOCS_HIERARCHY.routing;

  return [
    "src",
    DEFAULT_DOCS_HIERARCHY.roots.ai,
    DEFAULT_DOCS_HIERARCHY.roots.standards,
    DEFAULT_DOCS_HIERARCHY.roots.architecture,
    DEFAULT_DOCS_HIERARCHY.roots.truth,
    ...Object.values(docsRoots),
    routing.root_index,
    routing.area_files_root,
    ".truthmark/config.yml",
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    ".github/copilot-instructions.md",
    ...(rawConfig.instruction_targets ?? DEFAULT_INSTRUCTION_TARGETS),
  ];
};

const validatePortalConfig = (
  rawConfig: RawTruthmarkConfig,
  configPath: string,
): Diagnostic[] => {
  const portal = rawConfig["truthmark-portal"];

  if (portal === undefined) {
    return [];
  }

  const diagnostics: Diagnostic[] = [];
  const output = portal.output ?? DEFAULT_TRUTHMARK_PORTAL.output;
  const template = portal.template ?? DEFAULT_TRUTHMARK_PORTAL.template;

  if (
    isUnsafeRepoRelativePath(output) ||
    portalForbiddenOutputRoots(rawConfig).some((forbidden) => pathsOverlap(output, forbidden))
  ) {
    diagnostics.push(
      toConfigDiagnostic(
        "truthmark-portal.output must be a non-empty repo-relative directory that does not overlap source, instruction, routing, or canonical docs roots.",
        configPath,
      ),
    );
  }

  if (template !== "default" && isUnsafeRepoRelativePath(template)) {
    diagnostics.push(
      toConfigDiagnostic(
        "truthmark-portal.template must be 'default' or a non-empty repo-relative template path without absolute or parent traversal segments.",
        configPath,
      ),
    );
  }

  return diagnostics;
};

const normalizeConfig = (rawConfig: RawTruthmarkConfig): TruthmarkConfig => {
  const rawDocs = rawConfig.docs ?? {
    layout: DEFAULT_DOCS_HIERARCHY.layout,
    roots: { ...DEFAULT_DOCS_HIERARCHY.roots },
    routing: { ...DEFAULT_DOCS_HIERARCHY.routing },
  };
  const roots: Record<string, string> = { ...DEFAULT_DOCS_HIERARCHY.roots, ...rawDocs.roots };

  return {
    version: rawConfig.version,
    platforms: rawConfig.platforms ?? [...DEFAULT_PLATFORMS],
    docs: {
      layout: rawDocs.layout,
      roots,
      routing: {
        rootIndex: rawDocs.routing.root_index,
        areaFilesRoot: rawDocs.routing.area_files_root,
        defaultArea: rawDocs.routing.default_area,
        maxDelegationDepth: rawDocs.routing.max_delegation_depth,
      },
    },
    authority: rawConfig.authority,
    instructionTargets: rawConfig.instruction_targets ?? [...DEFAULT_INSTRUCTION_TARGETS],
    truthmarkPortal: {
      enabled: rawConfig["truthmark-portal"]?.enabled ?? DEFAULT_TRUTHMARK_PORTAL.enabled,
      output: rawConfig["truthmark-portal"]?.output ?? DEFAULT_TRUTHMARK_PORTAL.output,
      template: rawConfig["truthmark-portal"]?.template ?? DEFAULT_TRUTHMARK_PORTAL.template,
    },
    frontmatter: {
      required: rawConfig.frontmatter?.required ?? [],
      recommended: rawConfig.frontmatter?.recommended ?? [],
    },
    ignore: rawConfig.ignore ?? [],
  };
};

export const loadConfig = async (rootDir: string): Promise<LoadConfigResult> => {
  const configPath = ".truthmark/config.yml";
  const absolutePath = resolveRepoPath(rootDir, configPath);

  let source: string;

  try {
    source = await fs.readFile(absolutePath, "utf8");
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {
        status: "missing",
        config: null,
        diagnostics: [toConfigDiagnostic("Missing .truthmark/config.yml.", configPath)],
        configPath,
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
          configPath,
        ),
      ],
      configPath,
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

        return toConfigDiagnostic(message, configPath);
      }),
      configPath,
    };
  }

  const portalDiagnostics = validatePortalConfig(
    parsedConfig as RawTruthmarkConfig,
    configPath,
  );

  if (portalDiagnostics.length > 0) {
    return {
      status: "invalid",
      config: null,
      diagnostics: portalDiagnostics,
      configPath,
    };
  }

  return {
    status: "loaded",
    config: normalizeConfig(parsedConfig as RawTruthmarkConfig),
    diagnostics: [],
    configPath,
  };
};
