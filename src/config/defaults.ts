import { DEFAULT_PLATFORMS, type TruthmarkConfig } from "./schema.js";

export const DEFAULT_TRUTHMARK_WORKSPACE = {
  workspace: "docs/truthmark",
  routes: {
    index: "routes/areas.md",
    areas: "routes/areas",
    default_area: "repository",
    max_delegation_depth: 1,
  },
  templates: {
    root: "templates",
  },
  generated: {
    portal: {
      enabled: false,
    },
  },
} as const;

export const DEFAULT_INSTRUCTION_TARGETS = ["AGENTS.md"] as const;

export const createDefaultRawConfig = () => ({
  version: 2 as const,
  platforms: [...DEFAULT_PLATFORMS],
  truthmark: {
    workspace: DEFAULT_TRUTHMARK_WORKSPACE.workspace,
    routes: { ...DEFAULT_TRUTHMARK_WORKSPACE.routes },
    templates: { ...DEFAULT_TRUTHMARK_WORKSPACE.templates },
    generated: {
      portal: { ...DEFAULT_TRUTHMARK_WORKSPACE.generated.portal },
    },
  },
  instruction_targets: [...DEFAULT_INSTRUCTION_TARGETS],
  frontmatter: {
    required: [],
    recommended: ["status", "last_reviewed", "source_of_truth"],
  },
  ignore: ["node_modules/**", "vendor/**", "dist/**", "build/**"],
});

export const createDefaultConfig = (): TruthmarkConfig => ({
  version: 2,
  platforms: [...DEFAULT_PLATFORMS],
  truthmark: {
    workspace: DEFAULT_TRUTHMARK_WORKSPACE.workspace,
    routes: {
      index: DEFAULT_TRUTHMARK_WORKSPACE.routes.index,
      areas: DEFAULT_TRUTHMARK_WORKSPACE.routes.areas,
      defaultArea: DEFAULT_TRUTHMARK_WORKSPACE.routes.default_area,
      maxDelegationDepth: DEFAULT_TRUTHMARK_WORKSPACE.routes.max_delegation_depth,
    },
    truth: {
      productRoot: "product",
      engineeringRoot: "engineering",
    },
    templates: { root: DEFAULT_TRUTHMARK_WORKSPACE.templates.root },
    generated: {
      portal: { ...DEFAULT_TRUTHMARK_WORKSPACE.generated.portal },
    },
    paths: {
      routesIndex: "docs/truthmark/routes/areas.md",
      routeAreasRoot: "docs/truthmark/routes/areas",
      productTruthRoot: "docs/truthmark/product",
      engineeringTruthRoot: "docs/truthmark/engineering",
      templatesRoot: "docs/truthmark/templates",
      portalOutput: "docs/truthmark/generated/portal",
      portalTemplate: "docs/truthmark/templates/portal.html",
    },
    controlledPaths: [
      "docs/truthmark/routes/areas.md",
      "docs/truthmark/routes/areas/**/*.md",
      "docs/truthmark/product/**/*.md",
      "docs/truthmark/engineering/**/*.md",
      "docs/truthmark/templates/*.md",
    ],
  },
  instructionTargets: [...DEFAULT_INSTRUCTION_TARGETS],
  frontmatter: {
    required: [],
    recommended: ["status", "last_reviewed", "source_of_truth"],
  },
  ignore: ["node_modules/**", "vendor/**", "dist/**", "build/**"],
});
