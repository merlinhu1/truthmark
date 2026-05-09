import { DEFAULT_PLATFORMS, type TruthmarkConfig } from "./schema.js";

export const DEFAULT_DOCS_HIERARCHY = {
  layout: "hierarchical",
  roots: {
    ai: "docs/ai",
    standards: "docs/standards",
    architecture: "docs/architecture",
    features: "docs/features",
  },
  routing: {
    root_index: "docs/truthmark/areas.md",
    area_files_root: "docs/truthmark/areas",
    default_area: "repository",
    max_delegation_depth: 1,
  },
} as const;

export const DEFAULT_AUTHORITY = [
  "TRUTHMARK.md",
  DEFAULT_DOCS_HIERARCHY.routing.root_index,
  `${DEFAULT_DOCS_HIERARCHY.routing.area_files_root}/**/*.md`,
  `${DEFAULT_DOCS_HIERARCHY.roots.ai}/**/*.md`,
  `${DEFAULT_DOCS_HIERARCHY.roots.standards}/**/*.md`,
  `${DEFAULT_DOCS_HIERARCHY.roots.architecture}/**/*.md`,
  `${DEFAULT_DOCS_HIERARCHY.roots.features}/**/*.md`,
] as const;

export const DEFAULT_INSTRUCTION_TARGETS = ["AGENTS.md"] as const;

export const createDefaultRawConfig = () => ({
  version: 1 as const,
  platforms: [...DEFAULT_PLATFORMS],
  docs: {
    layout: DEFAULT_DOCS_HIERARCHY.layout,
    roots: { ...DEFAULT_DOCS_HIERARCHY.roots },
    routing: { ...DEFAULT_DOCS_HIERARCHY.routing },
  },
  authority: [...DEFAULT_AUTHORITY],
  instruction_targets: [...DEFAULT_INSTRUCTION_TARGETS],
  frontmatter: {
    required: [],
    recommended: ["status", "doc_type", "last_reviewed", "source_of_truth"],
  },
  ignore: ["node_modules/**", "vendor/**", "dist/**", "build/**"],
  realization: {
    enabled: true,
  },
});

export const createDefaultConfig = (): TruthmarkConfig => ({
  version: 1,
  platforms: [...DEFAULT_PLATFORMS],
  docs: {
    layout: DEFAULT_DOCS_HIERARCHY.layout,
    roots: { ...DEFAULT_DOCS_HIERARCHY.roots },
    routing: {
      rootIndex: DEFAULT_DOCS_HIERARCHY.routing.root_index,
      areaFilesRoot: DEFAULT_DOCS_HIERARCHY.routing.area_files_root,
      defaultArea: DEFAULT_DOCS_HIERARCHY.routing.default_area,
      maxDelegationDepth: DEFAULT_DOCS_HIERARCHY.routing.max_delegation_depth,
    },
  },
  authority: [...DEFAULT_AUTHORITY],
  instructionTargets: [...DEFAULT_INSTRUCTION_TARGETS],
  frontmatter: {
    required: [],
    recommended: ["status", "doc_type", "last_reviewed", "source_of_truth"],
  },
  ignore: ["node_modules/**", "vendor/**", "dist/**", "build/**"],
  realization: {
    enabled: true,
  },
});
