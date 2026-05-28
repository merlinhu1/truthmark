import type { JSONSchemaType } from "ajv";

export const SUPPORTED_PLATFORMS = [
  "codex",
  "opencode",
  "claude-code",
  "github-copilot",
  "gemini-cli",
] as const;

export type TruthmarkPlatform = (typeof SUPPORTED_PLATFORMS)[number];

export const DEFAULT_PLATFORMS = [
  "codex",
  "opencode",
  "claude-code",
  "github-copilot",
  "gemini-cli",
] as const satisfies
  readonly TruthmarkPlatform[];

export type RawDocsHierarchyConfig = {
  layout: "hierarchical";
  roots: Record<string, string>;
  routing: {
    root_index: string;
    area_files_root: string;
    default_area: string;
    max_delegation_depth: 1;
  };
};

export type DocsHierarchyConfig = {
  layout: "hierarchical";
  roots: Record<string, string>;
  routing: {
    rootIndex: string;
    areaFilesRoot: string;
    defaultArea: string;
    maxDelegationDepth: 1;
  };
};

export type RawTruthmarkPortalConfig = {
  enabled?: boolean;
  output?: string;
  template?: string;
};

export type TruthmarkPortalConfig = {
  enabled: boolean;
  output: string;
  template: string;
};

export type RawTruthmarkConfig = {
  version: 1;
  platforms?: TruthmarkPlatform[];
  docs?: RawDocsHierarchyConfig;
  authority: string[];
  instruction_targets?: string[];
  "truthmark-portal"?: RawTruthmarkPortalConfig;
  frontmatter?: {
    required?: string[];
    recommended?: string[];
  };
  ignore?: string[];
};

export type TruthmarkConfig = {
  version: 1;
  platforms: TruthmarkPlatform[];
  docs: DocsHierarchyConfig;
  authority: string[];
  instructionTargets: string[];
  truthmarkPortal: TruthmarkPortalConfig;
  frontmatter: {
    required: string[];
    recommended: string[];
  };
  ignore: string[];
};

export const truthmarkConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["version", "authority"],
  properties: {
    version: {
      type: "integer",
      const: 1,
    },
    platforms: {
      type: "array",
      nullable: true,
      items: {
        type: "string",
        enum: [...SUPPORTED_PLATFORMS],
      },
      minItems: 1,
    },
    docs: {
      type: "object",
      nullable: true,
      additionalProperties: false,
      required: ["layout", "roots", "routing"],
      properties: {
        layout: {
          type: "string",
          const: "hierarchical",
        },
        roots: {
          type: "object",
          required: [],
          additionalProperties: {
            type: "string",
          },
        },
        routing: {
          type: "object",
          additionalProperties: false,
          required: ["root_index", "area_files_root", "default_area", "max_delegation_depth"],
          properties: {
            root_index: {
              type: "string",
            },
            area_files_root: {
              type: "string",
            },
            default_area: {
              type: "string",
            },
            max_delegation_depth: {
              type: "integer",
              const: 1,
            },
          },
        },
      },
    },
    authority: {
      type: "array",
      items: {
        type: "string",
      },
      minItems: 1,
    },
    instruction_targets: {
      type: "array",
      nullable: true,
      items: {
        type: "string",
      },
    },
    "truthmark-portal": {
      type: "object",
      additionalProperties: false,
      required: [],
      properties: {
        enabled: {
          type: "boolean",
        },
        output: {
          type: "string",
        },
        template: {
          type: "string",
        },
      },
    },
    frontmatter: {
      type: "object",
      nullable: true,
      additionalProperties: false,
      required: [],
      properties: {
        required: {
          type: "array",
          nullable: true,
          items: {
            type: "string",
          },
        },
        recommended: {
          type: "array",
          nullable: true,
          items: {
            type: "string",
          },
        },
      },
    },
    ignore: {
      type: "array",
      nullable: true,
      items: {
        type: "string",
      },
    },
  },
} as unknown as JSONSchemaType<RawTruthmarkConfig>;
