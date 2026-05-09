import micromatch from "micromatch";

export type PathClassification =
  | "functional-code"
  | "markdown"
  | "config"
  | "ignored"
  | "derived"
  | "other";

const CODE_EXTENSIONS = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".cs",
  ".cts",
  ".cjs",
  ".ex",
  ".exs",
  ".gql",
  ".go",
  ".graphql",
  ".h",
  ".hpp",
  ".hrl",
  ".java",
  ".js",
  ".jsx",
  ".kt",
  ".kts",
  ".lua",
  ".mjs",
  ".mts",
  ".php",
  ".proto",
  ".py",
  ".rb",
  ".rs",
  ".scala",
  ".sh",
  ".swift",
  ".tf",
  ".tfvars",
  ".ts",
  ".tsx",
]);

const CONFIG_EXTENSIONS = new Set([
  ".cfg",
  ".conf",
  ".env",
  ".ini",
  ".json",
  ".jsonc",
  ".toml",
  ".yaml",
  ".yml",
]);

const CONFIG_BASENAMES = new Set([
  ".editorconfig",
  ".gitattributes",
  ".gitignore",
  "Dockerfile",
  "package-lock.json",
  "package.json",
  "pnpm-lock.yaml",
  "tsconfig.json",
  "yarn.lock",
]);

const CONFIG_SUFFIXES = [
  ".config.cjs",
  ".config.js",
  ".config.mjs",
  ".config.ts",
  ".config.tsx",
  ".config.jsx",
];

const COMMON_CODE_DIRECTORIES =
  /(^|\/)(api|app|apps|bin|client|cmd|components|frontend|infra|infrastructure|k8s|kubernetes|lib|packages|proto|schema|schemas|scripts|server|services|src|terraform|web)\//u;
const FUNCTIONAL_CONFIG_DIRECTORIES =
  /(^|\/)(api|infra|infrastructure|k8s|kubernetes|schema|schemas|terraform)\//u;
const FUNCTIONAL_CONFIG_BASENAMES = new Set([
  "openapi.json",
  "openapi.yaml",
  "openapi.yml",
  "swagger.json",
  "swagger.yaml",
  "swagger.yml",
]);

const normalizePath = (filePath: string): string => {
  return filePath.replaceAll("\\", "/").replace(/^\.\//u, "");
};

const getBaseName = (filePath: string): string => {
  const segments = normalizePath(filePath).split("/");

  return segments.at(-1) ?? filePath;
};

const getExtension = (filePath: string): string => {
  const baseName = getBaseName(filePath);
  const extensionIndex = baseName.lastIndexOf(".");

  if (extensionIndex <= 0) {
    return "";
  }

  return baseName.slice(extensionIndex).toLowerCase();
};

const isConfigPath = (filePath: string): boolean => {
  const normalizedPath = normalizePath(filePath);
  const baseName = getBaseName(normalizedPath);
  const extension = getExtension(normalizedPath);

  return (
    CONFIG_BASENAMES.has(baseName) ||
    CONFIG_EXTENSIONS.has(extension) ||
    CONFIG_SUFFIXES.some((suffix) => baseName.endsWith(suffix))
  );
};

const isFunctionalConfigPath = (filePath: string): boolean => {
  const normalizedPath = normalizePath(filePath);
  const baseName = getBaseName(normalizedPath).toLowerCase();
  const extension = getExtension(normalizedPath);

  return (
    normalizedPath.startsWith(".github/workflows/") ||
    FUNCTIONAL_CONFIG_BASENAMES.has(baseName) ||
    ((extension === ".yaml" || extension === ".yml" || extension === ".json") &&
      FUNCTIONAL_CONFIG_DIRECTORIES.test(normalizedPath))
  );
};

const isCodeLikePath = (filePath: string): boolean => {
  const normalizedPath = normalizePath(filePath);
  const extension = getExtension(normalizedPath);

  if (CODE_EXTENSIONS.has(extension)) {
    return true;
  }

  return extension.length === 0 && COMMON_CODE_DIRECTORIES.test(normalizedPath);
};

export const classifyPath = (
  filePath: string,
  ignorePatterns: string[],
): PathClassification => {
  const normalizedPath = normalizePath(filePath);

  if (normalizedPath === ".truthmark/config.yml") {
    return "config";
  }

  if (normalizedPath.startsWith(".truthmark/")) {
    return "derived";
  }

  if (
    normalizedPath.startsWith(".codex/") ||
    normalizedPath.startsWith(".cursor/") ||
    normalizedPath.startsWith(".gemini/commands/") ||
    normalizedPath.startsWith(".opencode/") ||
    normalizedPath === ".github/copilot-instructions.md" ||
    normalizedPath === "AGENTS.md" ||
    normalizedPath === "CLAUDE.md" ||
    normalizedPath === "GEMINI.md" ||
    normalizedPath.startsWith(".gemini/commands/truthmark/") ||
    normalizedPath.startsWith("skills/truthmark-")
  ) {
    return "derived";
  }

  if (ignorePatterns.length > 0 && micromatch.isMatch(normalizedPath, ignorePatterns)) {
    return "ignored";
  }

  if (normalizedPath.toLowerCase().endsWith(".md")) {
    return "markdown";
  }

  if (isFunctionalConfigPath(normalizedPath)) {
    return "functional-code";
  }

  if (isConfigPath(normalizedPath)) {
    return "config";
  }

  if (isCodeLikePath(normalizedPath)) {
    return "functional-code";
  }

  return "other";
};
