import { DEFAULT_PLATFORMS, type TruthmarkConfig } from "./schema.js";

export const DEFAULT_TRUTHMARK_WORKSPACE = {
  workspace: "docs/truthmark",
  routes: {
    index: "routes/areas.md",
    areas: "routes/areas",
    default_area: "repository",
    max_delegation_depth: 1,
  },
  truth: {
    root: "truth",
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
    truth: { ...DEFAULT_TRUTHMARK_WORKSPACE.truth },
    templates: { ...DEFAULT_TRUTHMARK_WORKSPACE.templates },
    generated: {
      portal: { ...DEFAULT_TRUTHMARK_WORKSPACE.generated.portal },
    },
  },
  instruction_targets: [...DEFAULT_INSTRUCTION_TARGETS],
  frontmatter: {
    required: [],
    recommended: ["status", "doc_type", "last_reviewed", "source_of_truth"],
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
    truth: { root: DEFAULT_TRUTHMARK_WORKSPACE.truth.root },
    templates: { root: DEFAULT_TRUTHMARK_WORKSPACE.templates.root },
    generated: {
      portal: { ...DEFAULT_TRUTHMARK_WORKSPACE.generated.portal },
    },
    paths: {
      routesIndex: "docs/truthmark/routes/areas.md",
      routeAreasRoot: "docs/truthmark/routes/areas",
      truthRoot: "docs/truthmark/truth",
      templatesRoot: "docs/truthmark/templates",
      portalOutput: "docs/truthmark/generated/portal",
      portalTemplate: "docs/truthmark/templates/portal.html",
    },
    controlledPaths: [
      "docs/truthmark/routes/areas.md",
      "docs/truthmark/routes/areas/**/*.md",
      "docs/truthmark/truth/**/*.md",
      "docs/truthmark/templates/*.md",
    ],
  },
  instructionTargets: [...DEFAULT_INSTRUCTION_TARGETS],
  frontmatter: {
    required: [],
    recommended: ["status", "doc_type", "last_reviewed", "source_of_truth"],
  },
  ignore: ["node_modules/**", "vendor/**", "dist/**", "build/**"],
});
