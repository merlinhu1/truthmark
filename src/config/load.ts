import fs from "node:fs/promises";

import { Ajv, type ErrorObject } from "ajv";
import { parse } from "yaml";

import type { Diagnostic } from "../output/diagnostic.js";
import { resolveRepoPath } from "../fs/paths.js";
import {
  DEFAULT_DOCS_HIERARCHY,
  DEFAULT_INSTRUCTION_TARGETS,
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

  return {
    status: "loaded",
    config: normalizeConfig(parsedConfig as RawTruthmarkConfig),
    diagnostics: [],
    configPath,
  };
};
