import type { JSONSchemaType } from "ajv";

const SUPPORTED_PLATFORMS = [
  "codex",
  "opencode",
  "claude-code",
  "github-copilot",
  "antigravity",
  "cursor",
] as const;

export type TruthmarkPlatform = (typeof SUPPORTED_PLATFORMS)[number];

export const DEFAULT_PLATFORMS = [] as const satisfies readonly TruthmarkPlatform[];

type TruthmarkPortalConfig = {
  enabled: boolean;
};

type RawTruthmarkWorkspaceConfig = {
  workspace: string;
  generated: {
    portal: TruthmarkPortalConfig;
  };
};

type TruthmarkWorkspaceConfig = {
  workspace: string;
  routes: {
    index: string;
    areas: string;
    defaultArea: string;
    maxDelegationDepth: 1;
  };
  truth: {
    productRoot: string;
    engineeringRoot: string;
  };
  templates: {
    root: string;
  };
  generated: {
    portal: TruthmarkPortalConfig;
  };
  paths: {
    routesIndex: string;
    routeAreasRoot: string;
    productTruthRoot: string;
    engineeringTruthRoot: string;
    truthRoot?: string;
    templatesRoot: string;
    portalOutput: string;
    portalTemplate: string;
  };
  controlledPaths: string[];
};

export type RawTruthmarkConfig = {
  version: 2;
  platforms?: TruthmarkPlatform[];
  truthmark: RawTruthmarkWorkspaceConfig;
  instruction_targets?: string[];
  frontmatter?: {
    required?: string[];
    recommended?: string[];
  };
  ignore?: string[];
};

export type TruthmarkConfig = {
  version: 2;
  platforms: TruthmarkPlatform[];
  truthmark: TruthmarkWorkspaceConfig;
  instructionTargets: string[];
  frontmatter: {
    required: string[];
    recommended: string[];
  };
  ignore: string[];
};

export const truthmarkConfigSchema = {
  type: "object",
  additionalProperties: false,
  required: ["version", "truthmark"],
  properties: {
    version: {
      type: "integer",
      const: 2,
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
    truthmark: {
      type: "object",
      additionalProperties: false,
      required: ["workspace", "generated"],
      properties: {
        workspace: {
          type: "string",
        },
        generated: {
          type: "object",
          additionalProperties: false,
          required: ["portal"],
          properties: {
            portal: {
              type: "object",
              additionalProperties: false,
              required: ["enabled"],
              properties: {
                enabled: { type: "boolean" },
              },
            },
          },
        },
      },
    },
    instruction_targets: {
      type: "array",
      nullable: true,
      items: {
        type: "string",
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
