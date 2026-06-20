import { DEFAULT_PLATFORMS, type TruthmarkConfig } from "./schema.js";

export const DEFAULT_TRUTHMARK_WORKSPACE = {
  workspace: "docs/truthmark",
  generated: {
    portal: {
      enabled: false,
    },
  },
} as const;

export const DERIVED_TRUTHMARK_PATHS = {
  routesIndex: "routes/areas.md",
  routeAreasRoot: "routes/areas",
  defaultArea: "repository",
  maxDelegationDepth: 1,
  productTruthRoot: "product",
  engineeringTruthRoot: "engineering",
  templatesRoot: "templates",
  portalOutput: "generated/portal",
  portalTemplate: "templates/portal.html",
} as const;

export const DEFAULT_INSTRUCTION_TARGETS = ["AGENTS.md"] as const;

export const createDefaultRawConfig = () => ({
  version: 2 as const,
  truthmark: {
    workspace: DEFAULT_TRUTHMARK_WORKSPACE.workspace,
    generated: {
      portal: { ...DEFAULT_TRUTHMARK_WORKSPACE.generated.portal },
    },
  },
  instruction_targets: [...DEFAULT_INSTRUCTION_TARGETS],
  frontmatter: {
    required: [],
    recommended: ["status", "last_reviewed"],
  },
  ignore: ["node_modules/**", "vendor/**", "dist/**", "build/**"],
});

export const createDefaultConfig = (): TruthmarkConfig => ({
  version: 2,
  platforms: [...DEFAULT_PLATFORMS],
  truthmark: {
    workspace: DEFAULT_TRUTHMARK_WORKSPACE.workspace,
    routes: {
      index: DERIVED_TRUTHMARK_PATHS.routesIndex,
      areas: DERIVED_TRUTHMARK_PATHS.routeAreasRoot,
      defaultArea: DERIVED_TRUTHMARK_PATHS.defaultArea,
      maxDelegationDepth: DERIVED_TRUTHMARK_PATHS.maxDelegationDepth,
    },
    truth: {
      productRoot: DERIVED_TRUTHMARK_PATHS.productTruthRoot,
      engineeringRoot: DERIVED_TRUTHMARK_PATHS.engineeringTruthRoot,
    },
    templates: { root: DERIVED_TRUTHMARK_PATHS.templatesRoot },
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
    recommended: ["status", "last_reviewed"],
  },
  ignore: ["node_modules/**", "vendor/**", "dist/**", "build/**"],
});
